$(document).ready(function () {
  $(document).on('blur', '#cep', function () {
    let cep = $(this).val().replace(/\D/g, ''); // Remove caracteres não numéricos

    // Verifica se o CEP tem 8 dígitos (formato correto)
    if (cep.length === 8) {
      $.get(`/buscar-endereco/${cep}`, function (data) {
        // Caso a requisição seja bem-sucedida e o CEP seja encontrado
        if (data.erro) {
          if (window.showMessage) showMessage('error', 'CEP não encontrado!');
        } else {
          // Preenche os campos com os dados retornados pela API
          $('#endereco').val(data.logradouro);
          $('#bairro').val(data.bairro);
          $('#cidade').val(data.localidade);
          $('#numero').focus(); // Foca no campo de número
        }
      }).fail(function () {
        if (window.showMessage) showMessage('error', 'Erro ao buscar o endereço.');
      });
    } else {
      if (window.showMessage) showMessage('error', 'CEP inválido. Por favor, insira um CEP válido.');
    }
  });
});
