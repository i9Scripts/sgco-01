Um **modal 100% genérico** é um componente reutilizável que recebe dinamicamente o conteúdo (campos, valores e botões) via JavaScript, sem depender do contexto específico do paciente, grupo, anamnese ou qualquer outro tipo de dado. Assim, você pode usá-lo para mostrar qualquer informação de qualquer tabela, ficha ou relatório, bastando passar os dados e a configuração de exibição.

## Como seria um modal 100% genérico

**HTML do modal (exemplo):**
```html
<div id="modalGenerico" class="custom-modal">
  <div class="custom-modal-content">
    <span class="custom-close-btn" onclick="fecharModalGenerico()">×</span>
    <h3 id="modal-generico-title"></h3>
    <div id="modal-generico-body"></div>
    <div id="modal-generico-footer" class="d-flex gap-2"></div>
  </div>
</div>

```

**JS para abrir o modal:**
```js
function abrirModalGenerico(config) {
  // config: {titulo, campos, botoes}
  document.getElementById('modal-generico-title').innerText = config.titulo || '';
  const body = document.getElementById('modal-generico-body');
  const footer = document.getElementById('modal-generico-footer');

  // Montar campos dinamicamente
  body.innerHTML = '';
  config.campos.forEach(campo => {
    body.innerHTML += `${campo.label}: ${campo.valor ?? 'Não informado'}`;
  });

  // Montar botões dinamicamente
  footer.innerHTML = '';
  (config.botoes || []).forEach(botao => {
    footer.innerHTML += `${botao.texto}`;
  });

  document.getElementById('modalGenerico').style.display = 'block';
}

function fecharModalGenerico() {
  document.getElementById('modalGenerico').style.display = 'none';
}
```

**Exemplo de chamada para paciente, anamnese e diagnóstico:**
```js
abrirModalGenerico({
  titulo: "Ficha do Paciente",
  campos: [
    { label: "Nome", valor: paciente.nome },
    { label: "CPF", valor: paciente.cpf },
    { label: "Data de Cadastro", valor: paciente.createdAt },
    { label: "Responsável", valor: paciente.responsavel },
    { label: "Contato", valor: paciente.contato },
    { label: "Diagnóstico", valor: paciente.diagnostico },
    { label: "Descrição da Anamnese", valor: paciente.anamnese?.descricao }
  ],
  botoes: [
    { texto: "Editar Paciente", href: `/pacientes/${paciente.idPaciente}/edit`, class: "btn btn-warning btn-sm" },
    { texto: "Nova Anamnese", href: `/pacientes/${paciente.idPaciente}/selecionar`, class: "btn btn-primary btn-sm" }
  ]
});
```
Você pode montar o objeto `campos` e `botoes` conforme o contexto (relatório, grupo, paciente, etc).

---

## Como seria o arquivo `pacientes.ejs` para relatórios completos

Você pode criar **parciais EJS** para cada parte (dados do paciente, anamnese, diagnóstico) e montar o relatório incluindo essas parciais, por exemplo:

**views/partials/dadosPaciente.ejs:**
```ejs
<!-- Dados do Paciente -->
<ul>
  <li>Nome: <%= paciente.nome %></li>
  <li>CPF: <%= paciente.cpf %></li>
  <li>Data de Nascimento: <%= paciente.dataNascimento %></li>
  <li>Contato: <%= paciente.contato %></li>
  <!-- outros campos -->
</ul>


```

**views/partials/anamnese.ejs:**
```ejs
<!-- Anamnese -->
<ul>
  <li>Queixa Principal: <%= anamnese.queixaPrincipal %></li>
  <li>História da Doença Atual: <%= anamnese.historiaDoencaAtual %></li>
  <li>Histórico Familiar: <%= anamnese.historicoFamiliar %></li>
  <!-- outros campos -->
</ul>

```

**views/partials/diagnostico.ejs:**
```ejs
<!-- Diagnóstico -->
<ul>
  <li>Diagnóstico: <%= diagnostico.descricao %></li>
  <li>Data: <%= diagnostico.data %></li>
  <!-- outros campos -->
</ul>

```

**views/pacientes.ejs:**
```ejs
<div class="relatorio-completo">
  <% include partials/dadosPaciente %>
  <% if (anamnese) { %>
    <% include partials/anamnese %>
  <% } %>
  <% if (diagnostico) { %>
    <% include partials/diagnostico %>
  <% } %>
</div>

```

Assim, você pode montar relatórios completos e flexíveis, seguindo as orientações de conteúdo essenciais para anamnese e relatórios médicos[6][7][9][10][11].

---

Se quiser exemplos prontos de configuração de campos para anamnese, diagnóstico ou outros contextos, só pedir!  
Posso te ajudar também a montar os arquivos EJS para outros tipos de dados. O que mais você gostaria de incluir no seu relatório?

Citations:
[1] https://pt.stackoverflow.com/questions/272796/criar-um-modal-apenas-com-jquery-javascript
[2] https://dev.to/devdoido/criando-componente-de-modal-generico-com-chakra-ui-no-crazystack-nextjs-494a
[3] http://opensource.locaweb.com.br/locawebstyle-v2/manual/componentes/modal/
[4] https://pt.stackoverflow.com/questions/371655/puxar-conteudo-de-dentro-de-uma-tabela-para-caixas-de-texto-dentro-da-modal
[5] https://institutohumaniza.com.br/wp-content/uploads/2022/05/02.-RELATORIO-N.S.SOCORRO-FEVEREIRO-2022.pdf
[6] https://telemedicinamorsch.com.br/blog/anamnese-completa
[7] https://conclinica.com.br/anamnese-completa/
[8] https://globocom.github.io/bootstrap/javascript.html
[9] https://documentos-especialista.com/modelo-de-relatorio-medico/
[10] https://mail.versatilis.com.br/relatorio-do-paciente/
[11] https://conclinica.com.br/relatorio-de-paciente/
[12] https://userguiding.com/pt-br/blog/janelas-modais-da-maneira
[13] https://cursos.alura.com.br/forum/topico-react-reutilizacao-de-codigo-61608
[14] https://www.treinaweb.com.br/blog/como-criar-uma-modal-com-a-tag-dialog
[15] https://cursos.alura.com.br/forum/topico-filtro-javascript-com-varias-condicoes-226221
[16] https://www.digitalocean.com/community/tutorials/js-drag-and-drop-vanilla-js-pt
[17] https://pt.stackoverflow.com/questions/115295/passar-valor-para-janela-modal-recuperar-o-dado-e-reutiliza-lo
[18] https://www.youtube.com/watch?v=29xBCS6VDy4
[19] https://www.youtube.com/watch?v=D-GFRJJHtAE
[20] https://visualdicas.com.br/scripts/modal/135-como-criar-um-modal-usando-html-css-e-javascript
[21] https://www.youtube.com/watch?v=v6wwSgTQ094
[22] https://pt.stackoverflow.com/questions/32020/janela-modal-com-conte%C3%BAdo-do-banco-de-dados
[23] https://getbootstrap.com.br/docs/4.1/content/tables/
[24] https://sanarmed.com/anamnese-de-forma-simples-colunistas/
[25] https://www.pucrs.br/medicina/wp-content/uploads/sites/22/2021/09/ROTEIRO-DE-ANAMNESE-PARA-O-PACIENTE-ADULTO.pdf
[26] https://www.scielo.br/j/jbpsiq/a/nTvttmHhbDSVvRkRpTLmDjn/?lang=pt&format=pdf
[27] https://maceio.al.gov.br/uploads/documentos/SAE-VERSAO-DEFINITIVA_2024-03-01-210417_ctxu.pdf
[28] https://blog.iclinic.com.br/ficha-de-anamnese/
[29] https://rbc.inca.gov.br/arquivos/CAREtemplate-Portuguese.pdf
[30] https://unimednoroesters.com.br/wp-content/uploads/2022/05/VERSAO-11.-MANUAL-DE-CONSULTAS-DAS-NORMAS-DE-AUDITORIA-MEDICA-E-DE-ENFERMAGEM-V.11.pdf
[31] https://sanarmed.com/anamnese/
[32] https://inisa.ufms.br/files/2019/06/AVALIA%C3%87%C3%83O-DO-PROCESSO-DE-OXIGENOTERAPIA.pdf
[33] https://www.scielo.br/j/tce/a/W3dWbyTBJbMpfLDCXJrVjQj/?lang=pt
[34] https://www.scielo.br/j/jbpsiq/a/nTvttmHhbDSVvRkRpTLmDjn/
[35] http://www.webfipa.net/facfipa/ner/sumarios/cuidarte/2020v2/p.276-281.pdf
[36] https://pt.stackoverflow.com/questions/232081/modal-100-com-css?rq=1
[37] https://www.youtube.com/watch?v=2jjbteTavm4
[38] https://getbootstrap.com.br/docs/4.1/components/modal/
[39] https://feegowclinic.com.br/blog/como-fazer-uma-boa-anamnese
[40] https://www.itecceduc.com/download/img/fotos/167042321582kitpsicopedagogia-pdf.pdf

---
Resposta do Perplexity: pplx.ai/share