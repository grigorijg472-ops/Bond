// Главный модуль приложения
(function () {
  const { Sky, flyOut, flyAway, sparkle, ripple } = window.Effects;
  const fmt = window.Outfits.fmt;
  const $ = (id) => document.getElementById(id);

  const DEFAULT_PLACE = { name: 'Минск', region: 'Беларусь', lat: 53.9, lon: 27.5667 };
  const REFRESH_MS = 15 * 60 * 1000;

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  const state = {
    place: store.get('wo.place', DEFAULT_PLACE),
    gender: store.get('wo.gender', 'f'),
    forecast: null,
    day: -1, // -1 = сейчас, 0..6 = день прогноза
    seed: 0,
    loading: false,
    firstReveal: true,
  };

  /* ---------- Загрузка ---------- */
  async function load(showLoading = true) {
    if (state.loading) return;
    state.loading = true;
    $('errorBox').hidden = true;
    if (showLoading) document.body.classList.add('is-loading');
    try {
      state.forecast = await Weather.getForecast(state.place.lat, state.place.lon);
      renderWeather();
      renderDays();
      renderOutfit(true);
      state.loadedAt = Date.now();
      $('updatedAt').textContent = 'Обновлено в ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error(e);
      $('errorText').textContent = navigator.onLine === false
        ? 'Нет подключения к интернету. Проверьте сеть и попробуйте снова.'
        : 'Не удалось загрузить погоду. Попробуйте ещё раз.';
      $('errorBox').hidden = false;
    } finally {
      state.loading = false;
      document.body.classList.remove('is-loading');
    }
  }

  /* ---------- Погода ---------- */
  function renderWeather() {
    const f = state.forecast;
    const c = f.current;
    const today = f.days[0];
    const d = Weather.describe(c.code, c.isDay);

    $('cityName').textContent = state.place.name;
    $('cityName').classList.remove('skeleton-text');
    const localTime = c.time.slice(11, 16);
    const dateStr = new Date(c.time.slice(0, 10) + 'T12:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    $('cityMeta').textContent = [state.place.region, `${dateStr}, ${localTime}`].filter(Boolean).join(' · ');

    $('weatherIcon').textContent = d.icon;
    countTo($('temperature'), Math.round(c.temp));
    $('weatherDesc').textContent = d.text;
    $('feelsLike').textContent = fmt(c.feels);
    $('minMax').textContent = `↑${fmt(today.max)} ↓${fmt(today.min)}`;
    $('wind').textContent = `${Math.round(c.wind)} м/с` + (c.gusts >= c.wind + 3 ? ` · до ${Math.round(c.gusts)}` : '');
    $('humidity').textContent = `${c.humidity}%`;
    $('precip').textContent = `${Math.round(c.popNext)}%`;
    $('uv').textContent = uvLabel(today.uv);
    $('sunrise').textContent = today.sunrise.slice(11, 16);
    $('sunset').textContent = today.sunset.slice(11, 16);

    document.body.dataset.theme = `${d.type}-${c.isDay ? 'day' : 'night'}`;
    Sky.set(d.type, c.isDay);
    document.title = `${fmt(c.temp)}, ${state.place.name} · Что надеть?`;

    // Почасовой
    const wrap = $('hourly');
    wrap.innerHTML = '';
    const temps = f.hourly.map((h) => h.temp);
    const tMin = Math.min(...temps), tMax = Math.max(...temps);
    f.hourly.forEach((h, i) => {
      const el = document.createElement('div');
      el.className = 'hour' + (i === 0 ? ' hour--now' : '');
      const hd = Weather.describe(h.code, h.isDay);
      const pct = tMax === tMin ? 50 : ((h.temp - tMin) / (tMax - tMin)) * 100;
      el.innerHTML = `
        <span class="hour__time"></span>
        <span class="hour__icon"></span>
        <span class="hour__bar"><i style="--p:${pct.toFixed(0)}%"></i></span>
        <b class="hour__temp"></b>
        <span class="hour__pop"></span>`;
      el.querySelector('.hour__time').textContent = i === 0 ? 'Сейчас' : h.time.slice(11, 16);
      el.querySelector('.hour__icon').textContent = hd.icon;
      el.querySelector('.hour__icon').title = hd.text;
      el.querySelector('.hour__temp').textContent = fmt(h.temp);
      el.querySelector('.hour__pop').textContent = h.pop >= 20 ? `💧${h.pop}%` : '';
      el.style.animationDelay = `${i * 25}ms`;
      wrap.appendChild(el);
    });
  }

  function uvLabel(uv) {
    const v = Math.round(uv);
    const l = v <= 2 ? 'низкий' : v <= 5 ? 'средний' : v <= 7 ? 'высокий' : 'очень высокий';
    return `${v} · ${l}`;
  }

  function countTo(el, target) {
    const from = parseInt(el.textContent, 10);
    if (isNaN(from) || Effects.reduceMotion) { el.textContent = target; return; }
    const start = performance.now(), dur = 700;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (target - from) * e);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Дни ---------- */
  function renderDays() {
    const wrap = $('days');
    wrap.innerHTML = '';
    const c = state.forecast.current;
    const chips = [{ idx: -1, label: 'Сейчас', icon: Weather.describe(c.code, c.isDay).icon, temp: fmt(c.temp) }]
      .concat(state.forecast.days.map((d, i) => ({
        idx: i,
        label: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : new Date(d.date + 'T12:00').toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }),
        icon: Weather.describe(d.code, true).icon,
        temp: `${fmt(d.max)} / ${fmt(d.min)}`,
      })));
    chips.forEach((ch) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'day' + (ch.idx === state.day ? ' is-active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', ch.idx === state.day);
      b.innerHTML = '<span class="day__label"></span><span class="day__icon"></span><span class="day__temp"></span>';
      b.querySelector('.day__label').textContent = ch.label;
      b.querySelector('.day__icon').textContent = ch.icon;
      b.querySelector('.day__temp').textContent = ch.temp;
      b.addEventListener('click', () => {
        if (state.day === ch.idx) return;
        state.day = ch.idx;
        state.seed = 0;
        wrap.querySelectorAll('.day').forEach((x) => { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
        b.classList.add('is-active');
        b.setAttribute('aria-selected', 'true');
        renderOutfit(true);
      });
      wrap.appendChild(b);
    });
  }

  /* ---------- Образ ---------- */
  function conditions() {
    const f = state.forecast;
    if (state.day === -1) {
      const c = f.current;
      return {
        feels: c.feels,
        range: c.feelsRange,
        type: Weather.describe(c.code).type,
        pop: c.popNext,
        wind: c.wind,
        gusts: c.gusts,
        uv: c.isDay ? f.days[0].uv : 0,
        isDay: c.isDay,
      };
    }
    const d = f.days[state.day];
    return {
      feels: d.feelsMin * 0.35 + d.feelsMax * 0.65, // днём важнее дневная температура
      range: [d.feelsMin, d.feelsMax],
      type: Weather.describe(d.code).type,
      pop: d.pop,
      wind: d.wind,
      gusts: d.gusts,
      uv: d.uv,
      isDay: true,
    };
  }

  let renderToken = 0;
  async function renderOutfit(animate) {
    if (!state.forecast) return;
    const token = ++renderToken;
    const cond = conditions();
    const o = Outfits.build(cond, state.gender, state.seed);
    const grid = $('outfitGrid');

    const old = [...grid.children];
    if (animate && old.length) await flyAway(old);
    if (token !== renderToken) return;

    const dayLabel = state.day === -1 ? 'Образ на сейчас'
      : state.day === 0 ? 'Образ на сегодня'
      : state.day === 1 ? 'Образ на завтра'
      : 'Образ на ' + new Date(state.forecast.days[state.day].date + 'T12:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    $('outfitFor').textContent = dayLabel;
    $('outfitTitle').textContent = o.title;
    $('outfitMessage').textContent = o.message;
    $('warmthFill').style.width = o.warmth + '%';
    $('warmthValue').textContent = o.warmth + '%';

    grid.innerHTML = '';
    o.items.forEach((it) => {
      const card = document.createElement('article');
      card.className = 'item';
      card.innerHTML = `
        <div class="item__emoji-wrap"><span class="item__emoji"></span></div>
        <span class="item__tag"></span>
        <h3 class="item__title"></h3>
        <p class="item__desc"></p>`;
      card.querySelector('.item__emoji').textContent = it.e;
      card.querySelector('.item__tag').textContent = it.tag;
      card.querySelector('.item__title').textContent = it.t;
      card.querySelector('.item__desc').textContent = it.d;
      card.addEventListener('pointermove', tilt);
      card.addEventListener('pointerleave', () => (card.style.transform = ''));
      grid.appendChild(card);
    });

    const tips = $('tips');
    tips.innerHTML = '';
    o.tips.forEach((t) => {
      const p = document.createElement('p');
      p.className = 'tip';
      p.textContent = t;
      tips.appendChild(p);
    });

    state.lastOutfit = o;
    if (animate) await reveal();
  }

  async function reveal() {
    const wardrobe = $('wardrobeBtn');
    const btns = [$('shuffleBtn'), $('replayBtn')];
    btns.forEach((b) => b.setAttribute('aria-busy', 'true'));
    const cards = [...$('outfitGrid').children];
    wardrobe.classList.remove('is-open');
    void wardrobe.offsetWidth;
    wardrobe.classList.add('is-open');
    await flyOut(cards, wardrobe, { delay: state.firstReveal ? 450 : 250 });
    state.firstReveal = false;
    btns.forEach((b) => b.removeAttribute('aria-busy'));
    setTimeout(() => wardrobe.classList.remove('is-open'), 300);
  }

  function tilt(e) {
    if (Effects.reduceMotion || e.pointerType !== 'mouse') return;
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-4px)`;
  }

  /* ---------- Поиск ---------- */
  function setupSearch() {
    const input = $('searchInput');
    const list = $('searchResults');
    let timer, active = -1, results = [], reqId = 0;

    const close = () => { list.hidden = true; active = -1; };
    const highlight = () => [...list.children].forEach((li, i) => li.classList.toggle('is-active', i === active));

    function show(items, emptyText) {
      list.innerHTML = '';
      if (!items.length) {
        const li = document.createElement('li');
        li.className = 'search__empty';
        li.textContent = emptyText;
        list.appendChild(li);
      }
      items.forEach((r, i) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.innerHTML = '<b></b><span></span>';
        li.querySelector('b').textContent = r.name;
        li.querySelector('span').textContent = r.region;
        li.addEventListener('mousedown', (e) => { e.preventDefault(); choose(i); });
        list.appendChild(li);
      });
      list.hidden = false;
    }

    function choose(i) {
      const r = results[i];
      if (!r) return;
      setPlace({ name: r.name, region: r.region, lat: r.lat, lon: r.lon });
      input.value = '';
      input.blur();
      close();
    }

    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value;
      if (q.trim().length < 2) { close(); return; }
      timer = setTimeout(async () => {
        const id = ++reqId;
        try {
          const r = await Weather.searchCities(q);
          if (id !== reqId) return;
          results = r;
          active = r.length ? 0 : -1;
          show(r, 'Город не найден');
          highlight();
        } catch {
          if (id === reqId) show([], 'Поиск не сработал. Проверьте интернет');
        }
      }, 280);
    });

    input.addEventListener('keydown', (e) => {
      if (list.hidden) return;
      if (e.key === 'ArrowDown') { active = Math.min(results.length - 1, active + 1); highlight(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { active = Math.max(0, active - 1); highlight(); e.preventDefault(); }
      else if (e.key === 'Enter') { choose(active < 0 ? 0 : active); e.preventDefault(); }
      else if (e.key === 'Escape') close();
    });
    input.addEventListener('blur', () => setTimeout(close, 120));
  }

  function setPlace(p) {
    state.place = p;
    state.day = -1;
    state.seed = 0;
    store.set('wo.place', p);
    load();
  }

  function locate() {
    const btn = $('geoBtn');
    if (!navigator.geolocation) return toast('Геолокация не поддерживается браузером');
    btn.classList.add('is-busy');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const info = await Weather.reverseGeocode(lat, lon);
        btn.classList.remove('is-busy');
        setPlace({ ...info, lat, lon });
        toast('📍 ' + info.name);
      },
      (err) => {
        btn.classList.remove('is-busy');
        toast(err.code === 1 ? 'Доступ к геолокации запрещён' : 'Не удалось определить местоположение');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }

  /* ---------- Прочее ---------- */
  function setGender(g, animate = true) {
    state.gender = g;
    store.set('wo.gender', g);
    const btns = document.querySelectorAll('.segmented__btn');
    btns.forEach((b, i) => {
      const on = b.dataset.gender === g;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-checked', on);
      if (on) document.querySelector('.segmented').style.setProperty('--i', i);
    });
    if (animate) { state.seed = 0; renderOutfit(true); }
  }

  let toastTimer;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-shown'), 2600);
  }

  async function share() {
    if (!state.lastOutfit || !state.forecast) return;
    const c = state.forecast.current;
    const text = `${state.place.name}: ${fmt(c.temp)}, ${Weather.describe(c.code, c.isDay).text.toLowerCase()}.\n${$('outfitFor').textContent}: ` +
      state.lastOutfit.items.map((i) => `${i.e} ${i.t}`).join(', ');
    try {
      if (navigator.share) await navigator.share({ title: 'Что надеть?', text, url: location.href });
      else { await navigator.clipboard.writeText(text + '\n' + location.href); toast('📋 Образ скопирован'); }
    } catch (e) {
      if (e.name !== 'AbortError') toast('Не удалось поделиться');
    }
  }

  function init() {
    Sky.init();
    setupSearch();
    setGender(state.gender, false);

    document.querySelectorAll('.btn, .icon-btn, .segmented__btn').forEach((b) => b.addEventListener('pointerdown', ripple));
    document.querySelectorAll('.segmented__btn').forEach((b) => b.addEventListener('click', () => b.dataset.gender !== state.gender && setGender(b.dataset.gender)));
    $('geoBtn').addEventListener('click', locate);
    $('retryBtn').addEventListener('click', async (e) => {
      const b = e.currentTarget;
      b.setAttribute('aria-busy', 'true');
      await load();
      b.removeAttribute('aria-busy');
    });
    $('shuffleBtn').addEventListener('click', (e) => {
      if (e.currentTarget.getAttribute('aria-busy')) return;
      state.seed++;
      const r = e.currentTarget.getBoundingClientRect();
      sparkle(r.left + r.width / 2, r.top + r.height / 2, 10);
      renderOutfit(true);
    });
    $('replayBtn').addEventListener('click', (e) => !e.currentTarget.getAttribute('aria-busy') && renderOutfit(true));
    $('wardrobeBtn').addEventListener('click', () => renderOutfit(true));
    $('shareBtn').addEventListener('click', share);

    load();
    setInterval(() => !document.hidden && load(false), REFRESH_MS);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && state.forecast && Date.now() - (state.loadedAt || 0) > REFRESH_MS) load(false);
    });
    window.addEventListener('online', () => $('errorBox').hidden || load());
  }

  document.addEventListener('DOMContentLoaded', init);
})();
