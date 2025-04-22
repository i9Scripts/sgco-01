// calcularDataNasc.js
function calcularIdade(dataNasc) {
  if (dataNasc) {
    const nascimento = new Date(dataNasc);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNasc = nascimento.getMonth();
    const diaAtual = hoje.getDate();
    const diaNasc = nascimento.getDate();

    if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
      idade--;
    }

    return idade;
  } else {
    throw new Error("Por favor, insira uma data válida.");
  }
}