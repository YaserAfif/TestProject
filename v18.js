/* دفتر حسابات ۱۸ — accessible account pinning, Persian-calendar picker, focused account and voucher views. */
(()=>{'use strict';
const $=id=>document.getElementById(id),C=window.MC14;if(!C)return;
const version='18.0.0', pins=new Map();
function setVersion(){document.title='دفتر حسابات — نسخه ۱۸';if($('appVersion'))$('appVersion').textContent=version;document.querySelectorAll('.v14-version').forEach(el=>el.textContent='نسخه ۱۸');const license=$('licenseOverlay')?.querySelector('h2 span');if(license)license.textContent='نسخهٔ ۱۸'}
function pinInput(id,formId){const input=$(id),form=$(formId);if(!input||!form||pins.has(id))return;
 const btn=document.createElement('button');btn.type='button';btn.className='v18-pin';btn.textContent='📌';btn.title='حفظ حساب انتخاب‌شده';btn.setAttribute('aria-pressed','false');input.insertAdjacentElement('afterend',btn);
 const pin={enabled:false,value:''};pins.set(id,pin);
 btn.onclick=()=>{pin.enabled=!pin.enabled;pin.value=input.value;btn.setAttribute('aria-pressed',String(pin.enabled));btn.title=pin.enabled?'حساب سنجاق است؛ می‌توانید حساب دیگری انتخاب کنید':'سنجاق حساب'};
 input.addEventListener('change',()=>{if(pin.enabled)pin.value=input.value});
 form.addEventListener('submit',()=>{if(!pin.enabled)return;pin.value=input.value;setTimeout(()=>{if(pin.enabled&&pin.value){input.value=pin.value;input.dispatchEvent(new Event('change',{bubbles:true}));if(id==='name'){const combo=input.parentElement?.querySelector('.account-combobox .account-search');if(combo)combo.value=pin.value}}},70)});
}
const persianFmt=new Intl.DateTimeFormat('en-US-u-ca-persian',{year:'numeric',month:'numeric',day:'numeric'});
function persianParts(iso){const d=new Date(iso+'T12:00:00');if(Number.isNaN(+d))return null;const m={};for(const x of persianFmt.formatToParts(d)){if(['year','month','day'].includes(x.type))m[x.type]=Number(x.value)}return m}
const isoDate=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
function persianToISO(year,month,day){const start=new Date(year+620,0,1,12);for(let i=0;i<780;i++){const d=new Date(start.getTime()+i*86400000),parts=persianParts(isoDate(d));if(parts?.year===year&&parts.month===month&&parts.day===day)return isoDate(d)}return null}
const months=['حمل','ثور','جوزا','سرطان','اسد','سنبله','میزان','عقرب','قوس','جدی','دلو','حوت'];
function datePicker(input){if(!input||input.dataset.v18Date)return;input.dataset.v18Date='1';const parts=persianParts(input.value||isoDate(new Date()));if(!parts)return;
 const wrap=document.createElement('div');wrap.className='v18-date-picker';wrap.setAttribute('aria-label','انتخاب تاریخ هجری شمسی');
 const year=document.createElement('select'),month=document.createElement('select'),day=document.createElement('select');year.title='سال هجری شمسی';month.title='ماه هجری شمسی';day.title='روز هجری شمسی';
 for(let y=parts.year-70;y<=parts.year+30;y++)year.add(new Option(String(y),String(y)));
 months.forEach((m,i)=>month.add(new Option(m,String(i+1))));for(let d=1;d<=31;d++)day.add(new Option(String(d),String(d)));
 const update=()=>{const iso=persianToISO(+year.value,+month.value,+day.value);if(!iso){day.setCustomValidity('روز انتخاب‌شده در این ماه وجود ندارد');return}day.setCustomValidity('');input.value=iso;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))};
 for(const el of [year,month,day])el.addEventListener('change',update);
 const sync=()=>{const p=persianParts(input.value);if(p){year.value=String(p.year);month.value=String(p.month);day.value=String(p.day)}};
 wrap.append(year,month,day);input.insertAdjacentElement('afterend',wrap);input.classList.add('v18-original-date');input.addEventListener('change',sync);sync();
}
function dateInputs(){document.querySelectorAll('input[type=date]').forEach(datePicker)}
function accountUX(){const page=$('page-accounts');if(!page)return;
 const hint=page.querySelectorAll('p,small,div,section');for(const el of hint){if(el.children.length===0&&/پرداخت کامل یا قسمی با انتقال دقیق از/.test(el.textContent||''))el.remove()}
 page.addEventListener('click',e=>{const open=e.target.closest('[data-open-account]');if(open){const detail=$('v13-detail');if(detail){detail.classList.add('v18-account-sheet');setTimeout(()=>detail.scrollIntoView({block:'start',behavior:'smooth'}),25)}}
 const voucher=e.target.closest('[data-v16-voucher],[data-v15-view]');if(voucher){const id=voucher.dataset.v16Voucher||voucher.dataset.v15View;setTimeout(()=>{if(window.MC15?.openVoucher&&id)window.MC15.openVoucher(id)},10)}
 });
 const search=$('v13-account-search');if(search){search.addEventListener('input',()=>{const q=search.value.trim().toLocaleLowerCase('fa').replace(/[يى]/g,'ی').replace(/ك/g,'ک');document.querySelectorAll('#v13-account-list [data-open-account]').forEach(row=>{const text=row.textContent.toLocaleLowerCase('fa').replace(/[يى]/g,'ی').replace(/ك/g,'ک');row.hidden=!text.includes(q)})})}
}
function simplifyForms(){for(const kind of ['in','out']){const p='v13-'+kind;const form=$(p+'-form');if(!form)continue;const source=$(p+'-source');if(source){source.closest('.field')?.setAttribute('hidden','');source.disabled=true}form.querySelectorAll('label').forEach(el=>{if(/اعمال مفاد پیش.?فرض/.test(el.textContent||'')){el.hidden=true;el.querySelectorAll('input').forEach(x=>x.disabled=true)}})}}
function documentUX(){document.addEventListener('click',e=>{const row=e.target.closest('#v13-detail-body tr,#v16-account-vouchers tbody tr');if(!row||e.target.closest('button,a,input,select'))return;const button=row.querySelector('[data-v15-view],[data-v16-voucher]');if(button)button.click()});}
function initialize(){setVersion();pinInput('name','entryForm');pinInput('exchangeFromAccount','exchangeForm');for(const kind of ['in','out'])pinInput('v13-'+kind+'-account','v13-'+kind+'-form');dateInputs();accountUX();simplifyForms();documentUX();const original=C.onAfterRender;C.onAfterRender=()=>{original?.();setVersion();dateInputs()};const oldPage=C.onPage;C.onPage=p=>{oldPage?.(p);setVersion();if(p==='hawalaIn'||p==='hawalaOut')simplifyForms();dateInputs()};window.MC18={VERSION:version,persianToISO,persianParts};}
try{initialize()}catch(e){console.error('دفتر حسابات ۱۸:',e)}
})();
