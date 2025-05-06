function abrirModalGenerico(url, titulo) {
  const modal = document.getElementById('modalGenerico');
  const title = document.getElementById('modal-generico-title');
  const body = document.getElementById('modal-generico-body');
  const footer = document.getElementById('modal-generico-footer');

  // Configurar o título do modal
  title.innerText = titulo;
  // Limpar o corpo e o rodapé do modal
  body.innerHTML = '<p>Carregando...</p>';
  footer.innerHTML = '';

  // Fazer a requisição para buscar o conteúdo
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao carregar o conteúdo do modal.');
      }
      return response.text();
    })
    .then((html) => {
      // Inserir o conteúdo no corpo do modal
      body.innerHTML = html;

      // Configurar os botões no rodapé
      footer.innerHTML = '<button class="btn btn-secondary btn-sm" onclick="fecharModalGenerico()">Fechar</button>';

      // Exibir o modal
      modal.style.display = 'block';
    });
}
function fecharModalGenerico() {
  const modal = document.getElementById('modalGenerico');
  modal.style.display = 'none';
  // Fecha o modal ao clicar fora dele
  window.onclick = function (event) {
    const modal = document.getElementById('modalGenerico');
    if (event.target === modal) {
      fecharModalGenerico();
    }
  };

  // Fecha o modal ao pressionar a tecla "Escape"
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      fecharModalGenerico();
    }
  });
}
function marcarComoAtendido(event, idPaciente) {
  event.preventDefault(); // Impede o envio padrão do formulário

  fetch(`/paciente/${idPaciente}/atendido`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao marcar paciente como atendido.');
      }
      return response.json();
    })
    .then((data) => {
      // Remover o paciente da lista na interface
      const pacienteRow = document.querySelector(`[data-id-paciente="${idPaciente}"]`);
      if (pacienteRow) {
        pacienteRow.remove();
      }
    })
    .catch((error) => {
      console.error(error);
      alert('Erro ao marcar paciente como atendido. Tente novamente.');
    });
}
