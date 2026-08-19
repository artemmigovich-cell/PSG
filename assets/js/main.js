document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* hero background video: desktop only, skip on reduced-motion or metered connections */
  var videoSlot = document.querySelector('.hero-video-slot');
  if (videoSlot) {
    var conn = navigator.connection || navigator.webkitConnection;
    var isMetered = conn && (conn.saveData || /^(slow-2g|2g|3g)$/.test(conn.effectiveType || ''));
    if (window.innerWidth >= 860 && !reduceMotion && !isMetered) {
      var video = document.createElement('video');
      video.src = videoSlot.dataset.video;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('aria-hidden', 'true');
      video.addEventListener('canplay', function () { video.classList.add('loaded'); });
      videoSlot.appendChild(video);
    }
  }

  /* make whole service cards clickable, not just the "Learn More" link */
  document.querySelectorAll('.card').forEach(function (card) {
    var link = card.querySelector('a.card-link');
    if (!link) return;
    card.classList.add('card-clickable');
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return; // let the real link handle its own click
      window.location.href = link.href;
    });
  });

  /* mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  var backdrop = document.querySelector('.main-nav-backdrop');

  function closeNav() {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('nav-locked');
    nav.querySelectorAll('.has-dropdown.open').forEach(function (li) {
      li.classList.remove('open');
      var caret = li.querySelector('.dropdown-caret');
      if (caret) caret.setAttribute('aria-expanded', 'false');
    });
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (backdrop) backdrop.classList.toggle('open', open);
      document.body.classList.toggle('nav-locked', open);
    });
    if (backdrop) backdrop.addEventListener('click', closeNav);

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });

    /* services dropdown: expandable accordion on mobile, hover on desktop (handled by CSS) */
    nav.querySelectorAll('.dropdown-caret').forEach(function (caret) {
      caret.addEventListener('click', function (e) {
        e.preventDefault();
        var li = caret.closest('.has-dropdown');
        var open = li.classList.toggle('open');
        caret.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
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

  /* custom "target-lock" cursor — desktop pointer devices only */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.body.classList.add('cursor-ready');

    var dot = document.createElement('div');
    dot.className = 'cursor-dot';

    var frame = document.createElement('div');
    frame.className = 'cursor-frame';
    frame.innerHTML =
      '<span class="cursor-corner tl"></span>' +
      '<span class="cursor-corner tr"></span>' +
      '<span class="cursor-corner bl"></span>' +
      '<span class="cursor-corner br"></span>' +
      '<span class="cursor-label">LOCKED</span>';

    document.body.appendChild(dot);
    document.body.appendChild(frame);

    var mouseX = 0, mouseY = 0, frameX = 0, frameY = 0, started = false;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px)';
      dot.classList.add('active');
      frame.classList.add('active');
      if (!started) {
        started = true;
        frameX = mouseX;
        frameY = mouseY;
        requestAnimationFrame(tick);
      }
    });

    document.addEventListener('mouseleave', function () {
      dot.classList.remove('active');
      frame.classList.remove('active');
    });

    function tick() {
      frameX += (mouseX - frameX) * 0.45;
      frameY += (mouseY - frameY) * 0.45;
      frame.style.transform = 'translate(' + frameX + 'px,' + frameY + 'px)';
      requestAnimationFrame(tick);
    }

    var hoverTargets = 'a, button, input, textarea, select, .card, .nav-toggle';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverTargets)) frame.classList.add('hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverTargets)) frame.classList.remove('hover');
    });
    document.addEventListener('mousedown', function () { frame.classList.add('click'); });
    document.addEventListener('mouseup', function () { frame.classList.remove('click'); });
  }

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
