# JV Engineering | Plataforma e Portfólio Digital

Repositório oficial da plataforma desenvolvida para oferecer suporte acadêmico e técnico especializado a estudantes de Engenharia e áreas STEM.

Acesse o site em produção: [JV Engineering](https://joaovitormiranda-eng.github.io/jv-engineering-website/)

---

## Contexto e Objetivo

A JV Engineering surgiu para apoiar estudantes durante toda a sua trajetória acadêmica na graduação. Este site atua como o principal canal de aquisição e consolidação da marca. 

O objetivo do projeto é transmitir credibilidade técnica, apresentar o portfólio de serviços de forma clara e facilitar o contato orgânico de alunos de cursos como Engenharia Elétrica, Eletrônica, Mecatrônica, Computação e Ciência de Dados.

## Arquitetura e Desenvolvimento

A premissa técnica do projeto foi evitar construtores de sites pesados (page builders). A escolha foi construir uma arquitetura leve, voltada para alta performance de carregamento e otimizada para indexação orgânica (Google Search Console).

O stack utilizado inclui:

* **Gerador de Sites Estáticos (SSG):** Desenvolvido com Hugo, garantindo compilação rápida e entrega eficiente de arquivos estáticos.
* **Front-end Customizado:** Estrutura e interatividade construídas do zero utilizando HTML5, CSS3 e JavaScript.
* **CI/CD e Hospedagem:** Fluxo de deploy automatizado utilizando GitHub Actions, com o ambiente de produção hospedado nativamente no GitHub Pages.

## Ambiente de build e segurança da publicação

O build validado utiliza **Hugo Extended 0.169.0**, **Node.js 24.18.0** e o lockfile
em `hugo-up-business/package-lock.json`. Instale as dependências nessa pasta com
`npm ci --include=dev --ignore-scripts` e execute `hugo --environment production --minify`.
A versão mínima do módulo Hugo não substitui a versão de build validada.

A versão e o SHA-256 do pacote Linux estão centralizados em
`.github/hugo-toolchain.json`. CI e deployment usam o mesmo instalador, que verifica
o digest antes de extrair o pacote para uma pasta temporária, sem `sudo` ou scripts
de instalação do pacote. Ao atualizar Hugo, compare o digest com o manifesto da
release oficial e a API de assets; revise a origem antes de alterar o valor fixado.
Essa verificação detecta bytes diferentes do digest aprovado, mas não certifica
que uma release upstream já comprometida seja segura.

Somente os workflows na pasta `.github/workflows/` da raiz são utilizados. O antigo
workflow duplicado dentro de `hugo-up-business/.github/` foi retirado para evitar
versões e instruções divergentes. `Build Hugo` continua sendo o check obrigatório
de PR; apenas a main pode publicar pelo workflow de Pages. O job de build não
recebe permissões de escrita, Pages ou OIDC; apenas o job de deploy recebe as duas
permissões de publicação necessárias.

As Actions usam SHAs completos, com comentários de versão. O Dependabot acompanha
npm e GitHub Actions semanalmente, sem auto-merge; a configuração versionada não
ativa por si só alertas ou security updates administrativos. Hugo e o digest JSON
exigem revisão manual das releases. Os verificadores rejeitam arquivos não públicos
e links no build, registram um manifesto SHA-256 fora do site e comparam o tar de
Pages com esse manifesto antes de liberar o job de deploy.

Antes de publicar uma atualização, execute
`python .github/scripts/test-supply-chain.py`, confira os dois workflows com
actionlint e compare builds, URLs, metadados e privacidade. No Windows, os testes do
instalador requerem Git Bash: defina `TEST_BASH` com o caminho de `bash.exe`.
Não é necessário substituir globalmente o Hugo local para testar uma versão em
pasta isolada. Uma falha posterior deve ser corrigida por novo PR, sem contornar
`Protect main`; um rollback deve reverter a mudança específica e passar pelo CI,
considerando que voltar a uma versão vulnerável exige uma decisão de risco.

## Roadmap de Desenvolvimento

O projeto segue um fluxo ágil de melhorias. Os próximos passos incluem:

- [x] Lançamento da página principal (Landing Page) e indexação orgânica.
- [ ] Criação de uma seção para "Biblioteca de Projetos" e casos de sucesso.
- [ ] Integração para agendamento de consultorias e orçamentos direto para o WhatsApp.
- [ ] Refatoração contínua de interface (UI) e usabilidade (UX).

---
*Projetado e desenvolvido por João Vitor Miranda Sousa.*
