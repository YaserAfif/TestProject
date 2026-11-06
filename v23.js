/* دفتر حسابات 23 — structured journal, non-destructive conversion input, linked
 * remittance fees and customer-facing copyable voucher text.
 * No migration and no rewrite of existing journal data.
 */
(()=>{'use strict';
 const C=window.MC14,$=id=>document.getElementById(id);if(!C)return;
 const VERSION='23.0.0';
 const raw=v=>{const value=C.parsedAmount(v??'');return Number.isFinite(value)?value:0};
 const format=v=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(v);
 const field=id=>$(id)?.closest('.field');
 const allCurrencies=()=>[...new Set(C.currencies)];
 function updateVersion(){if($('appVersion'))$('appVersion').textContent=VERSION;document.title='دفتر حسابات';}
 function journalLayout(){
  const form=$('entryForm'),row=form?.querySelector('.v22-journal-primary'),amount=row?.querySelector('.amount-row');
  if(!row||!amount||row.dataset.v23Journal)return;
  row.dataset.v23Journal='1';row.classList.add('v23-journal-row');
  const date=field('date'),account=field('name');
  // Date and account are a fixed pair at all widths; money and note follow.
  const first=document.createElement('div');first.className='v23-journal-head';
  first.append(date,account);row.prepend(first);
  const currencyPicker=amount.querySelector('.currency-picker');
  if(currencyPicker)currencyPicker.classList.add('v23-legacy-currency');
  for(const [id,role] of [['gotAmount','got'],['talabAmount','talab']]){
   const inputField=field(id);if(!inputField)continue;
   const holder=document.createElement('div');holder.className='v23-money-pair v23-money-'+role;
   const select=document.createElement('select');select.id='v23-'+role+'-currency';
   select.className='v23-money-currency';select.setAttribute('aria-label','واحد ارز '+(role==='got'?'گرفت':'طلب'));
   select.title='انتخاب ارز';
   holder.append(inputField,select);amount.append(holder);
   select.addEventListener('change',()=>{
    // Independent currencies: changing one side must NOT rewrite the other.
    activateJournalCurrency(role);
   });
   $(id)?.addEventListener('input',()=>activateJournalCurrency(role));
   $(id)?.addEventListener('focus',()=>activateJournalCurrency(role));
  }
  syncJournalCurrency();
 }
 function activateJournalCurrency(role){
  const select=$('v23-'+role+'-currency');if(!select)return;
  const main=$('currency'),code=select.value;
  if(main)main.value=code;
  if($('currencyTrigger'))$('currencyTrigger').textContent=code+' ▾';
 }
 function syncJournalCurrency(){
  const codes=allCurrencies(),fallback=$('currency')?.value||'AFN';
  for(const id of ['v23-got-currency','v23-talab-currency']){
   const select=$(id);if(!select)continue;
   const previous=select.value||fallback;
   if(select.options.length!==codes.length||codes.some((code,i)=>select.options[i]?.value!==code)){
    select.replaceChildren(...codes.map(c=>{const opt=document.createElement('option');opt.value=opt.textContent=c;return opt}));
   }
   select.value=codes.includes(previous)?previous:(codes.includes('AFN')?'AFN':codes[0]);
  }
 }
 function commissionRule(account,cur,principal){
  const config=C.settings.sarrafRules?.[account]?.fees?.[cur]||{};
  const threshold=Number(config.threshold),unit=Number(config.value);
  if(!(threshold>0&&unit>0&&principal>0))return 0;
  return Math.round(Math.ceil(principal/threshold)*unit*100)/100;
 }
 function sarrafFeeField(kind){
  const p='v13-'+kind;
  let input=$(p+'-sarraf-fee');
  if(!input&&kind==='in'){
   const parent=document.createElement('div');parent.className='field v21-sarraf-fee v23-peer-fee';
   parent.innerHTML=`<label for="${p}-sarraf-fee">مفاد صراف (حساب درک)</label><input type="text" inputmode="decimal" id="${p}-sarraf-fee" value="0" readonly aria-describedby="v23-in-peer-info"/><small id="v23-in-peer-info">فقط برای طریقهٔ درک فعال می‌شود.</small>`;
   $('v13-in-form')?.querySelector('.v22-secondary')?.insertBefore(parent,$(p+'-number')?.closest('.field'));
   input=$(p+'-sarraf-fee');
  }
  if(!input)return;
  let select=$(p+'-sarraf-fee-currency');
  if(!select){
   const pair=document.createElement('div');pair.className='v23-sarraf-pair';
   const container=input.closest('.field');container.classList.add('v23-sarraf-wrap');
   input.parentNode.insertBefore(pair,input);pair.append(input);
   select=document.createElement('select');select.id=p+'-sarraf-fee-currency';
   select.setAttribute('aria-label','ارز مفاد صراف');select.className='v23-sarraf-currency';
   pair.append(select);
  }
  const all=allCurrencies(),chosen=select.value||$(p+'-converted-currency')?.value||'AFN';
  select.replaceChildren(...all.map(c=>{const opt=document.createElement('option');opt.value=opt.textContent=c;return opt}));
  select.value=all.includes(chosen)?chosen:(all.includes('AFN')?'AFN':all[0]);
  if(kind==='in'){
   input.readOnly=true;
   input.setAttribute('aria-label','مفاد صراف به نفع حساب درک؛ محاسبهٔ خودکار');
  }else if(!input.dataset.v23Track){
   input.dataset.v23Track='1';input.addEventListener('input',()=>{input.dataset.v23Manual='1'});
  }
 }
 function inFee(recalculate=false){
  const input=$('v13-in-sarraf-fee'),select=$('v13-in-sarraf-fee-currency');if(!input||!select)return;
  const mode=document.querySelector('input[name="v13-in-mode"]:checked')?.value;
  const peer=$('v13-in-darak')?.value.trim()||'',from=$('v13-in-account')?.value.trim();
  const active=mode==='darak'&&peer&&peer!==from&&C.accounts.some(a=>a.name===peer);
  const container=input.closest('.field');container.classList.toggle('v23-fee-disabled',!active);
  input.disabled=!active;select.disabled=!active;
  if(!active){input.value='0';return}
  // Preserve the stored commission during edit. Recalculate only after an actual
  // change by the cashier; previous documents must not be silently modified.
  if(C.state.hwEdit&&!recalculate)return;
  const targetCurrency=$('v13-in-converted-currency')?.value||'AFN';
  if(recalculate||!select.value)select.value=targetCurrency;
  const base=raw($('v13-in-converted')?.value);
  input.value=format(commissionRule(peer,select.value,base));
 }
 function outFee(recalculate=false){
  const input=$('v13-out-sarraf-fee'),select=$('v13-out-sarraf-fee-currency');if(!input||!select)return;
  if(!recalculate||input.dataset.v23Manual==='1'||C.state.hwEdit)return;
  const account=$('v13-out-account')?.value.trim(),base=raw($('v13-out-converted')?.value);
  if(!account)return;
  input.value=format(commissionRule(account,select.value,base));
 }
 function initFees(){
  for(const kind of ['in','out'])sarrafFeeField(kind);
  const secondary=$('v13-out-form')?.querySelector('.v22-secondary');
  const fee=secondary?.querySelector('.v22-fee-pair'),sarraf=field('v13-out-sarraf-fee');
  if(secondary&&fee&&sarraf)secondary.insertBefore(sarraf,fee);
  inFee(false);
  // Fees are recalculated from the rule on peer, currency or amount changes.
  for(const id of ['v13-in-darak','v13-in-converted','v13-in-converted-currency','v13-in-amount','v13-in-rate','v13-in-operation','v13-in-currency','v13-in-sarraf-fee-currency']){
   const el=$(id);if(!el||el.dataset.v23FeeBound)continue;el.dataset.v23FeeBound='1';
   for(const type of ['input','change'])el.addEventListener(type,()=>inFee(true));
  }
  for(const id of ['v13-out-account','v13-out-converted','v13-out-converted-currency']){
   const el=$(id);if(!el||el.dataset.v23FeeBound)continue;el.dataset.v23FeeBound='1';
   for(const type of ['input','change'])el.addEventListener(type,()=>outFee(true));
  }
  for(const kind of ['in','out']){
   const el=$('v13-'+kind+'-sarraf-fee-currency');if(!el||el.dataset.v23FeeBound)continue;
   el.dataset.v23FeeBound='1';el.addEventListener('change',()=>kind==='in'?inFee(true):outFee(true));
   $('v13-'+kind+'-form')?.addEventListener('reset',()=>{
    setTimeout(()=>{if(kind==='in')inFee(false);else if($('v13-out-sarraf-fee'))$('v13-out-sarraf-fee').dataset.v23Manual='0'},50);
   });
  }
  document.addEventListener('change',event=>{
   if(event.target?.name==='v13-in-mode')inFee(true);
  });
 }
 function sync(){updateVersion();syncJournalCurrency();inFee(false)}
 function init(){journalLayout();initFees();sync();
  // A voucher edit can set the saved method programmatically, without firing a change event.
  const oldEdit=C.editLedgerRecord;C.editLedgerRecord=id=>{const result=oldEdit(id);setTimeout(()=>{inFee(false);if($('editId')?.value){const role=$('gotAmount')?.value?'got':'talab';const picker=$('v23-'+role+'-currency');if(picker)picker.value=$('currency').value;}},0);return result};
  document.addEventListener('click',e=>{if(e.target.closest('[data-v13-edit],[data-v16-voucher],[data-v16-report-open],[data-v17-voucher-edit]'))setTimeout(()=>inFee(false),45)});
  const prevAfter=C.onAfterRender,prevPage=C.onPage;
  C.onAfterRender=()=>{prevAfter?.();sync()};
  C.onPage=page=>{prevPage?.(page);sync()};
  document.addEventListener('click',e=>{if(e.target.closest('#currencyList [data-cur]'))syncJournalCurrency()});
  window.MC23={VERSION,commissionRule,syncJournalCurrency,inFee};
 }
 try{init()}catch(e){console.error('دفتر حسابات ۲۳:',e)}
})();
