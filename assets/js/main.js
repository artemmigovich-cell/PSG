document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  /* contact/career form feedback */
  var form = document.querySelector('form[data-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form-note');
      if (note) note.textContent = 'Thank you. Your message has been received — our team will be in touch shortly.';
      form.reset();
    });
  }

  /* header shrink on scroll */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (reduceMotion) return;

  /* scroll-reveal: auto-tag common blocks, stagger by position in parent */
  var revealSelectors = [
    'section .section-head',
    '.card',
    '.feature-row',
    '.stat',
    '.img-frame',
    '.contact-info .item',
    '.cta-band h2, .cta-band p, .cta-band .btn'
  ];
  document.querySelectorAll(revealSelectors.join(',')).forEach(function (el) {
    if (el.closest('.hero')) return; // hero animates on load, not on scroll
    el.classList.add('reveal');
    var siblingsIndex = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.style.transitionDelay = Math.min(siblingsIndex * 80, 400) + 'ms';
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* animated stat counters */
  document.querySelectorAll('.stat .num').forEach(function (el) {
    var raw = el.textContent.trim();
    var match = raw.match(/^(\d+)(.*)$/);
    if (!match) return;
    var target = parseInt(match[1], 10);
    var suffix = match[2];
    el.textContent = '0' + suffix;

    var counted = false;
    var counterIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !counted) {
          counted = true;
          var start = null;
          var duration = 1100;
          function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          counterIo.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    counterIo.observe(el);
  });
});
