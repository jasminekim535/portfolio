// Shared behavior: menu, slideshows, lightbox, project filters, gentle fade-in.
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Phone menu toggle
document.querySelectorAll('.menu-toggle').forEach(function (btn) {
  var nav = document.getElementById(btn.getAttribute('aria-controls'));
  var word = btn.querySelector('.menu-word');
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    if (word) word.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('open', open);
  });
});

// Slideshows
document.querySelectorAll('.slideshow').forEach(function (ss) {
  var track = ss.querySelector('.ss-track');
  function go(dir) { track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' }); }
  ss.querySelector('.ss-prev').addEventListener('click', function () { go(-1); });
  ss.querySelector('.ss-next').addEventListener('click', function () { go(1); });
});

// Lightbox: images that aren't links open full size
(function () {
  var imgs = Array.prototype.filter.call(
    document.querySelectorAll('.page-content .media img'),
    function (img) { return !img.closest('a'); }
  );
  if (!imgs.length) return;
  var box = document.createElement('dialog');
  box.className = 'lightbox';
  box.innerHTML = '<button class="lb-close" type="button" aria-label="Close">×</button><img alt="">';
  document.body.appendChild(box);
  var big = box.querySelector('img');
  function close() { box.close(); }
  box.querySelector('.lb-close').addEventListener('click', close);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  imgs.forEach(function (img) {
    img.classList.add('zoomable');
    img.addEventListener('click', function () {
      if (img.hidden || !img.naturalWidth) return;   // placeholder: nothing to show yet
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      box.showModal();
    });
  });
})();

// Project filter tabs with a sliding underline
(function () {
  var tabs = document.querySelector('.tabs');
  if (!tabs) return;
  var bar = tabs.querySelector('.tab-bar');
  var cards = document.querySelectorAll('.card-grid .card');
  function moveBar(tab) {
    bar.style.width = tab.offsetWidth + 'px';
    bar.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
  }
  function apply(filter) {
    cards.forEach(function (card) {
      var show = filter === 'all' || (' ' + card.dataset.cats + ' ').indexOf(' ' + filter + ' ') > -1;
      if (show) {
        card.hidden = false;
        requestAnimationFrame(function () { card.classList.remove('is-out'); });
      } else {
        card.classList.add('is-out');
        setTimeout(function () { if (card.classList.contains('is-out')) card.hidden = true; }, reduceMotion ? 0 : 250);
      }
    });
  }
  tabs.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.querySelectorAll('.tab').forEach(function (t) {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-pressed', String(t === tab));
      });
      moveBar(tab);
      apply(tab.dataset.filter);
    });
  });
  var active = tabs.querySelector('.tab.is-active');
  moveBar(active);
  window.addEventListener('resize', function () { moveBar(tabs.querySelector('.tab.is-active')); });
})();

// Project index: hovering (or tabbing to) a row shows its cover in the preview panel
(function () {
  var pv = document.querySelector('.preview');
  if (!pv) return;
  var img = pv.querySelector('img'), label = pv.querySelector('.pv-label'), cap = pv.querySelector('.pv-cap');
  var current = null;
  function show(row) {
    if (row === current) return;
    if (current) current.classList.remove('is-on');
    current = row;
    row.classList.add('is-on');
    pv.classList.add('is-swapping');
    setTimeout(function () {
      img.hidden = false;
      img.src = row.dataset.img;
      label.textContent = cap.textContent = row.dataset.title;
      pv.classList.remove('is-swapping');
    }, reduceMotion ? 0 : 150);
  }
  document.querySelectorAll('.row').forEach(function (row) {
    row.addEventListener('mouseenter', function () { show(row); });
    row.addEventListener('focus', function () { show(row); });
  });
})();

// Gentle fade-in for content that starts below the fold
(function () {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  var sel = '.card, .tile, .glance, .cs-hero, .page-content .cols, .page-content .media, .site-foot';
  var els = Array.prototype.filter.call(document.querySelectorAll(sel), function (el) {
    return el.getBoundingClientRect().top > window.innerHeight && !el.closest('.card, .tile, .ss-track');
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -5% 0px' });
  els.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
})();
