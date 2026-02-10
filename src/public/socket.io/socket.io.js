// Conecta ao servidor (ele entende automaticamente o IP da barra de endereços)
const socket = io();

// Escutar o evento que criamos no servidor
socket.on('atualizar_lista', (data) => {
  console.log('A fila mudou! Atualizando lista via fetch...', data);
  // Busca o fragmento atualizado do servidor e substitui o conteúdo dos containers
  fetch('/partials/_filaEspera')
    .then((r) => {
      if (!r.ok) throw new Error('Erro ao buscar fragmento da fila');
      return r.text();
    })
    .then((html) => {
      // Substitui em qualquer container presente nas páginas
      const recepcao = document.getElementById('fila-de-espera-recepcao');
      const profissional = document.getElementById('fila-de-espera-profissional');
      if (recepcao) recepcao.innerHTML = html;
      if (profissional) profissional.innerHTML = html;
      // Se quiser executar scripts do fragmento, pode avaliar aqui.
    })
    .catch((err) => console.error('Erro ao atualizar fila:', err));
});

// Exemplo de como avisar o servidor que algo mudou (ex: ao clicar num botão)
function avisarMudanca() {
  socket.emit('novo_paciente_fila', { mensagem: 'Paciente entrou na fila!' });
}
