const nav=document.getElementById('nav');
const menu=document.getElementById('menu');
const rail=document.querySelector('.rail');
const railNav=document.querySelector('.rail nav');

/* Keep the nickname exactly as requested everywhere it is used as branding. */
const exactNicknameHTML='Onel<span>1</span>t';
document.querySelectorAll('.brand,.hero h1').forEach(el=>{el.innerHTML=exactNicknameHTML;});
document.querySelectorAll('.rail-quote b,.hq i').forEach(el=>{el.textContent='— Onel1t';});
document.querySelectorAll('footer span:first-child').forEach(el=>{el.innerHTML=el.innerHTML.replace(/ONEL1T/g,'Onel1t');});
document.title=document.title.replace('ONEL1T','Onel1t');

/* Remove the broken Experience tab from both navigation areas. */
document.querySelectorAll('.nav a[href="#experience"],.rail nav a[href="#experience"]').forEach(a=>a.remove());

/* Keep the left-side numbering continuous after removing Experience. */
document.querySelectorAll('.rail nav a').forEach((a,i)=>{
  const n=a.querySelector('span');
  if(n) n.textContent=String(i+1).padStart(2,'0');
});

if(menu&&nav){
  menu.onclick=()=>nav.classList.toggle('open');
}

/* Brush font closest to the supplied reference screenshot. */
if(!document.getElementById('reference-brush-font')){
  const fontLink=document.createElement('link');
  fontLink.id='reference-brush-font';
  fontLink.rel='stylesheet';
  fontLink.href='https://db.onlinewebfonts.com/c/396d8feaff69b773bbfef35f7287eeb7?family=Another+Danger+Slanted+-+Demo';
  document.head.appendChild(fontLink);
}

const uiStyle=document.createElement('style');
uiStyle.textContent=`
:root{
  --brush:'Another Danger Slanted - Demo','Road Rage','Arial Black',sans-serif;
  --ui:'Roboto Condensed','Inter',Arial,sans-serif;
  --mono2:'Roboto Mono','JetBrains Mono',monospace;
}
.hero h1{
  font-family:var(--brush)!important;
  font-weight:400!important;
  font-style:normal!important;
  letter-spacing:.012em!important;
  line-height:.84!important;
  transform:rotate(-1deg)!important;
  text-shadow:4px 5px 0 #000,0 0 22px rgba(0,0,0,.92)!important;
}
.hero h1 span{font-family:inherit!important;font-weight:inherit!important}
.nav a,.feature-copy h3,.pb h3,.xl h3,.btn,.gh{font-family:var(--ui)!important}
.kick,.motto,.rail nav a,.lang a,.chips span,.pt span,.ph i,.stats span,.rail-quote,footer{font-family:var(--mono2)!important}

/* Left rail: smooth animated active marker. */
.rail nav{position:relative!important}
.rail nav a{
  transition:color .26s ease,transform .30s cubic-bezier(.2,.75,.25,1),opacity .26s ease!important;
  will-change:transform;
}
.rail nav a:before{opacity:0!important;box-shadow:none!important}
.rail nav a.active{transform:translateX(6px)!important;color:#fff!important}
.rail nav a:not(.active){opacity:.72}
.rail-indicator{
  position:absolute;
  left:-13px;
  top:0;
  width:3px;
  height:34px;
  border-radius:3px;
  background:var(--red);
  box-shadow:0 0 8px rgba(229,28,42,.95),0 0 22px rgba(229,28,42,.55);
  transform:translateY(0);
  transition:transform .42s cubic-bezier(.18,.86,.22,1),height .28s ease,opacity .25s ease;
  pointer-events:none;
  z-index:5;
}
.rail.rail-pulse{animation:railPulse .48s ease}
@keyframes railPulse{
  0%,100%{filter:none}
  45%{filter:drop-shadow(0 0 7px rgba(229,28,42,.25))}
}

/* Content reveal animation restored. */
.scroll-reveal{
  opacity:0;
  transform:translateY(20px);
  transition:opacity .62s cubic-bezier(.2,.7,.2,1),transform .62s cubic-bezier(.2,.7,.2,1);
  transition-delay:var(--reveal-delay,0ms);
}
.scroll-reveal.is-visible{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){
  .scroll-reveal{opacity:1!important;transform:none!important;transition:none!important}
  .rail-indicator,.rail nav a{transition:none!important}
}

/* Normalize the first and last feature cards. */
.feats .feature-card.dev-card,
.feats .feature-card.problem-card{position:relative;overflow:hidden}
.feats .feature-card.dev-card{background-size:108% 120%!important;background-position:right bottom!important}
.feats .feature-card.problem-card{background-size:100% 100%!important;background-position:center center!important}
.feats .feature-card.dev-card::before,
.feats .feature-card.problem-card::before{
  content:"";position:absolute;inset:8px;border:1px solid rgba(255,255,255,.24);
  border-radius:4px;pointer-events:none;z-index:1
}
.feats .feature-card.dev-card .feature-copy,
.feats .feature-card.problem-card .feature-copy{position:relative;z-index:2}
`;
document.head.appendChild(uiStyle);

const allLinks=[...document.querySelectorAll('.nav a[href^="#"],.rail nav a[href^="#"]')];
const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Animated rail marker. */
let railIndicator=null;
if(railNav){
  railIndicator=document.createElement('span');
  railIndicator.className='rail-indicator';
  railNav.appendChild(railIndicator);
}

function moveRailIndicator(id,animate=true){
  if(!railNav||!railIndicator) return;
  const link=railNav.querySelector(`a[href="#${id}"]`);
  if(!link){railIndicator.style.opacity='0';return;}
  railIndicator.style.opacity='1';
  if(!animate) railIndicator.style.transition='none';
  const y=link.offsetTop+(link.offsetHeight-34)/2;
  railIndicator.style.transform=`translateY(${Math.max(0,y)}px)`;
  if(!animate){
    requestAnimationFrame(()=>railIndicator.style.transition='');
  }
}

function setActive(id,animate=true){
  allLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${id}`));
  moveRailIndicator(id,animate);
}

function smoothScrollTo(target){
  const header=document.querySelector('.topbar');
  const offset=(header?header.offsetHeight:60)+10;
  const start=window.scrollY;
  const end=Math.max(0,target.getBoundingClientRect().top+start-offset);
  if(prefersReducedMotion){window.scrollTo(0,end);return;}
  const distance=end-start;
  const duration=Math.min(880,Math.max(500,Math.abs(distance)*.42));
  let t0=null;
  const ease=t=>1-Math.pow(1-t,4);
  function step(now){
    if(t0===null)t0=now;
    const p=Math.min((now-t0)/duration,1);
    window.scrollTo(0,start+distance*ease(p));
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

allLinks.forEach(a=>a.addEventListener('click',e=>{
  const href=a.getAttribute('href');
  if(!href||href==='#')return;
  const target=document.querySelector(href);
  if(!target)return;
  e.preventDefault();
  if(nav)nav.classList.remove('open');
  const id=href.slice(1);
  setActive(id,true);
  if(rail){
    rail.classList.remove('rail-pulse');
    void rail.offsetWidth;
    rail.classList.add('rail-pulse');
  }
  smoothScrollTo(target);
  history.replaceState(null,'',href);
}));

/* Reliable scroll-spy for top and side navigation. */
const ids=[...new Set(allLinks.map(a=>a.getAttribute('href')).filter(Boolean).map(h=>h.slice(1)))];
const trackedSections=ids.map(id=>document.getElementById(id)).filter(Boolean);
let ticking=false;
function updateScrollSpy(){
  ticking=false;
  if(!trackedSections.length)return;
  const probe=window.scrollY+window.innerHeight*.38;
  let active=trackedSections[0];
  for(const section of trackedSections){
    const top=section.getBoundingClientRect().top+window.scrollY;
    if(top<=probe)active=section;else break;
  }
  if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-12){
    active=trackedSections[trackedSections.length-1];
  }
  setActive(active.id,true);
}
window.addEventListener('scroll',()=>{
  if(!ticking){ticking=true;requestAnimationFrame(updateScrollSpy)}
},{passive:true});
window.addEventListener('resize',()=>{
  updateScrollSpy();
  const active=document.querySelector('.rail nav a.active');
  if(active)moveRailIndicator(active.getAttribute('href').slice(1),false);
});

/* Scroll reveal. */
const revealTargets=[...document.querySelectorAll('.feats .feature-card,.view,.vcard,.stats>div,.chips span,.pc,.banner,.xl article,.cbox')];
revealTargets.forEach((el,i)=>{
  el.classList.add('scroll-reveal');
  el.style.setProperty('--reveal-delay',`${(i%4)*45}ms`);
});
if(prefersReducedMotion||!('IntersectionObserver' in window)){
  revealTargets.forEach(el=>el.classList.add('is-visible'));
}else{
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },{threshold:.10,rootMargin:'0px 0px -6% 0px'});
  revealTargets.forEach(el=>revealObserver.observe(el));
}

/* Project imagery. */
const featuredProjectImages={
  'C++ Console Toolkit':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx (2).jpg',
  'Python Security Utilities':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx (1).jpg',
  'Onel1t Portfolio':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx.jpg'
};
const projectsSectionImages={
  'C++ Console Toolkit':'Gemini_Generated_Image_217vl4217vl4217v (5).jpg?v=original-projects-2244',
  'Python Security Utilities':'Gemini_Generated_Image_217vl4217vl4217v (3).jpg?v=original-projects-2244',
  'Onel1t Portfolio':'Gemini_Generated_Image_217vl4217vl4217v (4).jpg?v=original-projects-2244',
  'Secure Network Lab':'Gemini_Generated_Image_217vl4217vl4217v (2).jpg?v=original-projects-2244',
  'Arduino Radar':'Gemini_Generated_Image_217vl4217vl4217v.jpg?v=original-projects-2244'
};
document.querySelectorAll('#projects-preview .pc img[alt]').forEach(img=>{
  const next=featuredProjectImages[img.alt];if(next)img.src=next;
});
document.querySelectorAll('#projects .pc img[alt]').forEach(img=>{
  const next=projectsSectionImages[img.alt];if(next)img.src=next;
});

requestAnimationFrame(()=>{
  updateScrollSpy();
  const active=document.querySelector('.rail nav a.active');
  if(active)moveRailIndicator(active.getAttribute('href').slice(1),false);
});
