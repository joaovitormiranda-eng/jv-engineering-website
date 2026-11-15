#!/usr/bin/env bash
# Reproducible Kiro Web bootstrap for JV Engineering.
#
# One command to prepare the cloud sandbox and run the existing checks:
#   1. install the pinned Hugo Extended (isolated, hash-verified) if needed;
#   2. activate Node 24 via nvm and report any drift from the 24.18.0 pin;
#   3. npm ci with the workflow flags;
#   4. the 8 supply-chain tests  (.github/scripts/test-supply-chain.py);
#   5. production Hugo build into an isolated dir (never inside the repo);
#   6. verify-build.py            (.github/scripts/verify-build.py);
#   7. build invariants           (scripts/dev/check-invariants.py).
#
# It REUSES the existing CI scripts; it does not re-implement them. Nothing is
# written inside the repository. A real failure exits non-zero.
#
# Usage:
#   scripts/dev/bootstrap.sh [ISOLATED_DIR]
#   JV_ENV=/path scripts/dev/bootstrap.sh
# Default ISOLATED_DIR: $JV_ENV, else <repo-parent>/jv-env (outside the repo).
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
pinned_node="24.18.0"

# --- isolated directory, configurable, outside the repo, writable -------------
env_dir="${1:-${JV_ENV:-$(dirname "$repo_root")/jv-env}}"
case "$(cd "$(dirname "$env_dir")" 2>/dev/null && pwd)/$(basename "$env_dir")" in
  "$repo_root"|"$repo_root"/*)
    echo "Refusing to use an isolated dir inside the repository: $env_dir" >&2
    exit 2 ;;
esac
mkdir -p "$env_dir"
if ! { : > "$env_dir/.jv-write-test"; } 2>/dev/null; then
  echo "Isolated dir is not writable: $env_dir" >&2
  exit 2
fi
rm -f "$env_dir/.jv-write-test"
env_dir="$(cd "$env_dir" && pwd)"
public_dir="$env_dir/public"
manifest="$env_dir/site-manifest.json"

echo "== JV Engineering bootstrap =="
echo "repo:     $repo_root"
echo "isolated: $env_dir"

# --- Hugo (pinned, isolated, hash-verified) -----------------------------------
hugo_bin="$(bash "$repo_root/scripts/dev/install-hugo-tarball.sh" "$env_dir")"
hugo_version_line="$("$hugo_bin" version)"

# --- Node 24 via nvm (no auto-install from untrusted sources) -----------------
node_note="node não verificado"
if command -v node >/dev/null 2>&1 || [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && { nvm use 24 >/dev/null 2>&1 || true; }
fi
if command -v node >/dev/null 2>&1; then
  node_version="$(node --version | sed 's/^v//')"
  if [ "$node_version" = "$pinned_node" ]; then
    node_note="node $node_version (bate com o pin do CI)"
  else
    node_note="node $node_version (DIVERGE do pin do CI $pinned_node)"
  fi
else
  echo "Node 24 não encontrado; instale via nvm manualmente (sem fonte não confiável)." >&2
  exit 3
fi

# --- supply-chain tests (existing CI script, no re-implementation) ------------
echo "== supply-chain tests =="
python3 "$repo_root/.github/scripts/test-supply-chain.py"

# --- npm ci (workflow flags) + production build -------------------------------
echo "== npm ci + build =="
rm -rf "$public_dir"
(
  cd "$repo_root/hugo-up-business"
  npm ci --include=dev --ignore-scripts
  HUGO_ENVIRONMENT=production "$hugo_bin" --gc --minify \
    --baseURL="https://joaovitormiranda-eng.github.io/jv-engineering-website/" \
    --destination="$public_dir"
)

# --- integrity (existing verifier) + invariants (new, non-duplicate) ----------
echo "== verify-build (integridade do pacote) =="
python3 "$repo_root/.github/scripts/verify-build.py" "$public_dir" --manifest "$manifest"

echo "== invariantes do site =="
python3 "$repo_root/scripts/dev/check-invariants.py" "$public_dir"

# --- short report -------------------------------------------------------------
echo
echo "== RELATÓRIO =="
echo "Hugo:      $hugo_version_line"
echo "Node:      $node_note"
echo "público:   $public_dir"
echo "manifesto: $manifest"
echo "git:       $(git -C "$repo_root" rev-parse --short HEAD) ($(git -C "$repo_root" status --porcelain | wc -l | tr -d ' ') arquivo(s) modificado(s))"
echo "Resultado: supply-chain OK, build OK, verify-build OK, invariantes OK."
echo
echo "Nota: build tarball (não .deb do CI); sem dpkg-deb no sandbox. Sem rede"
echo "externa além da release oficial do Hugo. Nada gravado dentro do repo."
