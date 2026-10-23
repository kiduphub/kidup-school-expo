// KidUp Hub — consent-based Meta Pixel (no personal form fields sent).
(() => {
  'use strict';
  const PIXEL_ID = '1082926037894443';
  const KEY = 'kidup_meta_tracking_consent_v1';
  let initialized = false;
  let consent = null;
  try { consent = localStorage.getItem(KEY); } catch (_) {}
  function initPixel() {
    if (initialized) return;
    initialized = true;
    /* Standard Meta Pixel bootstrap, only after opt-in */
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID, {}, {autoConfig:false});
    fbq('track', 'PageView');
  }
  function saveChoice(choice) {
    consent = choice;
    try { localStorage.setItem(KEY, choice); } catch (_) {}
    if (choice === 'accepted') initPixel();
    const banner=document.getElementById('kidup-tracking-consent');
    if (banner) banner.hidden = true;
  }
  window.KidUpTracking = {
    lead: () => {
      if (consent !== 'accepted') return false;
      initPixel();
      window.fbq('track', 'Lead', {content_name: 'KidUp School Expo Registration'});
      return true;
    },
    openSettings: () => {
      const b=document.getElementById('kidup-tracking-consent');
      if (b) b.hidden=false;
    }
  };
  function mountBanner() {
    if(consent==='accepted'){ initPixel(); return; }
    if(consent==='rejected') return;
    const banner=document.getElementById('kidup-tracking-consent');
    if(!banner)return;
    banner.hidden=false;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-consent-accept]').forEach(e=>e.addEventListener('click',()=>saveChoice('accepted')));
    document.querySelectorAll('[data-consent-reject]').forEach(e=>e.addEventListener('click',()=>saveChoice('rejected')));
    document.querySelectorAll('[data-consent-settings]').forEach(e=>e.addEventListener('click',()=>window.KidUpTracking.openSettings()));
    mountBanner();
  });
})();
