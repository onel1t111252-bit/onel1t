(()=>{
  'use strict';
  const KEY='onel1t-home-last-section';
  const links=[...document.querySelectorAll('.nav a[href^="#"],.rail nav a[href^="#"]')];
  const ids=[...new Set(links.map(a=>a.getAttribute('href')?.slice(1)).filter(Boolean))];
  const sections=ids.map(id=>document.getElementById(id)).filter(Boolean);
  const valid=id=>ids.includes(id);

  let lastSaved='';
  let writeTimer=0;

  const persist=id=>{
    if(!valid(id)||id===lastSaved)return;
    lastSaved=id;
    clearTimeout(writeTimer);
    writeTimer=setTimeout(()=>{
      try{localStorage.setItem(KEY,id)}catch(_){}
      const hash=`#${id}`;
      if(location.hash!==hash){
        try{history.replaceState(history.state,'',hash)}catch(_){}
      }
    },120);
  };

  const saved=()=>{try{return localStorage.getItem(KEY)||''}catch(_){return''}};
  const requested=()=>{
    const h=location.hash.replace(/^#/,'');
    return valid(h)?h:(valid(saved())?saved():'');
  };

  let ticking=false;
  let activeId='';

  const sync=()=>{
    ticking=false;
    if(!sections.length)return;

    const probe=window.scrollY+window.innerHeight*.38;
    let active=sections[0];
    for(const section of sections){
      const top=section.offsetTop;
      if(top<=probe)active=section;else break;
    }
    if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-12){
      active=sections[sections.length-1];
    }

    if(active&&active.id!==activeId){
      activeId=active.id;
      persist(active.id);
    }
  };

  window.addEventListener('scroll',()=>{
    if(!ticking){
      ticking=true;
      requestAnimationFrame(sync);
    }
  },{passive:true});

  links.forEach(a=>a.addEventListener('click',()=>{
    const id=a.getAttribute('href')?.slice(1);
    if(valid(id)){
      activeId=id;
      persist(id);
    }
  }));

  const targetId=requested();
  if(targetId){
    lastSaved=targetId;
    const restore=()=>{
      const target=document.getElementById(targetId);
      if(target){
        activeId=targetId;
        target.scrollIntoView({block:'start',behavior:'auto'});
      }
    };
    if(document.readyState==='complete')requestAnimationFrame(()=>requestAnimationFrame(restore));
    else window.addEventListener('load',()=>requestAnimationFrame(()=>requestAnimationFrame(restore)),{once:true});
  }else{
    requestAnimationFrame(sync);
  }
})();
