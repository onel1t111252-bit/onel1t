(()=>{
'use strict';
const lang=()=>{const h=(document.documentElement.lang||'en').toLowerCase();if(h==='uk'||h==='ua')return'uk';if(h==='cs'||h==='cz')return'cs';try{const s=(localStorage.getItem('onel1t-lang')||'').toLowerCase();if(s==='ua'||s==='uk')return'uk';if(s==='cz'||s==='cs')return'cs'}catch(e){}return'en'};
const copy={en:{text:'Back to portfolio',aria:'Return to main portfolio',href:'../../index.html'},uk:{text:'Головний сайт',aria:'Повернутися на головний сайт',href:'../../index-uk.html'},cs:{text:'Hlavní stránka',aria:'Zpět na hlavní portfolio',href:'../../index-cz.html'}};
function render(){
 const host=document.querySelector('.top-actions');if(!host)return;
 let a=document.getElementById('nexus-home-link');if(!a){a=document.createElement('a');a.id='nexus-home-link';a.className='nexus-home-link';a.innerHTML='<span aria-hidden="true">←</span><b></b>';host.prepend(a)}
 const c=copy[lang()];a.href=c.href;a.setAttribute('aria-label',c.aria);a.querySelector('b').textContent=c.text;
}
function ensureStyle(){if(document.getElementById('nexus-home-link-style'))return;const s=document.createElement('style');s.id='nexus-home-link-style';s.textContent='.nexus-home-link{display:inline-flex;align-items:center;gap:7px;min-height:36px;padding:7px 11px;border:1px solid #2c5368;border-radius:10px;background:#0c1b29;color:#dffcff;text-decoration:none;font-size:11px;font-weight:700;white-space:nowrap;transition:.18s}.nexus-home-link:hover{border-color:var(--cyan);background:#102b35;transform:translateY(-1px)}.nexus-home-link span{color:var(--cyan);font-size:15px}.nexus-home-link b{font-weight:700}@media(max-width:720px){.nexus-home-link{width:38px;padding:7px;justify-content:center}.nexus-home-link b{display:none}}';document.head.append(s)}
ensureStyle();render();
document.addEventListener('click',e=>{if(e.target.closest('.language-switch button,[data-lang]'))setTimeout(render,0)},true);
new MutationObserver(()=>render()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
