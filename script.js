(()=>{
  const start=()=>{
    // Clean up the visuals: remove the empty project image areas and the old hero character art.
    if(!document.getElementById('clean-layout-overrides')){
      const cleanup=document.createElement('style');
      cleanup.id='clean-layout-overrides';
      cleanup.textContent=`
        #projects .project-visual{display:none!important}
        #projects .project-card{min-height:0!important}
        #projects .project-copy{padding:26px!important}
        #projects .project-index{position:static!important;margin:0 0 18px 0!important;width:42px!important;height:42px!important}
        #projects .project-card{padding-top:20px!important}
        .hero-bg{display:none!important}
        .hero{background:
          radial-gradient(circle at 77% 23%,rgba(215,25,41,.24),transparent 18%),
          radial-gradient(circle at 82% 28%,rgba(115,4,15,.20),transparent 32%),
          linear-gradient(115deg,#050506 0%,#08070a 48%,#14070a 76%,#050506 100%)!important
        }
        .hero:before{background:
          linear-gradient(90deg,rgba(5,5,6,.95) 0%,rgba(5,5,6,.72) 32%,rgba(5,5,6,.18) 68%,rgba(5,5,6,.48) 100%),
          repeating-linear-gradient(115deg,transparent 0 62px,rgba(215,25,41,.035) 63px 64px)!important
        }
        @media(max-width:980px){#projects .project-card{padding-top:14px!important}}
      `;
      document.head.appendChild(cleanup);
    }

    const hero=document.querySelector('.hero');
    if(hero&&!hero.querySelector('.ember-field')){
      const field=document.createElement('div');
      field.className='ember-field';
      for(let i=0;i<20;i++){
        const ember=document.createElement('span');
        ember.className='ember';
        ember.style.setProperty('--x',`${8+Math.random()*88}%`);
        ember.style.setProperty('--y',`${25+Math.random()*70}%`);
        ember.style.setProperty('--d',`${5+Math.random()*7}s`);
        ember.style.setProperty('--delay',`${-Math.random()*9}s`);
        field.appendChild(ember);
      }
      hero.appendChild(field);
    }

    const revealItems=[...document.querySelectorAll('.reveal')];
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },{threshold:.1,rootMargin:'0px 0px -5% 0px'});
      revealItems.forEach(item=>observer.observe(item));
    }else{
      revealItems.forEach(item=>item.classList.add('visible'));
    }

    const nav=document.querySelector('.nav');
    const menuToggle=document.querySelector('.menu-toggle');
    if(nav&&menuToggle){
      menuToggle.addEventListener('click',()=>{
        const open=nav.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded',String(open));
        menuToggle.textContent=open?'✕':'☰';
      });
      nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded','false');
        menuToggle.textContent='☰';
      }));
    }

    const sectionIds=['home','about','skills','projects','experience','contact'];
    const sections=sectionIds.map(id=>document.getElementById(id)).filter(Boolean);
    const navLinks=[...document.querySelectorAll('.nav a[href^="#"]')];
    const setActive=()=>{
      const y=window.scrollY+140;
      let current='home';
      sections.forEach(section=>{if(section.offsetTop<=y)current=section.id;});
      navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${current}`));
    };
    window.addEventListener('scroll',setActive,{passive:true});
    setActive();

    const year=document.getElementById('year');
    if(year)year.textContent=new Date().getFullYear();

    const copyButton=document.getElementById('copy-handle');
    const copyStatus=document.getElementById('copy-status');
    if(copyButton){
      copyButton.addEventListener('click',async()=>{
        const text='@onel1t';
        const uk=document.documentElement.lang==='uk';
        try{
          await navigator.clipboard.writeText(text);
          if(copyStatus)copyStatus.textContent=uk?'Нікнейм скопійовано: @onel1t':'Handle copied: @onel1t';
        }catch{
          if(copyStatus)copyStatus.textContent=uk?'Скопіюй вручну: @onel1t':'Copy manually: @onel1t';
        }
      });
    }

    document.querySelectorAll('.project-card').forEach(card=>{
      card.addEventListener('pointermove',event=>{
        if(!window.matchMedia('(pointer:fine)').matches)return;
        const rect=card.getBoundingClientRect();
        const rx=((event.clientY-rect.top)/rect.height-.5)*-3;
        const ry=((event.clientX-rect.left)/rect.width-.5)*4;
        card.style.transform=`translateY(-5px) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('pointerleave',()=>{card.style.transform='';});
    });
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();