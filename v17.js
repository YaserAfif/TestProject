/* دفتر حسابات ۱۷ — incremental UX, non-destructive upgrades. */
(()=>{'use strict';
 const $=id=>document.getElementById(id), C=window.MC14;
 if(!C)return;
 const version='17.0.0';
 function updateVersion(){
  document.title='دفتر حسابات — نسخه ۱۷';
  if($('appVersion'))$('appVersion').textContent=version;
  document.querySelectorAll('.v14-version').forEach(e=>e.textContent='نسخه ۱۷');
  const license=$('licenseOverlay')?.querySelector('h2 span');if(license)license.textContent='نسخهٔ ۱۷';
 }
 function pinJournal(){
  const form=$('entryForm'),account=$('name');if(!form||!account||$('v17-pin'))return;
  const pin=document.createElement('button');pin.id='v17-pin';pin.type='button';pin.textContent='📌';pin.title='حفظ حساب انتخاب‌شده پس از ثبت سند';pin.setAttribute('aria-pressed','false');
  account.insertAdjacentElement('afterend',pin);
  let pinned=false,chosen='';
  pin.onclick=()=>{pinned=!pinned;chosen=account.value;pin.classList.toggle('v17-pinned',pinned);pin.setAttribute('aria-pressed',String(pinned));pin.title=pinned?'حساب سنجاق شده؛ برای آزاد کردن دوباره کلیک کنید':'حفظ حساب انتخاب‌شده'};
  account.addEventListener('change',()=>{if(pinned)chosen=account.value});
  form.addEventListener('submit',()=>{if(!pinned)return;chosen=account.value;setTimeout(()=>{if(pinned&&chosen){account.value=chosen;account.dispatchEvent(new Event('change',{bubbles:true}))}},30)});
 }
 function simplifyAccounts(){
  const page=$('page-accounts');if(!page)return;
  const remove=()=>{page.querySelectorAll('section,div').forEach(el=>{if(el.id==='v14-unpaid-accounts-hint')el.remove()})};
  remove();
 }
 function enhanceDetails(){
  const page=$('page-accounts');if(!page)return;
  page.addEventListener('click',e=>{
   const row=e.target.closest('[data-open-account]');if(row){const details=$('v13-detail');if(details){details.classList.add('v17-account-sheet');setTimeout(()=>details.scrollIntoView({block:'start',behavior:'smooth'}),30)}}
   const btn=e.target.closest('[data-v16-voucher]');if(btn){setTimeout(()=>{const modal=$('v15-modal')||$('v14-modal');if(modal&&!modal.hidden)modal.classList.add('v17-document-sheet')},20)}
  });
  $('v13-back-accounts')?.addEventListener('click',()=>{$('v13-detail')?.classList.remove('v17-account-sheet')});
 }
 function simplifyRemittance(){
  for(const kind of ['in','out']){const form=$('v13-'+kind+'-form');if(!form)continue;
   for(const word of ['source']){const el=$('v13-'+kind+'-'+word);if(el){el.closest('.field')?.setAttribute('hidden','');el.disabled=true}}
   form.querySelectorAll('label').forEach(el=>{if(/اعمال مفاد پیش.?فرض/.test(el.textContent||'')){el.hidden=true;el.querySelectorAll('input').forEach(x=>x.disabled=true)}});
  }
 }
 function removeDuplicateActions(){
  const details=$('v13-detail');if(!details)return;
  const edit=$('v13-account-edit');if(edit)edit.hidden=true;
 }
 function init(){
  updateVersion();pinJournal();simplifyAccounts();enhanceDetails();simplifyRemittance();removeDuplicateActions();
  const original=C.onAfterRender;C.onAfterRender=()=>{original?.();updateVersion();removeDuplicateActions()};
  const originalPage=C.onPage;C.onPage=p=>{originalPage?.(p);updateVersion();if(p==='hawalaIn'||p==='hawalaOut')simplifyRemittance()};
  window.MC17={VERSION:version};
 }
 try{init()}catch(err){console.error('دفتر حسابات نسخه ۱۷',err)}
})();