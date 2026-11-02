(()=>{
  const version='site-audit-20261102-performance1';
  const root=document.documentElement;

  /* Adaptive performance mode: preserve layout, reduce only expensive effects on weaker devices. */
  const memory=Number(navigator.deviceMemory||8);
  const cores=Number(navigator.hardwareConcurrency||8);
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(memory<=4||cores<=4||reduceMotion)root.classList.add('perf-lite');
  const syncVisibility=()=>root.classList.toggle('perf-hidden',document.hidden);
  document.addEventListener('visibilitychange',syncVisibility,{passive:true});
  syncVisibility();

  const addIcon=(rel,href,type)=>{
    let link=document.querySelector(`link[rel="${rel}"]`);
    if(!link){link=document.createElement('link');link.rel=rel;document.head.appendChild(link);}
    if(type)link.type=type;
    link.href=`${href}?v=${version}`;
  };

  const addCss=href=>{
    if(document.querySelector(`link[data-home-css="${href}"]`))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=`${href}?v=${version}`;
    link.dataset.homeCss=href;
    document.head.appendChild(link);
  };

  addIcon('icon','./favicon.png','image/png');
  addIcon('shortcut icon','./favicon.ico','image/x-icon');
  addIcon('apple-touch-icon','./favicon.png','image/png');

  [
    './home-premium.css',
    './home-10.css',
    './home-10-fix.css',
    './home-11.css',
    './home-11-fix.css',
    './home-12.css',
    './home-13.css',
    './home-14.css',
    './home-15.css',
    './home-ui-stability.css',
    './home-performance.css'
  ].forEach(addCss);

  const projectCards=document.querySelectorAll('#projects .pgrid .pc');
  const cyberImg=projectCards[0]?.querySelector('.pi-img img');
  const nexusImg=projectCards[1]?.querySelector('.pi-img img');
  if(cyberImg)cyberImg.src='assets/optimized/cyber-lab-cover.webp?v=green-20261031-1';
  if(nexusImg)nexusImg.src='assets/optimized/nexus-cover.webp';

  /* Insert all scripts immediately with async=false: browsers can fetch them in parallel
     while still executing them in the required order. This replaces the old serial
     onload chain that caused visible layout changes and slower startup. */
  const scripts=[
    './home-core.js',
    './home-premium.js',
    './home-10.js',
    './home-11.js',
    './home-12.js',
    './home-13.js',
    './home-14.js',
    './home-15.js',
    './home-position-persistence.js',
    './home-ui-stability.js'
  ];

  scripts.forEach((src,index)=>{
    const s=document.createElement('script');
    s.async=false;
    s.src=`${src}?v=${version}`;
    if(index===scripts.length-1){
      s.addEventListener('load',()=>root.classList.add('home-enhancements-ready'),{once:true});
    }
    document.head.appendChild(s);
  });
})();
