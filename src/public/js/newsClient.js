// Cliente que busca /news e atualiza o bloco .api-noticias
(function () {
  const container = document.querySelector('.api-noticias');
  (function () {
    const container = document.querySelector('.api-noticias');
    if (!container) return;

    function formatDate(iso) {
      if (!iso) return '';
      try {
        const d = new Date(iso);
        return d.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return iso;
      }
    }

    let rotatorInterval = null;
    let rotatorIndex = 0;
    let rotatorItems = [];
    const ROTATE_MS = 15000;

    function renderItem(i) {
      const it = rotatorItems[i];
      if (!it) return;
      const placeholder = '/img/news-placeholder.svg';
      const src = it.image || placeholder;
      const imgHtml = `<img src="${src}" alt="" class="news-thumb" onerror="this.onerror=null;this.src='${placeholder}';"/>`;
      container.innerHTML = `
        
        <div class="news-rotator fade-in">
          <h3>Últimas <br> Notícias</h3>
          <a href="${it.link}" target="_blank" rel="noopener noreferrer">
            ${imgHtml}
            <div class="news-body">
              <strong class="news-title">${it.title}</strong>
              <div class="news-meta">${it.source} • ${formatDate(it.pubDate)}</div>
            </div>
          </a>
        </div>
      `;
    }

    function startRotator() {
      stopRotator();
      if (!rotatorItems || rotatorItems.length <= 1) return;
      rotatorInterval = setInterval(() => {
        rotatorIndex = (rotatorIndex + 1) % rotatorItems.length;
        renderItem(rotatorIndex);
      }, ROTATE_MS);
    }

    function stopRotator() {
      if (rotatorInterval) {
        clearInterval(rotatorInterval);
        rotatorInterval = null;
      }
    }

    async function loadNews() {
      container.innerHTML = '<h3>Carregando notícias...</h3>';
      try {
        const resp = await fetch('/news', { cache: 'no-store' });
        if (!resp.ok) throw new Error('Resposta inválida: ' + resp.status);
        const json = await resp.json();
        const items = json.results || [];

        if (!items.length) {
          container.innerHTML = '<h3>Últimas Notícias</h3><p>Nenhuma notícia encontrada.</p>';
          return;
        }

        rotatorItems = items;
        rotatorIndex = 0;
        renderItem(rotatorIndex);
        startRotator();
      } catch (err) {
        console.error('Erro ao carregar notícias:', err);
        container.innerHTML =
          '<h3>Últimas Notícias</h3><p class="text-danger">Erro ao carregar notícias. Tente novamente mais tarde.</p>';
      }
    }

    // Pause rotator on hover
    container.addEventListener('mouseenter', () => stopRotator());
    container.addEventListener('mouseleave', () => startRotator());

    loadNews();
    // atualizar a cada 10 minutos
    setInterval(loadNews, 28800 * 1000);
  })();
})();
