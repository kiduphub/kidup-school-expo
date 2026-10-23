(() => {
  const form=document.getElementById('registration-form');
  const phone=document.getElementById('phone');
  const iframe=document.getElementById('sheet-submit-target');
  const msg=document.getElementById('submit-message');
  const btn=form.querySelector('button[type=submit]');
  const originalBtn=btn.innerHTML;
  let pending=false;
  let timeoutId;
  const params=new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content'].forEach(k=>{
    document.getElementById(k).value=params.get(k)||'';
  });
  function notify(message,error=false){msg.textContent=message;msg.style.display='block';msg.style.color=error?'#A43F38':'#186845';}
  phone.addEventListener('input',()=>phone.setCustomValidity(''));
  function stop(){pending=false;btn.disabled=false;btn.innerHTML=originalBtn;clearTimeout(timeoutId);}
  // Response from the Apps Script HTML response is explicitly verified against
  // the currently pending iframe window and the unique submission ID.
  window.addEventListener('message', event=>{
    if(!pending || event.source !== iframe.contentWindow || !/^https:\/\/(?:script\.googleusercontent\.com|script\.google\.com)$/.test(event.origin)) return;
    const data=event.data;
    if(!data || data.type!=='KIDUP_REGISTRATION_RESULT'||data.registration_id!==document.getElementById('registration_id').value)return;
    stop();
    if(data.success){
      sessionStorage.setItem('kidup_registration_success','yes');
      window.location.assign('thank-you.html');
    } else notify(data.error || 'Registration was not completed. Please try again.',true);
  });
  form.addEventListener('submit',event=>{
    const normalized=phone.value.replace(/[\s()+-]/g,'');
    if(!/^(?:01[0125]\d{8}|201[0125]\d{8})$/.test(normalized)){
      event.preventDefault();phone.setCustomValidity('Please enter a valid Egyptian mobile number (e.g. 01012345678).');phone.reportValidity();return;
    }
    phone.value=normalized;
    const url=window.KIDUP_SCRIPT_URL;
    if(!url||!/^https:\/\/script\.google\.com\/macros\/s\//.test(url)){
      event.preventDefault();notify('The registration form is not connected yet. Please configure the Google Apps Script URL.',true);return;
    }
    if(pending){event.preventDefault();return;}
    document.getElementById('registration_id').value='KD'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
    form.action=url;
    btn.disabled=true;btn.textContent='Submitting…';msg.style.display='none';pending=true;
    timeoutId=setTimeout(()=>{
      if(pending){stop();notify('We could not confirm registration. Please contact the organizers before submitting again.',true);}
    },20000);
  });
})();
