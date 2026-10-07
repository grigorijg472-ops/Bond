/* Кнопка «О проекте» в верхней панели. Данные берутся из <script type="application/json" id="case-data">. */
(function () {
  var raw = document.getElementById('case-data');
  var bar = document.querySelector('.topbar');
  if (!raw || !bar || !window.HTMLDialogElement) return;
  var d; try { d = JSON.parse(raw.textContent); } catch (e) { return; }
  var NS = 'http://www.w3.org/2000/svg';
  function svg(paths) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', 'i'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.75');
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
    s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
    paths.forEach(function (p) { var e = document.createElementNS(NS, 'path'); e.setAttribute('d', p); s.appendChild(e); });
    return s;
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function block(title, node) { var w = el('section'); w.appendChild(el('h3', '', title)); w.appendChild(node); return w; }
  function list(items, cls) { var u = el('ul', cls); items.forEach(function (t) { u.appendChild(el('li', '', t)); }); return u; }

  var dlg = el('dialog', 'case'); dlg.setAttribute('aria-labelledby', 'case-title');
  var head = el('div', 'case-head'); var h = el('h2', '', d.title); h.id = 'case-title';
  var close = el('button', 'case-close'); close.type = 'button'; close.setAttribute('aria-label', 'Закрыть');
  close.appendChild(svg(['M18 6l-12 12', 'M6 6l12 12']));
  head.appendChild(h); head.appendChild(close);
  var body = el('div', 'case-body');
  body.appendChild(block('Задача', el('p', '', d.task)));
  body.appendChild(block('Что внутри', list(d.features)));
  body.appendChild(block('Стек', list(d.stack, 'case-stack')));
  if (d.note) { var n = el('p', 'case-note', d.note); body.appendChild(n); }
  dlg.appendChild(head); dlg.appendChild(body); document.body.appendChild(dlg);

  var btn = el('button', 'about'); btn.type = 'button'; btn.setAttribute('aria-label', 'О проекте');
  btn.appendChild(svg(['M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0', 'M12 9h.01', 'M11 12h1v4h1']));
  btn.appendChild(el('span', '', 'О проекте'));
  var write = bar.querySelector('.write'), wrap = el('div', 'actions');
  if (write) { write.parentNode.insertBefore(wrap, write); wrap.appendChild(btn); wrap.appendChild(write); } else bar.appendChild(wrap), wrap.appendChild(btn);

  btn.addEventListener('click', function () { dlg.showModal(); });
  close.addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
})();
