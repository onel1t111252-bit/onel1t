(()=>{
  const version='aegis-localization-20261030-3';
  const addIcon=(rel,href,type)=>{
    let link=document.querySelector(`link[rel="${rel}"]`);
    if(!link){link=document.createElement('link');link.rel=rel;document.head.appendChild(link);}
    if(type)link.type=type;
    link.href=`${href}?v=${version}`;
  };
  const addCss=(href)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=`${href}?v=${version}`;document.head.appendChild(link);};
  addIcon('icon','./favicon.png','image/png');
  addIcon('shortcut icon','./favicon.ico','image/x-icon');
  addIcon('apple-touch-icon','./favicon.png','image/png');

  addCss('./home-premium.css');
  addCss('./home-10.css');
  addCss('./home-10-fix.css');
  addCss('./home-11.css');
  addCss('./home-11-fix.css');
  addCss('./home-12.css');
  addCss('./home-13.css');
  addCss('./home-14.css');
  addCss('./home-15.css');

  const projectCards=document.querySelectorAll('#projects .pgrid .pc');
  const cyberImg=projectCards[0]?.querySelector('.pi-img img');
  const nexusImg=projectCards[1]?.querySelector('.pi-img img');
  if(cyberImg) cyberImg.src='assets/optimized/cyber-lab-cover.webp';
  if(nexusImg) nexusImg.src='assets/optimized/nexus-cover.webp';

  const loadScript=(src,onload)=>{const s=document.createElement('script');s.src=`${src}?v=${version}`;s.async=false;if(onload)s.onload=onload;document.head.appendChild(s);};
  loadScript('./home-core.js',()=>{
    loadScript('./home-premium.js',()=>{
      loadScript('./home-10.js',()=>{
        loadScript('./home-11.js',()=>{
          loadScript('./home-12.js',()=>{
            loadScript('./home-13.js',()=>{
              loadScript('./home-14.js',()=>{
                loadScript('./home-15.js');
              });
            });
          });
        });
      });
    });
  });
})();