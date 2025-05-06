 como seria um todo list em ejs para inserir pacientes recém cadastrado no bd para ficar à fila de espera?
Com certeza! Um "Todo List" de pacientes recém-cadastrados para a fila de espera pode ser uma funcionalidade muito útil no seu sistema. Aqui está uma sugestão de como implementar isso com EJS, Prisma, Express.js e um pouco de JavaScript para a interatividade:
1. Modelagem no Prisma:
Primeiro, precisamos garantir que o modelo do seu paciente tenha um campo que indique se ele está na fila de espera ou não. Por exemplo:
```prisma
model Paciente {
  id        Int      @id @default(autoincrement())
  nome      String
  createdAt DateTime @default(now())
  naFila    Boolean @default(true) // Novo campo
  // Outros campos...
}
```
Use code with caution.
Prisma
Lembre-se de executar prisma migrate dev após alterar o schema.
2. Lógica no Express.js (Rotas e Consultas):
Rota para Exibir a Fila:
```Javascript
app.get('/fila-espera', async (req, res) => {
  try {
    const pacientesNaFila = await prisma.paciente.findMany({
      where: {
        naFila: true,
      },
      orderBy: {
        createdAt: 'asc', // Ordem de chegada
      },
    });

    res.render('fila-espera', { pacientes: pacientesNaFila });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar a fila de espera');
  }
});
Use code with caution.
JavaScript
Rota para "Marcar como Atendido" (Remover da Fila):
app.post('/paciente/:id/atendido', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.paciente.update({
      where: {
        id: parseInt(id),
      },
      data: {
        naFila: false,
      },
    });

    res.redirect('/fila-espera'); // Redireciona de volta para a fila
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao marcar paciente como atendido');
  }
});
Use code with caution.
JavaScript
3. EJS (Visualização da Fila):
Crie um arquivo fila-espera.ejs com o seguinte conteúdo:
<%- include('layout', { title: 'Fila de Espera' }) %>

<div class="container">
  <h1>Fila de Espera</h1>

  <% if (pacientes.length > 0) { %>
    <ul class="list-group">
      <% pacientes.forEach(paciente => { %>
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <%= paciente.nome %> (Cadastrado em: <%= paciente.createdAt.toLocaleTimeString() %>)
          <form action="/paciente/<%= paciente.id %>/atendido" method="post">
            <button type="submit" class="btn btn-success">Marcar como Atendido</button>
          </form>
        </li>
      <% }); %>
    </ul>
  <% } else { %>
    <p>Nenhum paciente na fila de espera.</p>
  <% } %>
</div>
```
Use code with caution.
Html
Explicação do EJS:
````js
<%- include('layout', { title: 'Fila de Espera' }) %>: Inclui o layout base da sua aplicação.
<% pacientes.forEach(paciente => { %>: Itera sobre a lista de pacientes na fila.
<li class="list-group-item ...">: Cria um item de lista para cada paciente (estilizado com Bootstrap, por exemplo).
<%= paciente.nome %>: Exibe o nome do paciente.
<%= paciente.createdAt.toLocaleTimeString() %>: Exibe a hora de cadastro do paciente.
<form action="/paciente/<%= paciente.id %>/atendido" method="post">: Cria um formulário para marcar o paciente como atendido.
<button type="submit" class="btn btn-success">Marcar como Atendido</button>: Botão para submeter o formulário.
````
4. JavaScript (Opcional, para Melhorar a Interatividade):
Você pode adicionar JavaScript para:
Confirmação antes de marcar como atendido: Usar confirm() para perguntar ao usuário se ele realmente quer marcar o paciente como atendido.
Atualização da lista em tempo real: Usar WebSockets (com Socket.IO, por exemplo) para atualizar a lista automaticamente quando um novo paciente é adicionado ou removido.
Animações: Adicionar animações sutis quando um paciente é removido da fila.
Exemplo de Confirmação com JavaScript (adicione este script no final do seu fila-espera.ejs):
````js
<script>
  const botoesAtendido = document.querySelectorAll('.btn-success');

  botoesAtendido.forEach(botao => {
    botao.addEventListener('click', function(event) {
      const confirmacao = confirm("Tem certeza que deseja marcar este paciente como atendido?");
      if (!confirmacao) {
        event.preventDefault(); // Cancela o envio do formulário
      }
    });
  });
</script>
````
Use code with caution.
Html
5. CSS (Estilização):
Você pode usar CSS para estilizar a fila de espera e torná-la mais visualmente atraente. Por exemplo, você pode usar as classes do Bootstrap para criar uma lista estilizada:
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
Use code with caution.
Html
Passos Finais:
Crie a view fila-espera.ejs no diretório correto (geralmente views).
Importe o CSS do Bootstrap (ou use seu próprio CSS).
Teste as rotas:
Cadastre alguns pacientes no banco de dados (certifique-se de que o campo naFila seja true por padrão).
Acesse a rota /fila-espera para ver a lista de pacientes na fila.
Clique no botão "Marcar como Atendido" para remover um paciente da fila.
Lembre-se de ajustar o código para se adequar à estrutura do seu projeto e às suas necessidades específicas. A parte de JavaScript é opcional, mas pode melhorar bastante a experiência do usuário.