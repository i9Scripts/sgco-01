window.addEventListener('load', function () {
  const inputData = document.getElementById('dataAtend');
  if (inputData && (!inputData.value || inputData.value === 'undefined')) {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    inputData.value = `${dia}/${mes}/${ano}`;
  }
});

async function validarNFicha(input, excludeId = null) {
  const nFicha = input.value;
  const feedback = document.getElementById('ficha-feedback');

  if (!nFicha) {
    if (feedback) feedback.classList.add('hidden');
    input.classList.remove('border-red-500', 'border-emerald-500');
    return;
  }

  try {
    let url = `/pacientes/check-ficha/${nFicha}`;
    if (excludeId) {
      url += `?excludeId=${excludeId}`;
    }
    const response = await fetch(url);
    const data = await response.json();

    if (feedback) {
      feedback.classList.remove('hidden');
      if (data.available) {
        feedback.textContent = '✓ Disponível';
        feedback.classList.remove('text-red-500');
        feedback.classList.add('text-emerald-500');
        input.classList.remove('border-red-500');
        input.classList.add('border-emerald-500');
      } else {
        feedback.textContent = `⚠ Já em uso por: ${data.nome}`;
        feedback.classList.remove('text-emerald-500');
        feedback.classList.add('text-red-500');
        input.classList.remove('border-emerald-500');
        input.classList.add('border-red-500');
      }
    }
  } catch (error) {
    console.error('Erro ao validar ficha:', error);
  }
}
