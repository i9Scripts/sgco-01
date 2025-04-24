document.addEventListener('DOMContentLoaded', function () {
  const numeroInput = document.getElementById('numero');
  if (numeroInput) {
    numeroInput.addEventListener('blur', function () {
      const endereco = document.getElementById('endereco').value;
      const bairro = document.getElementById('bairro').value;
      const cidade = document.getElementById('cidade').value;

      if (endereco && bairro && cidade) {
        document.getElementById('cpf').focus();
      }
    });
  }
});
