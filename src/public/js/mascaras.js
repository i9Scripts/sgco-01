// Máscara para CEP (00000-000)
function mascaraCep(input) {
  input.value = input.value.replace(/\D/g, '') // Remove caracteres não numéricos
                            .replace(/^(\d{5})(\d)/, '$1-$2'); // Aplica o formato do CEP
}

// Máscara para CPF (000.000.000-00)
function mascaraCpf(input) {
  input.value = input.value.replace(/\D/g, '') // Remove caracteres não numéricos
                            .replace(/(\d{3})(\d)/, '$1.$2') // Primeiro ponto
                            .replace(/(\d{3})(\d)/, '$1.$2') // Segundo ponto
                            .replace(/(\d{3})(\d{2})$/, '$1-$2'); // Traço
}

// Máscara para celular ((00) 00000-0000)
function mascaraCelular(input) {
  input.value = input.value.replace(/\D/g, '') // Remove caracteres não numéricos
                            .replace(/(\d{2})(\d)/, '($1) $2') // Código de área
                            .replace(/(\d{5})(\d)/, '$1-$2') // Traço
                            .replace(/(-\d{4})\d+?$/, '$1'); // Limita ao tamanho correto
}

// Máscara para o campo data
function mascaraData(campo, e) {
  var kC = (document.all) ? event.keyCode : e.keyCode;
  var data = campo.value;

  if (kC != 8 && kC != 46) {
    if (data.length == 2) {
      campo.value = data += '/';
    } else if (data.length == 5) {
      campo.value = data += '/';
    } else {
      campo.value = data;
    }
  }
}
