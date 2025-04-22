// Calcular idade
function calcularIdadeFrontend() {
  const dataNasc = document.getElementById('dataNasc').value;
  const idadeInput = document.getElementById('idade');
  const responsavelField = document.getElementById('responsavel');

  try {
    const idade = calcularIdade(dataNasc);
    idadeInput.value = idade;

    if (idade < 18) {
      responsavelField.required = true;
      responsavelField.classList.add('required'); 
    } else {
      responsavelField.required = false;
      responsavelField.classList.remove('required'); 
    }

  } catch (error) {
    alert(error.message); 
    idadeInput.value = ''; 
    responsavelField.required = true; 
    responsavelField.classList.add('required');
  }
}

// Calcular idade ao sair do campo de data de nascimento
const dataNascInput = document.getElementById('dataNasc');
dataNascInput.addEventListener('blur', calcularIdadeFrontend);
