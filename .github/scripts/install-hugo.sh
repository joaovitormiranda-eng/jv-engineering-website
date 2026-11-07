#!/usr/bin/env bash
set -euo pipefail

# The digest is reviewed/versioned data, never fetched alongside the installer.
config="${1:-.github/hugo-toolchain.json}"
read -r version digest < <(python3 - "$config" <<'PY'
import json, re, sys
sys.stdout.reconfigure(newline='\n')
with open(sys.argv[1], encoding='utf-8') as f:
    config = json.load(f)
version, digest = config['version'], config['linux_amd64_deb_sha256']
if not re.fullmatch(r'\d+\.\d+\.\d+', version) or not re.fullmatch(r'[a-f0-9]{64}', digest):
    raise SystemExit('Invalid Hugo version or SHA-256')
print(version, digest)
PY
)
: "${GITHUB_PATH:?GITHUB_PATH must be provided by the runner}"
temporary="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
download_dir="$(mktemp -d "$temporary/jv-hugo-download.XXXXXX")"
package="$download_dir/hugo.deb"
trap 'rm -f -- "$package"; rmdir -- "$download_dir"' EXIT
url="https://github.com/gohugoio/hugo/releases/download/v${version}/hugo_extended_${version}_linux-amd64.deb"
curl --fail --show-error --silent --location --proto '=https' --proto-redir '=https' \
  --tlsv1.2 --retry 3 --output "$package" "$url"
printf '%s  %s\n' "$digest" "$package" | sha256sum --check --strict -

# No sudo or maintainer scripts: extract the verified package into the runner's temp.
install_dir="$(mktemp -d "$temporary/jv-hugo-bin.XXXXXX")"
dpkg-deb --extract "$package" "$install_dir"
binary="$install_dir/usr/local/bin/hugo"
version_text="$("$binary" version)"
case "$version_text" in
  *"v${version}-"*"+extended"*) ;;
  *) echo 'Unexpected Hugo version/edition' >&2; exit 1 ;;
esac
printf '%s\n' "$version_text"
printf '%s\n' "$install_dir/usr/local/bin" >> "$GITHUB_PATH"
