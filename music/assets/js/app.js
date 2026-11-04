// 曲目单：点一首在原地展开播放器；同一时间只放一首
(function () {
  var tracks = Array.prototype.slice.call(document.querySelectorAll('.track'));

  tracks.forEach(function (t) {
    var p = t.querySelector('.player');
    p.style.backgroundImage = 'url("' + p.dataset.cover + '")';
  });

  function playerSrc(bvid) {
    return 'https://player.bilibili.com/player.html?bvid=' + bvid +
      '&autoplay=1&high_quality=1&danmaku=0&isOutside=true';
  }

  function unload(t) {
    var f = t.querySelector('iframe');
    if (f) f.remove();
  }

  // 收起别的曲目时不做过渡，并按被点那一行的位移反向滚动，保证被点的那一行纹丝不动
  function closeInstantly(t) {
    var panel = t.querySelector('.track-panel');
    panel.classList.add('no-anim');
    t.classList.remove('is-open');
    t.querySelector('.track-row').setAttribute('aria-expanded', 'false');
    unload(t);
    panel.offsetHeight;
    panel.classList.remove('no-anim');
  }

  function open(t) {
    var row = t.querySelector('.track-row');
    var before = row.getBoundingClientRect().top;
    tracks.forEach(function (o) { if (o !== t && o.classList.contains('is-open')) closeInstantly(o); });
    var shift = row.getBoundingClientRect().top - before;
    if (shift) window.scrollBy({ top: shift, behavior: 'instant' });

    var player = t.querySelector('.player');
    var f = document.createElement('iframe');
    f.src = playerSrc(t.dataset.bvid);
    f.title = t.querySelector('.t-title').textContent;
    f.allow = 'autoplay; fullscreen; picture-in-picture';
    f.allowFullscreen = true;
    f.setAttribute('scrolling', 'no');
    player.appendChild(f);
    t.classList.add('is-open');
    row.setAttribute('aria-expanded', 'true');
  }

  function close(t) {
    t.classList.remove('is-open');
    t.querySelector('.track-row').setAttribute('aria-expanded', 'false');
    var panel = t.querySelector('.track-panel');
    var done = function () { if (!t.classList.contains('is-open')) unload(t); };
    panel.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 700);
  }

  tracks.forEach(function (t) {
    t.querySelector('.track-row').addEventListener('click', function () {
      if (t.classList.contains('is-open')) close(t); else open(t);
    });
  });
})();

// 看大图：点配图放大，点任意处或按 Esc 关闭
(function () {
  var box = document.querySelector('.lightbox');
  var big = box.querySelector('img');
  var last = null;

  function show(img) {
    last = img;
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    box.hidden = false;
    box.offsetHeight;
    box.classList.add('is-on');
    box.querySelector('.lightbox-close').focus({ preventScroll: true });
  }

  function hide() {
    if (box.hidden) return;
    box.classList.remove('is-on');
    var done = function () { if (!box.classList.contains('is-on')) box.hidden = true; };
    box.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 400);
    if (last) last.closest('.frame').focus({ preventScroll: true });
  }

  document.querySelectorAll('.media .frame').forEach(function (f) {
    var img = f.querySelector('img:last-of-type');
    f.tabIndex = 0;
    f.setAttribute('role', 'button');
    f.setAttribute('aria-label', '看大图：' + (img.alt || ''));
    f.addEventListener('click', function () { show(img); });
    f.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(img); }
    });
  });

  box.addEventListener('click', hide);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
})();

// 从台前到幕后：分界线跟着鼠标（或手指横向拖动）走，松开回到中间
(function () {
  var d = document.querySelector('.diptych');
  if (!d) return;
  var target = 50, cur = 50, raf = null;

  function tick() {
    cur += (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.05) cur = target;
    d.style.setProperty('--split', cur.toFixed(2) + '%');
    raf = cur === target ? null : requestAnimationFrame(tick);
  }
  function aim(p) {
    target = Math.min(88, Math.max(12, p));
    if (!raf) raf = requestAnimationFrame(tick);
  }

  d.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch' && !e.buttons && e.pressure === 0) return;
    var r = d.getBoundingClientRect();
    aim((e.clientX - r.left) / r.width * 100);
  });
  d.addEventListener('pointerleave', function () { aim(50); });
  d.addEventListener('pointerup', function (e) { if (e.pointerType === 'touch') aim(50); });
})();
