# Direção de produto (07D-S.27)

Documento curto de decisão. O relatório completo desta rodada (evidências,
fontes, matriz de inconsistências) fica fora do repositório, nos artefatos da
sessão. Nada aqui é resultado comercial comprovado.

## Decisão

**Direção B, reversível: portfólio técnico como prova de competência, com
acompanhamento técnico como serviço complementar iniciado por conversa.**

Por quê:

- A demanda observada é pequena e autodeclarada (cerca de 15 contatos, alguns
  recorrentes por mais de um semestre, vindos de WhatsApp e indicações). Isso
  justifica manter o serviço, mas não justifica apresentar o site como plataforma
  de acompanhamento já validada (direção A).
- O que o site já tem de diferente de um marketplace de aulas é evidência
  verificável: estudos com método, figuras reais, código e limites. É isso que
  gera confiança antes do contato.
- O portfólio mantém valor profissional (recrutadores, GitHub) mesmo se a receita
  não crescer. A direção A pode ser retomada sem refazer nada.

Fora de escopo, por escolha: execução de atividades avaliativas em nome de
terceiros. O texto dos serviços já registra aprendizado, autoria e integridade
acadêmica.

## Caminhos do visitante

| Público | Entra por | Prova | Contato |
|---|---|---|---|
| Estudante / dúvida técnica | Início → Serviços | Estudos do portfólio ligados a cada especialidade | WhatsApp com mensagem contextual |
| Recrutador / profissional | Início → Perfil → GitHub | Catálogo, estudos, repositórios | LinkedIn, GitHub, e-mail |
| Explorador de estudos | Catálogo → Estudo → Outros estudos | Figuras, equações, código | CTA ao fim de cada estudo |

## Medição (a configurar, sem dados hoje)

Search Console não está conectado ao site; não há dados de busca. Para medir:
verificar a propriedade (já existe o arquivo `google…html` em `static/`), enviar
`sitemap.xml` e acompanhar consultas, páginas e CTR. O GA4 já registra cliques de
contato condicionados a consentimento. Indicadores sugeridos: cliques de contato
por página de origem; proporção estudo → serviço; contatos que viram conversa;
conversas recorrentes por semestre (esta última é manual, fora do site).

Observação técnica: o site é um projeto do GitHub Pages
(`/jv-engineering-website/`). Crawlers só leem `robots.txt` na raiz do domínio,
então um `robots.txt` neste repositório não teria efeito. O sitemap é descoberto
pelo Search Console.

## Quando considerar backend (não implementar agora)

Condições sugeridas, a calibrar com dados reais de contato:

1. Triagem manual no WhatsApp passa a consumir tempo relevante (muitos pedidos sem
   contexto), ou
2. há demandas recorrentes que exigem agenda, histórico de sessões ou materiais, ou
3. há necessidade de cobrar online.

Ordem recomendada, do menor ao maior custo operacional:

1. Link de agendamento de um serviço externo, sem backend próprio.
2. Formulário estruturado para um BaaS com Postgres (por exemplo Supabase, com
   região no Brasil), mínimo de dados, base legal e prazo de retenção definidos
   (LGPD), sem dados de terceiros além do necessário.
3. Portal autenticado e pagamentos (PSP com Pix) somente depois de 1 e 2 terem
   uso real. Backend próprio só se o BaaS limitar algo necessário.

O frontend atual já separa conteúdo (Markdown e `data/`), apresentação
(`assets/css/system.css` e arquivos por família) e contato (`utilities/contact-url`),
o que permite trocar o destino do CTA sem reescrever páginas.
