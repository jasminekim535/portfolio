// Shared behavior: phone menu, slideshows, and click-to-enlarge images.

// Phone menu toggle
document.querySelectorAll('.menu-toggle').forEach(function (btn) {
  var nav = document.getElementById(btn.getAttribute('aria-controls'));
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
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
