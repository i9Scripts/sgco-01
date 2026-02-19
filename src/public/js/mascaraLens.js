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
    // Para campos de eixo: durante a digitação apenas números (até 3 dígitos).
    // O símbolo '°' será adicionado apenas ao perder o foco para não
    // atrapalhar a edição e o uso do backspace.
    value = value.replace(/[^0-9]/g, ''); // Apenas números
    if (value.length > 3) value = value.slice(0, 3); // Limita a 3 dígitos
    input.value = value;
  }
}

function validateMultiple(input) {
  let value = input.value;
  // Verifica se o campo precisa ser múltiplo de 0.25
  if (value) {
    // Preserva sinal (+/-) se existir no início
    let sign = '';
    if (value.length > 0 && (value[0] === '+' || value[0] === '-')) {
      sign = value[0];
      value = value.slice(1);
    }
    // Normaliza separador decimal e remove caracteres não numéricos
    value = value.replace(',', '.').replace(/[^0-9.]/g, '');
    // Verifica se o valor é um múltiplo de 0.25
    let num = parseFloat(value);
    if (!isNaN(num)) {
      let rounded = Math.round(num / 0.25) * 0.25;
      let formatted = rounded.toFixed(2).replace('.', ',');
      // Readiciona o sinal se era positivo ou negativo
      if (sign === '+') {
        input.value = '+' + formatted;
      } else if (sign === '-') {
        // Garante que o negativo esteja presente
        input.value = '-' + formatted;
      } else {
        input.value = formatted;
      }
    }
  }
}

// Função para adicionar eventos aos campos
function addMaskEvents() {
  document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('input[type="text"]');
    // Attach mask events to inputs by name so we cover different input types
    const names = ['esfOD', 'cilOD', 'esfOE', 'cilOE', 'adicao', 'eixoOD', 'eixoOE'];
    names.forEach((name) => {
      const els = document.querySelectorAll(`input[name="${name}"]`);
      els.forEach((input) => {
        input.addEventListener('input', function () {
          applyMask(this);
        });
        // For refractive fields, also validate rounding to multiples of 0.25 on blur/change
        if (['esfOD', 'cilOD', 'esfOE', 'cilOE', 'adicao'].includes(name)) {
          input.addEventListener('blur', function () {
            validateMultiple(this);
          });
          input.addEventListener('change', function () {
            validateMultiple(this);
          });
        }

        // For eixo fields, allow free editing (numbers only) while focused,
        // and append the degree symbol on blur. Remove the symbol on focus so
        // the user can edit/backspace normally.
        if (['eixoOD', 'eixoOE'].includes(name)) {
          input.addEventListener('focus', function () {
            // Remove any non-digit characters (including the trailing '°')
            this.value = this.value.replace(/[^0-9]/g, '');
          });

          input.addEventListener('blur', function () {
            // On blur, normalize and append '°' if there's a value
            let v = this.value.replace(/[^0-9]/g, '');
            if (v.length > 3) v = v.slice(0, 3);
            if (v.length > 0) {
              this.value = v + '°';
            } else {
              this.value = '';
            }
          });
        }
      });
    });
  });
}

// Chamar a função para adicionar eventos
addMaskEvents();
