// Анимированное небо и «вылет» одежды
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Небо ---------- */
  // Телефоны и слабые устройства: меньше частиц, 30 кадров в секунду, без ретины для фона
  const mobile = window.matchMedia('(hover: none), (max-width: 700px)').matches;
  const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const LITE = mobile || weak;
  if (LITE) document.documentElement.classList.add('lite');

  const Sky = {
    sprite: null, last: 0,
    canvas: null, ctx: null, particles: [], mode: 'clear', isDay: true, raf: 0, w: 0, h: 0, flash: 0,

    init() {
      this.canvas = document.getElementById('sky');
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      // Облако рисуем один раз в спрайт, а не создаём градиент на каждом кадре
      const sp = document.createElement('canvas');
      sp.width = sp.height = 128;
      const sc = sp.getContext('2d');
      const g = sc.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      sc.fillStyle = g;
      sc.fillRect(0, 0, 128, 128);
      this.sprite = sp;
      let rw = window.innerWidth;
      window.addEventListener('resize', () => {
        // На телефоне адресная строка меняет высоту при прокрутке, пересоздавать фон из-за этого не нужно
        if (LITE && window.innerWidth === rw) return;
        rw = window.innerWidth;
        this.resize();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(this.raf);
        else this.loop();
      });
      this.loop();
    },

    resize() {
      const dpr = LITE ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.canvas.width = this.w * dpr;
      this.canvas.height = this.h * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.spawn();
    },

    set(mode, isDay) {
      this.mode = mode;
      this.isDay = isDay;
      this.spawn();
    },

    spawn() {
      const area = (this.w * this.h) / (LITE ? 26000 : 12000);
      const P = [];
      const r = Math.random;
      const m = this.mode;
      if (m === 'rain' || m === 'storm' || m === 'sleet') {
        const n = Math.round(area * (m === 'storm' ? 2.2 : 1.5));
        for (let i = 0; i < n; i++) P.push({ k: 'rain', x: r() * this.w, y: r() * this.h, l: 10 + r() * 16, v: 9 + r() * 8, a: 0.15 + r() * 0.35 });
        if (m === 'sleet') for (let i = 0; i < n / 3; i++) P.push(this.flake());
      } else if (m === 'snow') {
        for (let i = 0; i < area * 1.4; i++) P.push(this.flake());
      } else if (!this.isDay) {
        for (let i = 0; i < area * 1.2; i++) P.push({ k: 'star', x: r() * this.w, y: r() * this.h * 0.8, s: r() * 1.6 + 0.3, p: r() * Math.PI * 2 });
      }
      if (m === 'clouds' || m === 'fog' || m === 'rain' || m === 'storm' || m === 'snow' || m === 'sleet') {
        const n = LITE ? (m === 'fog' ? 5 : 3) : (m === 'fog' ? 9 : 5);
        for (let i = 0; i < n; i++) P.push({ k: 'cloud', x: r() * this.w, y: r() * this.h * (m === 'fog' ? 1 : 0.5), s: 120 + r() * 220, v: 0.08 + r() * 0.25, a: m === 'fog' ? 0.07 : 0.05 + r() * 0.05 });
      }
      this.particles = P;
    },

    flake() {
      const r = Math.random;
      return { k: 'snow', x: r() * this.w, y: r() * this.h, s: 1 + r() * 3, v: 0.5 + r() * 1.3, d: r() * Math.PI * 2, a: 0.4 + r() * 0.5 };
    },

    loop() {
      cancelAnimationFrame(this.raf);
      const step = (now = performance.now()) => {
        if (!LITE || now - this.last >= 32) { this.last = now; this.draw(); }
        if (!reduceMotion) this.raf = requestAnimationFrame(step);
      };
      step();
    },

    draw() {
      const { ctx, w, h } = this;
      ctx.clearRect(0, 0, w, h);
      const t = performance.now() / 1000;

      if (this.mode === 'storm' && Math.random() < 0.004) this.flash = 1;
      if (this.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${this.flash * 0.25})`;
        ctx.fillRect(0, 0, w, h);
        this.flash -= 0.05;
      }

      for (const p of this.particles) {
        if (p.k === 'rain') {
          ctx.strokeStyle = `rgba(190,215,255,${p.a})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.l * 0.25, p.y + p.l);
          ctx.stroke();
          const k = LITE ? 2 : 1;
          p.y += p.v * k; p.x -= p.v * 0.25 * k;
          if (p.y > h) { p.y = -20; p.x = Math.random() * (w + 100); }
        } else if (p.k === 'snow') {
          ctx.fillStyle = `rgba(255,255,255,${p.a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.v * (LITE ? 2 : 1); p.x += Math.sin(t + p.d) * 0.5;
          if (p.y > h + 5) { p.y = -5; p.x = Math.random() * w; }
        } else if (p.k === 'star') {
          const a = 0.35 + Math.sin(t * 1.5 + p.p) * 0.35;
          ctx.fillStyle = `rgba(255,255,255,${Math.max(0.05, a)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.k === 'cloud') {
          ctx.globalAlpha = p.a;
          ctx.drawImage(this.sprite, p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
          ctx.globalAlpha = 1;
          p.x += p.v;
          if (p.x - p.s > w) p.x = -p.s;
        }
      }
    },
  };

  /* ---------- Вылет одежды из шкафа ---------- */
  function flyOut(cards, origin, opts = {}) {
    if (reduceMotion) {
      cards.forEach((c) => (c.style.opacity = 1));
      return Promise.resolve();
    }
    const o = origin.getBoundingClientRect();
    const ox = o.left + o.width / 2;
    const oy = o.top + o.height / 2;
    const anims = cards.map((card, i) => {
      const r = card.getBoundingClientRect();
      const dx = ox - (r.left + r.width / 2);
      const dy = oy - (r.top + r.height / 2);
      const rot = (Math.random() * 2 - 1) * 35;
      const delay = (opts.delay || 0) + i * 70;
      card.style.opacity = 0;
      const a = card.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(0.2) rotate(${rot}deg)`, opacity: 0 },
          { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 60}px) scale(0.9) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.45 },
          { transform: 'translate(0, 0) scale(1.06) rotate(-2deg)', opacity: 1, offset: 0.8 },
          { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        ],
        { duration: 720, delay, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }
      );
      const emoji = card.querySelector('.item__emoji');
      if (emoji) {
        emoji.animate(
          [{ transform: 'rotate(-25deg) scale(.4)' }, { transform: 'rotate(12deg) scale(1.25)', offset: 0.6 }, { transform: 'rotate(0) scale(1)' }],
          { duration: 1000, delay: delay + 150, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'both' }
        );
      }
      a.onfinish = () => { card.style.opacity = 1; a.cancel(); };
      setTimeout(() => sparkle(ox, oy, 6), delay);
      return a.finished.catch(() => {});
    });
    return Promise.all(anims);
  }

  function flyAway(cards) {
    if (reduceMotion || !cards.length) return Promise.resolve();
    return Promise.all(
      cards.map((card, i) =>
        card.animate(
          [{ transform: 'none', opacity: 1 }, { transform: `translateY(-30px) scale(.85) rotate(${(i % 2 ? 1 : -1) * 8}deg)`, opacity: 0 }],
          { duration: 300, delay: i * 25, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }
        ).finished.catch(() => {})
      )
    );
  }

  function sparkle(x, y, n = 8) {
    if (reduceMotion) return;
    const glyphs = ['✦', '✧', '•', '✨'];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      document.body.appendChild(s);
      const ang = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 90;
      s.animate(
        [{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(1)`, opacity: 0 }],
        { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.2,.8,.2,1)' }
      ).onfinish = () => s.remove();
    }
  }

  // Рябь на кнопках
  function ripple(e) {
    const btn = e.currentTarget;
    const r = btn.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'ripple';
    const size = Math.max(r.width, r.height) * 2;
    s.style.width = s.style.height = size + 'px';
    s.style.left = (e.clientX - r.left - size / 2) + 'px';
    s.style.top = (e.clientY - r.top - size / 2) + 'px';
    btn.appendChild(s);
    setTimeout(() => s.remove(), 600);
  }

  window.Effects = { Sky, flyOut, flyAway, sparkle, ripple, reduceMotion, LITE };
})();
