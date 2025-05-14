document.addEventListener('input', (event) => {
  const campo = event.target;

  // Verifica se o campo é um dos que precisam de capitalização
  if (
    ['nome', 'responsavel', 'endereco', 'bairro', 'cidade', 'profissao', 'complemento', 'especialidade'].includes(
      campo.name
    )
  ) {
    capitalizarPrimeiraLetra(campo);
  }
});

function capitalizarPrimeiraLetra(campo) {
  if (!campo.value) return;

  const palavras = campo.value.split(' ');

  for (let i = 0; i < palavras.length; i++) {
    palavras[i] = palavras[i].charAt(0).toUpperCase() + palavras[i].slice(1).toLowerCase();
  }

  campo.value = palavras.join(' ');
}
