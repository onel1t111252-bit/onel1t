(()=>{
  const version='premium-20261030-1';
  const addIcon=(rel,href,type)=>{
    let link=document.querySelector(`link[rel="${rel}"]`);
    if(!link){link=document.createElement('link');link.rel=rel;document.head.appendChild(link);}
    if(type)link.type=type;
    link.href=`${href}?v=${version}`;
  };
  addIcon('icon','./favicon.png','image/png');
  addIcon('shortcut icon','./favicon.ico','image/x-icon');
  addIcon('apple-touch-icon','./favicon.png','image/png');

  const premiumCss=document.createElement('link');
  premiumCss.rel='stylesheet';
  premiumCss.href=`./home-premium.css?v=${version}`;
  document.head.appendChild(premiumCss);

  const projectCards=document.querySelectorAll('#projects .pgrid .pc');
  const cyberImg=projectCards[0]?.querySelector('.pi-img img');
  const nexusImg=projectCards[1]?.querySelector('.pi-img img');
  if(cyberImg) cyberImg.src='assets/optimized/cyber-lab-cover.webp';
  if(nexusImg) nexusImg.src='assets/optimized/nexus-cover.webp';

  const core=document.createElement('script');
  core.src=`./home-core.js?v=${version}`;
  core.async=false;
  core.onload=()=>{
    const premium=document.createElement('script');
    premium.src=`./home-premium.js?v=${version}`;
    premium.async=false;
    document.head.appendChild(premium);
  };
  document.head.appendChild(core);
})();
