# AGENTS — JV Engineering

Índice de orientação para agentes de programação (Kiro, Codex e outros) que
trabalham neste repositório. A JV Engineering é um site estático (Hugo) de
portfólio e apoio técnico em Engenharia/STEM, publicado no GitHub Pages, e também
um estudo de engenharia de software (segurança de publicação, privacidade,
acessibilidade, testes).

## Antes de implementar qualquer mudança

Consulte os arquivos de steering relevantes à sua tarefa. Eles contêm as versões
de ferramentas, a estrutura do projeto, as invariantes e as regras completas:

- `.kiro/steering/product.md` — propósito, estudos publicados e rigor de conteúdo.
- `.kiro/steering/tech.md` — stack, build, CI/Pages, testes e Analytics/consentimento.
- `.kiro/steering/structure.md` — mapa de caminhos, overrides do tema e invariantes.
- `.kiro/steering/governance.md` — limites de publicação, áreas protegidas e Git seguro.

Arquitetura, comandos de build/teste e deploy estão no `README.md`; práticas de
segurança no `SECURITY.md`. Os arquivos de steering não repetem esse conteúdo.

> Observação sobre carregamento: o Kiro carrega automaticamente os arquivos em
> `.kiro/steering/` (front matter `inclusion: always`) e descobre `AGENTS.md`.
> Os caminhos listados acima são **referências textuais** para você abrir os
> arquivos — não são um mecanismo de inclusão automática. Abra cada documento
> relevante antes de agir.

## Três regras críticas

1. **Não modificar áreas protegidas sem autorização** (ex.: `design/`, hero/P0,
   Analytics, consentimento, conteúdo científico, workflows). Detalhe em
   `governance.md`.
2. **Não executar merge ou deploy sem aprovação humana.** GitHub é a fonte oficial;
   merge na `main` dispara publicação.
3. **Não alegar correções ou resultados científicos sem evidência.** Preservar
   equações, unidades, limites e fontes; nenhuma afirmação absoluta de bug
   resolvido, conformidade ou ganho sem demonstração.
