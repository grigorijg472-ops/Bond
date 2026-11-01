/* Автодемо «Показать»: крупный курсор сам проходит сценарий страницы.
   Наведение → клик → смена состояния → результат. Сценарий: window.TOUR_STEPS. */
(function () {
  var STEPS = window.TOUR_STEPS;
  var bar = document.querySelector('.topbar');
  if (!STEPS || !STEPS.length || !bar) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = false, layer, cur, ring, cap, capN, capT, pos = { x: 0, y: 0 };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'tour-btn'; btn.setAttribute('aria-label', 'Показать, как работает');
  btn.innerHTML = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg><span>Показать</span>';
  function mount() { var wrap = bar.querySelector('.actions') || bar; wrap.insertBefore(btn, wrap.firstChild); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else setTimeout(mount, 0);

  function build() {
    layer = document.createElement('div'); layer.className = 'tour-layer'; layer.setAttribute('aria-hidden', 'true');
    ring = document.createElement('div'); ring.className = 'tour-ring';
    cur = document.createElement('div'); cur.className = 'tour-cur';
    cur.innerHTML = '<svg viewBox="0 0 30 36"><path d="M2 2v26l7-6.5 4.5 10.5 4.5-2-4.4-10.2H23z" fill="#fff" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/></svg><i></i>';
    layer.appendChild(ring); layer.appendChild(cur);
    cap = document.createElement('div'); cap.className = 'tour-cap'; cap.setAttribute('role', 'status');
    cap.innerHTML = '<span class="tour-n"></span><b class="tour-t"></b><button type="button" class="tour-stop">Остановить</button>';
    capN = cap.querySelector('.tour-n'); capT = cap.querySelector('.tour-t');
    cap.querySelector('.tour-stop').addEventListener('click', stop);
    document.body.appendChild(layer); document.body.appendChild(cap);
  }
  function visible(el) { if (!el || !el.getClientRects().length) return false; var cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none'; }
  function pick(sel) {
    if (typeof sel === 'function') { var r = sel(); return visible(r) ? r : null; }
    var list = document.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) if (visible(list[i])) return list[i];
    return null;
  }
  async function find(sel) { for (var i = 0; i < 40 && running; i++) { var el = pick(sel); if (el) return el; await sleep(100); } return null; }
  function inView(el) { var r = el.getBoundingClientRect(); return r.top >= 70 && r.bottom <= innerHeight - 90; }
  async function scrollTo(el) {
    if (inView(el)) return;
    el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    var last = -1, same = 0;
    for (var i = 0; i < 25 && same < 3; i++) { await sleep(60); var y = el.getBoundingClientRect().top; same = Math.abs(y - last) < 1 ? same + 1 : 0; last = y; }
  }
  function target(el, ox) {
    var r = el.getBoundingClientRect();
    var x = ox != null ? r.left + r.width * ox : r.left + r.width / 2 + Math.min(r.width * .18, 40);
    return { x: x, y: r.top + r.height / 2 + Math.min(r.height * .2, 12), r: r };
  }
  async function moveTo(x, y) {
    var d = Math.hypot(x - pos.x, y - pos.y), ms = reduce ? 0 : Math.max(380, Math.min(900, d * 1.1));
    cur.style.transitionDuration = ms + 'ms'; pos = { x: x, y: y };
    cur.style.transform = 'translate(' + (x - 4) + 'px,' + (y - 4) + 'px)';
    await sleep(ms + 40);
  }
  function hover(r) {
    if (!r) { ring.classList.remove('on'); return; }
    ring.style.cssText = 'left:' + (r.left - 6) + 'px;top:' + (r.top - 6) + 'px;width:' + (r.width + 12) + 'px;height:' + (r.height + 12) + 'px';
    ring.classList.add('on');
  }
  async function press(el, p) {
    cur.classList.add('down');
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: p.x, clientY: p.y, pointerType: 'mouse', isPrimary: true }));
    await sleep(120);
    cur.classList.remove('down'); cur.classList.remove('pulse'); void cur.offsetWidth; cur.classList.add('pulse');
    el.click();
  }
  async function typeInto(el, text) {
    el.focus({ preventScroll: true });
    for (var i = 0; i < text.length && running; i++) {
      el.value += text[i]; el.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(reduce ? 0 : 55);
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  async function slide(el, to) {
    var min = +el.min || 0, max = +el.max || 100, from = +el.value, n = reduce ? 1 : 24;
    for (var i = 1; i <= n && running; i++) {
      var v = Math.round(from + (to - from) * i / n); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true }));
      var r = el.getBoundingClientRect(); var x = r.left + 12 + (r.width - 24) * (v - min) / (max - min);
      pos = { x: x, y: r.top + r.height / 2 }; cur.style.transitionDuration = '0ms';
      cur.style.transform = 'translate(' + (pos.x - 4) + 'px,' + (pos.y - 4) + 'px)';
      await sleep(35);
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function say(i, text) { capN.textContent = i == null ? '' : 'Шаг ' + (i + 1) + ' из ' + STEPS.length; capT.textContent = text; }
  async function run() {
    if (running) return; running = true;
    if (!layer) build();
    document.body.classList.add('touring'); layer.classList.add('on'); cap.classList.add('on');
    pos = { x: innerWidth * .82, y: innerHeight + 40 }; cur.style.transitionDuration = '0ms';
    cur.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)'; void cur.offsetWidth;
    for (var i = 0; i < STEPS.length && running; i++) {
      var s = STEPS[i]; say(i, s.say);
      if (!s.el) { hover(null); await moveTo(innerWidth * .78, innerHeight * .78); await sleep(s.wait || 1600); continue; }
      var el = await find(s.el); if (!el || !running) break;
      await scrollTo(el); if (!running) break;
      var p = target(el, s.ox); await moveTo(p.x, p.y); if (!running) break;
      p = target(el, s.ox); hover(p.r); await sleep(reduce ? 150 : 380); if (!running) break;
      if (s.type) { await press(el, p); await typeInto(el, s.type); }
      else if (s.range != null) { await slide(el, s.range); }
      else await press(el, p);
      await sleep(120); hover(null);
      await sleep(s.wait || 650);
    }
    if (running) { say(null, 'Готово. Теперь попробуйте сами'); hover(null); await moveTo(innerWidth * .86, innerHeight * .84); await sleep(2200); }
    stop();
  }
  function stop() {
    running = false; if (!layer) return;
    layer.classList.remove('on'); cap.classList.remove('on'); hover(null); document.body.classList.remove('touring');
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); running ? stop() : run(); });
  // любое действие пользователя останавливает показ
  ['pointerdown', 'keydown'].forEach(function (t) {
    document.addEventListener(t, function (e) {
      if (!running || !e.isTrusted) return;
      if (cap && cap.contains(e.target)) return;
      if (t === 'keydown' && e.key !== 'Escape' && e.key !== 'Tab' && e.key.length > 1) return;
      stop();
    }, true);
  });
})();
