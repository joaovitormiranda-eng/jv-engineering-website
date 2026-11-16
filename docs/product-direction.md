# Direção de produto (07D-S.27)

Documento curto de decisão. O relatório completo desta rodada (evidências,
fontes, matriz de inconsistências) fica fora do repositório, nos artefatos da
sessão. Nada aqui é resultado comercial comprovado.

## Decisão (revista na S29)

**A JV Engineering é uma marca técnica independente de engenharia, computação e
desenvolvimento, que também publica estudos e projetos reais.** Serviços técnicos
(orientação, revisão e desenvolvimento, com escopo avaliado) e portfólio fazem
parte da mesma identidade; o site não segmenta visitantes por perfil.

- Não é site de candidatura nem currículo online. Recrutadores não têm jornada
  própria; a bifurcação "estudante / recrutador" da S28 foi rejeitada e removida.
- Acompanhar estudantes é uma aplicação dos serviços, não a identidade da marca.
- Fora de escopo: executar avaliações acadêmicas em nome de terceiros.
- Nenhum vínculo, parceria ou endosso empresarial é sugerido.

## Estrutura da experiência

| Página | Papel |
|---|---|
| Início | Hero tipográfico com figuras reais dos estudos → projetos → serviços → método → ferramentas → sobre → contato |
| Projetos | Quatro estudos em linhas editoriais: figura, decisões de engenharia, ferramentas e natureza dos dados |
| Estudo | Ficha técnica, decisões de engenharia, conteúdo integral, visualizador de figuras, TOC com scroll-spy |
| Serviços | O que solicitar → áreas → exemplos publicados → como funciona → limites → contato, com índice fixo |

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
