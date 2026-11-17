---
inclusion: always
---

# JV Engineering — Estrutura e Invariantes

Caminhos relativos à raiz do repositório. O projeto Hugo está em
`hugo-up-business/`; nas linhas que começam por `content/`, `layouts/`,
`assets/`, `data/`, o prefixo omitido é `hugo-up-business/`.

## Mapa essencial

| Componente | Caminho |
|---|---|
| Toolchain / scripts | `.github/hugo-toolchain.json`, `.github/scripts/{install-hugo.sh,test-supply-chain.py,verify-build.py}` |
| Workflows | `.github/workflows/{ci.yml,hugo.yml}`, `.github/dependabot.yml` |
| Config Hugo | `hugo-up-business/hugo.yaml` (site, build, módulo, markup); `config/_default/{params.yaml,menus.yaml}` |
| Dependências | `hugo-up-business/package.json`, `package-lock.json`, `go.mod`, `go.sum`, `_vendor/` |
| Layout global | `layouts/{baseof.html,home.html}` |
| Header / nav | `layouts/partials/shared/header.html` (S29: classes `jv-header*`, fundo sólido, sem backdrop-filter; contrato `data-navigation*` mantido), `assets/js/shared/navigation.js` |
| JS compartilhado | `assets/js/main.js` (importa os módulos); `assets/js/shared/fragment.js` (decodificação segura de `#fragmentos`; usar em vez de `decodeURIComponent` direto) |
| Hero (P0) | `data/home/hero.yaml`, `layouts/partials/blocks/home/hero.html` (S29: tipográfico + figuras reais; sem foto, filtros, blur ou animação; baseline anterior = main @ 84b89f7) |
| Blocos Home | `data/home/*.yaml`, `layouts/partials/blocks/home/` |
| Serviços | `content/servicos/*.md`, `layouts/servicos/`, `data/services/*.yaml`, `layouts/partials/services/` |
| Estudos | `content/portfolio/*.md`, `data/portfolio/studies.yaml`, `layouts/portfolio/` |
| Analytics / privacidade | `assets/js/analytics.js`, `layouts/partials/analytics/`, `content/privacidade.md` |
| Licenças publicadas | `static/licenses/` (9 arquivos) |
| Design system / chrome interno | `assets/css/system.css`, `layouts/partials/system/{crumbs,paths}.html` (breadcrumb + JSON-LD, faixa "próximos passos") |
| Visualizador de figuras | `assets/js/portfolio/figure-viewer.js` (`<dialog>` nativo; só em `[data-figure-viewer]`) |
| Auditoria estática / invariantes | `scripts/dev/{audit-site.py,check-invariants.py}` (rodam no bootstrap e no check de PR `ci.yml`) |
| Figuras QEE | `assets/images/portfolio/qee/` (5 SVGs) |

## Overrides do tema

Templates/assets locais em `hugo-up-business/layouts/` e `assets/` **prevalecem**
sobre os do módulo vendorizado em
`_vendor/github.com/writeonlycode/hugo-up-business/`. Antes de concluir que um
arquivo não existe, consultar ambos. Preferir override localizado a editar o
vendor. A Home é `layouts/home.html` (o antigo `index.html` foi removido na S32).

CSS: `system.css` (tokens `--jv-*`, container, selo de folha, tipografia, links e
botões, breadcrumb, ficha técnica, faixa de caminhos) é global e vem antes dos
arquivos por família; `home.css` só na Home; `portfolio.css` só em portfolio/termos;
`services.css` em todas as páginas de `servicos/` (índice e especialidades);
`accessibility.css` é global. Medidas de texto em páginas internas usam `rem`, não
`ch`, para não re-quebrar linhas na troca de fonte (CLS). Só os arquivos chamados em
`baseof.html` são carregados — verificar o import real antes de editar. Ao mudar CSS,
remover a declaração antiga em vez de sobrescrevê-la num bloco posterior.

## Invariantes (confirmar antes de mexer; não manipular contadores para ficar verde)

- **29 URLs** no sitemap; **20 aliases** (redirects de paginação).
- **4 estudos** (não contar o laboratório S22 experimental).
- **11 figuras científicas** (QEE 5 + PDS 4 + Fuzzy 2) **+ 1 diagrama Web** = 12 figuras.
- **5 SVGs QEE** em `assets/images/portfolio/qee/`
  (`03_carga, 06_fp, 07_thd, 09_neutro, 10_eventos`); bytes publicados idênticos
  aos da fonte versionada (conferido por `check-invariants.py`).
- **8 testes** de supply chain.
- **9 arquivos de licença** em `static/licenses/`.

Uma alteração intencional de rotas/figuras exige revisar as invariantes, não
ajustar números. Preservar acentos/encoding dos slugs (não quebrar canonicals).

## Legado / não promover

Ainda no repositório, sem publicação: campos `featured`/`items` de
`data/home/testimonials.yaml` e `assets/images/4.png` (relatos antigos, origem e
autorização não confirmadas). Não reativar depoimentos legados (o bloco
"testimonials" renderiza abordagem/capacidades, apesar do nome). As variantes de
`assets/images/brand/` não usadas pelos templates são o kit da marca, não legado.

Removidos na S32 e preservados só no histórico do Git: `content/post/`,
`data/home/stats.yaml`, `layouts/index.html`, `resources_backup/`, imagens de demo
do tema, logos de software, `custom.css`, partials de ícones/botões sem uso. Não
restaurar sem uma tarefa que os justifique.
