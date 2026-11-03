/* Last-section memory: no duplicate scroll listener and no URL rewrites during scrolling. */
(()=>{
  'use strict';
  const KEY='onel1t-home-last-section';
  const ids=new Set(
    [...document.querySelectorAll('.nav a[href^="#"],.rail nav a[href^="#"]')]
      .map(a=>a.getAttribute('href').slice(1))
  );
  let lastSaved='';
  const remember=id=>{
    if(!ids.has(id)||id===lastSaved)return;
    lastSaved=id;
    try{localStorage.setItem(KEY,id)}catch(_){}
  };
  document.addEventListener('onel1t-section-change',e=>remember(e.detail?.id));
  const hash=decodeURIComponent(location.hash.slice(1));
  let previous='';
  try{previous=localStorage.getItem(KEY)||''}catch(_){}
  const target=ids.has(hash)?hash:(ids.has(previous)?previous:'');
  /* Explicit links already have native browser hash navigation. */
  if(target&&!ids.has(hash)){
    const restore=()=>{
      const el=document.getElementById(target);
      if(el)requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:'instant'}));
    };
    if(document.readyState==='complete')restore();
    else window.addEventListener('load',restore,{once:true});
  }
})();
