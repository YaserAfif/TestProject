/* دفتر حسابات 24 — desktop icon sidebar, independent currency state, stable version. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),C=window.MC14;
 const VERSION='24.0.0';if(!C)return;
 function version(){if($('appVersion'))$('appVersion').textContent=VERSION;
  const header=$('v14-appbar')?.querySelector('.v14-version');if(header)header.textContent='نسخه ۲۴';
  document.querySelectorAll('#licenseOverlay h2 span').forEach(x=>{if(x.textContent.includes('نسخه'))x.textContent='نسخهٔ ۲۴'});
 }
 function sidebar(){const side=$('v14-sidebar');if(!side)return;
  for(const button of side.querySelectorAll('[data-v14-page]')){
   if(button.dataset.v24Nav)continue;button.dataset.v24Nav='1';
   const icon=button.querySelector('span');if(icon)icon.classList.add('v24-nav-icon');
   const text=[...button.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();
   for(const node of [...button.childNodes])if(node.nodeType===3)node.remove();
   const name=document.createElement('span');name.className='v24-nav-text';name.textContent=text;button.append(name);
   button.setAttribute('aria-label',text);button.title=text;
  }
  let toggle=$('v24-sidebar-toggle');if(!toggle){
   toggle=document.createElement('button');toggle.type='button';toggle.id='v24-sidebar-toggle';
   toggle.className='v24-sidebar-toggle';toggle.setAttribute('aria-controls','v14-sidebar');
   toggle.innerHTML='<span class="v24-sidebar-toggle-icon" aria-hidden="true">☰</span><span class="v24-sidebar-toggle-text">بستن فهرست</span>';
   side.prepend(toggle);
  }
  let stored=false;try{stored=localStorage.getItem('daftar.v24.sidebar-collapsed')==='1'}catch(e){}
  function draw(closed){document.body.classList.toggle('v24-sidebar-collapsed',closed);
   toggle.setAttribute('aria-expanded',String(!closed));toggle.setAttribute('aria-label',closed?'باز کردن فهرست':'بستن فهرست');
   toggle.title=closed?'باز کردن فهرست':'بستن فهرست';
   toggle.querySelector('.v24-sidebar-toggle-icon').textContent=closed?'☰':'❯';
   toggle.querySelector('.v24-sidebar-toggle-text').textContent=closed?'باز کردن فهرست':'بستن فهرست';
  }
  draw(stored);
  toggle.addEventListener('click',()=>{const closed=!document.body.classList.contains('v24-sidebar-collapsed');draw(closed);
   try{localStorage.setItem('daftar.v24.sidebar-collapsed',closed?'1':'0')}catch(e){}
  });
 }
 function journal(){const got=$('v23-got-currency'),talab=$('v23-talab-currency');if(!got||!talab)return;
  const update=()=>{const role=$('gotAmount').value?'got':$('talabAmount').value?'talab':null;
   if(role){const select=$('v23-'+role+'-currency');if(select)$('currency').value=select.value;}
  };
  // On initial selection and before saving, the currency of the filled field is used.
  $('entryForm')?.addEventListener('submit',update,true);
  for(const id of ['gotAmount','talabAmount'])$(id)?.addEventListener('input',update);
  // Normalizing saved journal edit can change the single hidden currency synchronously.
  document.addEventListener('click',e=>{if(e.target.closest('[data-edit],[data-v13-edit]'))setTimeout(()=>{
   if(!$('editId')?.value)return;const role=$('gotAmount').value?'got':'talab';
   const sel=$('v23-'+role+'-currency');if(sel)sel.value=$('currency').value;
  },0)});
 }
 function init(){sidebar();journal();version();const before=C.onAfterRender,oldPage=C.onPage;
  C.onAfterRender=()=>{before?.();version()};C.onPage=p=>{oldPage?.(p);version()};
  window.MC24={VERSION};
 }
 try{init()}catch(e){console.error('دفتر حسابات ۲۴:',e)}
})();
