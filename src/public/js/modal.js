function abrirModalPaciente(btn) {
  let dados = btn.dataset.paciente;
  if (typeof dados === 'string') {
    dados = JSON.parse(dados);
  }
  const modal = document.getElementById('modalPaciente');
  const body = document.getElementById('modal-body');
  // const footer = document.getElementById('modal-footer');

  body.innerHTML = `
    Nome: ${dados.nome}
    CPF: ${dados.cpf}
    Data de Cadastro: ${new Date(dados.createdAt).toLocaleString()}
    Responsável: ${dados.responsavel}
    
    ${
      dados.anamnese
        ? `Última Anamnese
           Descrição: ${dados.anamnese.descricao || 'Não informado'}
           Data: ${dados.anamnese.createdAt ? new Date(dados.anamnese.createdAt).toLocaleString() : 'Não informado'}`
        : `Última Anamnese: Nenhuma anamnese registrada.`
    }
  `;

  footer.innerHTML = `
    Editar Paciente
    ${dados.anamnese ? `Editar Anamnese` : `Criar Anamnese`}
  `;

  modal.style.display = 'block';
}

function fecharModal() {
  const modal = document.getElementById('modalPaciente');
  modal.style.display = 'none';
}

// Fecha o modal se o usuário clicar fora da caixa
window.onclick = function (event) {
  const modal = document.getElementById('modalPaciente');
  if (event.target === modal) {
    fecharModal();
  }
};

// Fecha o modal ao pressionar a tecla "Escape"
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    fecharModal();
  }
});
