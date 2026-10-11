// Phone menu toggle and slideshows.
document.querySelectorAll('.menu-toggle').forEach(function (btn) {
  var nav = document.getElementById(btn.getAttribute('aria-controls'));
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('open', open);
  });
});

document.querySelectorAll('.slideshow').forEach(function (ss) {
  var track = ss.querySelector('.ss-track');
  function go(dir) { track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' }); }
  ss.querySelector('.ss-prev').addEventListener('click', function () { go(-1); });
  ss.querySelector('.ss-next').addEventListener('click', function () { go(1); });
});

// Drag to pan large canvases (wireframe sheets)
document.querySelectorAll('.canvas-view').forEach(function (v) {
  var down = false, x = 0, y = 0, sl = 0, st = 0;
  v.addEventListener('pointerdown', function (e) { down = true; x = e.clientX; y = e.clientY; sl = v.scrollLeft; st = v.scrollTop; v.style.cursor = 'grabbing'; });
  window.addEventListener('pointerup', function () { down = false; v.style.cursor = ''; });
  v.addEventListener('pointermove', function (e) { if (!down) return; v.scrollLeft = sl - (e.clientX - x); v.scrollTop = st - (e.clientY - y); });
});

// Email strip: arrows, end fade, and "Scroll ↓" cue that hides once read
document.querySelectorAll('.mail-wrap').forEach(function (w) {
  var strip = w.querySelector('.mail-strip'), prev = w.querySelector('.mail-prev'), next = w.querySelector('.mail-next');
  function step() { var i = strip.querySelector('.mail-item'); return i ? i.offsetWidth + 16 : 280; }
  function update() {
    var max = strip.scrollWidth - strip.clientWidth - 2;
    prev.disabled = strip.scrollLeft <= 2; next.disabled = strip.scrollLeft >= max;
    w.classList.toggle('at-end', strip.scrollLeft >= max);
  }
  prev.addEventListener('click', function () { strip.scrollBy({ left: -step() * 2, behavior: 'smooth' }); });
  next.addEventListener('click', function () { strip.scrollBy({ left: step() * 2, behavior: 'smooth' }); });
  strip.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
  w.querySelectorAll('.mail').forEach(function (m) {
    m.addEventListener('scroll', function () {
      if (m.scrollTop + m.clientHeight >= m.scrollHeight - 40) m.parentNode.classList.add('read');
    }, { passive: true });
  });
});
