/**
 * DIABEFIGHT Landing Page
 * Countdown timer + form handling
 */

(function () {
  'use strict';

  // ----- Countdown Timer -----
  // Set target: 24 hours from now (or use a fixed date)
  function getCountdownEnd() {
    const stored = sessionStorage.getItem('countdownEnd');
    if (stored) return new Date(parseInt(stored, 10));
    const end = new Date();
    end.setHours(end.getHours() + 24);
    sessionStorage.setItem('countdownEnd', end.getTime());
    return end;
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function updateCountdown() {
    const now = new Date();
    const end = getCountdownEnd();
    let diff = Math.max(0, end - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    const seconds = Math.floor(diff / 1000);

    const ids = ['days', 'hours', 'minutes', 'seconds'];
    const ids2 = ['days2', 'hours2', 'minutes2', 'seconds2'];
    const values = [pad(days), pad(hours), pad(minutes), pad(seconds)];

    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = values[i];
    });
    ids2.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = values[i];
    });

    const banner = document.getElementById('bannerCountdown');
    if (banner) {
      banner.textContent = `Ends in ${values[0]}d ${values[1]}h ${values[2]}m ${values[3]}s`;
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ----- Quantity option selected state (for browsers without :has()) -----
  document.querySelectorAll('.quantity-option input').forEach(function (radio) {
    radio.addEventListener('change', function () {
      document.querySelectorAll('.quantity-option').forEach(function (opt) {
        opt.classList.toggle('selected', opt.contains(radio));
      });
    });
  });
  document.querySelectorAll('.quantity-option').forEach(function (opt) {
    if (opt.querySelector('input:checked')) opt.classList.add('selected');
  });

  // ----- Form submit (email notifications via Formspree) -----
  const form = document.getElementById('orderForm');
  if (form) {
    const successEl = document.getElementById('orderSuccess');
    const errorEl = document.getElementById('orderError');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Replace with your Google Apps Script Web App endpoint:
    // Example: https://script.google.com/macros/s/XXXXXXX/exec
    const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxvcHsjXYIPjPcIqC7nMlKZJHp0VhmNWtqKJYJnzAUdbxAZ1AIKlSLtO2seE9OCINu5Pw/exec';

    const honeyEl = form.querySelector('input[name="_honey"]');
    const quantityRadios = form.querySelectorAll('input[name="quantity"]');
    const quantityLabelEl = document.getElementById('quantityLabel');
    const orderPriceEl = document.getElementById('orderPrice');
    const orderOriginalPriceEl = document.getElementById('orderOriginalPrice');
    const orderSaveEl = document.getElementById('orderSave');

    function syncHiddenFields() {
      const checked = form.querySelector('input[name="quantity"]:checked');
      if (!checked) return;
      if (quantityLabelEl) quantityLabelEl.value = checked.dataset.label || '';
      if (orderPriceEl) orderPriceEl.value = checked.dataset.price || '';
      if (orderOriginalPriceEl) orderOriginalPriceEl.value = checked.dataset.original || '';
      if (orderSaveEl) orderSaveEl.value = checked.dataset.save || '';
    }

    quantityRadios.forEach(function (r) {
      r.addEventListener('change', syncHiddenFields);
    });
    syncHiddenFields();

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (successEl) successEl.style.display = 'none';
      if (errorEl) errorEl.style.display = 'none';

      // Basic honeypot protection
      if (honeyEl && honeyEl.value && honeyEl.value.trim() !== '') {
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      // Sync the hidden pricing/capsule fields from the selected radio
      syncHiddenFields();

      var iframe = document.getElementById('orderIframe');
      var done = false;

      function showSuccess() {
        if (done) return;
        done = true;
        if (successEl) successEl.style.display = 'block';
        if (submitBtn) submitBtn.textContent = '✓ Order submitted';

        // Keep selected option; just clear text fields to avoid accidental double submits
        form.querySelectorAll('input[type="text"], input[type="tel"]').forEach(function (inp) {
          if (inp.type !== 'hidden') inp.value = '';
        });
      }

      // Fallback: show success even if we can't inspect the response.
      var timeoutId = setTimeout(function () {
        if (!done) showSuccess();
      }, 3500);

      if (iframe) {
        iframe.addEventListener('load', function () {
          clearTimeout(timeoutId);
          showSuccess();
        }, { once: true });
      }

      // Submit using the hidden iframe so we don't depend on AJAX/CORS.
      form.target = 'orderIframe';
      form.action = FORM_ENDPOINT;
      form.submit();
    });
  }

  // ----- Smooth scroll for anchor links -----
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ----- WhatsApp screenshots: tap to enlarge -----
  var lightbox = document.getElementById('whatsappLightbox');
  var lightboxImg = document.getElementById('whatsappLightboxImg');
  var lightboxClose = document.getElementById('whatsappLightboxClose');
  if (lightbox && lightboxImg) {
    function openLightbox(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      if (typeof lightbox.showModal === 'function') {
        lightbox.showModal();
      }
    }
    document.querySelectorAll('.testimonial-whatsapp-zoom').forEach(function (img) {
      img.setAttribute('tabindex', '0');
      img.addEventListener('click', function () {
        openLightbox(this.src, this.alt);
      });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(this.src, this.alt);
        }
      });
    });
    if (lightboxClose) {
      lightboxClose.addEventListener('click', function () {
        lightbox.close();
      });
    }
  }

  // ----- Interactive symptom check -----
  var symptomSummary = document.getElementById('symptomSummary');
  var symptomReset = document.getElementById('symptomReset');
  var symptomChips = document.querySelectorAll('.symptom-chip');

  function updateSymptomSummary() {
    if (!symptomSummary) return;
    var selected = document.querySelectorAll('.symptom-chip.is-selected');
    var n = selected.length;
    if (n === 0) {
      symptomSummary.innerHTML =
        '<p class="symptom-summary-intro">Tap the boxes above — your picks will show here.</p>';
      return;
    }
    var labels = Array.prototype.map.call(selected, function (btn) {
      return btn.textContent.trim();
    });
    var listHtml =
      '<p class="symptom-picked-intro">You picked <span class="symptom-summary-count">' +
      n +
      '</span> ' +
      (n === 1 ? 'thing' : 'things') +
      '. Please run it by a doctor. Many people also use <strong>DIABEFIGHT</strong> as part of their daily care.</p>' +
      '<ul class="symptom-picked-list">' +
      labels
        .map(function (l) {
          return '<li>' + l + '</li>';
        })
        .join('') +
      '</ul>';
    symptomSummary.innerHTML = listHtml;
  }

  if (symptomChips.length) {
    symptomChips.forEach(function (chip) {
      chip.setAttribute('type', 'button');
      chip.setAttribute('aria-pressed', 'false');
      chip.addEventListener('click', function () {
        var on = this.classList.toggle('is-selected');
        this.setAttribute('aria-pressed', on ? 'true' : 'false');
        updateSymptomSummary();
      });
    });
  }
  if (symptomReset) {
    symptomReset.addEventListener('click', function () {
      document.querySelectorAll('.symptom-chip.is-selected').forEach(function (chip) {
        chip.classList.remove('is-selected');
        chip.setAttribute('aria-pressed', 'false');
      });
      updateSymptomSummary();
    });
  }
})();
