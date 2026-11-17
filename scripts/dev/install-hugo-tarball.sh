#!/usr/bin/env bash
# Install the pinned Hugo Extended release into an isolated directory, for Kiro
# Web / sandboxes that lack dpkg-deb (so the CI .deb path in
# .github/scripts/install-hugo.sh cannot run). Downloads the official tar.gz and
# verifies its SHA-256 before extraction.
#
# Version and the linux-amd64 tarball digest come from .github/hugo-toolchain.json
# (reviewed, versioned data, like the CI .deb digest). The release's own
# checksums.txt must agree with that pin. Other architectures have no pin and
# fall back to checksums.txt alone, with a warning. Reuses an already-validated
# binary.
#
# Usage:   scripts/dev/install-hugo-tarball.sh <install_dir>
# Prints the absolute path of the hugo binary on stdout (last line).
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
config="$repo_root/.github/hugo-toolchain.json"
install_dir="${1:?install_dir required}"

# Read and validate the pinned version (and amd64 tarball digest) from the shared config.
read -r version pinned_tar < <(python3 - "$config" <<'PY'
import json, re, sys
with open(sys.argv[1], encoding='utf-8') as f:
    cfg = json.load(f)
v = cfg['version']
d = cfg.get('linux_amd64_tar_sha256', '-')
if not re.fullmatch(r'\d+\.\d+\.\d+', v) or not (d == '-' or re.fullmatch(r'[a-f0-9]{64}', d)):
    raise SystemExit('Invalid Hugo version or tarball SHA-256 in toolchain config')
print(v, d)
PY
)

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
if [ "$hugo_arch" = 'linux-amd64' ] && [ "$pinned_tar" != '-' ]; then
  if [ "$expected" != "$pinned_tar" ]; then
    echo "Release checksums disagree with the pinned tarball digest in $config" >&2
    exit 4
  fi
else
  echo "warning: no pinned digest for $tarball; trusting the release checksums only" >&2
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
