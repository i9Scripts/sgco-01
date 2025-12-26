## 💻 Preparando o Sistema para Execução (Sem VS Code)

Excelente\! Para deixar o seu sistema Node.js rodando de forma confiável neste computador para testes, sem precisar do VS Code ou de manter a janela do terminal aberta, você precisa de dois passos principais: **preparação do código** e **execução persistente**.

Aqui está o guia passo a passo:

### 1\. Preparação do Código (Instalação e Build)

Primeiro, você precisa garantir que o sistema esteja pronto para ser executado:

#### A. Instalar Dependências

No diretório raiz do seu projeto (onde está o `package.json`), abra o terminal e instale as dependências:

```bash
npm install
# ou
yarn install
```

#### B. Compilar o Código (Se for TypeScript)

Se você estiver usando **TypeScript** (o que é comum em projetos Node.js modernos), você precisa compilar o código para JavaScript.

```bash
npm run build
```

*Verifique o seu `package.json` para o comando exato de build.*

-----

### 2\. Execução Persistente (Rodando em Background)

O maior desafio é fazer o script continuar rodando mesmo que você feche a janela do terminal. Para isso, o método mais comum e robusto em um ambiente de teste é usar o **PM2**.

O PM2 é um gerenciador de processos para Node.js que mantém seus aplicativos ativos 24/7 e os reinicia automaticamente em caso de falha.

#### A. Instalar o PM2 Globalmente

Abra o terminal e instale o PM2:

```bash
npm install pm2 -g
```

#### B. Iniciar a Aplicação com PM2

Agora, use o PM2 para iniciar a sua aplicação. Você deve usar o mesmo comando que usaria para iniciar o servidor (geralmente definido no script `start` do seu `package.json`).

**Exemplo (Assumindo que seu comando de inicialização é `npm start`):**

```bash
pm2 start npm --name "optosystem-teste" -- start
```

  * `pm2 start`: Inicia o processo.
  * `npm`: O executável a ser usado.
  * `--name "optosystem-teste"`: Dá um nome fácil de identificar ao seu processo.
  * `-- start`: O comando que o `npm` deve executar (o script `start` do seu `package.json`).

#### C. Verificar o Status

Para confirmar que o sistema está rodando e verificar os logs:

```bash
pm2 status
pm2 logs "optosystem-teste"
```

#### D. Configurar a Inicialização Automática (Reboot)

Para que o sistema **inicie automaticamente** se o computador for reiniciado, o PM2 tem um comando para configurar isso:

```bash
pm2 startup
```

  * O PM2 dará um comando que você deve copiar e colar no terminal (ele irá criar um serviço no sistema operacional).

  * Depois de executar o comando de setup, salve a lista de processos ativos:

    ```bash
    pm2 save
    ```

-----

### Resumo Rápido (Execução)

| Comando | Descrição |
| :--- | :--- |
| `pm2 install pm2 -g` | Instala o PM2 (uma vez). |
| `pm2 start npm --name "optosystem-teste" -- start` | Inicia o seu sistema em *background*. |
| `pm2 status` | Vê o estado de todos os processos gerenciados. |
| `pm2 startup` + `pm2 save` | Garante que o sistema reinicie com o computador. |

Agora você pode fechar o terminal e a aplicação continuará rodando. Se precisar parar ou reiniciar, use `pm2 stop "optosystem-teste"` ou `pm2 restart "optosystem-teste"`.

Qual é o comando que você usa atualmente para iniciar o seu sistema (ex: `node index.js`, `npm start`, etc.)?
---
Como o seu `package.json` está usando `"type": "module"` e o arquivo principal é o `./src/server.js`, mas você não tem um script `"start"` definido (apenas o `"dev"` com nodemon), o comando ideal para rodar com o PM2 no seu caso é apontar diretamente para o arquivo do servidor.

Execute este comando dentro da pasta do projeto:

```bash
pm2 start src/server.js --name "sgco-v2"
```

-----

### 📋 Comandos essenciais para gerenciar o sistema

Agora que o sistema está rodando "escondido", você usará estes comandos no terminal sempre que precisar interagir com ele:

| Comando | O que ele faz |
| :--- | :--- |
| `pm2 status` | Lista se o sistema está online, quanto de CPU e RAM está usando. |
| `pm2 logs sgco-v2` | Mostra o que está acontecendo (erros, mensagens de console, etc). |
| `pm2 restart sgco-v2` | Reinicia o sistema (útil se você alterar algo no código). |
| `pm2 stop sgco-v2` | Para o sistema completamente. |

-----

### 💡 Dicas importantes para o seu ambiente de teste:

1.  **Script de Start (Opcional mas recomendado):**
    Para deixar seu projeto mais profissional, você pode adicionar a linha `"start": "node src/server.js"` dentro do bloco `"scripts"` no seu `package.json`. Assim, futuramente bastaria usar `pm2 start npm --name "sgco-v2" -- start`.

2.  **Acesso ao Sistema:**
    Como o VS Code está fechado, lembre-se que para acessar o sistema você deve abrir o navegador e digitar o endereço (ex: `http://localhost:3000` — verifique em qual porta seu `server.js` está configurado).

3.  **Persistência após reiniciar o Windows:**
    Para que o sistema ligue sozinho quando o computador for ligado:

    ```bash
    pm2 save
    ```

    *(Nota: No Windows, para o PM2 iniciar com o sistema, geralmente é necessário um pacote extra chamado `pm2-windows-startup`, mas por enquanto, rodar o comando acima já salva a lista de processos).*

**Deseja que eu te ajude a criar um arquivo `.bat` na área de trabalho para você abrir os logs ou reiniciar o servidor com apenas dois cliques?**