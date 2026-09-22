(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Photos

     Chaque emplacement porte data-photos : des identifiants Unsplash
     séparés par « | », essayés dans l'ordre jusqu'à ce que l'un charge.
     Tant qu'aucun n'aboutit, le bloc garde son fond pêche et son
     étiquette — la mise en page ne bouge pas.
  --------------------------------------------------------------------- */
  var CDN = 'https://images.unsplash.com/photo-';
  var PARAMS = '?q=85&w=1200&auto=format&fit=crop';

  document.querySelectorAll('[data-photos]').forEach(function (slot) {
    var ids = slot.getAttribute('data-photos').split('|');
    var alt = slot.getAttribute('data-alt') || '';
    var i = 0;

    (function attempt() {
      if (i >= ids.length) return;
      var url = CDN + ids[i].trim() + PARAMS;
      var probe = new Image();

      probe.onload = function () {
        var img = document.createElement('img');
        img.src = url;
        img.alt = alt;
        img.loading = slot.closest('.hero') ? 'eager' : 'lazy';
        slot.appendChild(img);
        slot.classList.add('has-photo');
      };

      probe.onerror = function () { i++; attempt(); };
      probe.src = url;
    })();
  });

  /* ---------------------------------------------------------------------
     Nav : état collé, menu mobile
  --------------------------------------------------------------------- */
  var nav = document.getElementById('nav');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-stuck', y > 40);
    if (toTop) toTop.classList.toggle('is-visible', y > 800);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var navToggle = document.getElementById('navToggle');
  var panel = document.getElementById('mobilePanel');

  function closePanel() {
    if (!panel) return;
    panel.classList.remove('is-open');
    if (navToggle) navToggle.textContent = 'Menu';
    document.body.style.overflow = '';
  }

  if (navToggle && panel) {
    navToggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      navToggle.textContent = open ? 'Fermer' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closePanel);
    });
  }

  /* ---------------------------------------------------------------------
     Révélations au défilement
  --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal, .mask-reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------------
     Compteurs
  --------------------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');

  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var started = null;

    function step(ts) {
      if (started === null) started = ts;
      var p = Math.min((ts - started) / 1400, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) window.requestAnimationFrame(step);
      else el.textContent = target;
    }
    window.requestAnimationFrame(step);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Parallaxe légère sur la photo du hero
  --------------------------------------------------------------------- */
  var heroPhoto = document.getElementById('heroPhoto');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroPhoto && !reduceMotion) {
    var ticking = false;
    document.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        var img = heroPhoto.querySelector('img');
        if (img && y < window.innerHeight) {
          img.style.transform = 'scale(1.06) translateY(' + (y * 0.12) + 'px)';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Horaires : jour courant et état ouvert/fermé
  --------------------------------------------------------------------- */
  var today = new Date().getDay();
  var todayRow = document.querySelector('.hours li[data-day="' + today + '"]');
  if (todayRow) todayRow.classList.add('is-today');

  var openState = document.getElementById('openState');
  if (openState && todayRow) {
    var closed = /Fermé/i.test(todayRow.textContent);
    openState.textContent = closed ? 'Fermé aujourd’hui' : 'Ouvert aujourd’hui';
  }

  /* ---------------------------------------------------------------------
     Semaine courante et année
  --------------------------------------------------------------------- */
  var weekOf = document.getElementById('weekOf');
  if (weekOf) {
    var now = new Date();
    var monday = new Date(now);
    // getDay() renvoie 0 pour dimanche : on recule jusqu'au lundi de la semaine
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekOf.textContent = monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Défilement ancré, sous la barre fixe
  --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closePanel();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - 72,
        behavior: 'smooth'
      });
    });
  });
})();
