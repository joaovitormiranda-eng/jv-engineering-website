---
inclusion: always
---

# JV Engineering — Stack e Build

GitHub é a fonte oficial de publicação. Antes de qualquer tarefa, confirmar HEAD
remoto da `main`, PRs abertos, CI e deployment separadamente. Um relatório local
antigo não é a `main` atual.

## Versões fixadas (não atualizar sem revisão explícita)

- **Hugo Extended 0.169.0** — versão de build validada e mínimo do módulo.
  Pin e digests em `.github/hugo-toolchain.json`
  (`linux_amd64_deb_sha256: a20f7da84e0981bebbecc032cc87f0dda2049a844727720aab14e61ce416e5e9`
  para o CI; `linux_amd64_tar_sha256` para o instalador de sandbox).
- **Node.js 24.18.0** — fixado em `ci.yml` e `hugo.yml`.
- Dependências CSS/ferramentas resolvidas pelo `package-lock.json`. Reprodução
  usa `npm ci --include=dev --ignore-scripts` (nunca `npm install`).
- Go `1.24.0` no `go.mod`; tema `github.com/writeonlycode/hugo-up-business`
  vendorizado em `hugo-up-business/_vendor/`.

## Estrutura de build

O projeto Hugo fica em **`hugo-up-business/`**, não na raiz do repositório.
baseURL com prefixo obrigatório `/jv-engineering-website/`, `canonifyURLs: true`,
`relativeURLs: false`, `locale: pt-br`. Config do site em
`hugo-up-business/hugo.yaml`; `params.yaml` e `menus.yaml` em `config/_default/`.
Nos templates, usar `hugo.Data` (não `site.Data`, obsoleto desde o Hugo 0.156).

Fluxo: Markdown + YAML + assets → templates locais + tema vendorizado →
Tailwind/Hugo Pipes → `public/` → `verify-build.py` + manifesto SHA-256 →
artefato verificado → deploy Pages. Sem backend.

`hugo_stats.json` é saída auxiliar **versionada** usada na detecção de classes;
o build pode alterá-la. Não editar seus números à mão nem descartá-la sem build.

## CI e Pages

- **`.github/workflows/ci.yml`** — check de PR (`Build Hugo`), ubuntu-latest,
  timeout 15 min, `contents: read`, sem permissões de deploy. Roda os 8 testes de
  supply chain, instala Hugo verificado, `npm ci`, build de produção,
  `verify-build.py`, `scripts/dev/check-invariants.py` e `scripts/dev/audit-site.py`.
- **`.github/workflows/hugo.yml`** — push na `main` ou `workflow_dispatch`. O
  build não recebe permissões de publicação; só o job de deploy tem
  `pages: write` + `id-token: write`. Artefato de `public/` com retenção de 1 dia;
  tar confrontado com o manifesto.
- Actions fixadas por SHA (checkout, setup-node, upload-pages-artifact,
  deploy-pages). Não despinar. **Merge na `main` dispara o deploy Pages
  automaticamente** — avisar antes de qualquer decisão de merge.
- Nunca executar `workflow_dispatch` por iniciativa própria.

## Oito testes de supply chain

`.github/scripts/test-supply-chain.py` define exatamente 8 testes offline:
`test_verified_installer_activates_only_after_checksum`,
`test_corrupted_installer_never_extracts_or_activates`,
`test_invalid_version_never_extracts_or_activates`,
`test_archive_matches_verified_files`, `test_archive_tampering_is_rejected`,
`test_private_path_is_rejected`, `test_missing_css_is_rejected`,
`test_hardlink_is_rejected`. Não remover testes nem reduzir tolerâncias. O
instalador valida SHA-256 antes da extração.

## Analytics e consentimento (preservar, não reimplementar)

`assets/js/analytics.js` e `layouts/partials/analytics/{config,consent}.html`.
Habilitado só em produção, validado por formato de ID. Sem consentimento ou com
recusa: não carregar Google nem enviar eventos. Revogação limpa cookies próprios
(host-only, caminho do projeto, prefixo próprio, Secure/SameSite, 180 dias).
URL sem query/hash, referrer reduzido à origem, sem Google Signals.

**Proibido enviar tráfego de teste ao GA4 real.** Em qualquer automação de
browser, interceptar/bloquear Analytics **antes do primeiro `goto`** e usar SDK
falso. Abrir preview de build production e clicar "aceitar" sem essa proteção
pode enviar dados reais.

## Ambiente Kiro Web (limitações conhecidas)

- Rede `COMMON_DEPENDENCIES` (apenas domínios allowlisted); `curl` à produção
  pode falhar — usar `gh api` para checar deploy.
- Hugo, `dpkg-deb`, Playwright (pacote npm), axe e actionlint **não vêm
  instalados**. Node 22 é o default (24 disponível via nvm); Python default 3.11.
  Há um Chrome for Testing em `/usr/local/bin/chrome`; ele só inicia com `HOME`
  apontando para uma pasta gravável e pode ser controlado por CDP (WebSocket nativo
  do Node 22). Processos em segundo plano não sobrevivem entre comandos: servidor e
  navegador precisam rodar no mesmo comando.
- **Não há iPhone físico nem Safari Web Inspector.** Chrome headless não
  reproduz o P0 do hero.
- Não há worktrees/relatórios do Windows nem arquivos experimentais locais.
- Não instalar dependências sem autorização explícita.
