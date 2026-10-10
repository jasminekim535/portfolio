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
