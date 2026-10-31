(()=>{
'use strict';
const KEY='onel1t-cyber-last-view';
const views=['overview','soc','network','assistant','academy','password','phishing','reports'];
const valid=v=>views.includes(v);
const readLang=()=>{
  const active=document.querySelector('.language-switch [data-lang].active');
  const raw=(active?.dataset.lang||localStorage.getItem('onel1t-lang')||'en').toLowerCase();
  if(raw==='ua'||raw==='uk')return'uk';
  if(raw==='cz'||raw==='cs')return'cs';
  return'en';
};
const copy={
  en:{text:'Portfolio',aria:'Back to ONEL1T portfolio',href:'../../index.html#home'},
  uk:{text:'Портфоліо',aria:'Повернутися до портфоліо ONEL1T',href:'../../index-uk.html#home'},
  cs:{text:'Portfolio',aria:'Zpět na portfolio ONEL1T',href:'../../index-cz.html#home'}
};
function syncHome(){
  const host=document.querySelector('.top-right');if(!host)return;
  let a=host.querySelector('.return-home');
  if(!a){a=document.createElement('a');a.className='return-home';a.innerHTML='<b aria-hidden="true">←</b><span></span>';host.prepend(a)}
  const c=copy[readLang()];a.href=c.href;a.setAttribute('aria-label',c.aria);a.setAttribute('title',c.text);const s=a.querySelector('span');if(s)s.textContent=c.text;
}
function save(view){
  if(!valid(view))return;
  try{localStorage.setItem(KEY,view)}catch(e){}
  const u=new URL(location.href);u.hash=view;history.replaceState(history.state,'',u);
}
function requested(){
  const h=location.hash.replace(/^#/,'').toLowerCase();if(valid(h))return h;
  try{const s=localStorage.getItem(KEY)||'';if(valid(s))return s}catch(e){}
  return'overview';
}
function open(view){
  if(!valid(view))return;
  const b=document.querySelector('.nav button[data-view="'+view+'"]');
  if(b&&!b.classList.contains('active'))b.click();
  save(view);
}
syncHome();
document.addEventListener('click',e=>{
  if(e.target.closest('.language-switch button[data-lang]'))setTimeout(syncHome,0);
  const b=e.target.closest('.nav button[data-view],[data-go]');if(b){const v=b.dataset.view||b.dataset.go;if(valid(v))setTimeout(()=>save(v),0)}
},true);
window.addEventListener('hashchange',()=>{const h=location.hash.replace(/^#/,'').toLowerCase();if(valid(h))open(h)});
requestAnimationFrame(()=>requestAnimationFrame(()=>open(requested())));
})();
