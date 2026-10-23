(() => {
  const form = document.getElementById('registration-form');
  const phone = document.getElementById('phone');
  const msg = document.getElementById('submit-message');
  const btn = form.querySelector('button[type=submit]');
  const originalBtn = btn.innerHTML;
  let pending = false;
  const params = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content'].forEach(k => {
    document.getElementById(k).value = params.get(k) || '';
  });
  const notify = (message, error=true) => {
    msg.textContent=message; msg.style.display='block';
    msg.style.color=error?'#A43F38':'#186845';
  };
  const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
  function checkReceipt(id, attempt) {
    return new Promise(resolve => {
      const callback='kidupReceipt_'+Math.random().toString(36).slice(2,13);
      const script=document.createElement('script');
      let finished=false;
      function finish(ok){
        if(finished)return;
        finished=true;
        clearTimeout(timeout);
        delete window[callback];
        script.remove();
        resolve(ok);
      }
      window[callback]=data=>finish(!!(data && data.registration_id===id && data.saved));
      script.onerror=()=>finish(false);
      const sep=window.KIDUP_SCRIPT_URL.includes('?')?'&':'?';
      script.src=window.KIDUP_SCRIPT_URL+sep+'registration_id='+encodeURIComponent(id)+'&callback='+callback+'&v='+attempt;
      const timeout=setTimeout(()=>finish(false),5000);
      document.head.appendChild(script);
    });
  }
  phone.addEventListener('input',()=>phone.setCustomValidity(''));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if(pending)return;
    const normalized=phone.value.replace(/[\s()+-]/g,'');
    if(!/^(?:01[0125]\d{8}|201[0125]\d{8})$/.test(normalized)){
      phone.setCustomValidity('Please enter a valid Egyptian mobile number.');
      phone.reportValidity();return;
    }
    phone.value=normalized;
    const url=window.KIDUP_SCRIPT_URL;
    if(!url || !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?|$)/.test(url)){
      notify('Registration is not connected yet.');return;
    }
    pending=true;btn.disabled=true;btn.textContent='Confirming registration…';msg.style.display='none';
    const id='KD'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
    document.getElementById('registration_id').value=id;
    // Send to the hidden iframe with a native form POST; do not read the cross-origin response.
    form.action=url;
    HTMLFormElement.prototype.submit.call(form);
    await sleep(1800);
    let success=false;
    for(let i=0;i<9;i++){
      if(await checkReceipt(id,i)){success=true;break;}
      if(i<8)await sleep(1200);
    }
    pending=false;btn.disabled=false;btn.innerHTML=originalBtn;
    if(success){
      sessionStorage.setItem('kidup_registration_success','yes');
      // Only a verified receipt can trigger Lead. Never send name, email or phone.
      const tracked = window.KidUpTracking?.lead() || false;
      if (tracked) await sleep(450);
      window.location.assign('thank-you.html');
    }else{
      notify('We could not verify this registration yet. Please check with the organizers before submitting again to avoid duplicates.');
    }
  });
})();
