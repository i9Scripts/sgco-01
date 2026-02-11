document.addEventListener('submit', async (e) => {
  const form = e.target;
  if (!form.classList || !form.classList.contains('ajax-remote')) return;

  e.preventDefault();
  try {
    const action = form.action;
    const method = (form.getAttribute('method') || 'POST').toUpperCase();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const body = JSON.stringify(data);

    const resp = await fetch(action, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body,
    });

    const json = await resp.json();

    if (json && json.success) {
      // Atualiza partial da fila
      const partial = await fetch('/_fila-espera', { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      const html = await partial.text();
      const container = document.getElementById('fila-espera-container');
      if (container) container.innerHTML = html;

      // fechar modal genérico se houver (Bootstrap)
      const modalEl = document.querySelector('.modal.show');
      if (modalEl) {
        // depende do bootstrap estar global
        try {
          const bsModal = bootstrap.Modal.getInstance(modalEl);
          bsModal && bsModal.hide();
        } catch (err) {
          // fallback: remover classe
          modalEl.classList.remove('show');
        }
      }
    } else {
      if (window.showMessage) showMessage('error', 'Erro ao salvar: ' + (json.error || 'tente novamente'));
    }
  } catch (err) {
    console.error('Erro AJAX ao salvar anamnese:', err);
    if (window.showMessage) showMessage('error', 'Erro ao salvar anamnese. Veja console.');
  }
});
