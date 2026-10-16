const nav=document.getElementById('nav');
const menu=document.getElementById('menu');
const links=[...document.querySelectorAll('.nav a,.rail nav a')];

if(menu&&nav){
  menu.onclick=()=>nav.classList.toggle('open');
}

/* Reference typography from the supplied screenshot. */
if(!document.getElementById('reference-fonts')){
  const fontLink=document.createElement('link');
  fontLink.id='reference-fonts';
  fontLink.rel='stylesheet';
  fontLink.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Noto+Sans+JP:wght@400;500;700&family=Road+Rage&family=Roboto+Condensed:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500;600;700&display=swap';
  document.head.appendChild(fontLink);
}

const typographyStyle=document.createElement('style');
typographyStyle.textContent=`
:root{
  --mono:'Roboto Mono',monospace;
  --serif:'Cinzel',serif;
  --sans:'Roboto Condensed',Arial,sans-serif;
  --display:'Road Rage',cursive;
  --jp:'Noto Sans JP',sans-serif;
}
body{font-family:var(--sans);font-weight:400;letter-spacing:.005em}
.brand{font-family:var(--sans)!important;font-weight:800!important;letter-spacing:.12em!important}
.nav a,.btn,.feature-copy h3,.pb h3,.xl h3,.gh{font-family:var(--sans)!important}
.nav a{font-weight:500;letter-spacing:.015em}
.btn,.gh{font-weight:600;letter-spacing:.045em}
.kick,.motto,.rail nav a,.lang a,.chips span,.pt span,.ph i,.stats span,.rail-quote,footer{font-family:var(--mono)!important}
.ph h2,.vcard h3,.hq,.banner div{font-family:var(--serif)!important}
.ph h2{font-weight:600;letter-spacing:.11em}
.hero h1{font-family:var(--display)!important;font-weight:400!important;letter-spacing:.025em!important;line-height:.84!important;transform:skew(-7deg) rotate(-1deg)!important;text-shadow:4px 5px 0 #000,0 0 22px rgba(0,0,0,.9)!important}
.hero h1 span{font-family:inherit!important}
.feature-copy h3,.pb h3,.xl h3{font-weight:700;letter-spacing:.015em}
.feature-copy p,.pb p,.xl p,.hero-c p,.vcard p,.cbox p{font-family:var(--sans)!important}
.vert{font-family:var(--jp),var(--serif)!important}

/* Scroll reveal restored and made smoother. */
.scroll-reveal{opacity:0;transform:translateY(22px);transition:opacity .68s cubic-bezier(.2,.7,.2,1),transform .68s cubic-bezier(.2,.7,.2,1);transition-delay:var(--reveal-delay,0ms);will-change:opacity,transform}
.scroll-reveal.is-visible{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.scroll-reveal{opacity:1!important;transform:none!important;transition:none!important}}
`;
document.head.appendChild(typographyStyle);

const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function smoothScrollTo(target){
  const offset=72;
  const start=window.scrollY;
  const end=Math.max(0,target.getBoundingClientRect().top+start-offset);
  if(prefersReducedMotion){
    window.scrollTo(0,end);
    return;
  }
  const distance=end-start;
  const duration=Math.min(900,Math.max(520,Math.abs(distance)*0.45));
  let startTime=null;
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  function step(time){
    if(startTime===null) startTime=time;
    const progress=Math.min((time-startTime)/duration,1);
    window.scrollTo(0,start+distance*ease(progress));
    if(progress<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const selector=a.getAttribute('href');
  if(!selector||selector==='#') return;
  const target=document.querySelector(selector);
  if(!target) return;
  e.preventDefault();
  if(nav) nav.classList.remove('open');
  smoothScrollTo(target);
  history.replaceState(null,'',selector);
}));

const sections=['home','about','skills','projects','experience','contact']
  .map(id=>document.getElementById(id)).filter(Boolean);

if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    const id=visible.target.id;
    links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));
  },{rootMargin:'-18% 0px -68% 0px',threshold:[0,.1,.25,.5]});
  sections.forEach(section=>observer.observe(section));
}

/* Scroll-in animation for the main content. */
const revealTargets=[...document.querySelectorAll('.feats .feature-card,.view,.vcard,.stats>div,.chips span,.pc,.banner,.xl article,.cbox')];
revealTargets.forEach((el,index)=>{
  el.classList.add('scroll-reveal');
  el.style.setProperty('--reveal-delay',`${(index%4)*55}ms`);
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
  },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
  revealTargets.forEach(el=>revealObserver.observe(el));
}

// New three images stay only in Featured Projects.
const featuredProjectImages={
  'C++ Console Toolkit':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx (2).jpg',
  'Python Security Utilities':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx (1).jpg',
  'Onel1t Portfolio':'Gemini_Generated_Image_wnnxk0wnnxk0wnnx.jpg'
};

// Projects uses the exact five images from the first set the user supplied.
const projectsSectionImages={
  'C++ Console Toolkit':'Gemini_Generated_Image_217vl4217vl4217v (5).jpg?v=original-projects-2244',
  'Python Security Utilities':'Gemini_Generated_Image_217vl4217vl4217v (3).jpg?v=original-projects-2244',
  'Onel1t Portfolio':'Gemini_Generated_Image_217vl4217vl4217v (4).jpg?v=original-projects-2244',
  'Secure Network Lab':'Gemini_Generated_Image_217vl4217vl4217v (2).jpg?v=original-projects-2244',
  'Arduino Radar':'Gemini_Generated_Image_217vl4217vl4217v.jpg?v=original-projects-2244'
};

document.querySelectorAll('#projects-preview .pc img[alt]').forEach(img=>{
  const next=featuredProjectImages[img.alt];
  if(next) img.src=next;
});

document.querySelectorAll('#projects .pc img[alt]').forEach(img=>{
  const next=projectsSectionImages[img.alt];
  if(next) img.src=next;
});

// Normalize the first and last feature cards to match the two middle cards.
const featureAlignmentStyle=document.createElement('style');
featureAlignmentStyle.textContent=`
.feats .feature-card.dev-card,
.feats .feature-card.problem-card{position:relative;overflow:hidden}
.feats .feature-card.dev-card{background-size:108% 120%!important;background-position:right bottom!important}
.feats .feature-card.problem-card{background-size:100% 100%!important;background-position:center center!important}
.feats .feature-card.dev-card::before,
.feats .feature-card.problem-card::before{content:"";position:absolute;inset:8px;border:1px solid rgba(255,255,255,.24);border-radius:4px;pointer-events:none;z-index:1}
.feats .feature-card.dev-card .feature-copy,
.feats .feature-card.problem-card .feature-copy{position:relative;z-index:2}
`;
document.head.appendChild(featureAlignmentStyle);
