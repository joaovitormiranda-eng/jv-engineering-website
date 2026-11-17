#!/usr/bin/env python3
"""Check JV Engineering build invariants that verify-build.py does not cover.

verify-build.py (in .github/scripts) already validates required files, sitemap
URL correctness, forbidden/private paths, links and the SHA-256 manifest/archive.
This script does NOT duplicate that; it only adds the *count* invariants noted in
the handoff (section P.5): number of sitemap URLs, meta-refresh aliases, figures
per study, QEE SVGs (present and byte-identical to their source), published
licenses, and the number of supply-chain tests. CI (ci.yml) runs it on every PR.

Expected values are the documented baseline. A real mismatch exits non-zero so a
drift (or an accidental content change) is caught, instead of being silently
normalised. Run verify-build.py first for integrity; run this for counts.

Usage: scripts/dev/check-invariants.py <public_dir>
"""
import sys
from pathlib import Path
from html.parser import HTMLParser
import xml.etree.ElementTree as ET

# Documented baseline invariants. Derived from real sources where possible:
#   studies  = content/portfolio/*.md (excluding _index)
#   svgs     = assets/images/portfolio/qee/*.svg
#   licenses = static/licenses/*.txt
#   tests    = def test_ in .github/scripts/test-supply-chain.py
# URL/alias counts are emergent from the build and are the published baseline;
# an intentional route change must update these here (and be reviewed), never be
# patched away to keep the check green.
EXPECTED_URLS = 29
EXPECTED_ALIASES = 20
EXPECTED_FIGURES = {
    "qualidade-energia": 5,
    "modelagem-simulacao": 4,
    "solucoes-computacionais": 2,
    "plataforma-web": 1,
}
EXPECTED_QEE_SVGS = ["03_carga", "06_fp", "07_thd", "09_neutro", "10_eventos"]
EXPECTED_LICENSES = 9
EXPECTED_SUPPLY_CHAIN_TESTS = 8
BASE_URL = "https://joaovitormiranda-eng.github.io/jv-engineering-website/"


class PageScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.is_alias = False
        self.figures = 0

    def handle_starttag(self, tag, attrs):
        v = dict(attrs)
        if tag == "meta" and v.get("http-equiv", "").lower() == "refresh":
            self.is_alias = True
        if tag == "figure":
            self.figures += 1


def main():
    if len(sys.argv) != 2:
        print("usage: check-invariants.py <public_dir>", file=sys.stderr)
        return 2
    public = Path(sys.argv[1])
    if not public.is_dir():
        print(f"public dir not found: {public}", file=sys.stderr)
        return 2
    repo_root = Path(__file__).resolve().parents[2]

    failures = []

    def check(name, actual, expected):
        ok = actual == expected
        print(f"  [{'OK' if ok else 'FAIL'}] {name}: {actual} (esperado {expected})")
        if not ok:
            failures.append(name)

    print("Invariantes do build:")

    # 1. sitemap URLs
    urls = [n.text for n in
            ET.parse(public / "sitemap.xml").getroot().findall("{*}url/{*}loc")]
    check("URLs no sitemap", len(urls), EXPECTED_URLS)

    # 2. meta-refresh aliases across all HTML pages
    aliases = 0
    for page in public.rglob("*.html"):
        s = PageScan()
        s.feed(page.read_text(encoding="utf-8"))
        aliases += s.is_alias
    check("aliases (meta-refresh)", aliases, EXPECTED_ALIASES)

    # 3. figures per study
    for slug, expected in EXPECTED_FIGURES.items():
        page = public / "portfolio" / slug / "index.html"
        if not page.is_file():
            check(f"estudo {slug}", "ausente", expected)
            continue
        s = PageScan()
        s.feed(page.read_text(encoding="utf-8"))
        check(f"figuras em {slug}", s.figures, expected)

    # 4. QEE SVGs present
    missing = [n for n in EXPECTED_QEE_SVGS
               if not (public / "images" / "portfolio" / "qee" / f"{n}.svg").is_file()]
    check("SVGs QEE presentes", len(EXPECTED_QEE_SVGS) - len(missing),
          len(EXPECTED_QEE_SVGS))
    # Published bytes must equal the versioned source (figures are never re-encoded).
    source = repo_root / "hugo-up-business" / "assets" / "images" / "portfolio" / "qee"
    identical = [n for n in EXPECTED_QEE_SVGS if n not in missing and
                 (public / "images" / "portfolio" / "qee" / f"{n}.svg").read_bytes()
                 == (source / f"{n}.svg").read_bytes()]
    check("SVGs QEE idênticos à fonte", len(identical), len(EXPECTED_QEE_SVGS))

    # 5. published licenses
    lic_dir = public / "licenses"
    lic = sorted(lic_dir.glob("*.txt")) if lic_dir.is_dir() else []
    check("licenças publicadas", len(lic), EXPECTED_LICENSES)

    # 6. supply-chain test count (source of truth, not a rebuild)
    script = repo_root / ".github" / "scripts" / "test-supply-chain.py"
    test_count = sum(
        1 for line in script.read_text(encoding="utf-8").splitlines()
        if line.lstrip().startswith("def test_")
    )
    check("testes supply chain definidos", test_count, EXPECTED_SUPPLY_CHAIN_TESTS)

    if failures:
        print(f"\nFALHA: {len(failures)} invariante(s) divergente(s): "
              f"{', '.join(failures)}", file=sys.stderr)
        return 1
    print("\nTodos os invariantes conferem.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
