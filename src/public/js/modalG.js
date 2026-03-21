/**
 * Cria e exibe um modal dinâmico do Bootstrap 5.
 */
function showModal({ title, body, footer, size = '' }) {
  const existingModal = document.getElementById('dynamicModal');
  if (existingModal) {
    existingModal.remove();
  }

  const modalElement = document.createElement('div');
  modalElement.className = 'modal fade';
  modalElement.id = 'dynamicModal';
  modalElement.tabIndex = -1;
  modalElement.setAttribute('aria-hidden', 'true');

  const modalFooter = footer || '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>';

  modalElement.innerHTML = `
        <div class="modal-dialog ${size} modal-dialog-centered">
            <div class="modal-content shadow-lg border-0 rounded-3">
                <div class="modal-header border-bottom-0 pb-0">
                    <h5 class="modal-title font-weight-bold text-primary" id="dynamicModalLabel">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body py-4">
                    ${body}
                </div>
                ${footer !== '' ? `<div class="modal-footer border-top-0 pt-0">${modalFooter}</div>` : ''}
            </div>
        </div>
    `;

  document.body.appendChild(modalElement);
  const modal = new bootstrap.Modal(modalElement);

  modalElement.addEventListener('hidden.bs.modal', function () {
    modalElement.remove();
  });

  modal.show();
  return modal;
}

/**
 * Abre o modal buscando conteúdo de uma URL, removendo layouts se necessário.
 */
function abrirModalGenerico(url, titulo, tamanho = 'modal-lg') {
  showModal({
    title: titulo,
    body: `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-2 text-muted">Carregando formulário...</p>
      </div>
    `,
    footer: '',
    size: tamanho
  });

  const modalBody = document.querySelector('#dynamicModal .modal-body');

  fetch(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar o conteúdo.');
      return response.text();
    })
    .then(html => {
      if (!modalBody) return;

      // Lógica de limpeza: Se vier a página inteira, tenta pegar só o <main> ou <form>
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Procura por elementos de conteúdo principal
      const content = doc.querySelector('main') || doc.querySelector('form') || doc.body;
      
      // Remove elementos indesejados caso tenham vindo no parse
      const aside = content.querySelector('aside');
      if (aside) aside.remove();
      const header = content.querySelector('header');
      if (header) header.remove();

      modalBody.innerHTML = content.innerHTML;
      
      // Inicializa eventos no novo conteúdo (máscaras, etc)
      if (typeof inicializarEventos === 'function') {
        inicializarEventos();
      }
    })
    .catch(error => {
      console.error(error);
      if (modalBody) {
        modalBody.innerHTML = `
          <div class="alert alert-danger mb-0">
            <i class="ri-error-warning-line me-2"></i>
            Não foi possível carrergar o conteúdo. Por favor, tente novamente.
          </div>
        `;
      }
    });
}

/**
 * Reinicializa máscaras e eventos (compatível com o novo conteúdo carregado)
 */
function inicializarEventos() {
    // Máscaras (se as funções existirem no escopo global)
    const inputs = {
        'dataNasc': typeof mascaraData === 'function' ? mascaraData : null,
        'cpf': typeof mascaraCpf === 'function' ? mascaraCpf : null,
        'celular': typeof mascaraCelular === 'function' ? mascaraCelular : null,
        'cep': typeof mascaraCep === 'function' ? mascaraCep : null
    };

    Object.keys(inputs).forEach(name => {
        const func = inputs[name];
        if (func) {
            document.querySelectorAll(`input[name="${name}"], input[id="${name}"]`).forEach(input => {
                input.addEventListener('input', () => func(input));
            });
        }
    });
}
