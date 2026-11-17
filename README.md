# JV Engineering — site e portfólio técnico

Site estático da **JV Engineering**, operação técnica independente de engenharia,
computação e desenvolvimento conduzida por João Vitor Miranda Sousa. O site
apresenta os serviços de apoio técnico (orientação, revisão e desenvolvimento com
escopo avaliado) e publica estudos técnicos com método, figuras e código.

- Produção: <https://joaovitormiranda-eng.github.io/jv-engineering-website/>
- Como o próprio site é feito: [estudo "Plataforma Web"](https://joaovitormiranda-eng.github.io/jv-engineering-website/portfolio/plataforma-web/)

## Escopo

O site é a vitrine técnica e o canal de contato da JV Engineering. O contato
acontece pelo WhatsApp, com mensagem inicial contextualizada por página.

Não há backend, banco de dados, formulário, login ou pagamento. O site não executa
Python nem MATLAB no navegador e não é uma ferramenta de cálculo certificada.

## Funcionalidades

| Área | O que existe |
|---|---|
| Início | Hero tipográfico com o explorador dos quatro estudos (abas ARIA, setas/Home/End, swipe, link direto `#estudo-…`); serviços, método, ferramentas, perfil e contato. |
| Projetos | Catálogo em `/portfolio/` e quatro estudos com ficha técnica, decisões de engenharia, índice com destaque da seção atual, barra de leitura e galeria de figuras em `<dialog>` (zoom 2×, anterior/próxima, teclado e swipe). |
| Serviços | `/servicos/`, `/servicos/matlab/` e `/servicos/python-engenharia/`, com índice fixo da página e links de WhatsApp por área. |
| Navegação | Menu móvel não modal, breadcrumbs, faixas de "próximos passos", índice por tecnologia em `/tags/`, página 404. |
| SEO | Canonical, Open Graph, Twitter Card, JSON-LD (`Person`, `BreadcrumbList`, `TechArticle`), sitemap com 29 URLs e 20 redirects de paginação. |
| Acessibilidade | Skip link, foco visível, alvos de toque de 44 px, `prefers-reduced-motion`, tabelas roláveis. Todo o conteúdo funciona sem JavaScript; os scripts só melhoram componentes que já existem no HTML. |
| Privacidade | Google Analytics 4 opcional, carregado só após consentimento explícito ([detalhes](#privacidade-e-analytics)). |

## Tecnologias

| Camada | Ferramenta | Versão |
|---|---|---|
| Gerador estático | Hugo Extended | 0.169.0 (fixada em `.github/hugo-toolchain.json`) |
| CSS utilitário | Tailwind CSS + `@tailwindcss/typography`, via Hugo `css.TailwindCSS` | 4.3.4 / 0.5.20 (`package-lock.json`) |
| CSS próprio | Design system em CSS puro (`--jv-*`), sem pré-processador | — |
| JavaScript | Módulos ES sem dependências, empacotados pelo Hugo (`js.Build`, esbuild) | — |
| Ferramentas de build | Node.js + npm (somente em build; nada é enviado ao navegador) | Node 24.18.0 |
| Testes e verificações | Python 3, apenas biblioteca padrão | 3.x |
| Tema base | [Up Business](https://github.com/writeonlycode/hugo-up-business) (MIT), vendorizado | commit `33d421f28c8c` |
| CI/CD e hospedagem | GitHub Actions + GitHub Pages | — |

O tema está em `hugo-up-business/_vendor/`, então o build não precisa de Go nem de
acesso à rede para baixar módulos.

## Arquitetura

```
Markdown (content/) + YAML (data/, config/)
        │
        ▼
templates locais (layouts/)  ──sobrepõem──▶  tema vendorizado (_vendor/…/layouts)
        │
        ▼  Hugo Pipes: Tailwind, minify, fingerprint + SRI, esbuild
public/  ──▶ verify-build.py (manifesto SHA-256) ──▶ invariantes + auditoria ──▶ GitHub Pages
```

**Templates.** Arquivos em `hugo-up-business/layouts/` e `assets/` têm prioridade
sobre os do tema. A Home é `layouts/home.html`; seus blocos ficam em
`layouts/partials/blocks/home/` e leem os textos de `data/home/*.yaml`. Estudos e
serviços têm templates próprios (`layouts/portfolio/`, `layouts/servicos/`) e
shortcodes para equações, métricas, figuras e repositório de origem.

**CSS**, na ordem carregada por `layouts/baseof.html`:

1. `styles.css` do tema (entrada do Tailwind) — utilitários e tipografia.
2. `assets/css/system.css` — tokens `--jv-*`, layout, tipografia, botões, header,
   footer, breadcrumb, ficha técnica, movimento. Todas as páginas.
3. Um arquivo por família: `home.css` (só Home), `portfolio.css` (estudos e
   páginas de tema), `services.css` (todas as páginas de serviços).
4. `fonts.css` do tema (Inter, `font-display: swap`).
5. `assets/css/accessibility.css` — skip link, foco, geometria do menu móvel.
6. `analytics-consent.css`, embutido no `<head>` apenas quando o Analytics está ativo.

Arquivos de família podem usar os tokens, mas não os redefinem.

**JavaScript.** `assets/js/main.js` importa os módulos; cada um só age se encontrar
o seu gancho `data-*` na página:

| Módulo | Gancho | Função |
|---|---|---|
| `shared/navigation.js` | `[data-navigation]` | Menu móvel, link atual, altura do header (`--navigation-offset`). |
| `shared/section-spy.js` | `[data-section-spy]` | Índice da página de serviços com a seção atual. |
| `shared/fragment.js` | — | Decodificação segura de `#fragmentos` (usada pelos demais). |
| `home/study-explorer.js` | `[data-study-explorer]` | Explorador de estudos do hero. |
| `home/reveal.js` | `[data-reveal]` | Entrada única de grupos abaixo da dobra (desligada com reduced motion). |
| `portfolio/study-progress.js` | `.portfolio-study__body` | Barra de leitura e destaque no índice. |
| `portfolio/figure-viewer.js` | `[data-figure-viewer]` | Galeria de figuras em `<dialog>`. |

`assets/js/analytics.js` é um pacote separado, incluído apenas em produção e com a
configuração validada (ver abaixo).

## Estrutura do repositório

```
.
├── .github/
│   ├── workflows/ci.yml          # check de PR "Build Hugo" (somente leitura)
│   ├── workflows/hugo.yml        # build + deploy do Pages (push na main)
│   ├── scripts/                  # instalador verificado do Hugo, verify-build, testes de supply chain
│   ├── hugo-toolchain.json       # versão e SHA-256 do Hugo
│   └── dependabot.yml
├── .kiro/steering/               # regras para agentes (produto, stack, estrutura, governança)
├── docs/product-direction.md     # decisão de produto vigente
├── scripts/dev/                  # bootstrap local, invariantes e auditoria estática
├── hugo-up-business/             # projeto Hugo
│   ├── hugo.yaml                 # configuração do site
│   ├── config/_default/          # params.yaml (SEO, Analytics, contato) e menus.yaml
│   ├── content/                  # páginas: portfolio/, servicos/, tags/, privacidade.md
│   ├── data/                     # textos da Home, áreas de serviço, mensagens de contato, SEO de tags
│   ├── layouts/                  # templates, partials e shortcodes
│   ├── assets/                   # CSS, JS, imagens processadas pelo Hugo, favicons
│   ├── static/                   # figuras PDS/Fuzzy, licenças publicadas, verificação do Search Console
│   ├── _vendor/                  # tema Up Business (não editar; sobrepor em layouts/ ou assets/)
│   ├── hugo_stats.json           # classes usadas no HTML (versionado; gerado pelo build)
│   └── package.json, package-lock.json
├── AGENTS.md, SECURITY.md, THIRD_PARTY_NOTICES.md
```

## Requisitos

- Hugo **Extended 0.169.0** (o módulo exige no mínimo essa versão).
- Node.js **24.18.0** com npm (a versão usada no CI).
- Python 3 e Bash para os testes. No Windows, os testes do instalador usam Git
  Bash: defina `TEST_BASH` com o caminho do `bash.exe`.

## Executar localmente

```bash
cd hugo-up-business
npm ci --include=dev --ignore-scripts
hugo server
```

O Hugo serve o site em `http://localhost:1313/jv-engineering-website/` (o caminho
vem do `baseURL`). Fora do ambiente de produção o Analytics não é incluído.

Em sandbox Linux sem Hugo instalado, `scripts/dev/bootstrap.sh` instala o Hugo
fixado numa pasta isolada (fora do repositório), roda `npm ci`, gera o build de
produção e executa todas as verificações. Detalhes em
[`scripts/dev/README.md`](scripts/dev/README.md).

## Build de produção

```bash
cd hugo-up-business
HUGO_ENVIRONMENT=production hugo --gc --minify
```

A saída vai para `hugo-up-business/public/` (ignorada pelo Git). É o mesmo comando
do CI e do deploy.

## Testes e verificações

Na raiz do repositório, depois do build:

```bash
python3 .github/scripts/test-supply-chain.py              # 8 testes do instalador e do verificador
python3 .github/scripts/verify-build.py hugo-up-business/public --manifest ../site-manifest.json
python3 scripts/dev/check-invariants.py hugo-up-business/public
python3 scripts/dev/audit-site.py hugo-up-business/public
```

| Verificação | O que garante |
|---|---|
| `test-supply-chain.py` | O instalador só ativa o Hugo após conferir o SHA-256; o verificador rejeita pacote adulterado, caminho privado, link físico e CSS ausente. |
| `verify-build.py` | Arquivos obrigatórios, sitemap válido, nenhum arquivo privado ou link; grava o manifesto SHA-256 que o deploy compara com o tar do Pages. |
| `check-invariants.py` | 29 URLs, 20 aliases, figuras por estudo (5/4/2/1), 5 SVGs QEE idênticos à fonte, 9 licenças, 8 testes de supply chain. |
| `audit-site.py` | Um `<h1>` por página, título, descrição, canonical, Open Graph, JSON-LD válido, `alt`/dimensões de imagens, links e `#fragmentos` internos, `target=_blank` com `rel=noopener`. |

As quatro rodam no check de PR. Uma mudança intencional de rotas ou figuras exige
revisar os valores esperados em `check-invariants.py`, nunca ajustá-los para
passar.

## Deploy

1. Todo PR para `main` roda `ci.yml` (**Build Hugo**): testes de supply chain, Hugo
   instalado com digest verificado, `npm ci --ignore-scripts`, build de produção e
   as verificações acima. O token tem só `contents: read` e não há secrets.
2. O merge na `main` dispara `hugo.yml`. O job de build (só leitura) repete o
   processo, envia `public/` como artefato e confere o tar com o manifesto. Só o
   job de deploy recebe `pages: write` e `id-token: write`.
3. As Actions são fixadas por SHA completo. O Dependabot propõe atualizações de
   npm e Actions semanalmente, sem auto-merge. Atualizar o Hugo exige revisar a
   release e os dois digests em `hugo-toolchain.json`.

**Um merge na `main` publica o site.** Correções e reversões passam por PR.

## Privacidade e analytics

- O GA4 só é incluído no build de produção, conforme `analytics` em
  `config/_default/params.yaml`. Com `enabled: true`, o build falha se faltar um ID
  válido, `settings_reviewed: true` ou retenção confirmada de 2 ou 14 meses.
- Nada é carregado do Google antes do clique em "Aceitar". Recusar não carrega
  nada; revogar depois de aceitar apaga os cookies próprios e recarrega a página
  sem a tag.
- A escolha fica no `localStorage` por 180 dias. Os eventos usam URL sem query nem
  fragmento e referrer reduzido à origem; Google Signals e sinais de anúncios
  ficam desligados. O evento `contact_click` envia apenas categorias fixas.
- Política publicada: [`/privacidade/`](https://joaovitormiranda-eng.github.io/jv-engineering-website/privacidade/).

Em testes automatizados de navegador, bloqueie as requisições ao Google **antes**
da primeira navegação e nunca aceite o consentimento com rede real.

## Estudos publicados

| Estudo | Rota | Natureza | Código |
|---|---|---|---|
| Qualidade de energia com dados sintéticos em Python | `/portfolio/qualidade-energia/` | Dados exclusivamente sintéticos; sem avaliação normativa | [analise-qee-python](https://github.com/joaovitormiranda-eng/analise-qee-python) |
| Filtragem digital e processamento de sinais com MATLAB | `/portfolio/modelagem-simulacao/` | Estudo computacional documentado | [MATLAB](https://github.com/joaovitormiranda-eng/MATLAB) |
| Modelagem de incertezas com lógica Fuzzy em MATLAB/Octave | `/portfolio/solucoes-computacionais/` | Estudo estático (sem laboratório interativo) | [MATLAB](https://github.com/joaovitormiranda-eng/MATLAB) |
| Plataforma web com Hugo, CI/CD e consentimento | `/portfolio/plataforma-web/` | Projeto próprio; diagrama documental | este repositório |

## Segurança

Práticas adotadas, limites do GitHub Pages e como relatar um problema:
[`SECURITY.md`](SECURITY.md).

## Licenças e atribuições

O repositório não declara uma licença de código aberto, e o rodapé do site indica
"Todos os direitos reservados". Os componentes de terceiros mantêm as licenças
próprias: tema Up Business, fontes Inter, Bootstrap Icons, Heroicons, Tailwind CSS,
figuras e fontes do projeto QEE e as marcas usadas nos links sociais. A origem e os
termos estão em [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md); os textos das
licenças são publicados em `/licenses/` a partir de `hugo-up-business/static/licenses/`.

## Limitações conhecidas

- **iPhone (P0):** em iPhone físico foi relatado um retângulo preto sobre parte do
  hero. A causa não foi demonstrada e o problema continua aberto. Testes em Chrome
  headless ou emulação não reproduzem o defeito e não servem como prova de correção.
- O GitHub Pages não permite cabeçalhos HTTP próprios: não há cabeçalho
  Content-Security-Policy. Os recursos próprios usam Subresource Integrity.
- O Search Console ainda não está conectado (ver `docs/product-direction.md`).
- Rodar `hugo server` (ambiente de desenvolvimento) altera `hugo_stats.json`, porque
  o HTML sem Analytics tem menos classes. Não versione essa alteração; o build de
  produção regenera o arquivo de referência.
- `data/home/testimonials.yaml` guarda relatos antigos que **não** são publicados;
  sua publicação depende de confirmação de origem e autorização.

## Documentação

| Documento | Assunto |
|---|---|
| [`AGENTS.md`](AGENTS.md) e [`.kiro/steering/`](.kiro/steering/) | Regras para agentes: produto, stack, estrutura, invariantes, governança |
| [`scripts/dev/README.md`](scripts/dev/README.md) | Bootstrap local e diferenças em relação ao CI |
| [`docs/product-direction.md`](docs/product-direction.md) | Decisão de produto vigente e critérios para um futuro backend |
| [`SECURITY.md`](SECURITY.md) | Segurança da publicação e do frontend |
| [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) | Licenças e atribuições de terceiros |
