// mask.js

function applyMask(input) {
  let value = input.value;
  let type = input.name;

  if (type === 'esfOD' || type === 'cilOD' || type === 'esfOE' || type === 'cilOE' || type === 'adicao') {
    // Remove tudo que não for número, vírgula, mais ou menos
    value = value.replace(/[^0-9,+,-]/g, '');

    // Garante que o sinal apareça apenas no início
    if (value.length > 0 && (value[0] === '+' || value[0] === '-')) {
      let signal = value[0];
      value = value.slice(1).replace(/[-+]/g, ''); // Remove outros sinais
      value = signal + value; // Adiciona o sinal no início
    } else {
      value = value.replace(/[-+]/g, ''); // Remove sinais se não estiverem no início
    }

    // Formata o valor para ter sempre duas casas decimais
    if (value.length > 0) {
      let parts = value.split(',');
      if (parts.length > 1) {
        parts[1] = parts[1].slice(0, 2); // Limita a duas casas decimais
      }
      value = parts.join(',');
    }

    // Limita o tamanho do campo
    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    input.value = value;
  } else if (type === 'eixoOD' || type === 'eixoOE') {
    // Para campos de eixo (exemplo: 000°)
    value = value.replace(/[^0-9]/g, ''); // Apenas números
    if (value.length > 3) value = value.slice(0, 3); // Limita a 3 dígitos
    input.value = value + '°'; // Adiciona o grau no final
  }
}

function validateMultiple(input) {
  let value = input.value;
  // Verifica se o campo precisa ser múltiplo de 0.25
  if (value) {
    // Remove o símbolo (para calcular)
    value = value.replace(',', '.');
    // Verifica se o valor é um múltiplo de 0.25
    let num = parseFloat(value);
    if (!isNaN(num)) {
      let rounded = Math.round(num / 0.25) * 0.25;
      // Ajusta o valor no campo
      input.value = rounded.toFixed(2).replace('.', ',');
    }
  }
}

// Função para adicionar eventos aos campos
function addMaskEvents() {
  document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach((input) => {
      if (['esfOD', 'cilOD', 'esfOE', 'cilOE', 'adicao', 'eixoOD', 'eixoOE'].includes(input.name)) {
        input.addEventListener('input', function () {
          applyMask(this);
        });
        if (['esfOD', 'cilOD', 'esfOE', 'cilOE', 'adicao'].includes(input.name)) {
          input.addEventListener('blur', function () {
            validateMultiple(this);
          });
        }
      }
    });
  });
}

// Chamar a função para adicionar eventos
addMaskEvents();
