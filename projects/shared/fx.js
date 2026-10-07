/* Волна от точки нажатия и помощники для появления/исчезновения строк. Без зависимостей. */
(function () {
  var mq = matchMedia('(prefers-reduced-motion: reduce)');
  var SEL = '.btn,.about,.case-close,.send,.add,.addrow,.check,.del,.rm,.quick button,.chip,#chips button,.loc,.swatches span,.seg span,.opt .box';
  function host(t) {
    var h = t.closest && t.closest(SEL);
    if (!h && t.tagName === 'INPUT' && t.parentElement) h = t.parentElement.querySelector('.box,span');
    if (h && (h.disabled || h.getAttribute('aria-disabled') === 'true')) return null;
    return h;
  }
  function ripple(h, x, y) {
    if (mq.matches) return;
    var cs = getComputedStyle(h);
    if (cs.position === 'static') h.style.position = 'relative';
    if (cs.overflow === 'visible') h.style.overflow = 'hidden';
    var r = h.getBoundingClientRect(), d = Math.max(Math.hypot(x - r.left, y - r.top), Math.hypot(r.right - x, y - r.top), Math.hypot(x - r.left, r.bottom - y), Math.hypot(r.right - x, r.bottom - y)) * 2;
    var s = document.createElement('span'); s.className = 'fx-ripple';
    s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (x - r.left - d / 2) + 'px;top:' + (y - r.top - d / 2) + 'px';
    h.appendChild(s); s.addEventListener('animationend', function () { s.remove(); });
  }
  document.addEventListener('pointerdown', function (e) {
    if (e.button > 0) return; var h = host(e.target); if (h) ripple(h, e.clientX, e.clientY);
  }, true);
  document.addEventListener('click', function (e) { // с клавиатуры: волна из центра
    if (e.detail !== 0) return; var h = host(e.target); if (!h) return;
    var r = h.getBoundingClientRect(); ripple(h, r.left + r.width / 2, r.top + r.height / 2);
  }, true);
  window.fx = {
    enter: function (el) { if (!el || mq.matches) return; el.classList.add('enter'); el.addEventListener('animationend', function () { el.classList.remove('enter'); }, { once: true }); },
    leave: function (el, done) { if (!el || mq.matches) return done(); el.classList.add('leaving'); setTimeout(done, 190); },
    reduce: function () { return mq.matches; }
  };
})();
