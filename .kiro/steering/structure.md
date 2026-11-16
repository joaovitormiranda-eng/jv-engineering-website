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
| Config Hugo | `hugo-up-business/hugo.yaml`; `config/_default/{hugo.yaml,params.yaml,menus.yaml}` |
| Dependências | `hugo-up-business/package.json`, `package-lock.json`, `go.mod`, `go.sum`, `_vendor/` |
| Layout global | `layouts/{baseof.html,home.html,index.html}` |
| Header / nav | `layouts/partials/shared/header.html`, `assets/js/shared/navigation.js` |
| Hero (P0) | `data/home/hero.yaml`, `layouts/partials/blocks/home/hero.html` |
| Blocos Home | `data/home/*.yaml`, `layouts/partials/blocks/home/` |
| Serviços | `content/servicos/*.md`, `layouts/servicos/`, `data/services/*.yaml`, `layouts/partials/services/` |
| Estudos | `content/portfolio/*.md`, `data/portfolio/studies.yaml`, `layouts/portfolio/` |
| Analytics / privacidade | `assets/js/analytics.js`, `layouts/partials/analytics/`, `content/privacidade.md` |
| Licenças publicadas | `static/licenses/` (9 arquivos) |
| Design system / chrome interno | `assets/css/system.css`, `layouts/partials/system/{crumbs,paths}.html` (breadcrumb + JSON-LD, faixa "próximos passos") |
| Visualizador de figuras | `assets/js/portfolio/figure-viewer.js` (`<dialog>` nativo; só em `[data-figure-viewer]`) |
| Auditoria estática | `scripts/dev/audit-site.py` (roda no bootstrap) |
| Figuras QEE | `assets/images/portfolio/qee/` (5 SVGs) |

## Overrides do tema

Templates/assets locais em `hugo-up-business/layouts/` e `assets/` **prevalecem**
sobre os do módulo vendorizado em
`_vendor/github.com/writeonlycode/hugo-up-business/`. Antes de concluir que um
arquivo não existe, consultar ambos. Preferir override localizado a editar o
vendor. `layouts/index.html` é um legado com ordem diferente de `home.html`; a
Home efetiva é `home.html` — não presumir que os dois renderizam.

CSS: `system.css` (tokens `--jv-*`, container, selo de folha, tipografia, links e
botões, breadcrumb, ficha técnica, faixa de caminhos) é global e vem antes dos
arquivos por família; `home.css` só na Home; `portfolio.css` só em portfolio/termos;
`services.css` em todas as páginas de `servicos/` (índice e especialidades);
`accessibility.css` é global. Medidas de texto em páginas internas usam `rem`, não
`ch`, para não re-quebrar linhas na troca de fonte (CLS). Existir um `custom.css` não prova que esteja no
head — verificar o import real antes de editar.

## Invariantes (confirmar antes de mexer; não manipular contadores para ficar verde)

- **29 URLs** no sitemap; **20 aliases** (redirects de paginação).
- **4 estudos** (não contar o laboratório S22 experimental).
- **11 figuras científicas** (QEE 5 + PDS 4 + Fuzzy 2) **+ 1 diagrama Web** = 12 figuras.
- **5 SVGs QEE** em `assets/images/portfolio/qee/`
  (`03_carga, 06_fp, 07_thd, 09_neutro, 10_eventos`); bytes publicados idênticos
  aos blobs da `main`.
- **8 testes** de supply chain.
- **9 arquivos de licença** em `static/licenses/`.

Uma alteração intencional de rotas/figuras exige revisar as invariantes, não
ajustar números. Preservar acentos/encoding dos slugs (não quebrar canonicals).

## Legado / não promover

`content/post/`, `data/home/stats.yaml`, campos antigos de `testimonials.yaml` e
`hero.yaml`, assets de software antigos e `resources_backup/`. Estar no Git não
autoriza publicar, apagar ou reutilizar. Não reativar depoimentos legados
(o bloco "testimonials" renderiza abordagem/capacidades, apesar do nome).
