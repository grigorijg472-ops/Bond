// Реальная погода: Open-Meteo (бесплатно, без API-ключа)
(function () {
  const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
  const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  const REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

  // Коды погоды WMO → описание, иконка, тип
  const CODES = {
    0: ['Ясно', '☀️', '🌙', 'clear'],
    1: ['Преимущественно ясно', '🌤️', '🌙', 'clear'],
    2: ['Переменная облачность', '⛅', '☁️', 'clouds'],
    3: ['Пасмурно', '☁️', '☁️', 'clouds'],
    45: ['Туман', '🌫️', '🌫️', 'fog'],
    48: ['Туман с изморозью', '🌫️', '🌫️', 'fog'],
    51: ['Лёгкая морось', '🌦️', '🌧️', 'rain'],
    53: ['Морось', '🌦️', '🌧️', 'rain'],
    55: ['Сильная морось', '🌧️', '🌧️', 'rain'],
    56: ['Ледяная морось', '🌧️', '🌧️', 'sleet'],
    57: ['Сильная ледяная морось', '🌧️', '🌧️', 'sleet'],
    61: ['Небольшой дождь', '🌦️', '🌧️', 'rain'],
    63: ['Дождь', '🌧️', '🌧️', 'rain'],
    65: ['Ливень', '🌧️', '🌧️', 'rain'],
    66: ['Ледяной дождь', '🌧️', '🌧️', 'sleet'],
    67: ['Сильный ледяной дождь', '🌧️', '🌧️', 'sleet'],
    71: ['Небольшой снег', '🌨️', '🌨️', 'snow'],
    73: ['Снег', '🌨️', '🌨️', 'snow'],
    75: ['Сильный снегопад', '❄️', '❄️', 'snow'],
    77: ['Снежная крупа', '🌨️', '🌨️', 'snow'],
    80: ['Кратковременный дождь', '🌦️', '🌧️', 'rain'],
    81: ['Ливневый дождь', '🌧️', '🌧️', 'rain'],
    82: ['Сильный ливень', '⛈️', '⛈️', 'rain'],
    85: ['Снегопад', '🌨️', '🌨️', 'snow'],
    86: ['Сильный снегопад', '❄️', '❄️', 'snow'],
    95: ['Гроза', '⛈️', '⛈️', 'storm'],
    96: ['Гроза с градом', '⛈️', '⛈️', 'storm'],
    99: ['Сильная гроза с градом', '⛈️', '⛈️', 'storm'],
  };

  function describe(code, isDay = true) {
    const c = CODES[code] || ['Нет данных', '🌡️', '🌡️', 'clouds'];
    return { text: c[0], icon: isDay ? c[1] : c[2], type: c[3] };
  }

  async function getJSON(url, timeout = 12000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }

  async function searchCities(query) {
    const q = query.trim();
    if (q.length < 2) return [];
    const url = `${GEO_URL}?name=${encodeURIComponent(q)}&count=7&language=ru&format=json`;
    const data = await getJSON(url, 8000);
    return (data.results || []).map((r) => ({
      name: r.name,
      region: [r.admin1, r.country].filter(Boolean).join(', '),
      country: r.country_code,
      lat: r.latitude,
      lon: r.longitude,
    }));
  }

  async function reverseGeocode(lat, lon) {
    try {
      const d = await getJSON(`${REVERSE_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=ru`, 6000);
      return {
        name: d.city || d.locality || d.principalSubdivision || 'Моё местоположение',
        region: [d.principalSubdivision, d.countryName].filter(Boolean).join(', '),
      };
    } catch (e) {
      return { name: 'Моё местоположение', region: '' };
    }
  }

  async function getForecast(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m',
      hourly: 'temperature_2m,apparent_temperature,precipitation_probability,weather_code,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,precipitation_sum,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset',
      wind_speed_unit: 'ms',
      timezone: 'auto',
      forecast_days: '7',
    });
    const d = await getJSON(`${FORECAST_URL}?${params}`);
    return normalize(d);
  }

  function normalize(d) {
    const c = d.current;
    const h = d.hourly;
    const dl = d.daily;

    // Почасовой прогноз начиная с текущего часа
    const nowHour = c.time.slice(0, 13); // "YYYY-MM-DDTHH"
    let start = h.time.findIndex((t) => t.slice(0, 13) >= nowHour);
    if (start < 0) start = 0;
    const hourly = [];
    for (let i = start; i < Math.min(start + 24, h.time.length); i++) {
      hourly.push({
        time: h.time[i],
        temp: h.temperature_2m[i],
        feels: h.apparent_temperature[i],
        pop: h.precipitation_probability[i] ?? 0,
        code: h.weather_code[i],
        isDay: h.is_day[i] === 1,
      });
    }

    const days = dl.time.map((date, i) => ({
      date,
      code: dl.weather_code[i],
      max: dl.temperature_2m_max[i],
      min: dl.temperature_2m_min[i],
      feelsMax: dl.apparent_temperature_max[i],
      feelsMin: dl.apparent_temperature_min[i],
      pop: dl.precipitation_probability_max[i] ?? 0,
      precipSum: dl.precipitation_sum[i] ?? 0,
      uv: dl.uv_index_max[i] ?? 0,
      wind: dl.wind_speed_10m_max[i],
      gusts: dl.wind_gusts_10m_max[i],
      sunrise: dl.sunrise[i],
      sunset: dl.sunset[i],
    }));

    // Вероятность осадков в ближайшие 12 часов — важна для зонта прямо сейчас
    const next12 = hourly.slice(0, 12);
    const popNext = next12.length ? Math.max(...next12.map((x) => x.pop)) : days[0].pop;

    return {
      timezone: d.timezone,
      current: {
        time: c.time,
        temp: c.temperature_2m,
        feels: c.apparent_temperature,
        humidity: c.relative_humidity_2m,
        isDay: c.is_day === 1,
        precip: c.precipitation,
        code: c.weather_code,
        wind: c.wind_speed_10m,
        gusts: c.wind_gusts_10m,
        popNext,
        feelsRange: next12.length ? [Math.min(...next12.map((x) => x.feels)), Math.max(...next12.map((x) => x.feels))] : null,
      },
      hourly,
      days,
    };
  }

  window.Weather = { getForecast, searchCities, reverseGeocode, describe };
})();
