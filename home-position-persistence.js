(()=>{
  'use strict';
  const KEY='onel1t-home-last-section';
  const links=[...document.querySelectorAll('.nav a[href^="#"],.rail nav a[href^="#"]')];
  const ids=[...new Set(links.map(a=>a.getAttribute('href')?.slice(1)).filter(Boolean))];
  const sections=ids.map(id=>document.getElementById(id)).filter(Boolean);
  const valid=id=>ids.includes(id);
  const save=id=>{if(!valid(id))return;try{localStorage.setItem(KEY,id)}catch(_){};const u=new URL(location.href);u.hash=id;history.replaceState(history.state,'',u)};
  const saved=()=>{try{return localStorage.getItem(KEY)||''}catch(_){return''}};
  const requested=()=>{const h=location.hash.replace(/^#/,'');return valid(h)?h:(valid(saved())?saved():'')};

  let ticking=false;
  const sync=()=>{
    ticking=false;
    if(!sections.length)return;
    const probe=window.scrollY+window.innerHeight*.38;
    let active=sections[0];
    for(const section of sections){
      const top=section.getBoundingClientRect().top+window.scrollY;
      if(top<=probe)active=section;else break;
    }
    if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-12)active=sections[sections.length-1];
    if(active)save(active.id);
  };
  window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(sync)}},{passive:true});
  links.forEach(a=>a.addEventListener('click',()=>{const id=a.getAttribute('href')?.slice(1);if(valid(id))save(id)}));

  const targetId=requested();
  if(targetId){
    const restore=()=>{const target=document.getElementById(targetId);if(target)target.scrollIntoView({block:'start',behavior:'auto'});save(targetId)};
    if(document.readyState==='complete')requestAnimationFrame(()=>requestAnimationFrame(restore));
    else window.addEventListener('load',()=>requestAnimationFrame(()=>requestAnimationFrame(restore)),{once:true});
  }
})();
