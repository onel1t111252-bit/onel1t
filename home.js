(()=>{
  const version='smooth-sections-20261029-2';
  const addIcon=(rel,href,type)=>{
    let link=document.querySelector(`link[rel="${rel}"]`);
    if(!link){link=document.createElement('link');link.rel=rel;document.head.appendChild(link);}
    if(type)link.type=type;
    link.href=`${href}?v=${version}`;
  };
  addIcon('icon','./favicon.png','image/png');
  addIcon('shortcut icon','./favicon.ico','image/x-icon');
  addIcon('apple-touch-icon','./favicon.png','image/png');

  // Project covers shared by EN / UA / CZ homepages.
  const projectCards=document.querySelectorAll('#projects .pgrid .pc');
  const cyberImg=projectCards[0]?.querySelector('.pi-img img');
  const nexusImg=projectCards[1]?.querySelector('.pi-img img');
  if(cyberImg) cyberImg.src='1793298041137.jpg';
  if(nexusImg) nexusImg.src='1793298027511.jpg';

  const core=document.createElement('script');
  core.src=`./home-core.js?v=${version}`;
  core.async=false;
  document.head.appendChild(core);
})();
