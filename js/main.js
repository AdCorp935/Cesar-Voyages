(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Sticky header on scroll
  --------------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var backToTop = document.getElementById('backToTop');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 700);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------------------
     Mobile menu toggle
  --------------------------------------------------------------------- */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function closeMenu() {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    if (header) header.classList.remove('menu-open');
    document.body.style.overflow = '';
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', isOpen);
      if (header) header.classList.toggle('menu-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal via IntersectionObserver
  --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------------
     Flight path draw-in (destinations section)
  --------------------------------------------------------------------- */
  var flightPathWrap = document.getElementById('flightPathWrap');
  if (flightPathWrap && 'IntersectionObserver' in window) {
    var pathObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          pathObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    pathObserver.observe(flightPathWrap);
  } else if (flightPathWrap) {
    flightPathWrap.classList.add('is-visible');
  }

  /* ---------------------------------------------------------------------
     Animated stat counters
  --------------------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 1600;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    window.requestAnimationFrame(step);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Premium custom cursor (desktop / fine pointer only)
  --------------------------------------------------------------------- */
  var cursorDot = document.getElementById('cursorDot');
  var supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursorDot && supportsHover) {
    var mx = 0, my = 0, cx = 0, cy = 0;
    var active = false;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!active) {
        active = true;
        cursorDot.classList.add('is-active');
      }
    });

    document.addEventListener('mouseleave', function () {
      cursorDot.classList.remove('is-active');
    });

    function raf() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursorDot.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      window.requestAnimationFrame(raf);
    }
    window.requestAnimationFrame(raf);

    var bigTargets = document.querySelectorAll('a, button, .dest-card, .btn');
    bigTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursorDot.classList.add('is-big'); });
      el.addEventListener('mouseleave', function () { cursorDot.classList.remove('is-big'); });
    });
  }

  /* ---------------------------------------------------------------------
     Magnetic buttons (subtle pull toward cursor)
  --------------------------------------------------------------------- */
  if (supportsHover) {
    document.querySelectorAll('.btn, .btn-arrow-circle').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + relX * 0.18 + 'px,' + relY * 0.3 + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------------------
     Contact form (front-end only demo submission)
  --------------------------------------------------------------------- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('button[type="submit"]');
      var original = btn.innerHTML;
      btn.innerHTML = 'Demande envoyée ✓';
      btn.style.background = '#bc7155';
      setTimeout(function () {
        contactForm.reset();
        btn.innerHTML = original;
        btn.style.background = '';
      }, 2600);
    });
  }

  /* ---------------------------------------------------------------------
     Footer year
  --------------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Smooth anchor scroll offset (account for fixed header)
  --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 84;
      window.scrollTo({ top: top, behavior: 'smooth' });
      closeMenu();
    });
  });
})();
