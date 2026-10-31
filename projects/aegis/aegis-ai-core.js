(()=>{
  document.body.classList.add('ai-core-theme');

  const hero=document.querySelector('.hero-panel');
  if(hero && !hero.querySelector('.aegis-ai-visual')){
    const visual=document.createElement('div');
    visual.className='aegis-ai-visual';
    visual.setAttribute('aria-hidden','true');
    visual.innerHTML=`
      <div class="ai-core-orb"><span class="ai-core-eye"></span></div>
      <div class="ai-side-copy"><b>AEGIS</b><span>PREDICT</span><span>ANALYZE</span><span>PROTECT</span><span>EVOLVE</span></div>
      <div class="ai-live"><i></i>LIVE</div>
      <div class="ai-floor"></div>`;
    hero.prepend(visual);
  }

  const overview=document.querySelector('[data-view-panel="overview"]');
  const metric=document.querySelector('.metric-grid');
  if(overview && metric && !overview.querySelector('.aegis-quick-access')){
    const quick=document.createElement('section');
    quick.className='aegis-quick-access';
    quick.innerHTML=`
      <div class="aegis-quick-head"><h3>QUICK ACCESS</h3><span>VIEW ALL →</span></div>
      <div class="aegis-quick-grid">
        <article class="aegis-quick-card" data-aegis-jump="incidents"><b>AI ANALYSIS</b><small>Smart threat detection</small><i>→</i></article>
        <article class="aegis-quick-card" data-aegis-jump="risk"><b>SECURITY CORE</b><small>Neural risk processing</small><i>→</i></article>
        <article class="aegis-quick-card" data-aegis-jump="reports"><b>LIVE MONITORING</b><small>Real-time protection</small><i>→</i></article>
      </div>`;
    metric.insertAdjacentElement('afterend',quick);
  }

  document.addEventListener('click',e=>{
    const card=e.target.closest('[data-aegis-jump]');
    if(!card) return;
    const target=card.dataset.aegisJump;
    const btn=document.querySelector(`.side-nav [data-view="${target}"]`);
    if(btn) btn.click();
  });

  const setQuickLabels=()=>{
    const lang=document.documentElement.lang||'en';
    const cards=[...document.querySelectorAll('.aegis-quick-card')];
    const data=lang.startsWith('uk')?[
      ['AI АНАЛІЗ','Розумне виявлення загроз'],['ЯДРО БЕЗПЕКИ','Нейронна обробка ризиків'],['LIVE МОНІТОРИНГ','Захист у реальному часі']
    ]:lang.startsWith('cs')?[
      ['AI ANALÝZA','Chytrá detekce hrozeb'],['BEZPEČNOSTNÍ JÁDRO','Neuronové zpracování rizik'],['LIVE MONITORING','Ochrana v reálném čase']
    ]:[
      ['AI ANALYSIS','Smart threat detection'],['SECURITY CORE','Neural risk processing'],['LIVE MONITORING','Real-time protection']
    ];
    cards.forEach((c,i)=>{if(data[i]){c.querySelector('b').textContent=data[i][0];c.querySelector('small').textContent=data[i][1];}});
  };
  setQuickLabels();
  document.querySelectorAll('.lang-switch button').forEach(b=>b.addEventListener('click',()=>setTimeout(setQuickLabels,0)));
})();
