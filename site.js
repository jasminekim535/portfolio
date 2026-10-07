// Shared behavior: menu, slideshows, lightbox, project filters, and motion.
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

// Top bar: shadow once scrolled; hides while scrolling down, returns on scroll up
(function () {
  var bar = document.querySelector('.topbar');
  if (!bar) return;
  var last = window.scrollY;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    bar.classList.toggle('is-scrolled', y > 8);
    var menuOpen = bar.querySelector('nav.open');
    bar.classList.toggle('is-hidden', !menuOpen && y > 160 && y > last);
    last = y;
  }, { passive: true });
})();

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

// "View" label that follows the cursor over project cards (mouse/trackpad only)
(function () {
  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var targets = document.querySelectorAll('.card, .tile');
  if (!targets.length) return;
  var tag = document.createElement('div');
  tag.className = 'cursor-tag';
  tag.textContent = 'View case study →';
  document.body.appendChild(tag);
  targets.forEach(function (el) {
    var img = el.querySelector('.card-img, .tile-img');
    if (!img) return;
    img.addEventListener('mouseenter', function () {
      tag.textContent = el.classList.contains('tile') ? 'View project →' : 'View case study →';
      tag.classList.add('on');
    });
    img.addEventListener('mouseleave', function () { tag.classList.remove('on'); });
    img.addEventListener('mousemove', function (e) {
      tag.style.transform = 'translate(' + (e.clientX + 14) + 'px,' + (e.clientY + 14) + 'px)';
    });
  });
})();

// Scroll reveal + count-up numbers (only for content that starts below the fold)
(function () {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  var sel = '.card, .tile, .stat, .feature, .process li, .sec-head, .tabs, .cs-meta, .cs-hero, .cs-intro, .site-foot, .page-content .cols, .page-content .media';
  var els = Array.prototype.filter.call(document.querySelectorAll(sel), function (el) {
    return el.getBoundingClientRect().top > window.innerHeight && !el.closest('.card, .tile, .ss-track');
  });
  function countUp(el) {
    var m = el.textContent.match(/^(\d+)(.*)$/);
    if (!m) return;
    var end = parseInt(m[1], 10), suffix = m[2], t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 900, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      // stagger siblings that arrive together
      var sibs = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(sibs, 6) * 70 + 'ms';
      el.classList.add('in');
      var n = el.querySelector && el.querySelector('.stat-n');
      if (n) countUp(n);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
})();
