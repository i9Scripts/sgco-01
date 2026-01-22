/**
 * Creates and displays a generic, dynamic Bootstrap 5 modal.
 *
 * @param {object} options - The options for the modal.
 * @param {string} options.title - The title of the modal.
 * @param {string} options.body - The HTML content for the modal body.
 * @param {string} [options.footer] - The HTML content for the modal footer. If not provided, a default close button will be used.
 * @param {string} [options.size] - The size of the modal (e.g., 'modal-sm', 'modal-lg', 'modal-xl'). Defaults to standard size.
 */
function showModal({ title, body, footer, size = '' }) {
  // Remove any existing modals to avoid conflicts
  const existingModal = document.getElementById('dynamicModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal element
  const modalElement = document.createElement('div');
  modalElement.classList.add('modal', 'fade');
  modalElement.id = 'dynamicModal';
  modalElement.tabIndex = -1;
  modalElement.setAttribute('aria-labelledby', 'dynamicModalLabel');
  modalElement.setAttribute('aria-hidden', 'true');

  // Define default footer if not provided
  const modalFooter =
    footer || '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>';

  modalElement.innerHTML = `
        <div class="modal-dialog ${size}">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="dynamicModalLabel">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ${body}
                </div>
                <div class="modal-footer">
                    ${modalFooter}
                </div>
            </div>
        </div>
    `;

  // Append to body and show
  document.body.appendChild(modalElement);
  const modal = new bootstrap.Modal(modalElement);

  // Clean up after the modal is hidden
  modalElement.addEventListener('hidden.bs.modal', function () {
    modalElement.remove();
  });

  modal.show();
}

/**
 * Legacy function to open a modal by fetching content from a URL.
 * It now uses the new showModal function internally.
 *
 * @param {string} url - The URL to fetch the modal content from.
 * @param {string} titulo - The title for the modal.
 */
function abrirModalGenerico(url, titulo) {
  showModal({
    title: titulo,
    body: '<p>Carregando...</p>',
    footer: '', // No footer until content is loaded
  });

  const modalBody = document.querySelector('#dynamicModal .modal-body');

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao carregar o conteúdo do modal.');
      }
      return response.text();
    })
    .then((html) => {
      if (modalBody) {
        modalBody.innerHTML = html;
      }
      // Re-initialize any necessary event listeners for the new content
      inicializarEventos();
    })
    .catch((error) => {
      console.error(error);
      if (modalBody) {
        modalBody.innerHTML = '<p>Erro ao carregar o conteúdo. Tente novamente mais tarde.</p>';
      }
    });
}

function inicializarEventos() {
  // Reaplica máscaras
  document.querySelectorAll('input[name="dataNasc"]').forEach((campo) => {
    campo.addEventListener('input', () => {
      mascaraData(campo);
    });
  });

  document.querySelectorAll('input[name="cpf"]').forEach((campo) => {
    campo.addEventListener('input', () => {
      mascaraCpf(campo);
    });
  });

  document.querySelectorAll('input[name="celular"]').forEach((campo) => {
    campo.addEventListener('input', () => {
      mascaraCelular(campo);
    });
  });

  // Outros eventos podem ser adicionados aqui
}

// The old fecharModalGenerico is no longer needed as Bootstrap's own dismiss functionality is used.
// You can remove it if it's not being called directly from anywhere else.
function fecharModalGenerico() {
  const modal = document.getElementById('modalGenerico');
  modal.style.display = 'none';
  // Fecha o modal ao clicar fora dele
  window.onclick = function (event) {
    const modal = document.getElementById('modalGenerico');
    if (event.target === modal) {
      fecharModalGenerico();
    }
  };

  // Fecha o modal ao pressionar a tecla "Escape"
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      fecharModalGenerico();
    }
  });
}
