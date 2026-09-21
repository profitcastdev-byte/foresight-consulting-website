/* Foresight Consulting — interactions */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;

  /* ---- Sticky header ---------------------------------------------------- */
  var header = doc.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile drawer ---------------------------------------------------- */
  var toggle = doc.querySelector('.nav-toggle');
  var drawer = doc.querySelector('.nav-drawer');
  if (toggle && drawer) {
    var setOpen = function (open) {
      body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
    };
    setOpen(false);
    toggle.addEventListener('click', function () {
      setOpen(!body.classList.contains('nav-open'));
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('nav-open')) setOpen(false);
    });
  }

  /* ---- Scroll reveal ---------------------------------------------------- */
  var reveals = doc.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

      reveals.forEach(function (el) {
        // Stagger siblings that share a parent group
        var group = el.closest('[data-reveal-group]');
        if (group) {
          var kids = Array.prototype.slice.call(group.querySelectorAll('[data-reveal]'));
          var i = kids.indexOf(el);
          if (i > -1) el.style.setProperty('--d', Math.min(i, 6) * 70 + 'ms');
        }
        io.observe(el);
      });

      // Failsafe: if the observer never reports (background tab, odd embed),
      // anything already within the viewport is shown anyway.
      window.setTimeout(function () {
        reveals.forEach(function (el) {
          if (el.classList.contains('is-in')) return;
          if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
        });
      }, 1600);
    }
  }

  /* ---- Marquee: duplicate the track for a seamless loop ------------------ */
  doc.querySelectorAll('.marquee-track').forEach(function (track) {
    var group = track.querySelector('.marquee-group');
    if (group && track.children.length === 1) {
      var clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
  });

  /* ---- Audit application form ------------------------------------------- */
  var form = doc.querySelector('[data-form]');
  if (form) {
    var status = doc.querySelector('[data-form-status]');

    var showError = function (field, message) {
      var wrap = field.closest('.field');
      if (!wrap) return;
      wrap.classList.toggle('is-invalid', Boolean(message));
      var slot = wrap.querySelector('.err');
      if (slot) slot.textContent = message || '';
    };

    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () { showError(field, ''); });
      field.addEventListener('blur', function () {
        if (field.required && !field.value.trim()) return;
        showError(field, field.checkValidity() ? '' : (field.validationMessage || 'Please check this field.'));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;

      form.querySelectorAll('input, select, textarea').forEach(function (field) {
        var ok = field.checkValidity();
        showError(field, ok ? '' : (field.validationMessage || 'This field is required.'));
        if (!ok && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }

      if (status) {
        status.innerHTML =
          '<strong>Application received.</strong> A senior member of the practice reviews every ' +
          'application. If it is a fit, we return with an initial read on your listings and a ' +
          'proposed scope. If not, we say so and explain why.';
        status.classList.add('is-visible');
        status.setAttribute('role', 'status');
        status.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      form.reset();
    });
  }

  /* ---- Current year ----------------------------------------------------- */
  doc.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
