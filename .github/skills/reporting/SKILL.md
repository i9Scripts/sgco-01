---
name: reporting
description: 'Skill para gerar, padronizar e manter relatórios EJS imprimíveis usando `ejs-layout` — modelos em `src/views/reports`.'
---

# Skill: Reporting (Relatórios)

Objetivo

- Fornecer padrões, checklists e templates para criar relatórios imprimíveis com `ejs-layout` e estilos para `@media print`.

Quando usar

- Ao criar novos relatórios/receitas/fichas que serão salvos em `src/views/reports`
- Ao padronizar layout de impressão (A4/PDF) para todas as views de relatório

Conveniências do projeto

- Layouts base: usamos `ejs-layout` (express-ejs-layouts ou include/layout partials). Os relatórios devem usar `layout: 'layouts/report'` ou incluir o partial de layout específico.
- Diretório para relatórios: `src/views/reports/` (cada relatório: `reports/<name>.ejs`).
- Estilos: centralizar regras de impressão em `src/public/css/report.css` e reutilizar classes `print-container` e `no-print`.

Estrutura recomendada

- `src/views/layouts/report.ejs` — layout mínimo para relatórios (sem navegação, otimizado para impressão).
- `src/views/reports/<nome_relatorio>.ejs` — templates de relatório que setam `layout` e usam `.print-container`.
- `src/public/css/report.css` — regras de `@media print`, `.no-print`, `.print-container` e helpers.

Padrões e checklists

- Todos os templates devem envolver o conteúdo imprimível dentro de `<div class="print-container">...</div>`.
- Botões, menus e controles devem ficar fora da `print-container` em elementos com a classe `no-print`.
- Use `@media print { @page { size: A4 portrait; margin: 10mm } }` em `report.css`.
- Evite backgrounds pesados; use `-webkit-print-color-adjust: exact` apenas quando precisar de cores impressas.
- Para acervos longos, marque blocos com `page-break-inside: avoid;` e use `<thead>` em tabelas.

Como criar um novo relatório (passo-a-passo)

1. Criar `src/views/reports/<meu_relatorio>.ejs` e no topo definir o layout, por exemplo:

```ejs
<% layout('layouts/report') %>
<div class="print-container">
  <!-- conteúdo do relatório -->
</div>
<!-- botões de ação (fora da print-container) -->
<div class="no-print"> ... ações, imprimir, fechar ... </div>
```

2. Colocar estilos/ajustes em `src/public/css/report.css` (reusar existente). Verifique que `.no-print { display: none !important }` dentro de `@media print`.
3. Testar `window.print()` via botão e ajustar margens no diálogo do navegador.

Exemplo rápido de nome/cláusula de redirecionamento em controllers

- Ao salvar um relatório (ex.: `diagnostico`), redirecione para a rota show específica: `/diagnosticos/:id` para mostrar o relatório pronto para impressão.

Boilerplate de template de relatório (exemplo)

```ejs
<% layout('layouts/report') %>
<link rel="stylesheet" href="/css/report.css">
<div class="print-container">
  <header class="print-header">
    <div class="logo"><img src="/img/LogotipoAC.png" alt="logo"></div>
    <div class="report-title">Relatório: <%= titulo %></div>
    <div class="report-meta"><%= new Date().toLocaleDateString('pt-BR') %></div>
  </header>

  <main>
    <!-- colocar seções com .section-box e tabelas bem formadas -->
    <div class="section-box">Conteúdo do relatório aqui</div>
  </main>
</div>

<div class="no-print" style="padding:12px;display:flex;justify-content:flex-end;gap:8px;">
  <button onclick="window.print()" class="no-print-btn">🖨️ Imprimir</button>
  <a href="/" class="btn">Fechar</a>
</div>
```

Notas de integração

- Se seu app usa `express-ejs-layouts`, o comando `<% layout('layouts/report') %>` funciona. Se usa includes manuais, substitua por `<%- include('../layouts/report') %>` conforme necessário.
- Salve templates em `src/views/reports/` para manter organização e facilitar buscas.

Sugestões de melhoria futura

- Gerar PDF server-side com `puppeteer` para filas ou anexos automáticos.
- Adicionar script CLI para validar templates e gerar PDF de amostra.

Fim.
