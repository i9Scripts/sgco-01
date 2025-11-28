// Cliente para buscar /weather e atualizar o bloco #api-content
// Mensagens em português (pt-BR) e manutenção dos ícones em FontAwesome
(function () {
  const container = document.getElementById('api-content');
  if (!container) return;

  // Mapeamento: chave -> { class: weathericons, desc: pt-BR }
  const weatherMap = {
    clear: { cls: 'wi-day-sunny', desc: 'Céu limpo' },
    partly_cloudy: { cls: 'wi-day-cloudy', desc: 'Parcialmente nublado' },
    cloudy: { cls: 'wi-cloud', desc: 'Nublado' },
    rain: { cls: 'wi-rain', desc: 'Chuva' },
    light_rain: { cls: 'wi-showers', desc: 'Chuvisco' },
    snow: { cls: 'wi-snow', desc: 'Neve' },
    sleet: { cls: 'wi-sleet', desc: 'Neve/Granizo' },
    fog: { cls: 'wi-fog', desc: 'Neblina' },
    thunder: { cls: 'wi-thunderstorm', desc: 'Trovoada' },
    windy: { cls: 'wi-windy', desc: 'Ventoso' },
  };

  function getIconHtml(key) {
    const info = weatherMap[key] || weatherMap.cloudy;
    return `<i class="wi ${info.cls}" aria-hidden="true" style="font-size:34px;"></i>`;
  }

  function weatherCodeToKey(code) {
    // Open-Meteo weathercode -> categoria
    if (code === 0) return 'clear';
    if (code === 1 || code === 2) return 'partly_cloudy';
    if (code === 3) return 'cloudy';
    if ([45, 48].includes(code)) return 'fog';
    if ([51, 53, 55, 80, 81, 82].includes(code)) return 'light_rain';
    if ([61, 63, 65].includes(code)) return 'rain';
    if ([56, 57, 66, 67].includes(code)) return 'sleet';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
    if ([95, 96, 99].includes(code)) return 'thunder';
    return 'cloudy';
  }

  async function loadWeather() {
    try {
      const resp = await fetch('/weather', { cache: 'no-store' });
      if (!resp.ok) throw new Error(`Resposta inválida: ${resp.status}`);
      const data = await resp.json();
      const cur = data.currently || {};

      // prefer server-provided key (already mapeado), fallback to weathercode
      const key = cur.icon || weatherCodeToKey(cur._weathercode || cur.weathercode || null);
      const iconHtml = getIconHtml(key);
      const desc = (weatherMap[key] && weatherMap[key].desc) || 'N/D';

      const temp = cur.temperature != null ? `${cur.temperature} °C` : 'N/D';
      const hum = cur.humidity != null ? `${cur.humidity} %` : 'N/D';
      const uv = cur.uvIndex != null ? cur.uvIndex : 'N/D';

      container.innerHTML = `
        <h3>O Clima</h3>
        <div class="d-flex align-items-center gap-2">
          <div class="weather-icon">${iconHtml}</div>
          <div class="weather-info">
            <p><strong>Temperatura:</strong> ${temp}</p>
            <p><strong>Descrição:</strong> ${desc}</p>
            <p><strong>Umidade:</strong> ${hum}</p>
            <p><strong>Índice UV:</strong> ${uv}</p>
          </div>
        </div>
      `;
    } catch (err) {
      console.error('Erro ao carregar dados do clima:', err);
      container.innerHTML = `
        <h3>O Clima</h3>
        <p class="text-danger"><strong>Erro ao carregar os dados do clima.</strong> Tente novamente mais tarde.</p>
      `;
    }
  }

  loadWeather();
  setInterval(loadWeather, 40 * 60 * 1000);
})();
