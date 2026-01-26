// Conecta ao servidor (ele entende automaticamente o IP da barra de endereços)
const socket = io();

// Escutar o evento que criamos no servidor
socket.on('atualizar_lista', (data) => {
  console.log('A fila mudou! Recarregando dados...', data);

  // Aqui você pode recarregar a página ou atualizar o DOM via JS
  window.location.reload();
});

// Exemplo de como avisar o servidor que algo mudou (ex: ao clicar num botão)
function avisarMudanca() {
  socket.emit('novo_paciente_fila', { mensagem: 'Alguém entrou na fila!' });
}
