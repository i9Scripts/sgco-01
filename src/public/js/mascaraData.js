function mascaraData(input) {
  let value = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
  if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d)/, '$1/$2'); // Adiciona a primeira barra
  }
  if (value.length > 5) {
    value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3'); // Adiciona a segunda barra
  }
  input.value = value.substring(0, 10); // Limita o valor a 10 caracteres
}
