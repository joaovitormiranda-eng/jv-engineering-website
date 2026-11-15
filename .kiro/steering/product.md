---
inclusion: always
---

# JV Engineering — Produto

## O que é

Site estático (Hugo) que serve como portfólio e apoio acadêmico/técnico em
Engenharia e áreas STEM. É também um estudo real de engenharia de software:
geração estática, segurança de publicação, privacidade, acessibilidade, testes e
manutenção incremental por PRs pequenos.

- Produção: https://joaovitormiranda-eng.github.io/jv-engineering-website/
- Repositório: https://github.com/joaovitormiranda-eng/jv-engineering-website

## O que NÃO é

- Não é CMS, backend, banco de dados ou formulário com armazenamento.
- Não é calculadora/ferramenta certificada.
- Não executa Python ou MATLAB no navegador. O "terminal Python" da seção About
  e os links para repositórios são ilustrativos/navegacionais, não execução.

## Conteúdo publicado (não recriar)

Quatro estudos em `content/portfolio/`:

| Estudo | Rota | Natureza |
|---|---|---|
| QEE | `/portfolio/qualidade-energia/` | Dados **exclusivamente sintéticos**; sem certificação normativa. |
| PDS | `/portfolio/modelagem-simulacao/` | Filtragem/espectro; preservar diferença entre resposta de uma passagem e `filtfilt`. |
| Fuzzy | `/portfolio/solucoes-computacionais/` | Estudo **estático**. Não há laboratório interativo publicado. |
| Plataforma Web | `/portfolio/plataforma-web/` | Diagrama documental, não uma app científica adicional. |

Também já existem: serviços por necessidade (MATLAB/Python), contato por WhatsApp
contextualizado, navegação mobile compacta, figuras ampliáveis, SEO, consentimento
GA4. Evite recriá-los.

## Rigor e proibições de conteúdo

- Preservar equações, unidades, parâmetros, curvas, limites e fontes dos estudos.
  Não inventar números, gráficos, downloads, depoimentos ou claims comerciais.
- QEE: aviso permanente obrigatório — **DADOS SINTÉTICOS — SIMULAÇÃO
  COMPUTACIONAL DIDÁTICA — NÃO REPRESENTAM MEDIÇÕES REAIS.** Nunca carregar,
  copiar ou reamostrar a planilha de terceiro. `normative_assessment = not_assessed`.
- Aviso MathWorks permanece em inglês, visível e acessível. Não abreviar/traduzir
  parcialmente.
- Sem alegações absolutas: não declarar "P0 resolvido", "CWV aprovado",
  "juridicamente regularizado", "software certificado" ou "ganho comprovado" sem
  evidência suficiente para o enunciado.
- A grade de ferramentas usa nomes factuais + símbolos genéricos autorais, não os
  logos proprietários. Não restaurar logos de titulares.

Fonte de detalhe: documento mestre de handoff (seções A, G, K). Este arquivo
resume; GitHub e o código são a verdade atual.
