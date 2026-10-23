// KidUp Hub — quicker receipt verification without duplicate submissions.
(() => {
  'use strict';
  const form = document.getElementById('registration-form');
  if (!form) return;
  const phone = document.getElementById('phone');
  const msg = document.getElementById('submit-message');
  const btn = form.querySelector('button[type="submit"]');
  const originalBtn = btn.innerHTML;
  let pending = false;
  const params = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content'].forEach(k => {
    const el = document.getElementById(k);
    if (el) el.value = params.get(k) || '';
  });
  const notify = (message, error = true) => {
    msg.textContent = message;
    msg.style.display = 'block';
    msg.style.color = error ? '#A43F38' : '#186845';
  };
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function checkReceipt(id, attempt, maxWait = 2800) {
    return new Promise(resolve => {
      const callback = 'kidupReceipt_' + Math.random().toString(36).slice(2, 13);
      const script = document.createElement('script');
      let finished = false;
      let timeout;
      function finish(ok) {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        try { delete window[callback]; } catch (_) { window[callback] = undefined; }
        script.remove();
        resolve(ok);
      }
      window[callback] = data => finish(!!(data && data.registration_id === id && data.saved === true));
      script.onerror = () => finish(false);
      const sep = window.KIDUP_SCRIPT_URL.includes('?') ? '&' : '?';
      script.src = window.KIDUP_SCRIPT_URL + sep + 'registration_id=' + encodeURIComponent(id) +
        '&callback=' + callback + '&v=' + attempt;
      timeout = setTimeout(() => finish(false), maxWait);
      document.head.appendChild(script);
    });
  }

  phone.addEventListener('input', () => phone.setCustomValidity(''));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (pending) return;
    const normalized = phone.value.replace(/[\s()+-]/g, '');
    if (!/^(?:01[0125]\d{8}|201[0125]\d{8})$/.test(normalized)) {
      phone.setCustomValidity('Please enter a valid Egyptian mobile number.');
      phone.reportValidity();
      return;
    }
    phone.value = normalized;
    const url = window.KIDUP_SCRIPT_URL;
    if (!url || !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?|$)/.test(url)) {
      notify('Registration is not connected yet.');
      return;
    }

    pending = true;
    btn.disabled = true;
    btn.textContent = 'Confirming registration…';
    notify('Please keep this page open while we confirm your registration.', false);
    const id = 'KD' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    document.getElementById('registration_id').value = id;

    // Only ONE POST. Retry the read-only receipt lookup, NEVER the POST.
    form.action = url;
    HTMLFormElement.prototype.submit.call(form);

    // Start checking soon, rather than waiting a fixed 1.8 seconds.
    await sleep(450);
    const started = Date.now();
    const intervals = [0, 350, 500, 700, 850, 1100, 1400, 1700, 2000];
    let success = false;
    for (let i = 0; i < intervals.length; i++) {
      if (i > 0) await sleep(intervals[i]);
      const elapsed = Date.now() - started;
      if (elapsed >= 19000) break;
      if (elapsed > 5500) notify('Still checking your registration. Please keep this page open.', false);
      if (await checkReceipt(id, i, Math.min(2800, 19500 - elapsed))) {
        success = true;
        break;
      }
    }

    pending = false;
    if (success) {
      sessionStorage.setItem('kidup_registration_success', 'yes');
      // Track ONLY verified saves, with consent. No personal form data is sent.
      const tracked = window.KidUpTracking?.lead() || false;
      if (tracked) await sleep(450);
      window.location.assign('thank-you.html');
    } else {
      // Unknown outcome: DON'T permit a second submission that may duplicate the row.
      btn.textContent = 'Registration pending confirmation';
      notify('Your details may already have been saved. Please do not submit again. Contact kiduphub@gmail.com to confirm your registration. Reference: ' + id);
    }
  });
})();
