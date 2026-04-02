/**
 * Cria e exibe um modal dinâmico sem dependência do Bootstrap.
 * Usa classes utilitárias (Tailwind) para aparência. Retorna um objeto com método close().
 */
function showModal({ title, body, footer = '', size = 'max-w-4xl' }) {
  const existing = document.getElementById('dynamicModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'dynamicModal';
  overlay.className = 'fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/50';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  overlay.innerHTML = `
    <div class="w-full ${size} bg-white rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
      <header class="flex items-start md:items-center justify-between gap-4 p-4 border-b">
        <h3 class="text-lg font-bold text-slate-800">${title}</h3>
        <button type="button" aria-label="Fechar modal" class="close-modal text-slate-600 hover:text-slate-900">✕</button>
      </header>
      <div class="modal-body overflow-auto p-4">${body}</div>
      ${footer !== '' ? `<footer class="p-4 border-t">${footer}</footer>` : ''}
    </div>
  `;

  // Append and manage events
  document.body.appendChild(overlay);

  const modalContent = overlay.querySelector('div');
  const closeButton = overlay.querySelector('.close-modal');
  const modalBody = overlay.querySelector('.modal-body');

  // Ensure a roomy modal: max width and responsive width
  try {
    modalContent.style.maxWidth = '1200px';
    modalContent.style.width = '95%';
    modalContent.style.margin = '0 auto';
  } catch (e) {
    // ignore in environments that disallow style changes
  }

  // Focus management
  const previouslyFocused = document.activeElement;
  modalContent.setAttribute('tabindex', '-1');
  modalContent.focus();

  function close() {
    overlay.remove();
    if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') close();
  }

  // Close when clicking backdrop (but not when clicking inside content)
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });

  closeButton?.addEventListener('click', close);
  document.addEventListener('keydown', onKeyDown);

  // Return controller
  return { overlay, modalContent, modalBody, close };
}

/**
 * Abre o modal buscando conteúdo de uma URL, removendo layouts se necessário.
 */
function abrirModalGenerico(url, titulo, tamanho = 'max-w-2xl') {
  const spinner = `
    <div class="flex flex-col items-center justify-center py-8">
      <div class="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
      <p class="mt-3 text-sm text-slate-500">Carregando formulário...</p>
    </div>
  `;

  // Support legacy size names (Bootstrap-like) and Tailwind classes
  const sizeMap = {
    'modal-sm': 'max-w-md',
    'modal-md': 'max-w-lg',
    'modal-lg': 'max-w-3xl',
    'modal-xl': 'max-w-5xl',
    'modal-xxl': 'max-w-7xl',
    full: 'w-full max-w-full',
  };

  const resolvedSize = sizeMap[tamanho] || tamanho || 'max-w-3xl';

  const modal = showModal({ title: titulo, body: spinner, footer: '', size: resolvedSize });
  if (!modal) return;

  const modalBody = modal.modalBody;

  fetch(url, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  })
    .then((res) => {
      if (!res.ok) throw new Error('Erro ao carregar o conteúdo.');
      return res.text();
    })
    .then((html) => {
      if (!modalBody) return;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const content = doc.querySelector('main') || doc.querySelector('form') || doc.body;

      const selectorsToRemove = ['aside', 'header', 'nav', 'footer', '.wrapper', '.fixed-buttons', '.no-print'];
      selectorsToRemove.forEach((sel) => {
        content.querySelectorAll(sel).forEach((el) => el.remove());
      });

      content.querySelectorAll('script').forEach((s) => s.remove());
      content.querySelectorAll('link').forEach((l) => l.remove());

      let finalHtml = content.innerHTML;
      const tempDoc = parser.parseFromString(finalHtml, 'text/html');
      const innerForm = tempDoc.querySelector('form');
      if (innerForm) finalHtml = innerForm.outerHTML;

      modalBody.innerHTML = finalHtml;

      if (typeof inicializarEventos === 'function') inicializarEventos();
    })
    .catch((err) => {
      console.error(err);
      if (modalBody)
        modalBody.innerHTML = `<div class="p-4 text-sm text-red-600">Não foi possível carregar o conteúdo. Tente novamente.</div>`;
    });

  return modal;
}

/**
 * Reinicializa máscaras e eventos (compatível com o novo conteúdo carregado)
 */
function inicializarEventos() {
  // Máscaras (se as funções existirem no escopo global)
  const inputs = {
    dataNasc: typeof mascaraData === 'function' ? mascaraData : null,
    cpf: typeof mascaraCpf === 'function' ? mascaraCpf : null,
    celular: typeof mascaraCelular === 'function' ? mascaraCelular : null,
    cep: typeof mascaraCep === 'function' ? mascaraCep : null,
  };

  Object.keys(inputs).forEach((name) => {
    const func = inputs[name];
    if (func) {
      document.querySelectorAll(`input[name="${name}"], input[id="${name}"]`).forEach((input) => {
        input.addEventListener('input', () => func(input));
      });
    }
  });
}
