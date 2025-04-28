function calcularIdadeFrontend(input) {
  const valorData = input.value;

  if (!valorData || valorData.length !== 10) {
    document.getElementById('idade').value = '';
    return;
  }

  const partes = valorData.split('/');
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1; // mês começa em 0 no JS
  const ano = parseInt(partes[2], 10);

  const nascimento = new Date(ano, mes, dia);
  const hoje = new Date();

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();

  // Ajustar se ainda não fez aniversário esse ano
  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
    idade--;
  }

  document.getElementById('idade').value = idade;
}
