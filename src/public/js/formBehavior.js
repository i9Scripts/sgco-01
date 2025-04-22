document.addEventListener('DOMContentLoaded', function () {
  // Quando o campo 'numero' perder o foco
  document.getElementById('numero').addEventListener('blur', function () {
    // Obter os valores dos campos
    const endereco = document.getElementById('endereco').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;

    // Verificar se 'endereco', 'bairro' e 'cidade' estão preenchidos
    if (endereco && bairro && cidade) {
      // Se estiverem preenchidos, foca no campo 'cpf'
      document.getElementById('cpf').focus();
    }
  });
});
