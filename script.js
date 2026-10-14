(()=>{
  const start=()=>{
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

    const bg=document.querySelector('.hero-bg');
    if(hero&&bg&&window.matchMedia('(pointer:fine)').matches){
      hero.addEventListener('pointermove',event=>{
        const rect=hero.getBoundingClientRect();
        const x=(event.clientX-rect.left)/rect.width-.5;
        const y=(event.clientY-rect.top)/rect.height-.5;
        bg.style.transform=`scale(1.035) translate3d(${x*-10}px,${y*-6}px,0)`;
      });
      hero.addEventListener('pointerleave',()=>{bg.style.transform='scale(1.02) translate3d(0,0,0)';});
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