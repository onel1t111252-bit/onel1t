(()=>{
  'use strict';

  const COPY={
    en:{label:'← Back to portfolio',aria:'Back to ONEL1T portfolio',href:'../../index.html'},
    uk:{label:'← Головний сайт',aria:'Повернутися на головний сайт ONEL1T',href:'../../index-uk.html'},
    cs:{label:'← Hlavní stránka',aria:'Zpět na hlavní stránku ONEL1T',href:'../../index-cz.html'}
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

  function syncPortfolioNavigation(){
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

    link.href=copy.href;
    link.textContent=copy.label;
    link.setAttribute('aria-label',copy.aria);
    link.setAttribute('title',copy.label.replace(/^←\s*/,''));

    const brand=document.querySelector('.brand');
    if(brand) brand.href=copy.href;
    const footer=document.querySelector('.sidebar-footer a[data-i18n="portfolio"]');
    if(footer) footer.href=copy.href;
  }

  document.addEventListener('DOMContentLoaded',syncPortfolioNavigation);
  document.addEventListener('click',event=>{
    if(event.target.closest('.lang-switch [data-lang]')) setTimeout(syncPortfolioNavigation,0);
  });
  setTimeout(syncPortfolioNavigation,0);
})();
