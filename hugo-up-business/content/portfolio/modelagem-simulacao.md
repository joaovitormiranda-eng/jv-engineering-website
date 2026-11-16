---
title: "Filtragem Digital e Processamento de Sinais com MATLAB"
seo_title: "Filtragem Digital e PDS com MATLAB: filtro IIR e FFT"
date: 2026-07-28
lastmod: 2026-11-05
service: "/servicos/matlab"
draft: false
catalog_nature: "Estudo computacional documentado · MATLAB"
catalog_image:
  src: "images/portfolio/pds-espectro.png"
  alt: "Espectro do sinal de entrada do projeto PDS: amplitude em função da frequência, com pico de interferência próximo de 300 Hz."
  caption: "Espectro do sinal de entrada · frequência em Hz"
slug: "modelagem-simulacao"
url: "/portfolio/modelagem-simulacao/"
description: "Estudo computacional em MATLAB com filtro IIR Butterworth, FFT e comparação de sinais, com parâmetros e limites da simulação documentados."
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
weight: 2
highlights:
  - "Filtro IIR Butterworth passa-baixa de 4ª ordem contra uma interferência de 300 Hz."
  - "Validação no tempo, no espectro (FFT) e na resposta em frequência (Bode)."
  - "Distingue a resposta de uma passagem (freqz) do processamento bidirecional com filtfilt."
---

{{< study-metrics >}}
1000 Hz | Amostragem (f<sub>s</sub>)
100 Hz | Corte (f<sub>c</sub>)
4ª Ordem | Filtro Butterworth
300 Hz | Interferência Alvo
{{< /study-metrics >}}

{{< study-source url="https://github.com/joaovitormiranda-eng/MATLAB/tree/main/Sinais%20e%20sistemas" text="Consulte o Live Script .mlx e a documentação técnica do projeto no GitHub." >}}

---

## Ficha Técnica (Project Charter)

| Parâmetro | Especificação / Tecnologias |
| :--- | :--- |
| **Domínio de Aplicação** | Processamento Digital de Sinais (PDS) & Instrumentação |
| **Abordagem Técnica** | Engenharia de Sistemas & Processamento Digital de Sinais |
| **Ferramentas Computacionais** | MATLAB, Signal Processing Toolbox, DSP Pipeline |
| **Arquitetura do Filtro** | IIR Passa-Baixa Butterworth (Topologia Maximamente Plana) |
| **Métodos de Validação** | Transformada Rápida de Fourier (FFT), Diagramas de Bode |

---

## 01. Contexto & Desafio Técnico

Em cenários industriais de instrumentação, automação e sistemas de comunicação, sinais elétricos brutos capturados por sensores frequentemente sofrem severas distorções causadas por **interferências eletromagnéticas (EMI)** e **ruídos térmicos de fundo**. 

O objetivo deste projeto consistiu em desenhar e analisar uma arquitetura de software em **MATLAB** para atenuar componentes determinísticas de alta amplitude e ruído estocástico, comparando o sinal filtrado com o sinal de referência.

### Modelagem Matemática do Sistema (Baseline)

O ambiente de simulação estabeleceu um sinal útil composto por duas harmônicas fundamentais (**10 Hz** e **30 Hz**), corrompido por uma interferência senoidal severa (**300 Hz**) e ruído branco gaussiano **w(t)**. As equações de estado definem o modelo:

{{< study-equations label="Modelo do sinal" >}}
<p class="study-eq__row"><span class="study-eq__sym">x<sub>limpo</sub>(t)</span> = 2 · sin(2π · 10t) + 1.5 · sin(2π · 30t)</p>
<p class="study-eq__row"><span class="study-eq__sym">n(t)</span> = 2.5 · sin(2π · 300t) + w(t)</p>
<p class="study-eq__row study-eq__row--result"><span class="study-eq__sym">x<sub>sujo</sub>(t)</span> = x<sub>limpo</sub>(t) + n(t)</p>
{{< /study-equations >}}

---

## 02. Arquitetura e Engenharia da Solução

Para a resolução do problema de contaminação espectral, implementou-se uma metodologia estruturada em três pilares analíticos de engenharia simultânea:

*   **Mapeamento Espectral via FFT:** Mapeamento no domínio da frequência utilizando o algoritmo *Fast Fourier Transform* com adequação estrita ao critério de Nyquist (**f<sub>s</sub> = 1000 Hz**). Isso permitiu a separação exata das bandas de interesse (**< 50 Hz**) e da banda de ruído indesejada (**300 Hz**).
*   **Síntese do Filtro IIR Butterworth:** Dimensionamento de uma arquitetura Passa-Baixa de 4ª ordem com frequência de corte estabelecida em **f<sub>c</sub> = 100 Hz**. A topologia Butterworth foi criteriosamente selecionada por sua resposta maximamente plana (*maximally flat*) na banda passante, mitigando a introdução de *ripples* ou distorções de ganho.
*   **Validação Temporal (V&V):** Execução do processamento digital no domínio do tempo e aferição comparativa contra o *baseline* teórico para garantia da qualidade da filtragem.

---

## 03. Verificação e Validação Experimental (V&V)

### Análise no Domínio do Tempo (Entrada Ruidosa)
Observa-se a degradação massiva sofrida pelo sinal original devido à sobreposição da componente de **300 Hz** e ao ruído estocástico, justificando a intervenção via PDS.

<!-- FIGURA 1 -->
<figure class="portfolio-study__figure" aria-labelledby="pds-caption-1">
  <img src="/images/portfolio/pds/figura1.png" width="830" height="542" loading="lazy" decoding="async" alt="Sinal Original vs Sinal Corrompido" />
  <figcaption id="pds-caption-1">
    Figura 1: Degradação temporal do sinal de entrada (Interferência + Estocástico).
    <a class="portfolio-section-link" href="/images/portfolio/pds/figura1.png" target="_blank" rel="noopener noreferrer">Ampliar figura 1 (PNG; nova aba)</a>
  </figcaption>
</figure>

---

### Mapeamento Espectral via FFT
A Transformada Rápida de Fourier mapeou os picos fundamentais de informação (**10 Hz** e **30 Hz**) e a anomalia espectral (**300 Hz**), validando empiricamente o ponto de corte em **100 Hz**.

<!-- FIGURA 2 -->
<figure class="portfolio-study__figure" aria-labelledby="pds-caption-2">
  <img src="/images/portfolio/pds/figura2.png" width="898" height="613" loading="lazy" decoding="async" alt="Espectro de Frequência do Sinal Sujo" />
  <figcaption id="pds-caption-2">
    Figura 2: Análise espectral de base validando a distribuição de frequências.
    <a class="portfolio-section-link" href="/images/portfolio/pds/figura2.png" target="_blank" rel="noopener noreferrer">Ampliar figura 2 (PNG; nova aba)</a>
  </figcaption>
</figure>

---

### Resposta em Frequência (Diagrama de Bode)
O diagrama apresenta magnitude e fase do filtro. Os indicadores de **0 dB** na banda de passagem e **-40 dB** na região de interferência devem ser interpretados na resposta em frequência e nas condições de processamento descritas abaixo.

A figura apresenta a resposta do filtro de uma passagem, calculada por `freqz(b, a, ...)`. O processamento do sinal usa `filtfilt`, cuja resposta em magnitude corresponde ao quadrado da resposta de uma passagem; os valores devem ser interpretados considerando essa distinção.

<!-- FIGURA 3 -->
<figure class="portfolio-study__figure" aria-labelledby="pds-caption-3">
  <img src="/images/portfolio/pds/figura3.png" width="672" height="423" loading="lazy" decoding="async" alt="Resposta em Frequência do Filtro Passa-Baixa" />
  <figcaption id="pds-caption-3">
    Figura 3: Homologação da magnitude e fase do filtro Butterworth (4ª Ordem).
    <a class="portfolio-section-link" href="/images/portfolio/pds/figura3.png" target="_blank" rel="noopener noreferrer">Ampliar figura 3 (PNG; nova aba)</a>
  </figcaption>
</figure>

---

### Resultado Final e Validação de QA
Comparação técnica que comprova a recuperação do ativo de dados. A atenuação eliminou oscilações de alta frequência e restaurou a topologia da onda teórica com precisão extrema.

<!-- FIGURA 4 -->
<figure class="portfolio-study__figure" aria-labelledby="pds-caption-4">
  <img src="/images/portfolio/pds/figura4.png" width="605" height="393" loading="lazy" decoding="async" alt="Resultado da Filtragem" />
  <figcaption id="pds-caption-4">
    Figura 4: Sinal recuperado, atestando a eficácia total do modelo PDS aplicado.
    <a class="portfolio-section-link" href="/images/portfolio/pds/figura4.png" target="_blank" rel="noopener noreferrer">Ampliar figura 4 (PNG; nova aba)</a>
  </figcaption>
</figure>

## 04. Entregáveis de Processo e Impacto (ROI Técnico)

*   **Algoritmo Modular em MATLAB:** Código-fonte componentizado, parametrizado e pronto para implantação em plataformas de teste contínuo ou hardwares embarcados.
*   **Recuperação de Ativo de Dados:** Atenuação da interferência com filtragem bidirecional de fase zero (`filtfilt`), cuja resposta em amplitude é determinada pelo filtro.
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

% Filtragem bidirecional de fase zero para processamento offline
sinal_recuperado = filtfilt(b, a, sinal_sujo);
```

Na filtragem bidirecional, a resposta em magnitude corresponde ao quadrado da resposta do filtro de uma passagem, conforme a [documentação de `filtfilt` da MathWorks](https://www.mathworks.com/help/signal/ref/filtfilt.html).

## 06. Competências Demonstradas

* **MATLAB & Signal Processing Toolbox:** Implementação avançada de algoritmos de PDS e manipulação de vetores.
* **Filtros Digitais IIR:** Projeto, síntese e validação de topologias Butterworth maximamente planas.
* **Análise Espectral (FFT):** Mapeamento no domínio da frequência com adequação ao critério de Nyquist.
* **Engenharia de Requisitos & V&V:** Rastreabilidade matemática e garantia de qualidade do sinal recuperado.
