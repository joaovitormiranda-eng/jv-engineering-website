---
title: "Qualidade de energia com dados sintéticos em Python"
date: 2026-07-28
lastmod: 2026-11-10
service: "/servicos/python-engenharia"
draft: false
catalog_image:
  src: "images/portfolio/qee/03_carga.svg"
  width: 792
  height: 468
  alt: "Simulação S1: perfil de potência ativa em degraus nas primeiras 48 horas, sem medições reais."
  caption: "QEE sintético · perfil de carga simulado em Python"
slug: "qualidade-energia"
description: "Simulação trifásica em Python com dados sintéticos: potências, energia, harmônicos, desequilíbrio e corrente de neutro, com testes e gráficos SVG reproduzíveis."
categories:
  - "Ciência de Dados"
  - "Engenharia Elétrica"
tags:
  - "Python"
  - "Pandas"
  - "NumPy"
  - "Matplotlib"
  - "LaTeX"
  - "ETL"
  - "Qualidade de Energia"
  - "Automação"
---

**Os dados e resultados deste estudo são sintéticos e foram gerados por simulação computacional. Não representam medições de instalações reais nem certificação de conformidade normativa.**

## Problema e objetivo

Como conferir um cálculo de qualidade da energia quando se conhecem as grandezas que o originaram? Este projeto próprio usa um modelo elétrico explícito para gerar entradas controladas, processar indicadores e comparar os resultados com oráculos físicos e matemáticos.

A implementação computacional é funcional: gera dados, valida tabelas, exporta Excel, produz relatórios e desenha gráficos vetoriais. Os cenários elétricos são simulações didáticas independentes. Nenhuma amostra, distribuição ajustada, evento ou conclusão numérica da antiga base de medições é utilizada na nova geração.

O estudo demonstra programação científica, modelagem, processamento de dados e documentação. Não é um case contratado nem um diagnóstico de instalação.

## Pipeline Python e reprodução

O pacote modular `src/jv_qee/` separa configuração, fasores e cálculos físicos, geração sintética, indicadores, validação, exportação e visualização. NumPy sustenta as operações numéricas, Pandas organiza as tabelas, openpyxl trata XLSX e Matplotlib gera os SVGs estáticos.

1. **Configurar:** escolher cenário, semente, número de intervalos e parâmetros elétricos.
2. **Gerar:** construir tensões e correntes coerentes com o modelo e segmentar mudanças programadas.
3. **Calcular e conferir:** derivar potências, energia e indicadores; recusar entradas inválidas explicitamente.
4. **Exportar:** reunir metadados, parâmetros, tabelas, validações e referências em `QEE_DADOS_SINTETICOS.xlsx`, além de CSVs, relatório Markdown e manifesto de proveniência.
5. **Visualizar:** produzir 12 figuras SVG; cinco estão apresentadas abaixo. O site publica somente arquivos estáticos, sem executar Python no navegador.

| Parâmetro padrão | Valor definido para a simulação |
| --- | --- |
| Sistema | Trifásico, quatro fios, sequência ABC e neutro ideal |
| Tensão nominal linha–linha | 380 V RMS |
| Frequência nominal | 60 Hz |
| Corrente fundamental de referência | 20 A por fase |
| Fator de deslocamento de referência | 0,95 indutivo |
| Série semanal | 1.008 intervalos de 600 s, total de 168 h |
| Semente | 746031 |
| Formas de onda | Janelas curtas a 15.360 Hz; não uma semana inteira nessa taxa |
| Avaliação normativa | `normative_assessment = not_assessed` |

Esses parâmetros são escolhas do modelo, não características atribuídas a uma instalação real. A duração dos intervalos pode ser configurada e as fronteiras dos eventos são tratadas antes da agregação.

## Cenários elétricos controlados

| Cenário | Fenômeno modelado |
| --- | --- |
| S0 | Referência nominal equilibrada |
| S1 | Perfil periódico e degrau de carga |
| S2 / S3 | Cargas indutiva e capacitiva, com sinais distintos de Q₁ |
| S4 | Harmônicos prescritos de tensão e corrente |
| S4b | Harmônicos triplos e soma das correntes no neutro |
| S5 | Desequilíbrio de tensão por componentes simétricas |
| S6 | Afundamento, elevação e interrupção sintéticos programados |
| S7 | Frequência variável definida pela fase analítica conhecida |

São nove cenários válidos. S8 reúne entradas artificiais inválidas para testes, não uma campanha de medição. S7 não é um estimador certificado de frequência.

## Grandezas e verificações físicas

As tensões e correntes são representadas por **fasores RMS complexos por fase e ordem harmônica**. As potências são derivadas dessas grandezas, sem inventar P, Q, S e fator de potência separadamente:

- **Potência ativa:** soma de Re(Vₕ Iₕ*) por fase e ordem.
- **Potência reativa fundamental Q₁:** soma de Im(V₁ I₁*); positiva no caso indutivo e negativa no capacitivo.
- **Potência aparente SΣ:** soma de Vᵣₘₛ Iᵣₘₛ das fases. Não é a potência aparente efetiva da IEEE 1459.
- **Fator de potência verdadeiro:** P/SΣ. O fator de deslocamento fundamental DPF₁ considera somente a fundamental; eles podem diferir sob distorção.
- **THD:** razão entre a raiz da soma dos quadrados das componentes harmônicas e a fundamental, calculada separadamente para tensão e corrente.
- **Desequilíbrio:** 100 |V⁻|/|V⁺|, com componentes simétricas fundamentais.
- **Neutro:** soma fasorial das correntes por ordem, seguida da composição RMS; harmônicos triplos podem somar em vez de se cancelar.
- **Energia:** soma de P médio × duração explícita dos intervalos, com conversão para kWh e indicação de cobertura e lacunas.

Sob distorção, **P² + Q₁² = SΣ² não é uma identidade geral**. A média de fatores de potência também não substitui a agregação das grandezas físicas.

A suíte do repositório verifica oráculos analíticos, RMS e formas de onda, sinais de Q₁, integração temporal e fronteiras, THD, neutro, desequilíbrio, entradas inválidas, determinismo e ida e volta pelo Excel. Os resultados e os comandos são consultáveis na [documentação de testes da versão integrada](https://github.com/joaovitormiranda-eng/analise-qee-python/blob/96cf14a3d56e1266d795563c3233d6d7907f44de/docs/testing.md).

## Cinco exemplos de resultados sintéticos

As figuras mantêm os eixos, unidades, cenários e avisos do repositório científico. Cada uma pode ser aberta em tamanho original para inspeção e zoom.

### Perfil de carga e integração temporal

Em S1, a corrente acompanha um perfil periódico com retenção de ordem zero e um degrau de 20% em 12 h; a tensão permanece rígida. O perfil tem duas oscilações por dia e não foi ajustado a consumo real. Na configuração semanal padrão, a energia integrada é aproximadamente **1.992,862 kWh**, resultado da simulação, sem estimativa de economia.

{{< qee-figure file="03_carga.svg" number="1" alt="Cenário S1: potência ativa em kW versus tempo em horas, com perfil em degraus e mudança de carga em 12 horas." caption="Figura 1 — Perfil sintético S1 nas primeiras 48 h. Os degraus representam o modelo segmentado; a energia é integrada sobre os intervalos explícitos, não estimada pela aparência da curva." >}}

### Fator de potência e fator de deslocamento

O sinal de Q₁ diferencia o comportamento indutivo do capacitivo. Em S4, os harmônicos fazem o fator de potência verdadeiro diferir do deslocamento fundamental; um único número de FP não caracteriza todas as condições elétricas.

Na comparação agregada, os marcadores mostram a razão ∫P dt / ∫SΣ dt e a média temporal de DPF₁ em cada cenário. Essas agregações têm definições diferentes e não devem ser interpretadas como grandezas de faturamento.

{{< qee-figure file="06_fp.svg" number="2" alt="Comparação discreta da razão entre integrais de P e SΣ e da média temporal de DPF fundamental nos nove cenários sintéticos." caption="Figura 2 — Razão ∫P dt / ∫SΣ dt e média temporal de DPF₁ por cenário. Os pontos representam condições sintéticas distintas, sem linha de limite regulatório ou conclusão de faturamento." >}}

### Distorção harmônica

Os coeficientes prescritos em S4 produzem, na fase A, **THDV ≈ 2,236%** e **THDI ≈ 14,422%**. São razões relativas a fundamentais diferentes. Calcular esses valores não demonstra conformidade normativa, TDD ou severidade em uma rede real.

{{< qee-figure file="07_thd.svg" number="3" alt="Cenário S4: THD da fase A, aproximadamente 2,236% para tensão e 14,422% para corrente." caption="Figura 3 — Indicadores discretos de distorção calculados dos fasores harmônicos. O modelo não implementa avaliação normativa completa." >}}

### Harmônicos triplos e corrente de neutro

Em S4b, uma terceira harmônica de **3 A RMS por fase** produz **9 A RMS no neutro** pela soma em fase dessas componentes. O cancelamento das fundamentais equilibradas não implica cancelamento dos harmônicos triplos.

{{< qee-figure file="09_neutro.svg" number="4" alt="Cenário S4b: formas de onda das correntes de fase e do neutro, em painéis com escalas próprias e tempo em milissegundos." caption="Figura 4 — Correntes sintéticas no sistema a quatro fios. Os painéis distinguem as correntes instantâneas das fases e do neutro; 9 A é o RMS do neutro, não seu pico." >}}

### Eventos programados e janela RMS

S6 programa envelopes de **0,70 pu por 200 ms**, **1,15 pu por 300 ms** e **0,01 pu por 500 ms**. A tensão e a corrente são escaladas juntas, em um exercício de admitância constante. A curva RMS de um ciclo suaviza as fronteiras em relação ao envelope programado.

{{< qee-figure file="10_eventos.svg" number="5" alt="Cenário S6: envelope programado e tensão RMS móvel de um ciclo versus tempo em segundos, incluindo redução, elevação e interrupção sintéticas." caption="Figura 5 — Comparação entre eventos conhecidos e resposta da janela RMS. Não é um detector normativo certificado nem uma reprodução de ocorrências reais." >}}

## Limitações e interpretação

O modelo assume fonte rígida, neutro ideal e correntes prescritas. Não resolve impedância da rede, ressonância, saturação, instrumentação ou transitórios eletromagnéticos. A agregação harmônica de segmentos não equivale à FFT integral de uma janela contendo transientes.

Há verificações de energia e desequilíbrio no código e nas demais figuras, além das cinco selecionadas. O eventual exercício ideal de compensação reativa do repositório tem hipóteses restritas e **não dimensiona nem recomenda a instalação de bancos de capacitores**.

A avaliação permanece **`not_assessed`**: não se afirmam conformidade PRODIST/IEC/IEEE, multas, diagnóstico de instalação, economia financeira, equivalência com instrumento certificado ou validação de medições históricas.

## Código, documentação e proveniência

O [repositório QEE no GitHub](https://github.com/joaovitormiranda-eng/analise-qee-python) contém o código e as instruções atuais. Esta apresentação utiliza a [versão mesclada do PR #1](https://github.com/joaovitormiranda-eng/analise-qee-python/commit/96cf14a3d56e1266d795563c3233d6d7907f44de).

Para reproduzir o pacote, siga as [instruções de ambiente e reprodução](https://github.com/joaovitormiranda-eng/analise-qee-python/blob/96cf14a3d56e1266d795563c3233d6d7907f44de/docs/reproduction.md): a CLI `python -m jv_qee.cli suite --output resultados` gera os nove cenários, a planilha, CSVs, manifesto, relatório e 12 SVGs. Use um diretório novo e as dependências fixadas. Determinismo numérico não significa identidade binária do arquivo XLSX.

Referências metodológicas da versão integrada:

- [Modelo físico, hipóteses e integração temporal](https://github.com/joaovitormiranda-eng/analise-qee-python/blob/96cf14a3d56e1266d795563c3233d6d7907f44de/docs/methodology.md).
- [Validação e oráculos de engenharia](https://github.com/joaovitormiranda-eng/analise-qee-python/blob/96cf14a3d56e1266d795563c3233d6d7907f44de/docs/validation.md).
- [Cenários e parâmetros](https://github.com/joaovitormiranda-eng/analise-qee-python/blob/96cf14a3d56e1266d795563c3233d6d7907f44de/docs/scenarios.md).
- [Critérios das figuras e acessibilidade vetorial](https://github.com/joaovitormiranda-eng/analise-qee-python/blob/96cf14a3d56e1266d795563c3233d6d7907f44de/docs/graphics.md).

As figuras autorais de João Vitor Miranda Sousa são reutilizadas sob MIT; os contornos de fonte DejaVu/Bitstream mantêm seus avisos próprios. A licença não altera os direitos de outros materiais do site.

{{< qee-credits >}}

A tag LaTeX é mantida como referência de navegação histórica. A implementação sintética atual gera relatórios Markdown e não depende de LaTeX.
