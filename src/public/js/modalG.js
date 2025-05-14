function abrirModalGenerico(url, titulo) {
  const modal = document.getElementById('modalGenerico');
  const title = document.getElementById('modal-generico-title');
  const body = document.getElementById('modal-generico-body');

  if (!modal || !title || !body) {
    console.error('Erro: Elementos do modal não encontrados.');
    return;
  }

  title.innerText = titulo;
  body.innerHTML = '<p>Carregando...</p>';

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao carregar o conteúdo do modal.');
      }
      return response.text();
    })
    .then((html) => {
      body.innerHTML = html;

      // Reaplica máscaras e eventos
      inicializarEventos();
    })
    .catch((error) => {
      console.error(error);
      body.innerHTML = '<p>Erro ao carregar o conteúdo. Tente novamente mais tarde.</p>';
    });

  modal.style.display = 'block';
}

function inicializarEventos() {
  // Reaplica máscaras
  document.querySelectorAll('input[name="dataNasc"]').forEach((campo) => {
    campo.addEventListener('input', () => {
      mascaraData(campo);
    });
  });

  document.querySelectorAll('input[name="cpf"]').forEach((campo) => {
    campo.addEventListener('input', () => {
      mascaraCpf(campo);
    });
  });

  document.querySelectorAll('input[name="celular"]').forEach((campo) => {
    campo.addEventListener('input', () => {
      mascaraCelular(campo);
    });
  });

  // Outros eventos podem ser adicionados aqui
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
