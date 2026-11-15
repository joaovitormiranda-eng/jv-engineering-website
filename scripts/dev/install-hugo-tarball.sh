#!/usr/bin/env bash
# Install the pinned Hugo Extended release into an isolated directory, for Kiro
# Web / sandboxes that lack dpkg-deb (so the CI .deb path in
# .github/scripts/install-hugo.sh cannot run). Downloads the official tar.gz and
# verifies its SHA-256 against the release's own checksums file before use.
#
# The authoritative version is read from .github/hugo-toolchain.json (same pin as
# the CI). No tarball hash is hardcoded here; it is checked against the official
# checksums.txt fetched from the same release. Reuses an already-validated binary.
#
# Usage:   scripts/dev/install-hugo-tarball.sh <install_dir>
# Prints the absolute path of the hugo binary on stdout (last line).
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
config="$repo_root/.github/hugo-toolchain.json"
install_dir="${1:?install_dir required}"

# Read and validate the pinned version from the shared toolchain config.
version="$(python3 - "$config" <<'PY'
import json, re, sys
with open(sys.argv[1], encoding='utf-8') as f:
    cfg = json.load(f)
v = cfg['version']
if not re.fullmatch(r'\d+\.\d+\.\d+', v):
    raise SystemExit('Invalid Hugo version in toolchain config')
print(v)
PY
)"

binary="$install_dir/hugo-$version/hugo"

# Reuse an already-validated binary if present and the right version/edition.
if [ -x "$binary" ] && "$binary" version 2>/dev/null | grep -q "v${version}-.*+extended"; then
  echo "reusing validated Hugo $version at $binary" >&2
  printf '%s\n' "$binary"
  exit 0
fi

command -v curl >/dev/null || { echo 'curl is required' >&2; exit 3; }
command -v sha256sum >/dev/null || { echo 'sha256sum is required' >&2; exit 3; }
command -v tar >/dev/null || { echo 'tar is required' >&2; exit 3; }

arch="$(uname -m)"
case "$arch" in
  x86_64|amd64) hugo_arch='linux-amd64' ;;
  aarch64|arm64) hugo_arch='linux-arm64' ;;
  *) echo "Unsupported architecture: $arch" >&2; exit 3 ;;
esac

tarball="hugo_extended_${version}_${hugo_arch}.tar.gz"
base="https://github.com/gohugoio/hugo/releases/download/v${version}"

mkdir -p "$install_dir"
work="$(mktemp -d "${install_dir}/.hugo-dl.XXXXXX")"
trap 'rm -rf -- "$work"' EXIT

# No curl|bash: artefacts are downloaded to files, then verified before any use.
curl --fail --show-error --silent --location --proto '=https' --proto-redir '=https' \
  --tlsv1.2 --retry 3 -o "$work/checksums.txt" "${base}/hugo_${version}_checksums.txt"
curl --fail --show-error --silent --location --proto '=https' --proto-redir '=https' \
  --tlsv1.2 --retry 3 -o "$work/$tarball" "${base}/${tarball}"

# Mandatory SHA-256 verification against the official manifest, before extraction.
expected="$(awk -v f="$tarball" '$2==f {print $1}' "$work/checksums.txt")"
if ! printf '%s' "$expected" | grep -Eq '^[a-f0-9]{64}$'; then
  echo "No valid SHA-256 for $tarball in official checksums" >&2
  exit 4
fi
printf '%s  %s\n' "$expected" "$work/$tarball" | sha256sum --check --strict - >&2

mkdir -p "$install_dir/hugo-$version"
tar -xzf "$work/$tarball" -C "$install_dir/hugo-$version" hugo

# Confirm the extracted binary is the pinned version and the Extended edition.
if ! "$binary" version | grep -q "v${version}-.*+extended"; then
  echo 'Unexpected Hugo version/edition after extraction' >&2
  exit 5
fi
"$binary" version >&2
printf '%s\n' "$binary"
