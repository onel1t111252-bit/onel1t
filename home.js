(()=>{
  const version='smooth-sections-20261029-1';
  const addIcon=(rel,href,type)=>{
    let link=document.querySelector(`link[rel="${rel}"]`);
    if(!link){link=document.createElement('link');link.rel=rel;document.head.appendChild(link);}
    if(type)link.type=type;
    link.href=`${href}?v=${version}`;
  };
  addIcon('icon','./favicon.png','image/png');
  addIcon('shortcut icon','./favicon.ico','image/x-icon');
  addIcon('apple-touch-icon','./favicon.png','image/png');
  const core=document.createElement('script');
  core.src=`./home-core.js?v=${version}`;
  core.async=false;
  document.head.appendChild(core);
})();
