---
title: "Plataforma Web com Hugo, CI/CD e Consentimento para Analytics"
date: 2026-11-06
lastmod: 2026-11-06
draft: false
slug: "plataforma-web"
description: "Projeto próprio da JV Engineering: site estático com Hugo, validação em Pull Requests, publicação no GitHub Pages e Analytics condicionado ao consentimento."
service: "/servicos"
catalog_image:
  src: "images/portfolio/plataforma-web-pipeline.png"
  format: "webp"
  alt: "Fluxo documental: Pull Request executa CI sem deploy; após revisão e merge, o push em main publica no GitHub Pages."
  caption: "Arquitetura documental · validação e publicação do próprio site"
---

## Problema e objetivo

O próprio site da JV Engineering é um projeto de desenvolvimento de software: organizar conteúdo técnico, apresentar serviços e manter uma publicação que possa ser validada antes de chegar ao público.

A solução utiliza páginas estáticas geradas pelo Hugo, componentes reutilizáveis e dois workflows separados. O objetivo é permitir evolução editorial e técnica sem exigir um servidor de aplicação para entregar as páginas do portfólio.

Este é um **projeto próprio**, não um trabalho contratado por cliente. Ele demonstra implementação web, organização de código, automação de build e cuidados com navegação e mensuração; não é evidência de ensaio de circuitos ou de desenvolvimento de firmware.

## Autoria, base e tecnologias

A apresentação, o conteúdo e as customizações da JV Engineering são conduzidos por **João Vitor Miranda Sousa**, responsável identificado no site e no [repositório público da plataforma](https://github.com/joaovitormiranda-eng/jv-engineering-website).

O site utiliza o **Up Business Theme**, de Iago Bozza, cuja configuração informa licença MIT. O tema permanece vendorizado; as adaptações usam layouts, partials, estilos e scripts locais. Portanto, este estudo não apresenta o tema ou suas dependências como criação integral da JV Engineering.

| Camada | Tecnologia e papel no projeto |
| --- | --- |
| Conteúdo e geração | Hugo, Markdown e arquivos YAML |
| Interface | HTML, Tailwind CSS e JavaScript |
| Organização | Partials reutilizáveis, configuração e recursos locais |
| Validação e publicação | Git, GitHub Actions e GitHub Pages |
| Mensuração opcional | GA4, carregado somente após consentimento |

## Arquitetura de validação e publicação

{{< portfolio-figure src="images/portfolio/plataforma-web-pipeline.png" vector="images/portfolio/plataforma-web-pipeline.svg" alt="Diagrama documental do fluxo real: Pull Request para main executa instalação npm, build Hugo e conferência de saídas, sem publicação. Após revisão humana e merge, o push em main gera o artefato e executa o deploy no GitHub Pages." caption="Diagrama elaborado a partir dos workflows versionados. Representa a arquitetura implementada, não uma medição de velocidade ou garantia de disponibilidade." >}}

### Pull Requests: validar sem publicar

O workflow de CI responde a Pull Requests para `main`. Ele instala as dependências com `npm ci --include=dev --ignore-scripts`, compila o Hugo em produção e confere a existência das saídas HTML, sitemap, CSS e JavaScript.

O workflow possui permissão de leitura do conteúdo e não inclui job de publicação. Essa checagem reduz o risco de aceitar uma alteração que não compila; ela não substitui revisão editorial, inspeção visual ou testes completos dos links.

### Main: gerar artefato e publicar

O workflow de publicação é separado. No fluxo habitual, o push resultante do merge em `main` executa build, envia o artefato e faz deploy no GitHub Pages. Também existe um gatilho manual de manutenção no workflow; ele não faz parte da validação do PR.

As permissões são declaradas por job: o build lê o conteúdo e a configuração de Pages, enquanto a escrita em Pages e a emissão do token OIDC ficam no deploy. O checkout não persiste credenciais no repositório de trabalho.

As versões de Hugo Extended e Node são fixadas nos workflows; o lockfile do site acompanha a instalação com `npm ci`. Isso torna as entradas do build mais explícitas, sem prometer reprodução idêntica em qualquer sistema ou disponibilidade permanente de dependências externas.

## Navegação, recursos e privacidade

- **Conteúdo rastreável:** serviços, estudos e tecnologias usam links HTML e metadados compartilhados, com o prefixo de publicação do GitHub Pages.
- **Interface responsiva:** o menu mobile usa estado de disclosure, controle por teclado, Escape e retorno de foco. As imagens declaram dimensões para reservar espaço.
- **Carregamento de imagens:** o hero tem carregamento imediato e prioridade alta; as figuras científicas abaixo da área inicial mantêm lazy loading nativo. Isso não implica aprovação universal dos Core Web Vitals.
- **Contato sem dependência de Analytics:** os links WhatsApp funcionam mesmo sem consentimento ou com a tag bloqueada. As mensagens iniciais são estáticas e editáveis no destino.
- **Consentimento prévio:** o script local só carrega a tag do Google após uma escolha válida. O visitante pode recusar ou revogar a preferência; as permissões publicitárias permanecem negadas.

O evento `contact_click` classifica o clique por componente e contexto, sem incluir telefone ou texto da mensagem nos parâmetros customizados. Um clique não comprova envio da mensagem, conversa iniciada, lead qualificado ou contratação. Os detalhes de tratamento de dados estão na [página de privacidade]({{< relref "/privacidade" >}}).

## Evidências verificáveis

| Evidência | O que permite conferir |
| --- | --- |
| [Workflow de CI](https://github.com/joaovitormiranda-eng/jv-engineering-website/blob/1f0be3a2d6f45945bc14934e258b709dbe29d5c7/.github/workflows/ci.yml) | Gatilho de PR, versões, instalação, build e checagem das saídas |
| [Workflow de Pages](https://github.com/joaovitormiranda-eng/jv-engineering-website/blob/1f0be3a2d6f45945bc14934e258b709dbe29d5c7/.github/workflows/hugo.yml) | Separação entre build e deploy, artefato e permissões |
| [Deploy do merge da etapa de contato](https://github.com/joaovitormiranda-eng/jv-engineering-website/actions/runs/42541447392) | Execução publicada para o commit de referência deste estudo |
| [Implementação de Analytics](https://github.com/joaovitormiranda-eng/jv-engineering-website/blob/1f0be3a2d6f45945bc14934e258b709dbe29d5c7/hugo-up-business/assets/js/analytics.js) | Consentimento, revogação e contrato do evento de contato |
| [Metadados do tema-base](https://github.com/joaovitormiranda-eng/jv-engineering-website/blob/1f0be3a2d6f45945bc14934e258b709dbe29d5c7/hugo-up-business/_vendor/github.com/writeonlycode/hugo-up-business/theme.toml) | Origem, autoria e licença declarada do tema |

As referências fixadas no commit `1f0be3a` registram o estado analisado. Versões futuras podem alterar a implementação. O build pode ser conferido a partir do repositório com as versões indicadas; não é necessário executar MATLAB ou reproduzir os estudos científicos para compilar o site.

## Limitações e aplicações

O projeto demonstra a construção e manutenção desta plataforma estática. Não comprova experiência industrial, clientes atendidos ou capacidade em todas as tecnologias citadas nas áreas de suporte.

Testes locais e um workflow bem-sucedido não certificam conformidade jurídica, acessibilidade integral, segurança absoluta, ranking orgânico ou ausência de falhas futuras. As medições locais de performance variaram entre execuções; este caso não declara ganho garantido de velocidade ou conversão.

A experiência é relevante para discutir [programação e desenvolvimento]({{< relref "/servicos" >}}#programacao-desenvolvimento) e [organização de documentação técnica]({{< relref "/servicos" >}}#dados-matematica-documentacao). Ferramentas, testes e entregáveis devem ser escolhidos de acordo com os requisitos e a viabilidade de cada demanda.
