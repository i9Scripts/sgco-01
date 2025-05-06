# Implementando uma Fila de Espera de Pacientes com EJS, Prisma, Express.js e JavaScript

Este documento detalha o processo de criação de uma fila de espera para pacientes em um sistema utilizando Node.js, Express.js, Prisma, EJS e JavaScript.

## Pré-requisitos

*   Node.js instalado
*   npm ou yarn (gerenciadores de pacotes)
*   Um projeto Node.js existente com:
    *   Express.js configurado
    *   Prisma configurado e conectado a um banco de dados
    *   EJS configurado para renderizar views

## Passo 1: Modificação do Schema do Prisma

1.  **Abra o arquivo `schema.prisma`** no seu projeto.

2.  **Adicione o campo `naFila` ao modelo `Paciente`:**

    ```prisma
    model Paciente {
      id        Int      @id @default(autoincrement())
      nome      String
      createdAt DateTime @default(now())
      naFila    Boolean @default(true) // Novo campo
      // Outros campos...
    }
    ```

    Este campo booleano indica se o paciente está atualmente na fila de espera. O valor padrão é `true`.

3.  **Execute as migrações do Prisma:**

    ```bash
    npx prisma migrate dev --name add_naFila_field
    ```

    Isso aplicará a mudança no seu banco de dados.

## Passo 2: Criação das Rotas no Express.js

1.  **Abra o arquivo onde você define suas rotas Express.js** (geralmente `app.js` ou `routes.js`).

2.  **Adicione a rota para exibir a fila de espera:**

    ```javascript
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
    ```

    Esta rota busca todos os pacientes com `naFila` igual a `true`, ordena-os por data de criação (do mais antigo para o mais novo) e renderiza a view `fila-espera.ejs`, passando os pacientes como dados.

3.  **Adicione a rota para marcar um paciente como atendido:**

    ```javascript
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
    ```

    Esta rota recebe o ID do paciente via parâmetro (`:id`), atualiza o campo `naFila` para `false` e redireciona o usuário de volta para a página da fila de espera.

## Passo 3: Criação da View EJS (fila-espera.ejs)

1.  **Crie um arquivo chamado `fila-espera.ejs`** no diretório onde suas views EJS são armazenadas (geralmente `views`).

2.  **Adicione o seguinte conteúdo ao arquivo:**

    ```html
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
    ```

    *   **`<%- include('layout', { title: 'Fila de Espera' }) %>`:** Inclui o layout base da sua aplicação, passando o título "Fila de Espera".
    *   **`<% if (pacientes.length > 0) { %>`:** Verifica se há pacientes na fila.
    *   **`<% pacientes.forEach(paciente => { %>`:** Itera sobre a lista de pacientes.
    *   **`<li class="list-group-item ...">`:** Cria um item de lista para cada paciente (use classes do Bootstrap ou seu próprio CSS).
    *   **`<%= paciente.nome %>`:** Exibe o nome do paciente.
    *   **`<%= paciente.createdAt.toLocaleTimeString() %>`:** Exibe a hora de cadastro.
    *   **`<form action="/paciente/<%= paciente.id %>/atendido" method="post">`:** Cria um formulário para marcar o paciente como atendido.
    *   **`<button type="submit" class="btn btn-success">Marcar como Atendido</button>`:** Botão para submeter o formulário.
    *   **JavaScript (Confirmação):** Adiciona um diálogo de confirmação antes de marcar o paciente como atendido.

## Passo 4: Estilização (CSS)

1.  **Adicione o CSS ao seu projeto.**

    css padrão está em:

    * /src/public/main.css
## Passo 5: Teste a Implementação

1.  **Inicie seu servidor Node.js.**
2.  **Cadastre alguns pacientes** no banco de dados (certifique-se de que o campo `naFila` seja `true` por padrão ou defina explicitamente como `true`).
3.  **Acesse a rota `/fila-espera`** no seu navegador. Você deverá ver a lista de pacientes na fila.
4.  **Clique no botão "Marcar como Atendido"** para remover um paciente da fila. Você deverá ser redirecionado de volta para a fila, e o paciente removido não estará mais na lista.

## Melhorias Opcionais

*   **Atualização em Tempo Real com WebSockets (Socket.IO):** Para uma experiência mais interativa, use WebSockets para atualizar a fila automaticamente quando um novo paciente é adicionado ou removido.
*   **Animações:** Adicione animações para tornar a interação mais agradável.
*   **Paginação:** Se a fila de espera for muito longa, implemente paginação para melhorar o desempenho e a usabilidade.
*   **Filtros e Busca:** Adicione filtros para pesquisar pacientes por nome, data de cadastro, etc.

Este guia deve fornecer um passo a passo claro para implementar uma fila de espera de pacientes em seu projeto.  Adapte o código e o design às suas necessidades específicas!