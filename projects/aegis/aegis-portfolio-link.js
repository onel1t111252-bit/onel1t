/* ONEL1T AEGIS — localized project-home + portfolio navigation */
(()=>{
  'use strict';

  const COPY={
    en:{project:'← AEGIS home',projectAria:'Back to AEGIS overview',portfolio:'← Portfolio',portfolioAria:'Back to ONEL1T portfolio',portfolioHref:'../../index.html'},
    uk:{project:'← Головна AEGIS',projectAria:'Повернутися на головну AEGIS',portfolio:'← Портфоліо',portfolioAria:'Повернутися до портфоліо ONEL1T',portfolioHref:'../../index-uk.html'},
    cs:{project:'← Hlavní AEGIS',projectAria:'Zpět na hlavní stránku AEGIS',portfolio:'← Portfolio',portfolioAria:'Zpět na portfolio ONEL1T',portfolioHref:'../../index-cz.html'}
  };

  function currentLanguage(){
    const active=document.querySelector('.lang-switch [data-lang].active');
    if(active&&COPY[active.dataset.lang]) return active.dataset.lang;
    try{
      const saved=JSON.parse(localStorage.getItem('onel1t-aegis-state-v2')||'null');
      if(saved&&COPY[saved.language]) return saved.language;
    }catch{}
    const requested=new URLSearchParams(location.search).get('lang');
    if(requested==='cz') return 'cs';
    if(COPY[requested]) return requested;
    return 'en';
  }

  function openOverview(event){
    if(event) event.preventDefault();
    const btn=document.querySelector('.side-nav button[data-view="overview"]');
    if(btn) btn.click();
    try{localStorage.setItem('onel1t-aegis-last-view','overview')}catch{}
    const u=new URL(location.href);u.hash='overview';history.replaceState(history.state,'',u);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function syncNavigation(){
    const lang=currentLanguage();
    const copy=COPY[lang]||COPY.en;
    const actions=document.querySelector('.top-actions');
    if(!actions) return;

    let link=actions.querySelector('.aegis-portfolio-link');
    if(!link){
      link=document.createElement('a');
      link.className='aegis-portfolio-link';
      const switcher=actions.querySelector('.lang-switch');
      actions.insertBefore(link,switcher||actions.firstChild);
    }

    link.href='#overview';
    link.textContent=copy.project;
    link.setAttribute('aria-label',copy.projectAria);
    link.setAttribute('title',copy.project.replace(/^←\s*/,''));
    link.onclick=openOverview;

    const brand=document.querySelector('.brand');
    if(brand){brand.href=copy.portfolioHref;brand.setAttribute('aria-label',copy.portfolioAria);}
    const footer=document.querySelector('.sidebar-footer a[data-i18n="portfolio"]');
    if(footer){footer.href=copy.portfolioHref;footer.textContent=copy.portfolio;footer.setAttribute('aria-label',copy.portfolioAria);}
  }

  document.addEventListener('DOMContentLoaded',syncNavigation);
  document.addEventListener('click',event=>{
    if(event.target.closest('.lang-switch [data-lang]')) setTimeout(syncNavigation,0);
  });
  setTimeout(syncNavigation,0);
})();
