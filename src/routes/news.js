import axios from 'axios';

// Cache simples em memória (tempo em ms)
const cache = {
  ts: 0,
  ttl: 1000 * 60 * 5, // 5 minutos
  data: null,
};

export default function registerNews(app) {
  app.get('/news', async (req, res) => {
    try {
      const now = Date.now();
      if (cache.data && now - cache.ts < cache.ttl) {
        return res.json({ ok: true, source: 'cache', results: cache.data });
      }

      const apiKey = process.env.NEWSDATA_APIKEY || 'outrachave';
      const url = 'https://newsdata.io/api/1/latest';

      const params = {
        apikey: apiKey,
        language: 'pt',
        category: 'education,domestic,entertainment,food,tourism',
        image: 1,
        country: 'br',
      };

      const resp = await axios.get(url, { params, timeout: 60000 });
      const body = resp.data || {};

      const results = (body.results || []).slice(0, 6).map((a) => {
        // tentativa robusta de extrair imagem de vários campos possíveis
        const image =
          a.image ||
          a.image_url ||
          a.thumbnail ||
          (a.enclosure && a.enclosure.url) ||
          (a.media && a.media[0] && a.media[0].url) ||
          null;
        const source = a.source_id || (a.creator && a.creator[0]) || a.source || 'Indisponível';
        return {
          title: a.title || 'Sem título',
          link: a.link || a.url || '#',
          image,
          source,
          pubDate: a.pubDate || a.pubDate || null,
        };
      });

      cache.ts = now;
      cache.data = results;

      return res.json({ ok: true, source: 'api', results });
    } catch (err) {
      console.error('Erro ao buscar notícias:', err?.message || err);
      // se cache existir, retornamos cache mesmo em erro de rede
      if (cache.data) return res.json({ ok: true, source: 'cache', results: cache.data });
      return res.status(500).json({ ok: false, error: 'Erro ao buscar notícias' });
    }
  });
}
