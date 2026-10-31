(()=>{
  'use strict';
  const KEY='onel1t-aegis-last-view';
  const views=['overview','incidents','assets','risk','playbooks','reports'];
  const valid=v=>views.includes(v);
  const readSaved=()=>{try{return localStorage.getItem(KEY)||''}catch(_){return''}};
  const save=v=>{if(!valid(v))return;try{localStorage.setItem(KEY,v)}catch(_){};const u=new URL(location.href);u.hash=v;history.replaceState(history.state,'',u)};
  const requested=()=>{const h=location.hash.replace(/^#/,'').toLowerCase();return valid(h)?h:(valid(readSaved())?readSaved():'overview')};
  const open=v=>{
    if(!valid(v))return;
    const btn=document.querySelector(`.side-nav button[data-view="${v}"]`);
    if(btn&&!btn.classList.contains('active'))btn.click();
    save(v);
  };

  document.addEventListener('click',e=>{
    const nav=e.target.closest('.side-nav button[data-view]');
    if(nav){save(nav.dataset.view);return;}
    const jump=e.target.closest('[data-jump],[data-aegis-jump]');
    if(jump){const v=jump.dataset.jump||jump.dataset.aegisJump;if(valid(v))setTimeout(()=>save(v),0);}
  });

  window.addEventListener('hashchange',()=>{
    const h=location.hash.replace(/^#/,'').toLowerCase();
    if(valid(h))open(h);
  });

  requestAnimationFrame(()=>requestAnimationFrame(()=>open(requested())));
})();
