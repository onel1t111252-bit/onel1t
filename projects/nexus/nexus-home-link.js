(()=>{
'use strict';
const KEY='onel1t-nexus-last-view';
const views=['overview','soc','threats','analyst','forensics','osint','matrix','cases','reports'];
const valid=v=>views.includes(v);
const lang=()=>{const h=(document.documentElement.lang||'en').toLowerCase();if(h==='uk'||h==='ua')return'uk';if(h==='cs'||h==='cz')return'cs';try{const s=(localStorage.getItem('onel1t-lang')||'').toLowerCase();if(s==='ua'||s==='uk')return'uk';if(s==='cz'||s==='cs')return'cs'}catch(e){}return'en'};
const copy={en:{text:'Back to portfolio',aria:'Return to main portfolio',href:'../../index.html#home'},uk:{text:'Головний сайт',aria:'Повернутися на головний сайт',href:'../../index-uk.html#home'},cs:{text:'Hlavní stránka',aria:'Zpět na hlavní portfolio',href:'../../index-cz.html#home'}};
function render(){
 const host=document.querySelector('.top-actions');if(!host)return;
 let a=document.getElementById('nexus-home-link');if(!a){a=document.createElement('a');a.id='nexus-home-link';a.className='nexus-home-link';a.innerHTML='<span aria-hidden="true">←</span><b></b>';host.prepend(a)}
 const c=copy[lang()];a.href=c.href;a.setAttribute('aria-label',c.aria);a.querySelector('b').textContent=c.text;
}
function ensureStyle(){if(document.getElementById('nexus-home-link-style'))return;const s=document.createElement('style');s.id='nexus-home-link-style';s.textContent='.nexus-home-link{display:inline-flex;align-items:center;gap:7px;min-height:36px;padding:7px 11px;border:1px solid #2c5368;border-radius:10px;background:#0c1b29;color:#dffcff;text-decoration:none;font-size:11px;font-weight:700;white-space:nowrap;transition:.18s}.nexus-home-link:hover{border-color:var(--cyan);background:#102b35;transform:translateY(-1px)}.nexus-home-link span{color:var(--cyan);font-size:15px}.nexus-home-link b{font-weight:700}@media(max-width:720px){.nexus-home-link{width:38px;padding:7px;justify-content:center}.nexus-home-link b{display:none}}';document.head.append(s)}
function saveView(view){if(!valid(view))return;try{localStorage.setItem(KEY,view)}catch(e){}const u=new URL(location.href);u.hash=view;history.replaceState(history.state,'',u)}
function requestedView(){const h=location.hash.replace(/^#/,'').toLowerCase();if(valid(h))return h;try{const s=localStorage.getItem(KEY)||'';if(valid(s))return s}catch(e){}return'overview'}
function openView(view){if(!valid(view))return;const b=document.querySelector('.nav button[data-view="'+view+'"]');if(b&&!b.classList.contains('active'))b.click();saveView(view)}
ensureStyle();render();
document.addEventListener('click',e=>{
 if(e.target.closest('.language-switch button,[data-lang]'))setTimeout(render,0);
 const b=e.target.closest('.nav button[data-view],[data-go]');if(b){const view=b.dataset.view||b.dataset.go;if(valid(view))setTimeout(()=>saveView(view),0)}
},true);
window.addEventListener('hashchange',()=>{const h=location.hash.replace(/^#/,'').toLowerCase();if(valid(h))openView(h)});
requestAnimationFrame(()=>requestAnimationFrame(()=>openView(requestedView())));
})();
