
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
