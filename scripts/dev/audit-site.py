#!/usr/bin/env python3
"""Static audit of the built site (no browser, stdlib only).

Checks every published HTML page in the build directory for the things that are
cheap to verify offline and easy to regress:

  * exactly one <h1>; no skipped heading levels;
  * <title> and meta description present and within sensible lengths;
  * canonical URL present, absolute, https, and equal to the page's own URL;
  * Open Graph / Twitter basics;
  * JSON-LD blocks parse as JSON and declare @context/@type;
  * <img> has alt (empty alt allowed for decorative), and width/height;
  * internal links and #fragments resolve to a built file / existing id;
  * duplicate ids; target=_blank without rel=noopener.

Alias pages (meta refresh redirects) are skipped. Exit code is non-zero only for
hard failures (errors). Warnings are reported but do not fail the run.

Usage: audit-site.py PUBLIC_DIR [--base https://host/prefix/]
"""
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote, urldefrag, urlparse

DEFAULT_BASE = "https://joaovitormiranda-eng.github.io/jv-engineering-website/"
VOID = {"img", "meta", "link", "br", "hr", "input", "source", "area", "base", "col", "embed", "wbr", "path", "circle", "rect"}


class Page(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self._in_title = False
        self.meta: dict[str, str] = {}
        self.canonical: str | None = None
        self.headings: list[int] = []
        self.ids: list[str] = []
        self.links: list[tuple[str, dict[str, str]]] = []
        self.imgs: list[dict[str, str]] = []
        self.jsonld: list[str] = []
        self._in_jsonld = False
        self.refresh = False
        self.robots = ""

    def handle_starttag(self, tag: str, attrs_list):  # noqa: ANN001
        a = {k: (v or "") for k, v in attrs_list}
        if "id" in a:
            self.ids.append(a["id"])
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            key = a.get("name") or a.get("property") or ""
            if key:
                self.meta[key] = a.get("content", "")
            if a.get("http-equiv", "").lower() == "refresh":
                self.refresh = True
        elif tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href", "")
        elif tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self.headings.append(int(tag[1]))
        elif tag == "a" and "href" in a:
            self.links.append((a["href"], a))
        elif tag == "img":
            self.imgs.append(a)
        elif tag == "script" and a.get("type") == "application/ld+json":
            self._in_jsonld = True
            self.jsonld.append("")

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False
        elif tag == "script":
            self._in_jsonld = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data
        if self._in_jsonld:
            self.jsonld[-1] += data


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    base = DEFAULT_BASE
    if "--base" in sys.argv:
        base = sys.argv[sys.argv.index("--base") + 1]
        args = [a for a in args if a != base]
    if not args:
        print(__doc__)
        return 2
    root = Path(args[0]).resolve()
    base_path = urlparse(base).path
    errors: list[str] = []
    warns: list[str] = []

    pages: dict[str, Page] = {}
    for f in sorted(root.rglob("*.html")):
        rel = f.relative_to(root).as_posix()
        if rel.startswith(("licenses/",)) or rel.startswith("google"):
            continue
        p = Page()
        p.feed(f.read_text(encoding="utf-8"))
        if p.refresh:
            continue  # alias redirect
        pages[rel] = p

    def resolve(path: str) -> Path | None:
        path = unquote(path)
        if not path.startswith(base_path):
            return None
        rel = path[len(base_path):]
        cand = root / rel
        if cand.is_dir():
            cand = cand / "index.html"
        return cand if cand.exists() else None

    for rel, p in pages.items():
        e = lambda m: errors.append(f"{rel}: {m}")  # noqa: E731
        w = lambda m: warns.append(f"{rel}: {m}")  # noqa: E731
        is_404 = rel == "404.html"
        if p.headings.count(1) != 1:
            e(f"{p.headings.count(1)} <h1> (esperado 1)")
        prev = 0
        for h in p.headings:
            if prev and h > prev + 1:
                w(f"salto de nível de heading h{prev} -> h{h}")
            prev = h
        t = p.title.strip()
        d = p.meta.get("description", "").strip()
        if not t:
            e("sem <title>")
        elif len(t) > 70:
            w(f"title longo ({len(t)})")
        if not d:
            e("sem meta description")
        elif len(d) > 175:
            w(f"description longa ({len(d)})")
        elif len(d) < 70:
            w(f"description curta ({len(d)})")
        if not is_404:
            if not p.canonical:
                e("sem canonical")
            else:
                dirpath = rel[: -len("index.html")] if rel.endswith("index.html") else rel
                expected = base + quote(dirpath, safe="/")
                if p.canonical != expected:
                    e(f"canonical {p.canonical!r} != {expected!r}")
            for k in ("og:title", "og:description", "og:url", "og:image", "twitter:card"):
                if not p.meta.get(k):
                    e(f"sem {k}")
        for blob in p.jsonld:
            try:
                data = json.loads(blob)
                for node in data if isinstance(data, list) else [data]:
                    if "@context" not in node or "@type" not in node:
                        e("JSON-LD sem @context/@type")
            except json.JSONDecodeError as exc:
                e(f"JSON-LD inválido: {exc}")
        seen = set()
        for i in p.ids:
            if i in seen:
                e(f"id duplicado: {i}")
            seen.add(i)
        for img in p.imgs:
            if "alt" not in img:
                e(f"<img> sem alt: {img.get('src', '')[:60]}")
            if not (img.get("width") and img.get("height")) and not img.get("src", "").endswith(".svg"):
                w(f"<img> sem width/height: {img.get('src', '')[:60]}")
        for href, a in p.links:
            if a.get("target") == "_blank" and "noopener" not in a.get("rel", ""):
                e(f"target=_blank sem noopener: {href[:60]}")
            if href.startswith(("mailto:", "tel:", "javascript:")):
                continue
            absolute = urlparse(href)
            if absolute.scheme in ("http", "https"):
                if not href.startswith(base):
                    continue  # external; not fetched offline
                target_path = absolute.path
                frag = absolute.fragment
            else:
                target_path, frag = urldefrag(href)[0], urldefrag(href)[1]
                if not target_path:
                    target_path = base_path + (rel[: -len("index.html")] if rel.endswith("index.html") else rel)
            fpath = resolve(target_path) if target_path.startswith("/") else None
            if fpath is None:
                if target_path.startswith("/"):
                    # static files (pdf/svg/png/…) are valid targets too
                    cand = root / unquote(target_path)[len(base_path):]
                    if cand.exists():
                        continue
                    e(f"link interno quebrado: {href[:80]}")
                continue
            if frag and fpath.suffix == ".html":
                key = fpath.relative_to(root).as_posix()
                tgt = pages.get(key)
                if tgt is None:
                    q = Page()
                    q.feed(fpath.read_text(encoding="utf-8"))
                    tgt = q
                if unquote(frag) not in tgt.ids:
                    e(f"fragmento inexistente: {href[:80]}")

    print(f"Páginas auditadas: {len(pages)}")
    for m in warns:
        print("AVISO ", m)
    for m in errors:
        print("ERRO  ", m)
    print(f"Resumo: {len(errors)} erro(s), {len(warns)} aviso(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
