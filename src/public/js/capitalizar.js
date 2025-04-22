function capitalizarPrimeiraLetra(campo) {
  campo.value = campo.value.replace(/(^\w{1})|(\s+\w{1})/g, char => char.toUpperCase());
}

const campos = document.querySelectorAll('input[name="nome"], input[name="responsavel"], input[name="endereco"], input[name="bairro"], input[name="cidade"], input[name="profissao"]');

campos.forEach(campo => {
  campo.addEventListener('input', () => {
    capitalizarPrimeiraLetra(campo);
  });
});
