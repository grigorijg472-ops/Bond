// Анимированные иконки погоды, счётчики, график и частицы для кнопок
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- Общие градиенты для иконок ---------- */
  function ensureDefs() {
    if (document.getElementById('wi-defs')) return;
    const d = document.createElement('div');
    d.innerHTML = `<svg id="wi-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <radialGradient id="wiSun" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff6b0"/><stop offset=".55" stop-color="#ffc83d"/><stop offset="1" stop-color="#ff9b2f"/></radialGradient>
      <linearGradient id="wiCloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd9ea"/></linearGradient>
      <linearGradient id="wiCloudDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa6bf"/><stop offset="1" stop-color="#5d6782"/></linearGradient>
      <linearGradient id="wiMoon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#d9d2ff"/></linearGradient>
      <linearGradient id="wiBolt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff59d"/><stop offset="1" stop-color="#ffb300"/></linearGradient>
    </defs></svg>`;
    document.body.appendChild(d.firstChild);
  }

  const CLOUD = 'M18 47a9 9 0 0 1 0-18a13 13 0 0 1 25-3a10.5 10.5 0 0 1 3 21z';
  const sun = (cx, cy, r, cls = '') => {
    let rays = '';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const x1 = cx + Math.cos(a) * (r + 5), y1 = cy + Math.sin(a) * (r + 5);
      const x2 = cx + Math.cos(a) * (r + 10), y2 = cy + Math.sin(a) * (r + 10);
      rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }
    return `<g class="wi-sun ${cls}"><g class="wi-rays" style="transform-origin:${cx}px ${cy}px">${rays}</g><circle class="wi-core" cx="${cx}" cy="${cy}" r="${r}" fill="url(#wiSun)" style="transform-origin:${cx}px ${cy}px"/></g>`;
  };
  const moon = (cx, cy, s = 1) => `<g class="wi-moon" style="transform-origin:${cx}px ${cy}px"><path d="M${cx + 6 * s} ${cy - 14 * s}a15 15 0 1 0 ${10 * s} ${22 * s}a12 12 0 0 1 -${10 * s} -${22 * s}z" fill="url(#wiMoon)"/></g>`;
  const stars = `<g class="wi-stars"><path d="M48 10l1.2 2.8 2.8 1.2-2.8 1.2L48 18l-1.2-2.8-2.8-1.2 2.8-1.2z"/><path d="M54 26l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z"/></g>`;
  const cloud = (dark, cls = '') => `<path class="wi-cloud ${cls}" d="${CLOUD}" fill="url(#${dark ? 'wiCloudDark' : 'wiCloud'})"/>`;
  const drops = (n = 3) => {
    let s = '<g class="wi-drops">';
    for (let i = 0; i < n; i++) s += `<line x1="${22 + i * 9}" y1="51" x2="${20 + i * 9}" y2="57" style="animation-delay:${i * 0.25}s"/>`;
    return s + '</g>';
  };
  const flakes = (n = 3, start = 0) => {
    let s = '<g class="wi-flakes">';
    for (let i = 0; i < n; i++) {
      const x = 22 + (i + start) * 9;
      s += `<g style="animation-delay:${i * 0.45}s"><path d="M${x} 49v8M${x - 3.5} 51l7 4M${x - 3.5} 55l7-4"/></g>`;
    }
    return s + '</g>';
  };

  function iconSVG(code, isDay) {
    const t = window.Weather.describe(code, isDay).type;
    let body;
    if (t === 'clear') {
      if (!isDay) body = moon(30, 34) + stars;
      else if (code === 1) body = sun(30, 30, 12) + `<path class="wi-cloud wi-cloud--small" d="M34 50a6 6 0 0 1 0-12a9 9 0 0 1 17-2a7 7 0 0 1 2 14z" fill="url(#wiCloud)"/>`;
      else body = sun(32, 32, 13);
    } else if (t === 'clouds') {
      body = (code === 2 ? (isDay ? sun(22, 22, 9, 'wi-sun--peek') : moon(20, 24, 0.7)) : `<path class="wi-cloud wi-cloud--back" d="M30 36a7 7 0 0 1 0-14a10 10 0 0 1 19-2a8 8 0 0 1 2 16z" fill="url(#wiCloudDark)" opacity=".8"/>`) + cloud(false);
    } else if (t === 'fog') {
      body = cloud(false, 'wi-cloud--fog') + '<g class="wi-fog"><line x1="12" y1="50" x2="44" y2="50"/><line x1="20" y1="56" x2="52" y2="56"/></g>';
    } else if (t === 'rain') {
      body = (isDay && (code === 51 || code === 61 || code === 80) ? sun(42, 20, 8, 'wi-sun--peek') : '') + cloud(code >= 63 && code !== 80) + drops(code === 65 || code === 82 ? 4 : 3);
    } else if (t === 'sleet') {
      body = cloud(true) + drops(2) + flakes(1, 2);
    } else if (t === 'snow') {
      body = cloud(false) + flakes(code === 75 || code === 86 ? 3 : 3);
    } else { // storm
      body = cloud(true) + drops(2) + `<path class="wi-bolt" d="M33 40l-6 11h6l-3 9 9-13h-6l3-7z" fill="url(#wiBolt)"/>`;
    }
    return `<svg class="wi wi--${t}" viewBox="0 0 64 64" aria-hidden="true">${body}</svg>`;
  }

  function setIcon(el, code, isDay, title) {
    ensureDefs();
    const key = code + '-' + isDay;
    if (el.dataset.wi === key) return false;
    el.dataset.wi = key;
    el.innerHTML = iconSVG(code, isDay);
    if (title) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', title); }
    return true;
  }

  /* ---------- Барабан цифр для температуры ---------- */
  function odometer(el, value) {
    const str = String(value).replace('-', '−');
    el.setAttribute('aria-label', str);
    const build = el.dataset.len !== String(str.length);
    if (build) {
      el.innerHTML = '';
      el.dataset.len = str.length;
      for (const ch of str) {
        const slot = document.createElement('span');
        slot.setAttribute('aria-hidden', 'true');
        if (/\d/.test(ch)) {
          slot.className = 'odo__slot';
          const col = document.createElement('span');
          col.className = 'odo__col';
          for (let i = 0; i < 10; i++) {
            const c = document.createElement('span');
            c.className = 'odo__digit';
            c.textContent = i;
            col.appendChild(c);
          }
          slot.appendChild(col);
        } else {
          slot.className = 'odo__sign';
          slot.textContent = ch;
        }
        el.appendChild(slot);
      }
    }
    const slots = [...el.children];
    const apply = () => slots.forEach((s, i) => {
      const ch = str[i];
      if (s.className === 'odo__sign') { s.textContent = ch; return; }
      const col = s.firstChild;
      col.style.transitionDelay = `${i * 90}ms`;
      col.style.transform = `translateY(${-Number(ch) * 10}%)`;
    });
    if (build && !reduce) requestAnimationFrame(() => requestAnimationFrame(apply));
    else apply();
  }

  /* ---------- Плавный счёт чисел внутри текста ---------- */
  function countText(el, text, dur = 900) {
    const target = String(text);
    const nums = target.match(/\d+/g);
    if (reduce || !nums) { el.textContent = target; return; }
    const prev = el._nums && el._nums.length === nums.length ? el._nums : nums.map(() => 0);
    el._nums = nums.map(Number);
    const parts = target.split(/\d+/);
    const start = performance.now();
    cancelAnimationFrame(el._raf);
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      let out = parts[0];
      nums.forEach((n, i) => { out += Math.round(prev[i] + (Number(n) - prev[i]) * e) + parts[i + 1]; });
      el.textContent = out;
      if (p < 1) el._raf = requestAnimationFrame(tick);
    };
    el._raf = requestAnimationFrame(tick);
  }

  /* ---------- Заголовок, который собирается по словам ---------- */
  function wordsIn(el, text) {
    el.textContent = '';
    el.setAttribute('aria-label', text);
    text.split(' ').forEach((w, i, arr) => {
      const s = document.createElement('span');
      s.className = 'word';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = w;
      el.appendChild(s);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
      if (!reduce) s.animate(
        [{ transform: 'translateY(.6em) rotate(4deg)', opacity: 0, filter: 'blur(6px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }],
        { duration: 600, delay: i * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }
      );
    });
  }

  /* ---------- Частицы ---------- */
  // Вылет значков из точки по дуге с гравитацией
  function burst(x, y, glyphs, o = {}) {
    if (reduce) return;
    const n = o.n || 12;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'particle';
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.fontSize = (o.size || 20) * (0.7 + Math.random() * 0.6) + 'px';
      document.body.appendChild(s);
      const spread = o.spread ?? Math.PI * 0.9;
      const dir = o.dir ?? -Math.PI / 2;
      const ang = dir + (Math.random() - 0.5) * spread;
      const v = (o.power || 170) * (0.55 + Math.random() * 0.6);
      const g = o.gravity ?? 260;
      const rot = (Math.random() - 0.5) * 540;
      const T = (o.duration || 1100) * (0.8 + Math.random() * 0.4);
      const frames = [];
      for (let k = 0; k <= 10; k++) {
        const t = (k / 10) * (T / 1000);
        const px = Math.cos(ang) * v * t;
        const py = Math.sin(ang) * v * t + 0.5 * g * t * t;
        frames.push({
          transform: `translate(calc(-50% + ${px.toFixed(1)}px), calc(-50% + ${py.toFixed(1)}px)) rotate(${(rot * k / 10).toFixed(0)}deg) scale(${k === 0 ? 0.2 : k < 3 ? 1.15 : 1 - k * 0.03})`,
          opacity: k > 6 ? 1 - (k - 6) / 4 : 1,
        });
      }
      s.animate(frames, { duration: T, easing: 'linear', delay: i * (o.stagger || 12) }).onfinish = () => s.remove();
    }
  }

  // Кольца, расходящиеся от кнопки
  function rings(el, n = 2) {
    if (reduce) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'ring';
      s.style.left = r.left + r.width / 2 + 'px';
      s.style.top = r.top + r.height / 2 + 'px';
      document.body.appendChild(s);
      s.animate(
        [{ transform: 'translate(-50%,-50%) scale(.4)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(3.2)', opacity: 0 }],
        { duration: 900, delay: i * 220, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }
      ).onfinish = () => s.remove();
    }
  }

  // Пружинка при нажатии
  function jelly(el) {
    if (reduce) return;
    el.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.1, .9)' }, { transform: 'scale(.94, 1.06)' }, { transform: 'scale(1.03, .97)' }, { transform: 'scale(1)' }],
      { duration: 520, easing: 'ease-out', composite: 'add' }
    );
  }

  // Кнопка слегка тянется к курсору
  function magnetic(el, strength = 0.25) {
    if (reduce) return;
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * strength).toFixed(1) + 'px');
      el.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * strength).toFixed(1) + 'px');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); });
  }

  const center = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  // Частицы под тип погоды
  const WEATHER_GLYPHS = {
    clear: { day: ['☀️', '✨', '🌟'], night: ['⭐', '✨', '🌙'] },
    clouds: { day: ['☁️', '⛅', '✨'], night: ['☁️', '⭐'] },
    fog: { day: ['🌫️', '☁️'], night: ['🌫️', '☁️'] },
    rain: { day: ['💧', '💧', '☔'], night: ['💧', '💧', '☔'] },
    sleet: { day: ['💧', '❄️', '🧊'], night: ['💧', '❄️', '🧊'] },
    snow: { day: ['❄️', '❄️', '⛄'], night: ['❄️', '❄️', '⛄'] },
    storm: { day: ['⚡', '💧', '⛈️'], night: ['⚡', '💧', '⛈️'] },
  };
  function weatherBurst(el, code, isDay, n = 14) {
    const t = window.Weather.describe(code, isDay).type;
    const g = WEATHER_GLYPHS[t][isDay ? 'day' : 'night'];
    const [x, y] = center(el);
    const falling = t === 'rain' || t === 'snow' || t === 'sleet' || t === 'storm';
    burst(x, y, g, falling ? { n, spread: Math.PI * 1.6, power: 150, gravity: 420, size: 22 } : { n, spread: Math.PI * 2, power: 160, gravity: 60, size: 22, duration: 1300 });
  }

  /* ---------- Плавный график температуры ---------- */
  function curve(track, hours, temps, height) {
    const old = track.querySelector('.hcurve');
    if (old) old.remove();
    if (!hours.length) return;
    const plot = hours[0].querySelector('.hour__plot');
    const top = plot.offsetTop, pad = 10;
    const tMin = Math.min(...temps), tMax = Math.max(...temps);
    const pts = hours.map((h, i) => {
      const p = tMax === tMin ? 0.5 : (temps[i] - tMin) / (tMax - tMin);
      return [h.offsetLeft + h.offsetWidth / 2, pad + (1 - p) * (height - pad * 2)];
    });
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0]},${p2[1].toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'hcurve');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', track.scrollWidth);
    svg.setAttribute('height', height);
    svg.style.top = top + 'px';
    svg.innerHTML = `<defs>
        <linearGradient id="hcLine" x1="0" x2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient>
        <linearGradient id="hcFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient>
      </defs>
      <path class="hcurve__area" d="${d} L${last[0]},${height} L${pts[0][0]},${height} Z" fill="url(#hcFill)"/>
      <path class="hcurve__line" d="${d}" fill="none" stroke="url(#hcLine)" stroke-width="3" stroke-linecap="round"/>
      ${pts.map((p, i) => `<circle class="hcurve__dot${i === 0 ? ' is-now' : ''}" cx="${p[0]}" cy="${p[1].toFixed(1)}" r="${i === 0 ? 5 : 3.5}" style="animation-delay:${200 + i * 35}ms"/>`).join('')}`;
    track.prepend(svg);
    const line = svg.querySelector('.hcurve__line');
    if (!reduce) {
      const len = line.getTotalLength();
      line.style.strokeDasharray = len;
      line.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1400, easing: 'cubic-bezier(.4,0,.2,1)' });
      svg.querySelector('.hcurve__area').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 500, fill: 'backwards' });
    }
  }

  window.FX = { setIcon, odometer, countText, wordsIn, burst, rings, jelly, magnetic, center, weatherBurst, curve, reduce };
})();
