import axios from 'axios';

// Registra a rota /weather na aplicação Express
export default function registerWeather(app) {
  app.get('/weather', async (req, res) => {
    try {
      const lat = process.env.WEATHER_LAT || '-23.55052';
      const lon = process.env.WEATHER_LON || '-46.633308';

      const resp = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          current_weather: true,
          hourly: 'relativehumidity_2m,uv_index',
          timezone: 'auto',
        },
        timeout: 8000,
      });

      const data = resp.data || {};
      const current = data.current_weather || {};
      let humidity = null;
      let uvIndex = null;

      if (data.hourly && Array.isArray(data.hourly.time)) {
        const times = data.hourly.time;
        const rh = data.hourly.relativehumidity_2m || [];
        const uv = data.hourly.uv_index || [];
        const currentTime = current.time || new Date().toISOString().slice(0, 13) + ':00';
        let idx = times.indexOf(currentTime);

        if (idx === -1) {
          // procura o índice com menor diferença de tempo como fallback
          let best = -1;
          let bestDiff = Infinity;
          const now = current.time ? new Date(current.time).getTime() : Date.now();
          for (let i = 0; i < times.length; i++) {
            const t = new Date(times[i]).getTime();
            const diff = Math.abs(t - now);
            if (diff < bestDiff) {
              bestDiff = diff;
              best = i;
            }
          }
          idx = best;
        }

        if (idx >= 0) {
          humidity = rh[idx] ?? null;
          uvIndex = uv[idx] ?? null;
        }
      }

      const mapWeatherCode = (code) => {
        if (code === 0) return 'clear';
        if ([1, 2].includes(code)) return 'partly_cloudy';
        if ([3].includes(code)) return 'cloudy';
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
        if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
        return 'cloudy';
      };

      const icon = mapWeatherCode(current.weathercode);

      return res.json({
        currently: {
          icon,
          temperature: current.temperature ?? null,
          humidity,
          uvIndex,
        },
      });
    } catch (error) {
      console.error('Erro ao obter dados do clima:', error?.message || error);
      return res.status(500).json({ error: 'Erro ao obter dados do clima' });
    }
  });
}
