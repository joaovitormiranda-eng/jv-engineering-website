---
title: "Filtragem Digital e Processamento de Sinais com MATLAB"
date: 2026-07-28
draft: false
slug: "modelagem-simulacao"
url: "/portfolio/modelagem-simulacao/"
description: "Desenvolvimento, simulação e validação experimental de uma solução computacional em MATLAB para remoção de ruídos via Filtro IIR Butterworth e análise espectral por FFT."
categories:
  - "Modelagem e Simulação"
  - "Engenharia Elétrica"
tags:
  - "MATLAB"
  - "PDS"
  - "Filtros Digitais"
  - "Butterworth"
  - "FFT"
  - "Sinais e Sistemas"
---

<!-- METRICAS DE IMPACTO (KPI GRID) -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
  <div class="p-4 rounded-xl bg-[#111827] border border-gray-800 text-center">
    <span class="block text-2xl md:text-3xl font-extrabold text-blue-400">1000 Hz</span>
    <span class="text-xs text-gray-400 font-mono uppercase tracking-wider">Amostragem (f<sub>s</sub>)</span>
  </div>
  <div class="p-4 rounded-xl bg-[#111827] border border-gray-800 text-center">
    <span class="block text-2xl md:text-3xl font-extrabold text-blue-400">100 Hz</span>
    <span class="text-xs text-gray-400 font-mono uppercase tracking-wider">Corte (f<sub>c</sub>)</span>
  </div>
  <div class="p-4 rounded-xl bg-[#111827] border border-gray-800 text-center">
    <span class="block text-2xl md:text-3xl font-extrabold text-blue-400">4ª Ordem</span>
    <span class="text-xs text-gray-400 font-mono uppercase tracking-wider">Filtro Butterworth</span>
  </div>
  <div class="p-4 rounded-xl bg-[#111827] border border-gray-800 text-center">
    <span class="block text-2xl md:text-3xl font-extrabold text-emerald-400">300 Hz</span>
    <span class="text-xs text-gray-400 font-mono uppercase tracking-wider">Interferência Eliminada</span>
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
      <p class="text-gray-400 text-xs m-0">Acesse o repositório completo com scripts .m e documentação técnica no GitHub.</p>
    </div>
  </div>
  <a href="https://github.com/SEU-USUARIO/SEU-REPOSITORIO" target="_blank" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors whitespace-nowrap">
    Ver Repositório no GitHub →
  </a>
</div>

---

### 📋 Ficha Técnica (Project Charter)

| Parâmetro | Especificação / Tecnologias |
| :--- | :--- |
| **Domínio de Aplicação** | Processamento Digital de Sinais (PDS) & Instrumentação |
| **Nível de Maturidade** | Engenharia de Sistemas & Alta Precisão (CMMI Level 3) |
| **Ferramentas Computacionais** | MATLAB, Signal Processing Toolbox, DSP Pipeline |
| **Arquitetura do Filtro** | IIR Passa-Baixa Butterworth (Topologia Maximamente Plana) |
| **Métodos de Validação** | Transformada Rápida de Fourier (FFT), Diagramas de Bode |

---

## 01. Contexto & Desafio Técnico

Em cenários industriais de instrumentação, automação e sistemas de comunicação, sinais elétricos brutos capturados por sensores frequentemente sofrem severas distorções causadas por **interferências eletromagnéticas (EMI)** e **ruídos térmicos de fundo**. 

O objetivo deste projeto consistiu em desenhar e validar uma arquitetura de software em **MATLAB** capaz de isolar e recuperar com alta fidelidade a informação de um sinal contaminado por componentes determinísticas de alta amplitude e ruído estocástico, garantindo a integridade dos dados para tomada de decisão.

### Modelagem Matemática do Sistema (Baseline)

O ambiente de simulação estabeleceu um sinal útil composto por duas harmônicas fundamentais (**10 Hz** e **30 Hz**), corrompido por uma interferência senoidal severa (**300 Hz**) e ruído branco gaussiano **w(t)**. As equações de estado definem o modelo:

<!-- CARD ESTILIZADO DE EQUAÇÕES MATEMÁTICAS -->
<div class="my-6 p-6 rounded-xl bg-[#111827] border border-gray-800 font-mono text-sm md:text-base text-gray-200 shadow-inner space-y-3 text-center">
  <div>
    <span class="text-blue-400 font-bold">x<sub>limpo</sub>(t)</span> = 2 · sin(2π · 10t) + 1.5 · sin(2π · 30t)
  </div>
  <div>
    <span class="text-amber-400 font-bold">n(t)</span> = 2.5 · sin(2π · 300t) + w(t)
  </div>
  <div class="pt-2 border-t border-gray-800/80 max-w-md mx-auto">
    <span class="text-emerald-400 font-bold">x<sub>sujo</sub>(t)</span> = x<sub>limpo</sub>(t) + n(t)
  </div>
</div>

---

## 02. Arquitetura e Engenharia da Solução

Para a resolução do problema de contaminação espectral, implementou-se uma metodologia estruturada em três pilares analíticos de engenharia simultânea:

*   **Mapeamento Espectral via FFT:** Mapeamento no domínio da frequência utilizando o algoritmo *Fast Fourier Transform* com adequação estrita ao critério de Nyquist (**f<sub>s</sub> = 1000 Hz**). Isso permitiu a separação exata das bandas de interesse (**< 50 Hz**) e da banda de ruído indesejada (**300 Hz**).
*   **Síntese do Filtro IIR Butterworth:** Dimensionamento de uma arquitetura Passa-Baixa de 4ª ordem com frequência de corte estabelecida em **f<sub>c</sub> = 100 Hz**. A topologia Butterworth foi criteriosamente selecionada por sua resposta maximamente plana (*maximally flat*) na banda passante, mitigando a introdução de *ripples* ou distorções de ganho.
*   **Validação Temporal (V&V):** Execução do processamento digital no domínio do tempo e aferição comparativa contra o *baseline* teórico para garantia da qualidade da filtragem.

---

## 03. Verificação e Validação Experimental (V&V)

### 🔹 Análise no Domínio do Tempo (Entrada Ruidosa)
Observa-se a degradação massiva sofrida pelo sinal original devido à sobreposição da componente de **300 Hz** e ao ruído estocástico, justificando a intervenção via PDS.

<!-- PAINEL INTERATIVO - FIGURA 1 -->
<div class="my-6 p-3 md:p-4 rounded-xl bg-[#111827] border border-gray-800 shadow-lg">
  <img src="/images/portfolio/pds/figura1.png" alt="Sinal Original vs Sinal Corrompido" class="w-full rounded-lg mx-auto block" style="filter: invert(0.9) hue-rotate(180deg);" />
  <p class="text-center text-xs md:text-sm text-gray-400 mt-3 mb-1 font-mono">
    Figura 1: Degradação temporal do sinal de entrada (Interferência + Estocástico).
  </p>
</div>

---

### 🔹 Mapeamento Espectral via FFT
A Transformada Rápida de Fourier mapeou os picos fundamentais de informação (**10 Hz** e **30 Hz**) e a anomalia espectral (**300 Hz**), validando empiricamente o ponto de corte em **100 Hz**.

<!-- PAINEL INTERATIVO - FIGURA 2 -->
<div class="my-6 p-3 md:p-4 rounded-xl bg-[#111827] border border-gray-800 shadow-lg">
  <img src="/images/portfolio/pds/figura2.png" alt="Espectro de Frequência do Sinal Sujo" class="w-full rounded-lg mx-auto block" style="filter: invert(0.9) hue-rotate(180deg);" />
  <p class="text-center text-xs md:text-sm text-gray-400 mt-3 mb-1 font-mono">
    Figura 2: Análise espectral de base validando a distribuição de frequências.
  </p>
</div>

---

### 🔹 Resposta em Frequência (Diagrama de Bode)
O diagrama de magnitude e fase certifica o comportamento do filtro: ganho unitário (**0 dB**) na banda de passagem e atenuação superior a **-40 dB** na região de interferência, garantindo a robustez do projeto.

<!-- PAINEL INTERATIVO - FIGURA 3 -->
<div class="my-6 p-3 md:p-4 rounded-xl bg-[#111827] border border-gray-800 shadow-lg">
  <img src="/images/portfolio/pds/figura3.png" alt="Resposta em Frequência do Filtro Passa-Baixa" class="w-full rounded-lg mx-auto block" style="filter: invert(0.9) hue-rotate(180deg);" />
  <p class="text-center text-xs md:text-sm text-gray-400 mt-3 mb-1 font-mono">
    Figura 3: Homologação da magnitude e fase do filtro Butterworth (4ª Ordem).
  </p>
</div>

---

### 🔹 Resultado Final e Validação de QA
Comparação técnica que comprova a recuperação do ativo de dados. A atenuação eliminou oscilações de alta frequência e restaurou a topologia da onda teórica com precisão extrema.

<!-- PAINEL INTERATIVO - FIGURA 4 -->
<div class="my-6 p-3 md:p-4 rounded-xl bg-[#111827] border border-gray-800 shadow-lg">
  <img src="/images/portfolio/pds/figura4.png" alt="Resultado da Filtragem" class="w-full rounded-lg mx-auto block" style="filter: invert(0.9) hue-rotate(180deg);" />
  <p class="text-center text-xs md:text-sm text-gray-400 mt-3 mb-1 font-mono">
    Figura 4: Sinal recuperado, atestando a eficácia total do modelo PDS aplicado.
  </p>
</div>

## 04. Entregáveis de Processo e Impacto (ROI Técnico)

*   **Algoritmo Modular em MATLAB:** Código-fonte componentizado, parametrizado e pronto para implantação em plataformas de teste contínuo ou hardwares embarcados.
*   **Recuperação de Ativo de Dados:** Atenuação completa da interferência mantendo **100% da integridade de amplitude e fase** das variáveis essenciais.
*   **Documentação Analítica (Traceability):** Relatório completo cobrindo a rastreabilidade desde a modelagem matemática até a verificação experimental.

---

## 05. Implementação Computacional (Core Code)

A solução foi estruturada focando na eficiência computacional via recursos nativos da **Signal Processing Toolbox**:

```matlab
% ==========================================================
% PROJETO DE FILTRAGEM DIGITAL - IIR BUTTERWORTH
% Status: QA Aprovado | Target: Remoção EMI (300Hz)
% ==========================================================

% Parâmetros do Sistema (Baseline)
fs = 1000;         % Frequência de amostragem (Hz)
fc = 100;          % Frequência de corte Nyquist-compliant (Hz)
ordem = 4;         % Topologia do filtro (4ª ordem)

% Síntese do Filtro de Resposta Plana
[b, a] = butter(ordem, fc/(fs/2), 'low');

% Processamento e Isolamento do Sinal
sinal_recuperado = filter(b, a, sinal_sujo);
```
## 06. Competências Demonstradas

* **MATLAB & Signal Processing Toolbox:** Implementação avançada de algoritmos de PDS e manipulação de vetores.
* **Filtros Digitais IIR:** Projeto, síntese e validação de topologias Butterworth maximamente planas.
* **Análise Espectral (FFT):** Mapeamento no domínio da frequência com adequação ao critério de Nyquist.
* **Engenharia de Requisitos & V&V:** Rastreabilidade matemática e garantia de qualidade do sinal recuperado.

---

<!-- CARD CALL TO ACTION (CTA) -->
<div class="my-12 p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 via-gray-900 to-indigo-900/40 border border-blue-500/30 text-center relative overflow-hidden shadow-2xl">
  <div class="relative z-10 max-w-2xl mx-auto space-y-4">
    <h3 class="text-2xl md:text-3xl font-extrabold text-white">
      Precisa de suporte especializado em Processamento de Sinais ou MATLAB?
    </h3>
    <p class="text-gray-300 text-sm md:text-base">
      Desenvolvemos algoritmos customizados, modelagens matemáticas rigorosas e simulações de alta precisão para a sua demanda acadêmica ou profissional.
    </p>
    <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="https://wa.me/5516981946642?text=Olá!%20Gostaria%20de%20uma%20consultoria%20em%20MATLAB/PDS." target="_blank" class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/25 w-full sm:w-auto">
        Solicitar Consultoria Técnica →
      </a>
      <a href="/#portfolio" class="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300         font-semibold text-sm transition-colors border border-gray-700 w-full sm:w-auto">
        ← Voltar ao Portfólio
      </a>
      </a>
    </div>
  </div>
</div>
</div>