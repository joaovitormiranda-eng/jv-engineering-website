# AGENTS — JV Engineering

Instruções permanentes para agentes que trabalham neste repositório. Em Kiro Web
o `AGENTS.md` de um diretório é descoberto e carregado como contexto de steering;
ele garante que as regras abaixo viajem com o repositório mesmo quando o
`.kiro/steering/` não está na raiz do workspace da sessão.

**Leia os quatro arquivos de steering antes de qualquer tarefa:**

- `.kiro/steering/product.md` — propósito, estudos publicados, rigor de conteúdo.
- `.kiro/steering/tech.md` — Hugo 0.169.0, Node 24.18.0, build, CI/Pages, 8 testes
  de supply chain, Analytics/consentimento, limitações do Kiro Web.
- `.kiro/steering/structure.md` — mapa de caminhos, overrides do tema, invariantes.
- `.kiro/steering/governance.md` — limites de publicação, áreas protegidas, Git
  seguro, P0 do hero e S22.

## Regras que nunca mudam sem autorização humana

- GitHub é a fonte oficial do código; confirmar HEAD/PR/CI/deploy antes de agir.
- Projeto Hugo em `hugo-up-business/`. Hugo Extended **0.169.0**, Node **24.18.0**.
- Sem merge, deploy ou `workflow_dispatch` sem autorização humana. Merge na `main`
  dispara o Pages.
- Branches isoladas; PRs pequenos; sem Git destrutivo ou force push.
- **`design/` é intocável.** Não abrir, listar, ler, mover ou publicar.
- Preservar conteúdo científico, acessibilidade, SEO e os 8 testes de supply chain.
- Analytics só conforme o consentimento existente; **proibido tráfego de teste no
  GA4 real**.
- **P0 do hero no iPhone continua ABERTO** (causa raiz não demonstrada); não propor
  CSS especulativo nem declarar resolvido por CI/emulação.
- **07D-S.22 (laboratório Fuzzy)** não é aprovado nem publicado; não reutilizar
  arquivos experimentais locais.
- Não adicionar segredos, dados pessoais ou documentos internos ao repositório.
- Dependabot #20/#21: não mexer sem autorização específica.

O documento mestre de handoff é a fonte de detalhe; GitHub e o código são a
verdade atual.
