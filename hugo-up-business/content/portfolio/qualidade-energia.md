---
title: "Pipeline Automatizado em Python para Diagnóstico de Qualidade de Energia"
date: 2026-07-28
draft: false
slug: "qualidade-energia"
description: "Desenvolvimento, validação e execução de um pipeline em Python para automação de ETL, análise estatística vetorial e diagnóstico normativo de Qualidade de Energia Elétrica (QEE) conforme PRODIST/ANEEL."
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

<!-- METRICAS DE IMPACTO (KPI GRID) -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
  <div class="p-4 rounded-xl bg-[#111827] border border-gray-800 text-center">
    <span class="block text-2xl md:text-3xl font-extrabold text-blue-400">1.666</span>
    <span class="text-xs text-gray-400 font-mono uppercase tracking-wider">Amostras Temporais</span>
  </div>
  <div class="p-4 rounded-xl bg-[#111827] border border-gray-800 text-center">
    <span class="block text-2xl md:text-3xl font-extrabold text-blue-400">51,39 kW</span>
    <span class="text-xs text-gray-400 font-mono uppercase tracking-wider">Demanda de Pico</span>
  </div>
  <div class="p-4 rounded-xl bg-[#111827] border border-gray-800 text-center">
    <span class="block text-2xl md:text-3xl font-extrabold text-emerald-400">0,949</span>
    <span class="text-xs text-gray-400 font-mono uppercase tracking-wider">FP Médio Global</span>
  </div>
  <div class="p-4 rounded-xl bg-[#111827] border border-gray-800 text-center">
    <span class="block text-2xl md:text-3xl font-extrabold text-emerald-400">&lt; 3s</span>
    <span class="text-xs text-gray-400 font-mono uppercase tracking-wider">Tempo de Pipeline</span>
  </div>
</div>

<!-- CARD DO REPOSITORIO GITHUB -->
<div class="my-8 p-4 rounded-xl bg-[#111827] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
  <div class="flex items-center gap-3">
    <div class="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
      <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
    </div>
    <div>
      <h4 class="text-white font-bold text-sm mb-0.5">Código-Fonte do Projeto</h4>
      <p class="text-gray-400 text-xs m-0">Acesse a arquitetura completa em Python, scripts ETL e gerador LaTeX no GitHub.</p>
    </div>
  </div>
  <a href="https://github.com/joaovitormonica87-cmyk" target="_blank" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors whitespace-nowrap">
    Ver Repositório no GitHub →
  </a>
</div>

---

### 📋 Ficha Técnica (Project Charter)

| Parâmetro | Especificação / Tecnologias |
| :--- | :--- |
| **Domínio de Aplicação** | Qualidade da Energia Elétrica (QEE), Eficiência & Data Analytics |
| **Nível de Maturidade** | Engenharia de Dados & Diagnóstico de Ativos (CMMI Level 3) |
| **Ferramentas Computacionais** | Python, Pandas, NumPy, Matplotlib, OpenPyXL, Engine TeX |
| **Arquitetura da Solução** | Pipeline ETL Modular + Audit Normativo (PRODIST/ANEEL) + Report Engine |
| **Métricas Avaliadas** | Perfil de Demanda, Fator de Potência, THD<sub>V</sub>, THD<sub>I</sub>, Harmônicas Triplen |

---

## 01. Contexto & Desafio Técnico (Business Case)

Campanhas industriais e prediais de monitoramento de Qualidade de Energia Elétrica (QEE) geram dezenas de milhares de registros em séries temporais. Tradicionalmente, esses relatórios são consolidados de forma manual em planilhas eletrônicas — um fluxo moroso, propenso a falhas de digitação e ineficiente para auditorias normativas rápidas.

O objetivo deste projeto consistiu no desenvolvimento de uma **arquitetura de software automatizada em Python** capaz de receber logs brutos de analisadores de energia trifásicos, sanitizar inconsistências temporais, calcular grandezas fundamentais e emitir laudos executivos em **menos de 3 segundos**.

> **Arquitetura do Fluxo de Valor:** Arquivo Bruto (.xlsx) ➔ Ingestão & Sanitização ETL ➔ Motor Analytics Vetorial ➔ Dashboards Executivos + Relatório TeX Auto-Gerado

### Modelagem Matemática do Pipeline

O pipeline executa o cálculo vetorial contínuo da série temporal (**1.666 amostras** ao longo de **138,75 horas** de medição contínua) para derivar as grandezas elétricas fundamentais da instalação:

<!-- CARD ESTILIZADO DE EQUAÇÕES MATEMÁTICAS -->
<div class="my-6 p-6 rounded-xl bg-[#111827] border border-gray-800 font-mono text-sm md:text-base text-gray-200 shadow-inner space-y-3 text-center">
  <div>
    <span class="text-blue-400 font-bold">Potência Aparente:</span> $S(t) = \sqrt{P(t)^2 + Q(t)^2}$
  </div>
  <div>
    <span class="text-amber-400 font-bold">Fator de Potência Real:</span> $FP(t) = \frac{P(t)}{S(t)}$
  </div>
  <div>
    <span class="text-purple-400 font-bold">Distorção Harmônica:</span> $\text{THD}_V = \left(\frac{\sqrt{\sum V_n^2}}{V_1}\right) \cdot 100\%$
  </div>
  <div class="pt-2 border-t border-gray-800/80 max-w-md mx-auto">
    <span class="text-emerald-400 font-bold">Dimensionamento Capacitivo:</span> $Q_c = P_{\text{pico}} \cdot (\tan \phi_1 - \tan \phi_2)$
  </div>
</div>

---

## 02. Arquitetura e Engenharia da Solução

Para assegurar reprodutibilidade, alto desempenho e padrões de engenharia corporativa, a solução foi componentizada em quatro pilares funcionais:

*   **Ingestão ETL & Sanitização Temporal:** Parser de planilhas complexas com eliminação dinâmica de colunas nulas (*ghost columns*) e conversão computacional do formato de data serial do Excel (`origin="1899-12-30"`) para objetos `datetime` padronizados no padrão ISO.
*   **Motor Analytics Vetorial & Audit Normativo:** Vetorização de cálculos estatísticos diários e globais via NumPy/Pandas, varredura de Afundamentos Momentâneos de Tensão (VTCDs) e verificação estrita de *compliance* com o **Módulo 8 do PRODIST (ANEEL)**.
*   **Engine de Visualização Executiva:** Exportação automatizada dos gráficos operacionais de alta resolução (**250 DPI**) com parâmetros estéticos padronizados para compor documentações técnicas.
*   **Motor de Reporting TeX Automatizado:** Geração autônoma de tabelas normativas em sintaxe nativa `.tex`, convertendo separadores decimais para a norma brasileira (vírgula) para imediata compilação de laudos.

---

## 03. Verificação, Validação & Diagnóstico Executivo (V&V)

### 🔹 Perfil Temporal de Demanda e Curva de Carga
A curva de carga evidencia o perfil operacional da instalação. Registrou-se um consumo de base (*baseload*) entre **3 kW** e **5 kW** nos finais de semana e picos operacionais estruturados durante os dias úteis, atingindo a **demanda máxima de 51,39 kW** no dia 22/05 às 15:21.

<!-- PAINEL INTERATIVO - FIGURA 1 -->
<div class="my-6 p-3 md:p-4 rounded-xl bg-[#111827] border border-gray-800 shadow-lg">
  <img src="/images/portfolio/qee/curvacarga.png" alt="Curva de Carga do Bloco" class="w-full rounded-lg mx-auto block" style="filter: invert(0.9) hue-rotate(180deg);" />
  <p class="text-center text-xs md:text-sm text-gray-400 mt-3 mb-1 font-mono">
    Figura 1: Curva de Carga temporal com registro da demanda máxima de 51,39 kW e consumo total de 1.507,71 kWh no período.
  </p>
</div>

---

### 🔹 Eficiência Energética e Fator de Potência
Apesar do Fator de Potência médio global figurar em **0,949**, o monitoramento contínuo identificou **298 registros em inconformidade regulatória (< 0,92)**, concentrados majoritariamente em períodos de madrugada e horários de baixa solicitação de carga.

Para adequar o sistema no ponto de demanda máxima (**P = 51,39 kW**, **FP<sub>1</sub> = 0,934**), o algoritmo dimensionou pontualmente um **banco de capacitores de 2,85 kvar** para atingir a meta operacional de **FP<sub>2</sub> = 0,95**, otimizando a alocação de CAPEX.

<!-- PAINEL INTERATIVO - FIGURA 2 -->
<div class="my-6 p-3 md:p-4 rounded-xl bg-[#111827] border border-gray-800 shadow-lg">
  <img src="/images/portfolio/qee/fatorpotencia.png" alt="Fator de Potência ao Longo da Medição" class="w-full rounded-lg mx-auto block" style="filter: invert(0.9) hue-rotate(180deg);" />
  <p class="text-center text-xs md:text-sm text-gray-400 mt-3 mb-1 font-mono">
    Figura 2: Monitoramento contínuo do FP com linhas de referência normativas (0,92 regulatório e 0,95 meta).
  </p>
</div>

---

### 🔹 Balanço Diário de Consumo Energético
A consolidação vetorial agrupada por data permite mapear os dias de maior intensidade produtiva, destacando a terça-feira (26/05) como o pico de consumo acumulado do período (**422,12 kWh**).

<!-- PAINEL INTERATIVO - FIGURA 3 -->
<div class="my-6 p-3 md:p-4 rounded-xl bg-[#111827] border border-gray-800 shadow-lg">
  <img src="/images/portfolio/qee/energiadiaria.png" alt="Energia Ativa Diária Estimada" class="w-full rounded-lg mx-auto block" style="filter: invert(0.9) hue-rotate(180deg);" />
  <p class="text-center text-xs md:text-sm text-gray-400 mt-3 mb-1 font-mono">
    Figura 3: Consumo de energia ativa diário acumulado (Total do período: 1.507,71 kWh).
  </p>
</div>

---

### 🔬 Diagnóstico Avançado de Qualidade de Onda (Deep-Dive Técnico)
A auditoria de qualidade de onda apontou inconformidades regulatórias críticas. A linha de base da Distorção Harmônica Total de Tensão (**THD<sub>V</sub>**) permaneceu estabilizada em patamares próximos a **18%**, violando o limite máximo de **10%** fixado pelo Módulo 8 do PRODIST (ANEEL) para barramentos de baixa tensão. Adicionalmente, identificaram-se transientes severos de até **80%** na fase **V<sub>3</sub>**, correlacionados a um afundamento momentâneo de **147,20 V**.

<!-- PAINEL INTERATIVO - FIGURA 4 -->
<div class="my-6 p-3 md:p-4 rounded-xl bg-[#111827] border border-gray-800 shadow-lg">
  <img src="/images/portfolio/qee/thdtensao.png" alt="Distorção Harmônica Total de Tensão" class="w-full rounded-lg mx-auto block" style="filter: invert(0.9) hue-rotate(180deg);" />
  <p class="text-center text-xs md:text-sm text-gray-400 mt-3 mb-1 font-mono">
    Figura 4: THD<sub>V</sub> contínuo indicando não-conformidade com o padrão PRODIST/ANEEL (10%).
  </p>
</div>

A decomposição do espectro de corrente revelou a causa raiz do problema: expressiva contaminação por **9ª ordem (4,42 A)** e componentes *triplen* (3ª e 7ª ordens), indicativo típico de desbalanceamento severo por cargas não lineares monofásicas e fontes chaveadas.

<!-- PAINEL INTERATIVO - FIGURA 5 -->
<div class="my-6 p-3 md:p-4 rounded-xl bg-[#111827] border border-gray-800 shadow-lg">
  <img src="/images/portfolio/qee/harmonicascorrente.png" alt="Componentes Harmônicas de Corrente" class="w-full rounded-lg mx-auto block" style="filter: invert(0.9) hue-rotate(180deg);" />
  <p class="text-center text-xs md:text-sm text-gray-400 mt-3 mb-1 font-mono">
    Figura 5: Espectro harmônico médio de corrente por fase com destaque para ordens ímpares triplen.
  </p>
</div>

---

## 04. Entregáveis de Processo e Impacto (ROI Técnico & Financeiro)

*   **Ganho de Eficiência Operacional:** Redução do tempo de processamento de laudos de horas para **menos de 3 segundos** (ganho de produtividade superior a 98%).
*   **Otimização de CAPEX:** O dimensionamento preciso (**Q<sub>c</sub> = 2,85 kvar**) preveniu o sobredimensionamento e o investimento desnecessário em bancos capacitivos.
*   **Mitigação de Penalidades Regulatórias:** Mapeamento exato das 298 ocorrências de FP excedente para programação de acionamentos automáticos.
*   **Auditabilidade e Reprodutibilidade:** Eliminação de erros manuais via compilação autônoma de relatórios técnicos em código LaTeX.

---

## 05. Implementação Computacional (Core Code)

O trecho de código abaixo destaca os métodos centrais de ingestão ETL, sanitização de timestamps legados do Excel e geração autônoma de relatórios formatados:

```python
# ==========================================================
# PIPELINE DE QUALIDADE DE ENERGIA - ETL & REPORT AUTOMATION
# Status: QA Aprovado | Target: Compliance PRODIST/ANEEL
# ==========================================================

import pandas as pd
import numpy as np

def carregar_e_sanitizar(caminho_excel: str) -> pd.DataFrame:
    """Carrega dados brutos, remove colunas fantasma e trata datas legadas."""
    df = pd.read_excel(caminho_excel)
    df = df.loc[:, ~df.columns.astype(str).str.startswith("Unnamed")]
    
    # Tratamento de data em formato serial do Excel (origin 1899-12-30)
    if np.issubdtype(df["Time"].dtype, np.number):
        df["DataHora"] = pd.to_datetime(df["Time"], unit="D", origin="1899-12-30")
    else:
        df["DataHora"] = pd.to_datetime(df["Time"], errors="coerce")
        
    return df.dropna(subset=["DataHora"]).sort_values("DataHora").reset_index(drop=True)

def exportar_tabela_latex(df_stats: pd.DataFrame, arquivo_saida: str):
    """Gera bloco de código TeX com separador decimal PT-BR (vírgula)."""
    linhas = [
        "\\begin{tabular}{lrrr}", 
        "\\hline", 
        "Grandeza & Média & Mínimo & Máximo \\\\", 
        "\\hline"
    ]
    for _, r in df_stats.iterrows():
        med, mini, maxi = [f"{v:.2f}".replace('.', ',') for v in [r['Media'], r['Minimo'], r['Maximo']]]
        linhas.append(f"{r['Grandeza']} & {med} & {mini} & {maxi} \\\\")
    linhas.extend(["\\hline", "\\end{tabular}"])
    
    with open(arquivo_saida, "w", encoding="utf-8") as f:
        f.write("\n".join(linhas))
```

---

## 06. Competências Demonstradas

* **Python & Engenharia de Software Aplicada:** Pipeline robusto e escalável.
* **Tratamento e Análise Vetorial de Séries Temporais:** Alta performance via Pandas e NumPy.
* **Visualização de Dados Executiva:** Geração de gráficos normativos via Matplotlib.
* **Análise Normativa de Qualidade de Energia:** Rigor técnico fundamentado no PRODIST/ANEEL.
* **Automação de Relatórios de Engenharia:** Conversão autônoma de dataframes para sintaxe nativa de LaTeX.
* **Modelagem e Dimensionamento Elétrico de Ativos:** Adequação de fator de potência e projeto de capacitores.

---

<!-- CARTÃO DE CONCLUSÃO & CALL TO ACTION (CTA) NO FINAL DA PÁGINA -->
<div style="margin: 3rem 0; padding: 2.5rem; border-radius: 1rem; background: linear-gradient(to right, #1e3a8a, #111827); border: 1px solid #3b82f6; text-align: center; color: white; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
  <p style="color: #93c5fd; font-weight: bold; font-size: 0.875rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem;">Conclusão do Projeto</p>
  
  <p style="color: #d1d5db; font-size: 1rem; margin-bottom: 2rem; max-width: 800px; margin-left: auto; margin-right: auto;">
    Este projeto reflete o valor da <strong>Ciência de Dados aplicada à Engenharia Elétrica</strong>. Ao automatizar tarefas repetitivas de baixo valor agregado, o pipeline garante diagnósticos precisos, ágeis e respaldados por normas regulatórias, permitindo que a tomada de decisão seja rápida, segura e fundamentada em dados.
  </p>
  
  <hr style="border-color: #374151; margin: 1.5rem 0;">
  
  <h3 style="font-size: 1.5rem; font-weight: 800; color: white; margin-bottom: 1rem;">
    Precisa de suporte especializado em Data Analytics ou Qualidade de Energia?
  </h3>
  
  <p style="color: #9ca3af; font-size: 0.875rem; margin-bottom: 1.5rem;">
    Desenvolvemos automações em Python, painéis executivos e modelagens analíticas rigorosas para impulsionar a eficiência e o compliance da sua operação.
  </p>
  
  <div style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem;">
    <a href="https://wa.me/5516981946642?text=Olá!%20Gostaria%20de%20uma%20consultoria%20em%20Python/Data%20Analytics" target="_blank" style="display: inline-block; padding: 0.75rem 1.5rem; border-radius: 0.5rem; background-color: #2563eb; color: white; font-weight: bold; text-decoration: none;">
      Solicitar Consultoria Técnica →
    </a>
    <a href="/#portfolio" style="display: inline-block; padding: 0.75rem 1.5rem; border-radius: 0.5rem; background-color: #374151; color: #d1d5db; font-weight: 600; text-decoration: none;">
      ← Voltar ao Portfólio
    </a>
  </div>
</div>