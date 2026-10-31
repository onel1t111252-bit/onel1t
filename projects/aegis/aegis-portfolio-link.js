/* ONEL1T AEGIS — localized project-home + portfolio navigation */
(()=>{
  'use strict';

  const COPY={
    en:{project:'← AEGIS home',projectAria:'Back to AEGIS overview',portfolio:'Portfolio ↗',portfolioFooter:'← Portfolio',portfolioAria:'Back to ONEL1T portfolio',portfolioHref:'../../index.html#home'},
    uk:{project:'← Головна AEGIS',projectAria:'Повернутися на головну AEGIS',portfolio:'Портфоліо ↗',portfolioFooter:'← Портфоліо',portfolioAria:'Повернутися до портфоліо ONEL1T',portfolioHref:'../../index-uk.html#home'},
    cs:{project:'← Hlavní AEGIS',projectAria:'Zpět na hlavní stránku AEGIS',portfolio:'Portfolio ↗',portfolioFooter:'← Portfolio',portfolioAria:'Zpět na portfolio ONEL1T',portfolioHref:'../../index-cz.html#home'}
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

    let projectLink=actions.querySelector('.aegis-project-home-link');
    if(!projectLink){
      projectLink=document.createElement('a');
      projectLink.className='aegis-portfolio-link aegis-project-home-link';
      const switcher=actions.querySelector('.lang-switch');
      actions.insertBefore(projectLink,switcher||actions.firstChild);
    }
    projectLink.href='#overview';
    projectLink.textContent=copy.project;
    projectLink.setAttribute('aria-label',copy.projectAria);
    projectLink.setAttribute('title',copy.project.replace(/^←\s*/,''));
    projectLink.onclick=openOverview;

    let portfolioLink=actions.querySelector('.aegis-main-site-link');
    if(!portfolioLink){
      portfolioLink=document.createElement('a');
      portfolioLink.className='aegis-main-site-link ghost';
      const switcher=actions.querySelector('.lang-switch');
      actions.insertBefore(portfolioLink,switcher||actions.firstChild);
    }
    portfolioLink.href=copy.portfolioHref;
    portfolioLink.textContent=copy.portfolio;
    portfolioLink.setAttribute('aria-label',copy.portfolioAria);
    portfolioLink.setAttribute('title',copy.portfolio.replace(/\s*↗$/,''));
    portfolioLink.style.setProperty('display','inline-flex','important');
    portfolioLink.style.setProperty('align-items','center','important');
    portfolioLink.style.setProperty('justify-content','center','important');
    portfolioLink.style.setProperty('text-decoration','none','important');

    const brand=document.querySelector('.brand');
    if(brand){brand.href=copy.portfolioHref;brand.setAttribute('aria-label',copy.portfolioAria);}
    const footer=document.querySelector('.sidebar-footer a[data-i18n="portfolio"]');
    if(footer){footer.href=copy.portfolioHref;footer.textContent=copy.portfolioFooter;footer.setAttribute('aria-label',copy.portfolioAria);}
  }

  document.addEventListener('DOMContentLoaded',syncNavigation);
  document.addEventListener('click',event=>{
    if(event.target.closest('.lang-switch [data-lang]')) setTimeout(syncNavigation,0);
  });
  setTimeout(syncNavigation,0);
})();
