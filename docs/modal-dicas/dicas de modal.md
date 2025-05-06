Oi! Bom dia! 😃  
Vou te ajudar a resolver os problemas do seu código. Vou analisar os pontos principais e sugerir correções e melhorias para tornar seu modal realmente genérico e funcional para outras tabelas.

---

## 1. Problemas Identificados

### a) **Erro de sintaxe no script**
No seu HTML, a tag `` está **sem aspas fechando** o atributo `src`.  
**Correto:**  
```html
<script src="/js/modal.js"></script>

```

---

### b) **Problemas com o uso do JSON.stringify e EJS**
Ao passar objetos para o `onclick` do botão, você está usando:
```js
anamnese: <%- JSON.stringify(paciente.anamneses && paciente.anamneses[0] ? paciente.anamneses[0] : null) %>

```
Isso pode causar problemas se o JSON tiver aspas, pois pode quebrar o atributo HTML.  
**Solução:**  
- Prefira passar o ID do paciente e buscar os dados via JS/AJAX, ou
- Encode o JSON como string e parse no JS, ou
- Use `data-*` attributes para passar dados para o modal.

---

### c) **Modal não é realmente genérico**
Seu modal está fortemente acoplado ao modelo de paciente/anamnese.  
**Solução:**  
- Deixe o HTML do modal mais flexível, e o JS recebe um objeto com campos dinâmicos.
- Use funções para montar o conteúdo do modal conforme a tabela.

---

### d) **Possível erro de escopo com variáveis JS**
Se o objeto passado para `abrirModalPaciente` não tiver todos os campos esperados, pode dar erro ao acessar propriedades como `dados.anamnese.descricao`.

---

## 2. Sugestão de Refatoração

### a) **Use data-* attributes**
No botão, faça assim:
```html
<button 
  class="btn btn-info btn-sm"
  data-paciente='<%- JSON.stringify({
    idPaciente: paciente.idPaciente,
    nome: paciente.nome,
    cpf: paciente.cpf,
    createdAt: paciente.createdAt,
    responsavel: paciente.responsavel || "Não informado",
    contato: paciente.contato || "Não informado",
    anamnese: paciente.anamneses && paciente.anamneses[0] ? paciente.anamneses[0] : null
  }) %>'
  onclick="abrirModalPaciente(this)">
  <span class="material-symbols-outlined icon-btn">visibility</span> Ver Ficha
</button>

```

### b) **No JS, pegue os dados do atributo**
```js
function abrirModalPaciente(btn) {
  let dados = btn.dataset.paciente;
  if (typeof dados === 'string') {
    dados = JSON.parse(dados);
  }
  // ... resto do código igual
}
```

### c) **Torne o modal mais genérico**
Você pode criar uma função para montar o conteúdo do modal conforme o objeto recebido, por exemplo:

```js
function abrirModalGenerico(dados, config) {
  const modal = document.getElementById('modalPaciente');
  const body = document.getElementById('modal-body');
  const footer = document.getElementById('modal-footer');

  // Monta o corpo dinamicamente
  let html = '';
  for (let campo of config.campos) {
    html += `${campo.label}: ${dados[campo.key] || 'Não informado'}`;
  }
  body.innerHTML = html;

  // Rodapé dinâmico
  footer.innerHTML = '';
  for (let botao of config.botoes) {
    footer.innerHTML += `${botao.text}`;
  }

  modal.style.display = 'block';
}
```
E aí, para pacientes:
```js
abrirModalGenerico(dados, {
  campos: [
    { key: 'nome', label: 'Nome' },
    { key: 'cpf', label: 'CPF' },
    { key: 'createdAt', label: 'Data de Cadastro' },
    { key: 'responsavel', label: 'Responsável' },
    { key: 'contato', label: 'Contato' }
  ],
  botoes: [
    { text: 'Editar Paciente', class: 'btn btn-warning btn-sm', href: (d) => `/pacientes/${d.idPaciente}/edit` }
    // Outras ações...
  ]
});
```

---

## 3. **Resumo das Correções**

- Corrija o <script src="..."></script>.
- Prefira `data-*` para passar objetos para o JS.
- Torne o JS do modal mais flexível para outros usos.
- Trate campos opcionais no JS para evitar erros.

---

## 4. **Exemplo Corrigido (Paciente)**

### HTML:
```html
<button 
  class="btn btn-info btn-sm"
  data-paciente='<%- JSON.stringify({
    idPaciente: paciente.idPaciente,
    nome: paciente.nome,
    cpf: paciente.cpf,
    createdAt: paciente.createdAt,
    responsavel: paciente.responsavel || "Não informado",
    contato: paciente.contato || "Não informado",
    anamnese: paciente.anamneses && paciente.anamneses[0] ? paciente.anamneses[0] : null
  }) %>'
  onclick="abrirModalPaciente(this)">
  <span class="material-symbols-outlined icon-btn">visibility</span> Ver Ficha
</button>

```

### JS:
```js
function abrirModalPaciente(btn) {
  let dados = btn.dataset.paciente;
  if (typeof dados === 'string') {
    dados = JSON.parse(dados);
  }
  const modal = document.getElementById('modalPaciente');
  const body = document.getElementById('modal-body');
  const footer = document.getElementById('modal-footer');

  body.innerHTML = `
    Nome: ${dados.nome}
    CPF: ${dados.cpf}
    Data de Cadastro: ${new Date(dados.createdAt).toLocaleString()}
    Responsável: ${dados.responsavel}
    Contato: ${dados.contato}
    
    ${
      dados.anamnese
        ? `Última Anamnese
           Descrição: ${dados.anamnese.descricao || "Não informado"}
           Data: ${dados.anamnese.createdAt ? new Date(dados.anamnese.createdAt).toLocaleString() : "Não informado"}`
        : `Última Anamnese: Nenhuma anamnese registrada.`
    }
  `;

  footer.innerHTML = `
    Editar Paciente
    ${
      dados.anamnese
        ? `Editar Anamnese`
        : `Criar Anamnese`
    }
  `;

  modal.style.display = 'block';
}
```

---

Se precisar de um exemplo para outro tipo de tabela/modal, só pedir!  
Se quiser o modal 100% genérico, me avise que te ajudo a montar uma estrutura ainda mais flexível!  
Qualquer dúvida, pode perguntar! 🚀

---
Resposta do Perplexity: pplx.ai/share