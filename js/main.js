(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return [].slice.call((r || document).querySelectorAll(s)); };

  // год в подвале
  var y = $('#y'); if (y) y.textContent = new Date().getFullYear();

  // карта: подставляем только когда блок рядом, чтобы не грузить её сразу
  var mf = $('#mapframe'), ml = $('#maplink');
  var q = encodeURIComponent('Нижний Новгород, деревня Кузнечиха, Акварельная улица, 82Д');
  if (ml) ml.href = 'https://yandex.ru/maps/?text=' + q;
  if (mf) mf.src = 'https://yandex.ru/map-widget/v1/?text=' + q + '&z=16';

  // шапка, полоса прогресса, нижняя панель на телефоне, параллакс фото
  var head = $('.site-head'), bar = $('#mbar'), prog = $('.progress'), par = $('.hero-photo .arch img');
  var ticking = false;
  function onScroll(){
    var sy = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (head) head.classList.toggle('solid', sy > 20);
    if (bar) bar.classList.toggle('show', sy > 420);
    if (prog) prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(sy / h, 1) : 0) + ')';
    if (par && !reduce && sy < 1200) par.style.transform = 'translateY(' + (-sy * 0.06) + 'px)';
    ticking = false;
  }
  window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  onScroll();

  // бургер-меню
  var burger = $('.burger');
  if (burger && head){
    burger.addEventListener('click', function(){
      var open = head.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    $$('.menu a').forEach(function(a){ a.addEventListener('click', function(){ head.classList.remove('open'); burger.setAttribute('aria-expanded', false); }); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && head.classList.contains('open')){ head.classList.remove('open'); burger.setAttribute('aria-expanded', false); burger.focus(); } });
  }

  // появление блоков при прокрутке + счётчики
  function count(el){
    var to = parseFloat(el.getAttribute('data-count')), pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '';
    if (reduce){ el.textContent = pre + to + suf; return; }
    var t0 = null, dur = 1400;
    function step(t){
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + Math.round(to * e) + suf;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var els = $$('.rv, [data-count]');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.hasAttribute('data-count')) count(e.target);
        io.unobserve(e.target);
      });
    }, {threshold:.08, rootMargin:'0px 0px -30px 0px'});
    els.forEach(function(el){ io.observe(el); });
  } else {
    els.forEach(function(el){ el.classList.add('in'); });
  }
  // страховка: если наблюдатель не сработал (старый webview), показываем всё, что уже на экране или выше
  setTimeout(function(){
    $$('.rv:not(.in)').forEach(function(el){ if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); });
  }, 2500);

  // меняющееся слово в заголовке
  var rot = $('.rot b');
  if (rot && !reduce){
    var words = rot.getAttribute('data-words').split('|'), i = 0;
    setInterval(function(){
      rot.classList.add('out');
      setTimeout(function(){
        i = (i + 1) % words.length;
        rot.textContent = words[i];
        rot.classList.remove('out'); rot.classList.add('pre');
        void rot.offsetWidth;
        rot.classList.remove('pre');
      }, 450);
    }, 2600);
  }

  // вкладки противопоказаний
  var tabs = $$('.tabs [role=tab]');
  function pick(t, focus){
    tabs.forEach(function(b){
      var on = b === t;
      b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
      document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) t.focus();
    var p = t.parentNode;
    if (p.scrollWidth > p.clientWidth) p.scrollTo({left: t.offsetLeft - p.offsetLeft - 22, behavior: 'smooth'});
  }
  tabs.forEach(function(b, i){
    b.addEventListener('click', function(){ pick(b); });
    b.addEventListener('keydown', function(e){
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){ e.preventDefault(); pick(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true); }
    });
  });

  // просмотр фото
  var lb = $('#lb');
  if (lb){
    var lbi = lb.querySelector('img');
    $$('[data-lb]').forEach(function(img){
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function(){ lbi.src = img.src; lbi.alt = img.alt; lb.classList.add('open'); });
    });
    lb.addEventListener('click', function(){ lb.classList.remove('open'); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') lb.classList.remove('open'); });
  }
})();
