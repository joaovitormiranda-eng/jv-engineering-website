# scripts/dev — Kiro Web bootstrap

Reproducible local/cloud preparation and validation for the JV Engineering Hugo
site. Intended for the Kiro Web sandbox (Amazon Linux, no `dpkg-deb`), but works
on any Linux with `bash`, `curl`, `sha256sum`, `tar`, Python 3 and Node 24.

These scripts are development tooling. They do **not** build or deploy the
published site (that is GitHub Actions). They reuse the existing CI scripts in
`.github/scripts/` rather than re-implementing them, and write nothing inside the
repository. `check-invariants.py` and `audit-site.py` also run in the PR check
(`.github/workflows/ci.yml`), so a local run and CI apply the same criteria.

## Usage

```bash
# default isolated dir: ../jv-env (outside the repo)
scripts/dev/bootstrap.sh

# or choose the isolated dir explicitly
scripts/dev/bootstrap.sh /path/to/isolated
JV_ENV=/path/to/isolated scripts/dev/bootstrap.sh
```

What it runs, in order:

1. `install-hugo-tarball.sh` — installs the pinned Hugo Extended into the isolated
   dir if not already present. Downloads the official `.tar.gz` and verifies its
   SHA-256 **before** extraction against the digest pinned in
   `.github/hugo-toolchain.json` (`linux_amd64_tar_sha256`); the release's
   `checksums.txt` must agree with it. Other architectures fall back to
   `checksums.txt` alone, with a warning.
2. Node 24 via `nvm` (reports drift from the `24.18.0` pin; never auto-installs
   from an untrusted source).
3. `npm ci --include=dev --ignore-scripts` (workflow flags).
4. `.github/scripts/test-supply-chain.py` — the 8 supply-chain tests.
5. Production Hugo build into `$ISOLATED_DIR/public` (never inside the repo).
6. `.github/scripts/verify-build.py` — package integrity + SHA-256 manifest.
7. `check-invariants.py` — count invariants (29 URLs, 20 aliases, figures per
   study, 5 QEE SVGs present and byte-identical to their source, 9 licenses,
   8 supply-chain tests).
8. `audit-site.py` — static audit of the built pages (one `<h1>`, title/description,
   canonical, Open Graph, JSON-LD parses, `<img>` alt/size, internal links and
   `#fragments`, `target=_blank` without `rel=noopener`). Errors fail the run;
   warnings (e.g. long titles, a heading level skipped inside study content) are listed.

A real failure makes the script exit non-zero.

## Files

| File | Role |
|---|---|
| `bootstrap.sh` | Orchestrator; single entry point. |
| `install-hugo-tarball.sh` | Isolated, hash-verified Hugo install (tarball variant for sandboxes without `dpkg-deb`). |
| `check-invariants.py` | Count invariants not covered by `verify-build.py`. |
| `audit-site.py` | Offline SEO / link / heading / JSON-LD audit of the built site (stdlib only). |

## Differences from CI

- CI installs the official **`.deb`** (`dpkg-deb`); this uses the official
  **`.tar.gz`** of the same version and edition. Both digests are pinned in
  `hugo-toolchain.json`. Same binary, different packaging.
- CI pins Node `24.18.0`; the sandbox's nvm may expose a different `24.x` patch,
  which the report flags as a divergence.
- Build artefacts are not byte-identical to Pages (timestamps/environment);
  integrity is validated structurally (manifest, invariants, forbidden paths).

## Safety

No `sudo`, no global package changes, no `curl | bash`, no public artefacts, no
changes to project versions, dependencies, workflows or configuration.
