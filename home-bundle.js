/* ONEL1T performance bundle v2: stable single-pass ordered startup. */
(()=>{
 'use strict';
 const root=document.documentElement;
 const memory=Number(navigator.deviceMemory||8);
 const cores=Number(navigator.hardwareConcurrency||8);
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(memory<=4||cores<=4||reduceMotion)root.classList.add('perf-lite');
 const syncVisibility=()=>root.classList.toggle('perf-hidden',document.hidden);
 document.addEventListener('visibilitychange',syncVisibility,{passive:true});
 syncVisibility();
})();

/* SOURCE 1: home-core.js */
const nav=document.getElementById('nav');
const menu=document.getElementById('menu');
const rail=document.querySelector('.rail');
const railNav=document.querySelector('.rail nav');

/* Share the selected homepage language with every project. */
try{const pageLang=(document.documentElement.lang||'en').toLowerCase();localStorage.setItem('onel1t-lang',pageLang==='uk'?'ua':pageLang==='cs'?'cz':'en')}catch(_){}

/* Keep the nickname exactly as requested everywhere it is used as branding. */
const exactNicknameHTML='<span class="nick-text">Onel</span><span class="nick-one">1</span><span class="nick-text">t</span>';
document.querySelectorAll('.brand,.hero h1').forEach(el=>{el.innerHTML=exactNicknameHTML;});
document.querySelectorAll('.rail-quote b,.hq i').forEach(el=>{el.textContent='— Onel1t';});
document.querySelectorAll('footer span:first-child').forEach(el=>{el.innerHTML=el.innerHTML.replace(/ONEL1T|Onelt|Onel1t/g,'Onel1t');});
document.title=document.title.replace(/ONEL1T|Onelt/g,'Onel1t');

if(menu&&nav){
  menu.onclick=()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open?'true':'false');};
}

/* Mobile navigation keyboard/outside-click behavior. */
if(menu&&nav){
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
  document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!nav.contains(e.target)&&!menu.contains(e.target)){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}});
}

/* Hero branding uses Cinzel from the existing primary font stylesheet.
   Avoid a late-loading, unused external Permanent Marker font. */

const uiStyle=document.createElement('style');
uiStyle.textContent=`
:root{
  --brush:'Cinzel',serif;
  --ui:'Roboto Condensed','Inter',Arial,sans-serif;
  --mono2:'Roboto Mono','JetBrains Mono',monospace;
}
.hero h1{
  font-family:var(--brush)!important;
  font-weight:400!important;
  font-style:normal!important;
  letter-spacing:.01em!important;
  line-height:.88!important;
  transform:skewX(-5deg) rotate(-1deg)!important;
  text-transform:none!important;
  text-shadow:4px 5px 0 #000,0 0 22px rgba(0,0,0,.92)!important;
}
.hero h1 .nick-text,
.hero h1 .nick-one{
  font-family:var(--brush)!important;
  font-weight:400!important;
  display:inline-block!important;
  transform:none!important;
  margin:0!important;
}
.hero h1 .nick-text{color:#fff!important}
.hero h1 .nick-one{
  color:var(--red)!important;
  text-shadow:3px 4px 0 #000,0 0 18px rgba(229,28,42,.35)!important;
}
.brand{text-transform:none!important}
.brand .nick-text{font-family:var(--ui)!important;font-weight:800!important}
.brand .nick-one{font-family:var(--ui)!important;color:var(--red)!important;font-weight:800!important}
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
  filter:blur(3px);
  transform:translateY(26px) scale(.99);
  transition:opacity .78s cubic-bezier(.2,.7,.2,1),transform .78s cubic-bezier(.2,.7,.2,1),filter .78s cubic-bezier(.2,.7,.2,1);
  transition-delay:var(--reveal-delay,0ms);
}
.scroll-reveal.is-visible{opacity:1;filter:blur(0);transform:none}
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

let currentActiveSection='';
function setActive(id,animate=true){
  if(id===currentActiveSection)return;
  currentActiveSection=id;
  allLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${id}`));
  moveRailIndicator(id,animate);
  document.dispatchEvent(new CustomEvent('onel1t-section-change',{detail:{id}}));
}

function smoothScrollTo(target){
  const header=document.querySelector('.topbar');
  const offset=(header?header.offsetHeight:60)+10;
  const end=Math.max(0,target.getBoundingClientRect().top+window.scrollY-offset);
  window.scrollTo({top:end,behavior:prefersReducedMotion?'auto':'smooth'});
}

allLinks.forEach(a=>a.addEventListener('click',e=>{
  const href=a.getAttribute('href');
  if(!href||href==='#')return;
  const target=document.querySelector(href);
  if(!target)return;
  e.preventDefault();
  if(nav)nav.classList.remove('open');
  if(menu)menu.setAttribute('aria-expanded','false');
  const id=href.slice(1);
  setActive(id,true);
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
    if(section.offsetTop<=probe)active=section;else break;
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
  if(currentActiveSection)moveRailIndicator(currentActiveSection,false);
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

/* Project covers are defined by the page markup and home.js. */

requestAnimationFrame(()=>{
  updateScrollSpy();
  const active=document.querySelector('.rail nav a.active');
  if(active)moveRailIndicator(active.getAttribute('href').slice(1),false);
});


/* SOURCE 2: home-premium.js */
(()=>{
'use strict';
const lang=(document.documentElement.lang||'en').toLowerCase();
const L=lang==='uk'?'uk':lang==='cs'?'cs':'en';
const copy={
 en:{kick:'CYBERSECURITY · NETWORKS · DEVELOPMENT',status:'BUILDING SECURITY TOOLS, INTERACTIVE LABS & NETWORK PROJECTS',flag:'FLAGSHIP SYSTEM',introTitle:'TWO FLAGSHIP BUILDS',intro:'Cyber Lab and NEXUS are the core of this portfolio: interactive security products built to demonstrate analysis, networking, defensive thinking and interface design.',gitTitle:'SOURCE & BUILD LOG',git:'The portfolio is built in public. Explore the source, project structure and ongoing improvements on GitHub.',gitBtn:'OPEN GITHUB ↗',live:'LIVE DEMO',details:'CASE STUDY',source:'SOURCE',more:'MORE LABS & UTILITIES',building:'CURRENTLY BUILDING',buildingText:'Improving the ONEL1T security ecosystem, localization and mobile experience.',terminalTitle:'PROJECT TERMINAL',terminalSub:'TYPE A COMMAND · LOCAL PORTFOLIO NAVIGATION',terminalHelp:'Try: help · whoami · projects · skills · open nexus · open cyber-lab · github · clear',hello:'ONEL1T terminal ready. Type "help" to explore.',unknown:'Unknown command. Type "help".',who:'Maksym Dymchuk — IT student focused on cybersecurity, networks and software development.',projects:'Flagship: ONEL1T Cyber Lab, ONEL1T NEXUS. Also: C++ Toolkit, Python Security Utilities, Password Lab, Subnet Calculator, Phishing Analyzer, Log Triage.',skills:'Cybersecurity · Networking · Windows · C++ · C# · Python · HTML/CSS/JavaScript · Troubleshooting',help:'Commands: whoami, projects, skills, open nexus, open cyber-lab, github, clear',expTags:[['IT','Security systems','Internship'],['IT','Security systems','Internship'],['IT','Security systems','Internship'],['Telecom','Customer support','Technical service']]},
 uk:{kick:'КІБЕРБЕЗПЕКА · МЕРЕЖІ · РОЗРОБКА',status:'СТВОРЮЮ ІНСТРУМЕНТИ БЕЗПЕКИ, ІНТЕРАКТИВНІ ЛАБОРАТОРІЇ ТА МЕРЕЖЕВІ ПРОЄКТИ',flag:'ФЛАГМАНСЬКА СИСТЕМА',introTitle:'ДВА ГОЛОВНІ ПРОЄКТИ',intro:'Cyber Lab і NEXUS — ядро цього портфоліо: інтерактивні продукти з кібербезпеки, що демонструють аналіз, мережі, defensive thinking та дизайн інтерфейсів.',gitTitle:'КОД І РОЗРОБКА',git:'Портфоліо розвивається відкрито. На GitHub можна переглянути код, структуру проєктів і поточні покращення.',gitBtn:'ВІДКРИТИ GITHUB ↗',live:'LIVE DEMO',details:'CASE STUDY',source:'КОД',more:'ІНШІ ЛАБОРАТОРІЇ ТА УТИЛІТИ',building:'ЗАРАЗ У РОБОТІ',buildingText:'Покращення екосистеми ONEL1T, локалізації та мобільного досвіду.',terminalTitle:'PROJECT TERMINAL',terminalSub:'ВВЕДИ КОМАНДУ · ЛОКАЛЬНА НАВІГАЦІЯ ПОРТФОЛІО',terminalHelp:'Спробуй: help · whoami · projects · skills · open nexus · open cyber-lab · github · clear',hello:'Термінал ONEL1T готовий. Введи "help".',unknown:'Невідома команда. Введи "help".',who:'Максим Димчук — IT-студент із фокусом на кібербезпеці, мережах і розробці.',projects:'Головні: ONEL1T Cyber Lab, ONEL1T NEXUS. Також: C++ Toolkit, Python Security Utilities, Password Lab, Subnet Calculator, Phishing Analyzer, Log Triage.',skills:'Кібербезпека · Мережі · Windows · C++ · C# · Python · HTML/CSS/JavaScript · Діагностика',help:'Команди: whoami, projects, skills, open nexus, open cyber-lab, github, clear',expTags:[['IT','Системи безпеки','Практика'],['IT','Системи безпеки','Практика'],['IT','Системи безпеки','Практика'],['Телеком','Робота з клієнтами','Технічні послуги']]},
 cs:{kick:'KYBERBEZPEČNOST · SÍTĚ · VÝVOJ',status:'TVORBA BEZPEČNOSTNÍCH NÁSTROJŮ, INTERAKTIVNÍCH LABORATOŘÍ A SÍŤOVÝCH PROJEKTŮ',flag:'HLAVNÍ SYSTÉM',introTitle:'DVA HLAVNÍ PROJEKTY',intro:'Cyber Lab a NEXUS jsou jádrem tohoto portfolia: interaktivní bezpečnostní produkty zaměřené na analýzu, sítě, defensive thinking a návrh rozhraní.',gitTitle:'ZDROJOVÝ KÓD A VÝVOJ',git:'Portfolio vzniká otevřeně. Na GitHubu lze prozkoumat kód, strukturu projektů a průběžná vylepšení.',gitBtn:'OTEVŘÍT GITHUB ↗',live:'LIVE DEMO',details:'CASE STUDY',source:'KÓD',more:'DALŠÍ LABORATOŘE A NÁSTROJE',building:'PRÁVĚ VÝVOJ',buildingText:'Vylepšování ekosystému ONEL1T, lokalizace a mobilního prostředí.',terminalTitle:'PROJECT TERMINAL',terminalSub:'ZADEJ PŘÍKAZ · LOKÁLNÍ NAVIGACE PORTFOLIEM',terminalHelp:'Zkus: help · whoami · projects · skills · open nexus · open cyber-lab · github · clear',hello:'Terminál ONEL1T je připraven. Zadej "help".',unknown:'Neznámý příkaz. Zadej "help".',who:'Maksym Dymchuk — student IT se zaměřením na kyberbezpečnost, sítě a vývoj softwaru.',projects:'Hlavní: ONEL1T Cyber Lab, ONEL1T NEXUS. Dále: C++ Toolkit, Python Security Utilities, Password Lab, Subnet Calculator, Phishing Analyzer, Log Triage.',skills:'Kyberbezpečnost · Sítě · Windows · C++ · C# · Python · HTML/CSS/JavaScript · Troubleshooting',help:'Příkazy: whoami, projects, skills, open nexus, open cyber-lab, github, clear',expTags:[['IT','Bezpečnostní systémy','Praxe'],['IT','Bezpečnostní systémy','Praxe'],['IT','Bezpečnostní systémy','Praxe'],['Telekom','Zákaznická podpora','Technické služby']]}
}[L];

const brand=document.querySelector('.brand');
if(brand&&!brand.querySelector('.brand-emblem')){const e=document.createElement('span');e.className='brand-emblem';e.setAttribute('aria-hidden','true');brand.prepend(e)}
const kick=document.querySelector('.hero .kick');if(kick)kick.textContent=copy.kick;
const heroText=document.querySelector('.hero-c p');
if(heroText&&!document.querySelector('.hero-statusline')){const s=document.createElement('div');s.className='hero-statusline';s.innerHTML='<i aria-hidden="true"></i><strong>'+copy.status+'</strong>';heroText.insertAdjacentElement('afterend',s)}

const hero=document.querySelector('.hero');
if(hero&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.classList.contains('perf-lite')&&matchMedia('(pointer:fine)').matches){
  let pending=false,last=0,mouseX=0,mouseY=0;
  hero.addEventListener('pointermove',e=>{
    mouseX=e.clientX;mouseY=e.clientY;
    if(pending)return;
    pending=true;
    requestAnimationFrame(now=>{
      pending=false;
      if(document.hidden||now-last<34)return;
      last=now;
      const r=hero.getBoundingClientRect();
      hero.style.setProperty('--hx',((mouseX-r.left)/r.width*100).toFixed(1)+'%');
      hero.style.setProperty('--hy',((mouseY-r.top)/r.height*100).toFixed(1)+'%');
    });
  },{passive:true});
}

const projects=document.getElementById('projects');
const grid=projects?.querySelector('.pgrid');
if(projects&&grid){
  grid.classList.add('project-showcase-grid');
  const cards=[...grid.children].filter(x=>x.classList.contains('pc'));
  const intro=document.createElement('div');intro.className='premium-project-intro';intro.innerHTML='<div class="premium-callout"><b>'+copy.introTitle+'</b><p>'+copy.intro+'</p></div><div class="github-strip"><div><b>'+copy.gitTitle+'</b><p>'+copy.git+'</p></div><a class="btn" href="https://github.com/onel1t111252-bit" target="_blank" rel="noopener">'+copy.gitBtn+'</a></div>';
  grid.before(intro);
  const langQuery=L==='uk'?'uk':L==='cs'?'cs':'en';
  const featureData=[
    {slug:'cyber-lab',caseHref:'projects/cyber-lab/case-study.html?lang='+langQuery,source:'https://github.com/onel1t111252-bit/onel1t/tree/main/projects/cyber-lab',proof:['SOC SIMULATION','3 LANGUAGES','RESPONSIVE','LOCAL-FIRST']},
    {slug:'nexus',caseHref:'projects/nexus/case-study.html?lang='+langQuery,source:'https://github.com/onel1t111252-bit/onel1t/tree/main/projects/nexus',proof:['SOC + OSINT','3 LANGUAGES','CASE TRACKING','REPORT EXPORT']}
  ];
  cards.slice(0,2).forEach((card,i)=>{
    card.classList.add('project-featured');
    const pb=card.querySelector('.pb');const oldBtn=pb?.querySelector('a.btn');if(!pb||!oldBtn)return;
    const label=document.createElement('div');label.className='flagship-label';label.textContent=copy.flag;pb.prepend(label);
    const proof=document.createElement('div');proof.className='project-proof';proof.innerHTML=featureData[i].proof.map(x=>'<span>'+x+'</span>').join('');oldBtn.before(proof);
    const actions=document.createElement('div');actions.className='project-actions';
    oldBtn.remove();
    const live=oldBtn.cloneNode(true);live.textContent=copy.live+' ↗';live.classList.add('primary');
    const details=document.createElement('a');details.className='btn details';details.href=featureData[i].caseHref;details.textContent=copy.details+' →';
    const src=document.createElement('a');src.className='btn';src.href=featureData[i].source;src.target='_blank';src.rel='noopener';src.textContent=copy.source+' ↗';
    actions.append(live,details,src);pb.append(actions);
  });
  if(cards.length>2){const sub=document.createElement('div');sub.className='project-subgrid-title';sub.textContent=copy.more;cards[2].before(sub)}
  const paths=['cpp-console-toolkit','python-security-utilities','password-strength-lab','ipv4-subnet-calculator','phishing-link-analyzer','security-log-triage'];
  cards.slice(2).forEach((card,i)=>{card.classList.add('project-compact');const pt=card.querySelector('.pt');if(pt){const src=document.createElement('a');src.className='source-link';src.href='https://github.com/onel1t111252-bit/onel1t/tree/main/projects/'+paths[i];src.target='_blank';src.rel='noopener';src.textContent=copy.source;pt.append(src)}});
  const current=document.createElement('div');current.className='current-build';current.innerHTML='<i aria-hidden="true"></i><div><b>'+copy.building+'</b> · '+copy.buildingText+'</div>';grid.after(current);
}

const exp=document.querySelector('#experience .pgrid');
if(exp){exp.classList.add('experience-timeline');[...exp.querySelectorAll('.pc')].forEach((card,i)=>{const tags=document.createElement('div');tags.className='experience-tags';tags.innerHTML=(copy.expTags[i]||[]).map(t=>'<span>'+t+'</span>').join('');card.querySelector('.pb')?.append(tags)})}

const contact=document.getElementById('contact');
if(contact&&!document.getElementById('terminal')){
 const sec=document.createElement('section');sec.className='terminal-section';sec.id='terminal';sec.innerHTML='<div class="ph"><span class="s">◆</span><h2>'+copy.terminalTitle+'</h2><i>/ SYS</i></div><div class="terminal-wrap"><div class="terminal-head"><span>'+copy.terminalSub+'</span><span class="terminal-dots"><i></i><i></i><i></i></span></div><div class="terminal-screen" id="terminalScreen" aria-live="polite"><span class="ok">'+copy.hello+'</span></div><form class="terminal-form" id="terminalForm"><span>›</span><input id="terminalInput" autocomplete="off" spellcheck="false" aria-label="Project terminal command"></form><div class="terminal-help">'+copy.terminalHelp+'</div></div>';
 contact.before(sec);
 const screen=sec.querySelector('#terminalScreen'),form=sec.querySelector('#terminalForm'),input=sec.querySelector('#terminalInput');
 const print=(cmd,out,cls='')=>{screen.insertAdjacentHTML('beforeend','\n<span class="prompt-line">› '+cmd.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))+'</span>\n<span class="'+cls+'">'+out+'</span>');screen.scrollTop=screen.scrollHeight};
 form.addEventListener('submit',e=>{e.preventDefault();const raw=input.value.trim();const cmd=raw.toLowerCase();input.value='';if(!cmd)return;if(cmd==='clear'){screen.innerHTML='<span class="ok">'+copy.hello+'</span>';return}let out=copy.unknown,cls='';if(cmd==='help'){out=copy.help;cls='accent'}else if(cmd==='whoami'){out=copy.who}else if(cmd==='projects'){out=copy.projects}else if(cmd==='skills'){out=copy.skills}else if(cmd==='github'){out='github.com/onel1t111252-bit';print(raw,out,'ok');window.open('https://github.com/onel1t111252-bit','_blank','noopener');return}else if(cmd==='open nexus'){out='Opening ONEL1T NEXUS…';print(raw,out,'ok');setTimeout(()=>location.href='projects/nexus/index.html',180);return}else if(cmd==='open cyber-lab'||cmd==='open cyberlab'){out='Opening ONEL1T Cyber Lab…';print(raw,out,'ok');setTimeout(()=>location.href='projects/cyber-lab/index.html',180);return}print(raw,out,cls)});
}

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Use native link navigation; artificial 150ms delays made project links feel stuck. */
})();


/* SOURCE 3: home-10.js */
(()=>{
'use strict';
const lang=(document.documentElement.lang||'en').toLowerCase();
const L=lang==='uk'?'uk':lang==='cs'?'cs':'en';
const T={
  en:{hudTitle:'ONEL1T SYSTEM',online:'ONLINE',focus:'FOCUS',focusV:'CYBERSECURITY',build:'CURRENT BUILD',buildV:'NEXUS / CYBER LAB',mode:'MODE',modeV:'LEARN · BUILD · DEFEND',uptime:'PORTFOLIO',uptimeV:'ACTIVE 2026',skillsTitle:'SKILL MATRIX',skillsSub:'TOOLS I USE ACROSS SECURITY, NETWORKING AND DEVELOPMENT',groups:[['SECURITY',['Cybersecurity','Blue Team','Log Analysis','OSINT','Phishing Analysis']],['NETWORKING',['Cisco','IPv4 / CIDR','LAN / WAN','Routing','Network Topology']],['DEVELOPMENT',['C++','C#','Python','JavaScript','HTML / CSS']],['SYSTEMS',['Windows','Troubleshooting','Git / GitHub','Responsive UI','Local-first Tools']]],caseLabel:'QUICK CASE STUDY',caseA:[['PROBLEM','Turn security concepts into an interactive learning environment.'],['SOLUTION','SOC-style simulations, network views and client-side exercises.'],['BUILT WITH','JavaScript · UI systems · defensive workflows'],['RESULT','A flagship lab that demonstrates analysis and practical security thinking.']],caseB:[['PROBLEM','Security investigation workflows are often scattered across separate tools.'],['SOLUTION','A single workspace for SOC triage, OSINT notes, network context and case tracking.'],['BUILT WITH','JavaScript · data workflows · interactive UI'],['RESULT','A portfolio-scale cyber intelligence workspace with report export.']],liveTitle:'LIVE GITHUB SIGNAL',liveSub:'PUBLIC REPOSITORY ACTIVITY',repo:'REPOSITORY',latest:'LATEST COMMIT',updated:'UPDATED',branch:'BRANCH',loading:'SYNCING…',unavailable:'PUBLIC API UNAVAILABLE — OPEN GITHUB FOR LIVE STATUS',openGit:'OPEN GITHUB ↗',pathTitle:'BUILD PATH',pathSub:'FROM FOUNDATIONS TO SECURITY PRODUCTS',path:[['2025','SYSTEMS & SUPPORT','Security systems, telecom workflows and practical troubleshooting.'],['2025–26','NETWORKS & CODE','C++, Python, web development and network fundamentals.'],['2026','CYBER LABS','Interactive blue-team, OSINT and network-security projects.'],['NEXT','DEEPER SECURITY','Keep improving defensive analysis, automation and product quality.']],terminalSystem:'SYSTEM: ONLINE · BUILD: ONEL1T · MODE: LEARN / BUILD / DEFEND',terminalStatus:'Portfolio status: flagship projects live, localization active, mobile polish enabled.',terminalJourney:'Journey: systems → networking → development → cybersecurity products.',terminalStruggle:'No shortcuts. Build, break, learn, improve, repeat.',top:'TOP',caseToggle:'VIEW NOTES',caseClose:'HIDE NOTES'},
  uk:{hudTitle:'СИСТЕМА ONEL1T',online:'ОНЛАЙН',focus:'ФОКУС',focusV:'КІБЕРБЕЗПЕКА',build:'ЗАРАЗ У РОБОТІ',buildV:'NEXUS / CYBER LAB',mode:'РЕЖИМ',modeV:'ВЧУСЯ · СТВОРЮЮ · ЗАХИЩАЮ',uptime:'ПОРТФОЛІО',uptimeV:'АКТИВНЕ 2026',skillsTitle:'МАТРИЦЯ НАВИЧОК',skillsSub:'ІНСТРУМЕНТИ ДЛЯ БЕЗПЕКИ, МЕРЕЖ І РОЗРОБКИ',groups:[['БЕЗПЕКА',['Кібербезпека','Blue Team','Аналіз логів','OSINT','Аналіз фішингу']],['МЕРЕЖІ',['Cisco','IPv4 / CIDR','LAN / WAN','Маршрутизація','Топології мереж']],['РОЗРОБКА',['C++','C#','Python','JavaScript','HTML / CSS']],['СИСТЕМИ',['Windows','Діагностика','Git / GitHub','Адаптивний UI','Local-first інструменти']]],caseLabel:'КОРОТКИЙ CASE STUDY',caseA:[['ПРОБЛЕМА','Перетворити теорію кібербезпеки на інтерактивне навчальне середовище.'],['РІШЕННЯ','SOC-симуляції, візуалізація мережі та локальні вправи у браузері.'],['ТЕХНОЛОГІЇ','JavaScript · UI-системи · defensive workflows'],['РЕЗУЛЬТАТ','Флагманська лабораторія, що демонструє аналіз і практичне security-мислення.']],caseB:[['ПРОБЛЕМА','Розслідування часто розкидане між окремими інструментами.'],['РІШЕННЯ','Єдиний workspace для SOC triage, OSINT-нотаток, мережевого контексту та справ.'],['ТЕХНОЛОГІЇ','JavaScript · data workflows · інтерактивний UI'],['РЕЗУЛЬТАТ','Cyber intelligence workspace рівня портфоліо з експортом звітів.']],liveTitle:'ЖИВИЙ GITHUB СИГНАЛ',liveSub:'АКТИВНІСТЬ ПУБЛІЧНОГО РЕПОЗИТОРІЮ',repo:'РЕПОЗИТОРІЙ',latest:'ОСТАННІЙ КОМІТ',updated:'ОНОВЛЕНО',branch:'ГІЛКА',loading:'СИНХРОНІЗАЦІЯ…',unavailable:'PUBLIC API НЕДОСТУПНИЙ — ВІДКРИЙ GITHUB ДЛЯ АКТУАЛЬНОГО СТАТУСУ',openGit:'ВІДКРИТИ GITHUB ↗',pathTitle:'ШЛЯХ РОЗВИТКУ',pathSub:'ВІД ОСНОВ ДО ВЛАСНИХ SECURITY-ПРОДУКТІВ',path:[['2025','СИСТЕМИ Й ПІДТРИМКА','Системи безпеки, телеком-процеси та практична діагностика.'],['2025–26','МЕРЕЖІ Й КОД','C++, Python, веброзробка та основи комп’ютерних мереж.'],['2026','CYBER LABS','Інтерактивні blue-team, OSINT та мережеві security-проєкти.'],['ДАЛІ','ГЛИБША БЕЗПЕКА','Розвивати defensive analysis, автоматизацію та якість продуктів.']],terminalSystem:'SYSTEM: ONLINE · BUILD: ONEL1T · MODE: LEARN / BUILD / DEFEND',terminalStatus:'Статус портфоліо: флагманські проєкти live, локалізація активна, mobile polish увімкнено.',terminalJourney:'Шлях: системи → мережі → розробка → продукти з кібербезпеки.',terminalStruggle:'Без коротких шляхів. Створюй, ламай, вивчай, покращуй, повторюй.',top:'ВГОРУ',caseToggle:'ПОКАЗАТИ НОТАТКИ',caseClose:'СХОВАТИ НОТАТКИ'},
  cs:{hudTitle:'SYSTÉM ONEL1T',online:'ONLINE',focus:'ZAMĚŘENÍ',focusV:'KYBERBEZPEČNOST',build:'AKTUÁLNÍ BUILD',buildV:'NEXUS / CYBER LAB',mode:'REŽIM',modeV:'UČIT · TVOŘIT · BRÁNIT',uptime:'PORTFOLIO',uptimeV:'AKTIVNÍ 2026',skillsTitle:'MATICE DOVEDNOSTÍ',skillsSub:'NÁSTROJE PRO BEZPEČNOST, SÍTĚ A VÝVOJ',groups:[['BEZPEČNOST',['Kyberbezpečnost','Blue Team','Analýza logů','OSINT','Analýza phishingu']],['SÍTĚ',['Cisco','IPv4 / CIDR','LAN / WAN','Routing','Síťové topologie']],['VÝVOJ',['C++','C#','Python','JavaScript','HTML / CSS']],['SYSTÉMY',['Windows','Troubleshooting','Git / GitHub','Responzivní UI','Local-first nástroje']]],caseLabel:'RYCHLÝ CASE STUDY',caseA:[['PROBLÉM','Převést bezpečnostní koncepty do interaktivního výukového prostředí.'],['ŘEŠENÍ','SOC simulace, síťové pohledy a lokální cvičení v prohlížeči.'],['TECHNOLOGIE','JavaScript · UI systémy · defensive workflows'],['VÝSLEDEK','Vlajková laboratoř demonstrující analýzu a praktické bezpečnostní myšlení.']],caseB:[['PROBLÉM','Vyšetřovací workflow bývá rozdělené mezi více nástrojů.'],['ŘEŠENÍ','Jeden workspace pro SOC triage, OSINT poznámky, síťový kontext a případy.'],['TECHNOLOGIE','JavaScript · data workflows · interaktivní UI'],['VÝSLEDEK','Portfolio cyber intelligence workspace s exportem reportů.']],liveTitle:'ŽIVÝ GITHUB SIGNÁL',liveSub:'AKTIVITA VEŘEJNÉHO REPOZITÁŘE',repo:'REPOZITÁŘ',latest:'POSLEDNÍ COMMIT',updated:'AKTUALIZOVÁNO',branch:'VĚTEV',loading:'SYNCHRONIZACE…',unavailable:'PUBLIC API NENÍ DOSTUPNÉ — OTEVŘI GITHUB PRO AKTUÁLNÍ STAV',openGit:'OTEVŘÍT GITHUB ↗',pathTitle:'CESTA VÝVOJE',pathSub:'OD ZÁKLADŮ K VLASTNÍM SECURITY PRODUKTŮM',path:[['2025','SYSTÉMY & PODPORA','Bezpečnostní systémy, telecom workflow a praktický troubleshooting.'],['2025–26','SÍTĚ & KÓD','C++, Python, webový vývoj a síťové základy.'],['2026','CYBER LABS','Interaktivní blue-team, OSINT a síťové bezpečnostní projekty.'],['DALŠÍ','HLUBŠÍ SECURITY','Rozvoj defensive analýzy, automatizace a produktové kvality.']],terminalSystem:'SYSTEM: ONLINE · BUILD: ONEL1T · MODE: LEARN / BUILD / DEFEND',terminalStatus:'Stav portfolia: flagship projekty live, lokalizace aktivní, mobile polish zapnutý.',terminalJourney:'Cesta: systémy → sítě → vývoj → produkty kyberbezpečnosti.',terminalStruggle:'Žádné zkratky. Tvoř, rozbíjej, uč se, zlepšuj a opakuj.',top:'NAHORU',caseToggle:'ZOBRAZIT POZNÁMKY',caseClose:'SKRÝT POZNÁMKY'}
}[L];
if(!document.querySelector('.site-progress')){const p=document.createElement('div');p.className='site-progress';p.setAttribute('aria-hidden','true');document.body.prepend(p);
  let pending=false;
  const update=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;const d=document.documentElement,max=d.scrollHeight-innerHeight,v=max>0?Math.min(1,scrollY/max):0;p.style.transform=`scaleX(${v})`})};
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update,{passive:true});update();}
const hero=document.querySelector('.hero');if(hero&&!hero.querySelector('.hero-atmosphere')){const a=document.createElement('div');a.className='hero-atmosphere';a.setAttribute('aria-hidden','true');a.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i><span></span>';hero.prepend(a);}if(hero&&!hero.querySelector('.system-hud')){const hud=document.createElement('aside');hud.className='system-hud';hud.innerHTML=`<div class="hud-head"><span>${T.hudTitle}</span><b><i></i>${T.online}</b></div><div class="hud-grid"><div><small>${T.focus}</small><strong>${T.focusV}</strong></div><div><small>${T.build}</small><strong>${T.buildV}</strong></div><div><small>${T.mode}</small><strong>${T.modeV}</strong></div><div><small>${T.uptime}</small><strong>${T.uptimeV}</strong></div></div>`;hero.append(hud);}
const skills=document.getElementById('skills');if(skills&&!skills.querySelector('.skill-matrix')){const old=skills.querySelector('.chips');if(old)old.classList.add('skill-chips-fallback');const box=document.createElement('div');box.className='skill-matrix';box.innerHTML=`<div class="matrix-head"><b>${T.skillsTitle}</b><span>${T.skillsSub}</span></div><div class="matrix-grid">${T.groups.map((g,i)=>`<article class="matrix-group"><div class="matrix-no">0${i+1}</div><h3>${g[0]}</h3><div class="matrix-items">${g[1].map(x=>`<span>${x}</span>`).join('')}</div></article>`).join('')}</div>`;(old||skills.lastElementChild)?.insertAdjacentElement('afterend',box);}
const featured=[...document.querySelectorAll('#projects .project-featured')];featured.slice(0,2).forEach((card,i)=>{if(card.querySelector('.case-mini'))return;const data=i===0?T.caseA:T.caseB,actions=card.querySelector('.project-actions');if(!actions)return;const wrap=document.createElement('div');wrap.className='case-mini';wrap.innerHTML=`<button type="button" class="case-toggle" aria-expanded="false"><span>${T.caseLabel}</span><b>${T.caseToggle}</b></button><div class="case-grid" hidden>${data.map(x=>`<div><small>${x[0]}</small><p>${x[1]}</p></div>`).join('')}</div>`;actions.before(wrap);const btn=wrap.querySelector('.case-toggle'),grid=wrap.querySelector('.case-grid');btn.addEventListener('click',()=>{const open=btn.getAttribute('aria-expanded')==='true';btn.setAttribute('aria-expanded',String(!open));grid.hidden=open;btn.querySelector('b').textContent=open?T.caseToggle:T.caseClose;});});
const exp=document.getElementById('experience');if(exp&&!document.getElementById('build-path')){const sec=document.createElement('section');sec.className='build-path view';sec.id='build-path';sec.innerHTML=`<div class="ph"><span class="s">◆</span><h2>${T.pathTitle}</h2><i>/ PATH</i></div><div class="path-sub">${T.pathSub}</div><div class="path-grid">${T.path.map((x,i)=>`<article><div class="path-index">0${i+1}</div><time>${x[0]}</time><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('')}</div>`;exp.before(sec);}
const current=document.querySelector('.current-build');if(current&&!document.querySelector('.github-signal')){const sec=document.createElement('section');sec.className='github-signal';sec.innerHTML=`<div class="signal-head"><div><b>${T.liveTitle}</b><span>${T.liveSub}</span></div><i class="signal-pulse" aria-hidden="true"></i></div><div class="signal-grid"><div><small>${T.repo}</small><strong>onel1t</strong></div><div><small>${T.latest}</small><strong id="ghCommit">${T.loading}</strong></div><div><small>${T.updated}</small><strong id="ghUpdated">—</strong></div><div><small>${T.branch}</small><strong id="ghBranch">main</strong></div></div><div class="signal-foot"><span id="ghStatus">github.com/onel1t111252-bit/onel1t</span><a href="https://github.com/onel1t111252-bit/onel1t" target="_blank" rel="noopener">${T.openGit}</a></div>`;current.insertAdjacentElement('afterend',sec);const clean=s=>(s||'').replace(/[<>]/g,'').trim();Promise.all([fetch('https://api.github.com/repos/onel1t111252-bit/onel1t',{headers:{Accept:'application/vnd.github+json'}}).then(r=>{if(!r.ok)throw new Error('repo');return r.json()}),fetch('https://api.github.com/repos/onel1t111252-bit/onel1t/commits?per_page=1',{headers:{Accept:'application/vnd.github+json'}}).then(r=>{if(!r.ok)throw new Error('commit');return r.json()})]).then(([repo,commits])=>{const c=commits&&commits[0];document.getElementById('ghCommit').textContent=c?clean((c.commit?.message||'').split('\n')[0]).slice(0,44):'—';const d=new Date(repo.updated_at);document.getElementById('ghUpdated').textContent=Number.isNaN(+d)?'—':d.toLocaleDateString(L==='uk'?'uk-UA':L==='cs'?'cs-CZ':'en-GB',{day:'2-digit',month:'short',year:'numeric'});document.getElementById('ghBranch').textContent=repo.default_branch||'main';document.getElementById('ghStatus').textContent=`${repo.size||0} KB · ${repo.open_issues_count||0} open issues · public`;sec.classList.add('is-live');}).catch(()=>{document.getElementById('ghCommit').textContent=T.unavailable;sec.classList.add('is-fallback');});}
const termForm=document.getElementById('terminalForm');if(termForm&&!termForm.dataset.ultimateCommands){termForm.dataset.ultimateCommands='1';termForm.addEventListener('submit',e=>{const input=document.getElementById('terminalInput'),screen=document.getElementById('terminalScreen');if(!input||!screen)return;const raw=input.value.trim(),cmd=raw.toLowerCase(),map={system:T.terminalSystem,status:T.terminalStatus,journey:T.terminalJourney,struggle:T.terminalStruggle};if(!map[cmd])return;e.preventDefault();e.stopImmediatePropagation();input.value='';const safe=raw.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));screen.insertAdjacentHTML('beforeend',`\n<span class="prompt-line">› ${safe}</span>\n<span class="accent">${map[cmd]}</span>`);screen.scrollTop=screen.scrollHeight;},true);const help=document.querySelector('.terminal-help');if(help)help.textContent+=' · system · status · journey · struggle';}
if(!document.querySelector('.back-top')){const b=document.createElement('button');b.className='back-top';b.type='button';b.setAttribute('aria-label',T.top);b.innerHTML='<span>↑</span><b>'+T.top+'</b>';document.body.append(b);const vis=()=>b.classList.toggle('show',scrollY>700);addEventListener('scroll',vis,{passive:true});vis();b.addEventListener('click',()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));}
if(!document.querySelector('link[rel="manifest"]')){const m=document.createElement('link');m.rel='manifest';m.href='site.webmanifest';document.head.append(m);}if(!document.querySelector('meta[name="color-scheme"]')){const m=document.createElement('meta');m.name='color-scheme';m.content='dark';document.head.append(m);}
if(!document.querySelector('script[data-onel1t-schema]')){const s=document.createElement('script');s.type='application/ld+json';s.dataset.onel1tSchema='1';s.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Person',name:'Maksym Dymchuk',alternateName:'Onel1t',url:'https://onel1t111252-bit.github.io/onel1t/',sameAs:['https://github.com/onel1t111252-bit'],knowsAbout:['Cybersecurity','Computer Networks','C++','Python','JavaScript','Windows','Blue Team','OSINT'],mainEntityOfPage:{'@type':'WebPage','@id':location.href.split('#')[0]}});document.head.append(s);}
document.querySelectorAll('#projects img').forEach(img=>{img.loading='lazy';img.decoding='async';});document.querySelectorAll('a[target="_blank"]').forEach(a=>{if(!a.rel.includes('noopener'))a.rel=(a.rel+' noopener').trim();});
})();


/* SOURCE 4: home-11.js */
(()=>{
'use strict';
const lang=(document.documentElement.lang||'en').toLowerCase();
const L=lang==='uk'?'uk':lang==='cs'?'cs':'en';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const T={
 en:{cmd:'COMMAND',search:'Search portfolio…',esc:'ESC',hint:'↑↓ navigate · Enter open · Esc close',noMatches:'NO MATCHES',all:'ALL',cyber:'CYBERSECURITY',net:'NETWORKING',dev:'DEVELOPMENT',filterTitle:'ADDITIONAL PROJECTS FILTER',filterSub:'AEGIS stays pinned above · filter the remaining projects by discipline',showing:'SHOWING',socTitle:'ONEL1T SECURITY CORE',socSub:'INTERACTIVE DEMO · SAFE SIMULATED EVENTS',demo:'DEMO DATA',system:'SYSTEM',firewall:'POLICY',network:'NETWORK',events:'EVENTS',online:'ONLINE',active:'ACTIVE',stable:'STABLE',feed:'EVENT STREAM',map:'NETWORK VIEW',localDemo:'LOCAL DEMO',topology:'LAB TOPOLOGY',note:'Educational interface demo. No live user traffic or private data is processed.',case:'CASE STUDY',open:'OPEN',actions:[['HM','Home','Hero and portfolio overview','#home'],['PR','Projects','Flagship systems and utilities','#projects'],['AE','AEGIS','Open the defensive security operations platform',`projects/aegis/index.html?lang=${L}`],['CL','Cyber Lab','Open the interactive cybersecurity lab','projects/cyber-lab/index.html'],['NX','NEXUS','Open the cyber intelligence workspace','projects/nexus/index.html'],['CV','CV','Open the English CV','cv.html'],['GH','GitHub','Open public source and build history','https://github.com/onel1t111252-bit'],['CT','Contact','Jump to contact section','#contact']],eventsList:[['AUTH_OK','Local session verified','OK'],['MFA_CHECK','Training identity check passed','OK'],['POLICY','Security policy state healthy','OK'],['NET_MAP','Lab topology synchronized','OK'],['LOG_REVIEW','Sample log batch indexed','OK'],['BACKUP','Demo workspace snapshot ready','OK'],['ALERT_TEST','Training alert queued','REVIEW']]},
 uk:{cmd:'КОМАНДИ',search:'Пошук у портфоліо…',esc:'ESC',hint:'↑↓ навігація · Enter відкрити · Esc закрити',noMatches:'НІЧОГО НЕ ЗНАЙДЕНО',all:'УСІ',cyber:'КІБЕРБЕЗПЕКА',net:'МЕРЕЖІ',dev:'РОЗРОБКА',filterTitle:'ФІЛЬТР ДОДАТКОВИХ ПРОЄКТІВ',filterSub:'AEGIS закріплений вище · інші проєкти можна фільтрувати за напрямом',showing:'ПОКАЗАНО',socTitle:'ONEL1T SECURITY CORE',socSub:'ІНТЕРАКТИВНЕ ДЕМО · БЕЗПЕЧНІ СИМУЛЬОВАНІ ПОДІЇ',demo:'ДЕМО-ДАНІ',system:'СИСТЕМА',firewall:'ПОЛІТИКА',network:'МЕРЕЖА',events:'ПОДІЇ',online:'ОНЛАЙН',active:'АКТИВНА',stable:'СТАБІЛЬНА',feed:'ПОТІК ПОДІЙ',map:'СХЕМА МЕРЕЖІ',localDemo:'ЛОКАЛЬНЕ ДЕМО',topology:'НАВЧАЛЬНА ТОПОЛОГІЯ',note:'Навчальна демонстрація інтерфейсу. Реальний трафік користувачів і приватні дані не обробляються.',case:'ОПИС ПРОЄКТУ',open:'ВІДКРИТИ',actions:[['ГЛ','Головна','Головний екран та огляд портфоліо','#home'],['ПР','Проєкти','Флагманські системи та утиліти','#projects'],['AE','AEGIS','Відкрити платформу операцій кіберзахисту',`projects/aegis/index.html?lang=${L}`],['CL','Cyber Lab','Відкрити інтерактивну лабораторію кібербезпеки','projects/cyber-lab/index.html'],['NX','NEXUS','Відкрити робочий простір кіберрозвідки','projects/nexus/index.html'],['CV','CV','Відкрити резюме','cv-uk.html'],['GH','GitHub','Відкрити публічний код та історію розробки','https://github.com/onel1t111252-bit'],['КТ','Контакти','Перейти до контактів','#contact']],eventsList:[['AUTH_OK','Локальну сесію перевірено','OK'],['MFA_CHECK','Навчальну перевірку особи пройдено','OK'],['POLICY','Стан політик безпеки нормальний','OK'],['NET_MAP','Топологію лабораторії синхронізовано','OK'],['LOG_REVIEW','Навчальний пакет журналів проіндексовано','OK'],['BACKUP','Демонстраційний знімок середовища готовий','OK'],['ALERT_TEST','Навчальне сповіщення додано','ПЕРЕГЛЯД']]},
 cs:{cmd:'PŘÍKAZY',search:'Hledat v portfoliu…',esc:'ESC',hint:'↑↓ navigace · Enter otevřít · Esc zavřít',noMatches:'NIC NENALEZENO',all:'VŠE',cyber:'KYBERNETICKÁ BEZPEČNOST',net:'SÍTĚ',dev:'VÝVOJ',filterTitle:'FILTR DALŠÍCH PROJEKTŮ',filterSub:'AEGIS zůstává připnutý výše · ostatní projekty lze filtrovat podle zaměření',showing:'ZOBRAZENO',socTitle:'ONEL1T SECURITY CORE',socSub:'INTERAKTIVNÍ DEMO · BEZPEČNĚ SIMULOVANÉ UDÁLOSTI',demo:'DEMO DATA',system:'SYSTÉM',firewall:'ZÁSADY',network:'SÍŤ',events:'UDÁLOSTI',online:'ONLINE',active:'AKTIVNÍ',stable:'STABILNÍ',feed:'PROUD UDÁLOSTÍ',map:'SÍŤOVÝ POHLED',localDemo:'LOKÁLNÍ DEMO',topology:'VÝUKOVÁ TOPOLOGIE',note:'Výuková demonstrace rozhraní. Nezpracovává živý provoz uživatelů ani soukromá data.',case:'PŘÍPADOVÁ STUDIE',open:'OTEVŘÍT',actions:[['DM','Domů','Hlavní obrazovka a přehled portfolia','#home'],['PR','Projekty','Hlavní systémy a nástroje','#projects'],['AE','AEGIS','Otevřít platformu bezpečnostních operací',`projects/aegis/index.html?lang=${L}`],['CL','Cyber Lab','Otevřít interaktivní laboratoř kybernetické bezpečnosti','projects/cyber-lab/index.html'],['NX','NEXUS','Otevřít pracovní prostředí kybernetické analýzy','projects/nexus/index.html'],['CV','CV','Otevřít životopis','cv-cz.html'],['GH','GitHub','Otevřít veřejný zdrojový kód','https://github.com/onel1t111252-bit'],['KT','Kontakt','Přejít na kontakt','#contact']],eventsList:[['AUTH_OK','Lokální relace ověřena','OK'],['MFA_CHECK','Výuková kontrola identity prošla','OK'],['POLICY','Bezpečnostní zásady jsou v pořádku','OK'],['NET_MAP','Laboratorní topologie synchronizována','OK'],['LOG_REVIEW','Ukázková dávka logů indexována','OK'],['BACKUP','Demonstrační snímek prostředí je připraven','OK'],['ALERT_TEST','Výukové upozornění zařazeno','KONTROLA']]}
}[L];

/* Command palette is managed exclusively by home-ui-stability.js.
   The previous instance registered a stale global keyboard listener. */

/* Interactive SOC-style dashboard using clearly labelled demo data. */
const feats=document.querySelector('.feats');if(feats&&!document.querySelector('.soc-section')){
 const sec=document.createElement('section');sec.className='soc-section';sec.innerHTML=`<div class="ph"><span class="s">◆</span><h2>${T.socTitle}</h2><i>/ SOC</i></div><div class="soc-shell"><div class="soc-top"><div class="soc-title"><b>${T.socTitle}</b><span>${T.socSub}</span></div><div class="soc-demo"><i></i>${T.demo}</div></div><div class="soc-grid"><div class="soc-stat"><small>${T.system}</small><strong><i></i>${T.online}</strong></div><div class="soc-stat"><small>${T.firewall}</small><strong><i></i>${T.active}</strong></div><div class="soc-stat"><small>${T.network}</small><strong><i></i>${T.stable}</strong></div><div class="soc-stat"><small>${T.events}</small><strong id="socCount">07</strong></div></div><div class="soc-body"><div class="soc-feed"><div class="soc-feed-head"><span>${T.feed}</span><span>${T.localDemo}</span></div><div class="soc-feed-list"></div></div><div class="soc-map"><div class="soc-map-head"><span>${T.map}</span><span>${T.topology}</span></div><div class="node-map"><div class="map-node n1">CLIENT</div><div class="map-node n2">CORE</div><div class="map-node n3">SOC</div><div class="map-node n4">LAB</div></div></div></div><div class="soc-note"><b>INFO:</b> ${T.note}</div></div>`;feats.after(sec);
 const feed=sec.querySelector('.soc-feed-list');let idx=0;
 const stamp=()=>new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
 const addEvent=(fresh=false)=>{const ev=T.eventsList[idx%T.eventsList.length];idx++;const row=document.createElement('div');row.className='soc-event'+(ev[2]==='REVIEW'?' warn':'')+(fresh?' new':'');row.innerHTML=`<time>${stamp()}</time><b>${ev[0]}</b><span>${ev[1]}</span><em>${ev[2]}</em>`;feed.prepend(row);while(feed.children.length>5)feed.lastElementChild.remove();if(fresh)setTimeout(()=>row.classList.remove('new'),700)};
 for(let i=0;i<5;i++)addEvent(false);
  let feedVisible=false;
  if('IntersectionObserver' in window){
    const watcher=new IntersectionObserver(entries=>{feedVisible=entries.some(e=>e.isIntersecting)},{rootMargin:'250px'});
    watcher.observe(sec);
  }else feedVisible=true;
  if(!reduced)setInterval(()=>{
    if(feedVisible&&!document.hidden&&!document.documentElement.classList.contains('perf-lite'))addEvent(true);
  },4200);
}

/* Filters cover the eight static project cards; AEGIS remains pinned above as the primary flagship. */
const projects=document.getElementById('projects'),grid=projects?.querySelector('.pgrid');if(projects&&grid&&!projects.querySelector('.project-filter-wrap')){
 const cards=[...grid.querySelectorAll('.pc')];const cats=[['cyber'],['cyber','net'],['dev'],['cyber','dev'],['cyber','dev'],['net','dev'],['cyber','dev'],['cyber']];cards.forEach((c,i)=>c.dataset.cats=(cats[i]||['dev']).join(' '));
 const bar=document.createElement('div');bar.className='project-filter-wrap';bar.innerHTML=`<div class="project-filter-copy"><b>${T.filterTitle}</b><span>${T.filterSub} · <strong class="project-count">${T.showing} ${cards.length}/${cards.length}</strong></span></div><div class="project-filters"><button type="button" class="project-filter active" data-filter="all">${T.all}</button><button type="button" class="project-filter" data-filter="cyber">${T.cyber}</button><button type="button" class="project-filter" data-filter="net">${T.net}</button><button type="button" class="project-filter" data-filter="dev">${T.dev}</button></div>`;grid.before(bar);
 const count=bar.querySelector('.project-count'),sub=grid.querySelector('.project-subgrid-title');
 const apply=f=>{let n=0;cards.forEach(c=>{const show=f==='all'||c.dataset.cats.split(' ').includes(f);c.hidden=!show;if(show){n++;c.classList.remove('project-filtered-in');void c.offsetWidth;c.classList.add('project-filtered-in')}});bar.querySelectorAll('.project-filter').forEach(b=>b.classList.toggle('active',b.dataset.filter===f));count.textContent=`${T.showing} ${n}/${cards.length}`;if(sub){const compact=cards.slice(2).some(c=>!c.hidden);sub.hidden=!compact;}};
 bar.addEventListener('click',e=>{const b=e.target.closest('.project-filter');if(b)apply(b.dataset.filter)});
}

/* Small visual gallery inside the two static flagship cards. AEGIS has its own dedicated showcase. */
const featured=[...document.querySelectorAll('#projects .project-featured')];featured.slice(0,2).forEach((card,i)=>{if(card.querySelector('.flagship-gallery-strip'))return;const actions=card.querySelector('.project-actions');if(!actions)return;const g=document.createElement('div');g.className='flagship-gallery-strip';const img=i===0?'assets/optimized/cyber-lab-cover.webp':'assets/optimized/nexus-cover.webp';const caseHref=i===0?`projects/cyber-lab/case-study.html?lang=${L}`:`projects/nexus/case-study.html?lang=${L}`;g.innerHTML=`<a href="${caseHref}"><img src="${img}" alt=""><span>${T.case}</span><small>${T.open} →</small></a><div><span>${i===0?'SOC SIMULATION':'SOC + OSINT'}</span><small>${i===0?'Incident workflow · network view':'Case tracking · investigation workspace'}</small></div><div><span>${i===0?'LOCAL-FIRST':'REPORT WORKFLOW'}</span><small>${i===0?'Browser-side learning tools':'Structured analysis and export'}</small></div>`;actions.before(g);});
})();


/* SOURCE 5: home-12.js */
(()=>{
'use strict';
const lang=(document.documentElement.lang||'en').toLowerCase();
const L=lang==='uk'?'uk':lang==='cs'?'cs':'en';
const cvHref=L==='uk'?'cv-uk.html':L==='cs'?'cv-cz.html':'cv.html';
const email='onel1t111252@gmail.com';
const T={
 en:{role:'ROLE TARGET · CYBERSECURITY INTERN / JUNIOR IT / SOC-ORIENTED STUDENT',career:'CAREER SIGNAL',careerTitle:'Why me?',careerText:'I combine cybersecurity studies, hands-on IT internships, network labs, programming and customer-facing technical experience. I learn by building practical tools and turning coursework into usable projects.',proof:['3 IT internships','Cybersecurity studies','Networks + code','EN / UA / CZ portfolio','Support experience'],cv:'OPEN CV',exp:'EXPERIENCE',buildSub:'Portfolio focus and flagship systems',flagship:'FLAGSHIP',aegis:'Local-first defensive security operations platform connecting incidents, asset context, risk decisions, response playbooks and analyst reporting.',lab:'Defensive learning platform with SOC-style simulations, network views and client-side exercises.',nexus:'Cyber-intelligence workspace for triage, OSINT notes, network context, case tracking and reporting.',open:'OPEN',console:'CAREER CONSOLE',consoleHint:'try: help · cv · projects · experience · contact',consoleAria:'Career console command',run:'RUN',commands:['help','cv','projects','experience','contact','github'],help:'Commands: help, cv, projects, experience, contact, github',about:'Profile: cybersecurity student focused on networks, defensive security, software development and practical IT work.',skills:'Core skills: cybersecurity fundamentals, Blue Team concepts, networking, Cisco, Windows, C++, C#, Python, JavaScript and troubleshooting.',projects:'Flagships: ONEL1T AEGIS, ONEL1T Cyber Lab and ONEL1T NEXUS. Additional projects cover networking, phishing analysis, passwords, log triage and programming.',experience:'Experience: 3 IT internships plus telecom customer/service experience.',contact:`Email: ${email}`,unknown:'Unknown command. Type help.',spot:'PROJECT SPOTLIGHT',spotTitle:'Flagship work, explained clearly',spotSub:'A recruiter-friendly view of what each flagship solves, how it works and what it demonstrates.',problem:'PROBLEM',solution:'SOLUTION',signal:'SIGNAL',aegisProblem:'Defensive-security concepts are often studied in separate tools and isolated exercises.',aegisSolution:'One local workspace connects synthetic incidents, assets, risks, response steps and reporting.',aegisSignal:'Shows defensive workflow design, state management, information architecture and product thinking.',labProblem:'Security theory can feel abstract without a safe place to practise.',labSolution:'Interactive SOC-style scenarios, network visualization and defensive browser-based exercises.',labSignal:'Shows practical security thinking, UI engineering and client-side workflow design.',nexusProblem:'Investigation context gets scattered across notes, alerts and separate tools.',nexusSolution:'One workspace for SOC triage, OSINT notes, network context, cases and report export.',nexusSignal:'Shows structured investigation thinking, information design and workflow building.',case:'CASE STUDY',opLabel:'OPPORTUNITIES',opTitle:'Open to internships, junior IT/cybersecurity roles and collaboration.',opText:'The best fit is practical work around cybersecurity, networks, technical support, SOC-oriented learning or junior development.',mail:'EMAIL',github:'GITHUB'},
 uk:{role:'ЦІЛЬОВІ РОЛІ · CYBERSECURITY INTERN / JUNIOR IT / SOC-ОРІЄНТОВАНИЙ СТУДЕНТ',career:'КАР’ЄРНИЙ ПРОФІЛЬ',careerTitle:'Чому саме я?',careerText:'Поєдную навчання з кібербезпеки, практичні IT-стажування, мережеві лабораторії, програмування та досвід технічної комунікації з клієнтами. Найкраще навчаюся через практику й перетворюю навчальні задачі на робочі проєкти.',proof:['3 IT-практики','Кібербезпека','Мережі + код','Портфоліо EN / UA / CZ','Досвід підтримки'],cv:'ВІДКРИТИ CV',exp:'ДОСВІД',buildSub:'Фокус портфоліо та флагманські системи',flagship:'ФЛАГМАНСЬКИЙ ПРОЄКТ',aegis:'Локальна платформа операцій кіберзахисту, що поєднує інциденти, контекст активів, ризики, сценарії реагування та звітність аналітика.',lab:'Навчальна платформа кіберзахисту із SOC-симуляціями, візуалізацією мережі та локальними вправами у браузері.',nexus:'Робочий простір кіберрозвідки для опрацювання подій, OSINT-нотаток, мережевого контексту, справ і звітності.',open:'ВІДКРИТИ',console:'КАР’ЄРНА КОНСОЛЬ',consoleHint:'команди: help · cv · projects · experience · contact',consoleAria:'Команда кар’єрної консолі',run:'ВИКОНАТИ',commands:['help','cv','projects','experience','contact','github'],help:'Команди: help, cv, projects, experience, contact, github',about:'Профіль: студент кібербезпеки з фокусом на мережах, кіберзахисті, розробці та практичній IT-роботі.',skills:'Ключові навички: основи кібербезпеки, концепції Blue Team, мережі, Cisco, Windows, C++, C#, Python, JavaScript і діагностика.',projects:'Флагмани: ONEL1T AEGIS, ONEL1T Cyber Lab та ONEL1T NEXUS. Інші проєкти охоплюють мережі, аналіз фішингу, паролі, журнали подій і програмування.',experience:'Досвід: 3 IT-практики та телеком-досвід у роботі з клієнтами й сервісними процесами.',contact:`Email: ${email}`,unknown:'Невідома команда. Введи help.',spot:'ОГЛЯД ПРОЄКТІВ',spotTitle:'Флагманські роботи без зайвого шуму',spotSub:'Зрозумілий для рекрутера огляд: яку проблему вирішує кожен флагман, як він працює і що демонструє.',problem:'ПРОБЛЕМА',solution:'РІШЕННЯ',signal:'ЩО ДЕМОНСТРУЄ',aegisProblem:'Концепції кіберзахисту часто вивчаються в окремих інструментах і не пов’язаних між собою вправах.',aegisSolution:'Єдиний локальний простір поєднує синтетичні інциденти, активи, ризики, кроки реагування та звітність.',aegisSignal:'Проєктування захисного процесу, керування станом, інформаційну архітектуру та продуктове мислення.',labProblem:'Теорія безпеки залишається абстрактною без безпечного середовища для практики.',labSolution:'SOC-сценарії, візуалізація мережі та захисні вправи, що працюють локально у браузері.',labSignal:'Практичне безпекове мислення, розробку інтерфейсів і побудову клієнтських процесів.',nexusProblem:'Контекст розслідування часто розкиданий між нотатками, подіями та різними інструментами.',nexusSolution:'Єдиний простір для опрацювання SOC-подій, OSINT, мережевого контексту, справ та експорту звітів.',nexusSignal:'Структурне мислення під час аналізу, інформаційний дизайн і побудову робочих процесів.',case:'ОПИС ПРОЄКТУ',opLabel:'МОЖЛИВОСТІ',opTitle:'Відкритий до стажувань, junior IT/cybersecurity ролей та співпраці.',opText:'Найкраще підходять практичні задачі у кібербезпеці, мережах, технічній підтримці, SOC-напрямі або junior-розробці.',mail:'EMAIL',github:'GITHUB'},
 cs:{role:'CÍLOVÉ ROLE · CYBERSECURITY INTERN / JUNIOR IT / SOC-ORIENTOVANÝ STUDENT',career:'KARIÉRNÍ PROFIL',careerTitle:'Proč já?',careerText:'Spojuji studium kybernetické bezpečnosti, praktické IT stáže, síťové laboratoře, programování a zkušenost s technickou komunikací se zákazníky. Nejlépe se učím tvorbou praktických nástrojů a převáděním školních úloh do použitelných projektů.',proof:['3 IT praxe','Kybernetická bezpečnost','Sítě + kód','Portfolio EN / UA / CZ','Zkušenost s podporou'],cv:'OTEVŘÍT CV',exp:'PRAXE',buildSub:'Zaměření portfolia a hlavní systémy',flagship:'HLAVNÍ PROJEKT',aegis:'Lokální platforma bezpečnostních operací propojující incidenty, kontext aktiv, rizika, postupy reakce a reporting analytika.',lab:'Výuková platforma kybernetické bezpečnosti se SOC simulacemi, síťovými pohledy a lokálními cvičeními v prohlížeči.',nexus:'Pracovní prostředí kybernetické analýzy pro zpracování událostí, OSINT poznámky, síťový kontext, případy a reporting.',open:'OTEVŘÍT',console:'KARIÉRNÍ KONZOLE',consoleHint:'příkazy: help · cv · projects · experience · contact',consoleAria:'Příkaz kariérní konzole',run:'SPUSTIT',commands:['help','cv','projects','experience','contact','github'],help:'Příkazy: help, cv, projects, experience, contact, github',about:'Profil: student kybernetické bezpečnosti zaměřený na sítě, obrannou bezpečnost, vývoj a praktickou IT práci.',skills:'Klíčové dovednosti: základy kybernetické bezpečnosti, koncepty Blue Team, sítě, Cisco, Windows, C++, C#, Python, JavaScript a diagnostika.',projects:'Hlavní projekty: ONEL1T AEGIS, ONEL1T Cyber Lab a ONEL1T NEXUS. Další projekty pokrývají sítě, analýzu phishingu, hesla, logy a programování.',experience:'Zkušenosti: 3 IT praxe a telekomunikační zkušenost se zákazníky a servisními procesy.',contact:`Email: ${email}`,unknown:'Neznámý příkaz. Napiš help.',spot:'PŘEHLED PROJEKTŮ',spotTitle:'Hlavní projekty vysvětlené jasně',spotSub:'Pohled pro recruitera na problém, řešení a technický přínos každého hlavního projektu.',problem:'PROBLÉM',solution:'ŘEŠENÍ',signal:'CO UKAZUJE',aegisProblem:'Koncepty kybernetické obrany se často studují v oddělených nástrojích a nesouvisejících cvičeních.',aegisSolution:'Jedno lokální prostředí propojuje syntetické incidenty, aktiva, rizika, kroky reakce a reporting.',aegisSignal:'Návrh obranného procesu, správu stavu, informační architekturu a produktové myšlení.',labProblem:'Bezpečnostní teorie zůstává abstraktní bez bezpečného prostředí pro praxi.',labSolution:'SOC scénáře, vizualizace sítě a obranná cvičení běžící lokálně v prohlížeči.',labSignal:'Praktické bezpečnostní myšlení, návrh rozhraní a tvorbu klientských pracovních postupů.',nexusProblem:'Kontext vyšetřování bývá rozptýlen mezi poznámky, události a oddělené nástroje.',nexusSolution:'Jedno prostředí pro zpracování SOC událostí, OSINT, síťový kontext, případy a export reportů.',nexusSignal:'Strukturované analytické myšlení, informační design a návrh pracovních postupů.',case:'PŘÍPADOVÁ STUDIE',opLabel:'PŘÍLEŽITOSTI',opTitle:'Otevřený stážím, junior IT/kybernetickým rolím a spolupráci.',opText:'Nejlépe mi vyhovuje praktická práce v kybernetické bezpečnosti, sítích, technické podpoře, SOC nebo juniorním vývoji.',mail:'E-MAIL',github:'GITHUB'}
}[L];

const heroCopy=document.querySelector('.hero-c');
if(heroCopy&&!heroCopy.querySelector('.career-role-chip')){const chip=document.createElement('div');chip.className='career-role-chip';chip.textContent=T.role;heroCopy.appendChild(chip);}

const about=document.getElementById('about');
if(about&&!document.querySelector('.career-layer')){
 const sec=document.createElement('section');sec.className='career-layer view';
 const build=(name,desc,tags,href)=>`<article class="career-build"><div class="status">${T.flagship}</div><h3>${name}</h3><p>${desc}</p><div class="stack">${tags.map(x=>`<span>${x}</span>`).join('')}</div><a href="${href}">${T.open} ↗</a></article>`;
 sec.innerHTML=`<div class="career-head"><div><small>${T.career}</small><h2>${T.careerTitle}</h2></div><p>${T.buildSub}</p></div><div class="career-grid"><article class="career-why"><div class="career-label">PROFILE / VALUE</div><h3>${T.careerTitle}</h3><p>${T.careerText}</p><div class="career-proof">${T.proof.map(x=>`<span>${x}</span>`).join('')}</div><div class="career-links"><a href="${cvHref}">${T.cv} ↗</a><a href="${cvHref}#experience">${T.exp} ↗</a></div></article><div class="career-builds">${build('ONEL1T AEGIS',T.aegis,['DEFENSIVE','INCIDENTS','RISK'],`projects/aegis/index.html?lang=${L}`)}${build('ONEL1T Cyber Lab',T.lab,['BLUE TEAM','NETWORK','JS'],'projects/cyber-lab/index.html')}${build('ONEL1T NEXUS',T.nexus,['SOC','OSINT','WORKFLOW'],'projects/nexus/index.html')}</div><article class="career-console"><div class="career-console-bar"><b>${T.console}</b><span>${T.consoleHint}</span></div><div class="career-console-body"><div class="career-console-output"><b>onel1t@portfolio:~$</b> help\n${T.help}</div><form class="career-console-form"><label>$</label><input autocomplete="off" spellcheck="false" aria-label="${T.consoleAria}"><button type="submit">${T.run}</button></form></div><div class="career-command-row">${T.commands.map(c=>`<button type="button" data-command="${c}">${c}</button>`).join('')}</div></article></div>`;
 about.insertAdjacentElement('afterend',sec);
 const out=sec.querySelector('.career-console-output'),input=sec.querySelector('input'),form=sec.querySelector('form');
 const act=raw=>{const c=(raw||'').trim().toLowerCase();if(!c)return;const prefix='<b>onel1t@portfolio:~$</b> '+c+'\n';if(c==='help')out.innerHTML=prefix+T.help;else if(c==='about')out.innerHTML=prefix+T.about;else if(c==='skills')out.innerHTML=prefix+T.skills;else if(c==='projects'){out.innerHTML=prefix+T.projects;document.getElementById('projects')?.scrollIntoView({behavior:'smooth',block:'start'});}else if(c==='experience'){out.innerHTML=prefix+T.experience;document.getElementById('experience')?.scrollIntoView({behavior:'smooth',block:'start'});}else if(c==='contact'){out.innerHTML=prefix+T.contact;document.getElementById('contact')?.scrollIntoView({behavior:'smooth',block:'start'});}else if(c==='cv')location.href=cvHref;else if(c==='github')window.open('https://github.com/onel1t111252-bit','_blank','noopener');else out.innerHTML=prefix+T.unknown;};
 form.addEventListener('submit',e=>{e.preventDefault();act(input.value);input.value='';});sec.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.command)));
}

const exp=document.getElementById('experience');
if(exp&&!document.querySelector('.project-spotlight')){
 const projects={
  aegis:{title:'ONEL1T AEGIS',problem:T.aegisProblem,solution:T.aegisSolution,signal:T.aegisSignal,href:`projects/aegis/index.html?lang=${L}`,caseHref:`projects/aegis/case-study.html?lang=${L}`},
  lab:{title:'ONEL1T Cyber Lab',problem:T.labProblem,solution:T.labSolution,signal:T.labSignal,href:'projects/cyber-lab/index.html',caseHref:`projects/cyber-lab/case-study.html?lang=${L}`},
  nexus:{title:'ONEL1T NEXUS',problem:T.nexusProblem,solution:T.nexusSolution,signal:T.nexusSignal,href:'projects/nexus/index.html',caseHref:`projects/nexus/case-study.html?lang=${L}`}
 };
 const s=document.createElement('section');s.className='project-spotlight view';s.innerHTML=`<div class="spotlight-head"><div><small>${T.spot}</small><h2>${T.spotTitle}</h2></div><p>${T.spotSub}</p></div><div class="spotlight-tabs"><button type="button" class="active" data-project="aegis">AEGIS</button><button type="button" data-project="lab">CYBER LAB</button><button type="button" data-project="nexus">NEXUS</button></div><article class="spotlight-panel"></article>`;
 exp.insertAdjacentElement('beforebegin',s);
 const panel=s.querySelector('.spotlight-panel'),buttons=[...s.querySelectorAll('[data-project]')];
 const render=key=>{const p=projects[key];panel.innerHTML=`<div class="spotlight-copy"><small>${T.spot}</small><h3>${p.title}</h3><div class="spotlight-flow"><div><b>${T.problem}</b><p>${p.problem}</p></div><div><b>${T.solution}</b><p>${p.solution}</p></div><div><b>${T.signal}</b><p>${p.signal}</p></div></div><div class="spotlight-actions"><a href="${p.href}">${T.open} ↗</a><a href="${p.caseHref}">${T.case} ↗</a></div></div>`;buttons.forEach(b=>b.classList.toggle('active',b.dataset.project===key));};
 buttons.forEach(b=>b.addEventListener('click',()=>render(b.dataset.project)));render('aegis');
}

const contact=document.getElementById('contact');
if(contact&&!document.querySelector('.opportunity-cta')){const s=document.createElement('section');s.className='opportunity-cta';s.innerHTML=`<div><small>${T.opLabel}</small><h2>${T.opTitle}</h2><p>${T.opText}</p></div><div class="opportunity-actions"><a href="mailto:${email}">${T.mail} ↗</a><a href="${cvHref}">${T.cv} ↗</a><a href="https://github.com/onel1t111252-bit" target="_blank" rel="noopener">${T.github} ↗</a></div>`;contact.insertAdjacentElement('beforebegin',s);}
})();

/* SOURCE 6: home-13.js */
(()=>{
'use strict';
const lang=(document.documentElement.lang||'en').toLowerCase();
const L=lang==='uk'?'uk':lang==='cs'?'cs':'en';
const cvHref=L==='uk'?'cv-uk.html':L==='cs'?'cv-cz.html':'cv.html';
const safeSession={get(k){try{return sessionStorage.getItem(k)}catch{return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch{}}};
const T={
 en:{recruit:'RECRUITER VIEW',visual:'VISUAL VIEW',proof:'PROOF OF WORK',proofTitle:'Skills backed by real project evidence',proofSub:'A faster way to see where each skill appears in the portfolio.',evidence:'EVIDENCE',experienceLabel:'EXPERIENCE',proofs:[['SECURITY','ONEL1T AEGIS · Cyber Lab · Log Triage','Defensive analysis, incident workflows, security signals and safe browser-based exercises.',['AEGIS|projects/aegis/index.html?lang=en','Cyber Lab|projects/cyber-lab/index.html','Log Triage|projects/security-log-triage/index.html']],['NETWORKING','NEXUS · IPv4 Calculator · Packet Tracer','Topology thinking, IPv4/CIDR and network context inside practical tools.',['NEXUS|projects/nexus/index.html','IPv4 Tool|projects/ipv4-subnet-calculator/index.html']],['DEVELOPMENT','Portfolio · C++ Toolkit · Python Utilities','C++, Python, JavaScript and responsive interfaces used in working projects.',['C++ Toolkit|projects/cpp-console-toolkit/index.html','Python Utilities|projects/python-security-utilities/index.html']],['SUPPORT','IT internships · Kyivstar','Structured troubleshooting, process discipline and technical communication.',[`CV|${cvHref}#experience`]]],xp:'INTERACTIVE EXPERIENCE',xpTitle:'Experience timeline',xpSub:'Select a role to see the practical context and what it added to my profile.',xps:[['01','MagneticOne — IT Internship','07.07.2026 – 30.07.2026 · Ternopil','Worked around security-system tasks, internal procedures and restricted internship access.','SECURITY SYSTEMS|PROCESS|SUPPORT'],['02','Forte Group — IT Internship','07.07.2025 – 30.07.2025 · Ternopil','Supported security-system-related tasks under supervision and within assigned permissions.','SECURITY WORKFLOWS|SUPPORT|DISCIPLINE'],['03','Yaware — IT Internship','01.03.2025 – 01.04.2025 · Ternopil','Learned professional workflows while assisting with security-system-related work under limited access.','SECURITY SYSTEMS|WORKFLOW|LEARNING'],['04','Kyivstar','Ended 05.09.2026 · Telecommunications','Customer communication, service processes, telecom products and technical questions.','CUSTOMER SUPPORT|TELECOM|COMMUNICATION']],demo:'PROJECT DEMO MODE',demoTitle:'Safe simulated previews',demoSub:'These mini previews are illustrative UI demos only — no live user traffic or private data.',sim:'SIMULATED',lab:'Cyber Lab event flow',nexus:'NEXUS network context',labRows:[['AUTH CHECK','PASS'],['MFA POLICY','OK'],['LOG REVIEW','READY']],nodes:['CLIENT','CORE','SOC','CASE']},
 uk:{recruit:'РЕЖИМ ДЛЯ РЕКРУТЕРА',visual:'ВІЗУАЛЬНИЙ РЕЖИМ',proof:'ПІДТВЕРДЖЕННЯ НАВИЧОК',proofTitle:'Навички, підтверджені реальними проєктами',proofSub:'Швидкий спосіб побачити, де саме кожна навичка використана у портфоліо.',evidence:'ПРИКЛАДИ',experienceLabel:'ДОСВІД',proofs:[['БЕЗПЕКА','ONEL1T AEGIS · Cyber Lab · Аналіз логів','Захисний аналіз, опрацювання інцидентів, сигнали безпеки та безпечні вправи у браузері.',['AEGIS|projects/aegis/index.html?lang=uk','Cyber Lab|projects/cyber-lab/index.html','Аналіз логів|projects/security-log-triage/index.html']],['МЕРЕЖІ','NEXUS · IPv4 Calculator · Packet Tracer','Топології, IPv4/CIDR та мережевий контекст у практичних інструментах.',['NEXUS|projects/nexus/index.html','IPv4 Tool|projects/ipv4-subnet-calculator/index.html']],['РОЗРОБКА','Портфоліо · C++ Toolkit · Python Utilities','C++, Python, JavaScript та адаптивні інтерфейси у робочих проєктах.',['C++ Toolkit|projects/cpp-console-toolkit/index.html','Python Utilities|projects/python-security-utilities/index.html']],['ПІДТРИМКА','IT-практики · Київстар','Системна діагностика, дисципліна процесів і технічна комунікація.',[`CV|${cvHref}#experience`]]],xp:'ІНТЕРАКТИВНИЙ ДОСВІД',xpTitle:'Хронологія досвіду',xpSub:'Обери роль, щоб швидко побачити практичний контекст і її внесок у технічний профіль.',xps:[['01','MagneticOne — IT-практика','07.07.2026 – 30.07.2026 · Тернопіль','Робота із завданнями навколо систем безпеки, внутрішніми процедурами та обмеженим доступом практиканта.','СИСТЕМИ БЕЗПЕКИ|ПРОЦЕСИ|ПІДТРИМКА'],['02','Forte Group — IT-практика','07.07.2025 – 30.07.2025 · Тернопіль','Підтримка завдань, пов’язаних із системами безпеки, під наглядом і в межах наданих дозволів.','БЕЗПЕКОВІ ПРОЦЕСИ|ПІДТРИМКА|ДИСЦИПЛІНА'],['03','Yaware — IT-практика','01.03.2025 – 01.04.2025 · Тернопіль','Знайомство з професійними процесами та допомога із завданнями навколо систем безпеки за обмеженого доступу.','СИСТЕМИ БЕЗПЕКИ|РОБОЧІ ПРОЦЕСИ|НАВЧАННЯ'],['04','Київстар','Завершено 05.09.2026 · Телекомунікації','Комунікація з клієнтами, сервісні процеси, телеком-продукти й технічні питання.','ПІДТРИМКА КЛІЄНТІВ|ТЕЛЕКОМ|КОМУНІКАЦІЯ']],demo:'ДЕМО ПРОЄКТІВ',demoTitle:'Безпечні симульовані приклади',demoSub:'Ці міні-демо лише ілюструють інтерфейс — вони не обробляють реальний трафік чи приватні дані.',sim:'СИМУЛЯЦІЯ',lab:'Потік подій Cyber Lab',nexus:'Мережевий контекст NEXUS',labRows:[['ПЕРЕВІРКА ВХОДУ','УСПІШНО'],['ПОЛІТИКА MFA','НОРМА'],['ПЕРЕГЛЯД ЛОГІВ','ГОТОВО']],nodes:['КЛІЄНТ','ЯДРО','SOC','СПРАВА']},
 cs:{recruit:'REŽIM PRO RECRUITERY',visual:'VIZUÁLNÍ REŽIM',proof:'DŮKAZY PRAXE',proofTitle:'Dovednosti podložené reálnými projekty',proofSub:'Rychlý pohled na to, kde se jednotlivé dovednosti v portfoliu skutečně používají.',evidence:'DŮKAZY',experienceLabel:'PRAXE',proofs:[['BEZPEČNOST','ONEL1T AEGIS · Cyber Lab · Analýza logů','Defenzivní analýza, zpracování incidentů, bezpečnostní signály a bezpečná cvičení v prohlížeči.',['AEGIS|projects/aegis/index.html?lang=cs','Cyber Lab|projects/cyber-lab/index.html','Analýza logů|projects/security-log-triage/index.html']],['SÍTĚ','NEXUS · IPv4 Calculator · Packet Tracer','Topologie, IPv4/CIDR a síťový kontext v praktických nástrojích.',['NEXUS|projects/nexus/index.html','IPv4 Tool|projects/ipv4-subnet-calculator/index.html']],['VÝVOJ','Portfolio · C++ Toolkit · Python Utilities','C++, Python, JavaScript a responzivní rozhraní v reálných projektech.',['C++ Toolkit|projects/cpp-console-toolkit/index.html','Python Utilities|projects/python-security-utilities/index.html']],['PODPORA','IT praxe · Kyivstar','Systematická diagnostika, procesní disciplína a technická komunikace.',[`CV|${cvHref}#experience`]]],xp:'INTERAKTIVNÍ PRAXE',xpTitle:'Časová osa zkušeností',xpSub:'Vyber roli a zobraz praktický kontext a přínos pro technický profil.',xps:[['01','MagneticOne — IT praxe','07.07.2026 – 30.07.2026 · Ternopil','Úkoly kolem bezpečnostních systémů, interních postupů a omezeného přístupu praktikanta.','BEZPEČNOSTNÍ SYSTÉMY|PROCESY|PODPORA'],['02','Forte Group — IT praxe','07.07.2025 – 30.07.2025 · Ternopil','Podpora úkolů spojených s bezpečnostními systémy pod dohledem a v rámci přidělených oprávnění.','BEZPEČNOSTNÍ PROCESY|PODPORA|DISCIPLÍNA'],['03','Yaware — IT praxe','01.03.2025 – 01.04.2025 · Ternopil','Seznámení s profesionálními procesy a pomoc s úlohami kolem bezpečnostních systémů při omezeném přístupu.','BEZPEČNOSTNÍ SYSTÉMY|PRACOVNÍ POSTUPY|UČENÍ'],['04','Kyivstar','Ukončeno 05.09.2026 · Telekomunikace','Komunikace se zákazníky, servisní procesy, telekomunikační produkty a technické dotazy.','ZÁKAZNICKÁ PODPORA|TELEKOM|KOMUNIKACE']],demo:'DEMO PROJEKTŮ',demoTitle:'Bezpečné simulované náhledy',demoSub:'Tyto mini náhledy jsou pouze ilustrační — nezpracovávají živý provoz ani soukromá data.',sim:'SIMULACE',lab:'Tok událostí Cyber Lab',nexus:'Síťový kontext NEXUS',labRows:[['KONTROLA PŘIHLÁŠENÍ','OK'],['ZÁSADY MFA','OK'],['KONTROLA LOGŮ','PŘIPRAVENO']],nodes:['KLIENT','JÁDRO','SOC','PŘÍPAD']}
}[L];

/* Recruiter control is installed once by home-ui-stability.js,
   avoiding duplicate setup and removal during initial rendering. */

const projects=document.getElementById('projects');
if(projects&&!document.querySelector('.proof-section')){
 const sec=document.createElement('section');sec.className='proof-section';sec.id='proof-of-work';sec.innerHTML=`<div class="proof-head"><div><small>${T.proof}</small><h2>${T.proofTitle}</h2></div><p>${T.proofSub}</p></div><div class="proof-grid">${T.proofs.map((p,i)=>`<article class="proof-card"><div class="proof-skill"><small>0${i+1} / ${T.evidence}</small><b>${p[0]}</b><em>${p[1]}</em></div><div class="proof-evidence"><h3>${p[1]}</h3><p>${p[2]}</p><div class="proof-links">${p[3].map(v=>{const [label,href]=v.split('|');return `<a href="${href}">${label} ↗</a>`}).join('')}</div></div></article>`).join('')}</div>`;
 projects.insertAdjacentElement('afterend',sec);
}

const exp=document.getElementById('experience');
if(exp&&!document.querySelector('.experience-lab')){
 const rows=T.labRows.map((r,i)=>`<div><time>09:${41+i}</time><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
 const nodes=`<svg class="demo-topology" viewBox="0 0 600 200" role="img" aria-label="${T.nexus}" xmlns="http://www.w3.org/2000/svg">
  <title>${T.nexus}</title>
  <g class="demo-topology-links" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path class="demo-route-base" d="M146 100 H224 M350 100 H397 V50 H446 M350 100 H397 V152 H446"/>
   <path class="demo-route-active" d="M146 100 H224 M350 100 H397 V50 H446 M350 100 H397 V152 H446"/>
  </g>
  <circle class="demo-route-junction" cx="397" cy="100" r="4"/>
  <g class="demo-topology-node client"><rect x="20" y="77" width="126" height="46" rx="9"/><circle cx="44" cy="100" r="10"/><text class="demo-node-index" x="44" y="104" text-anchor="middle">01</text><text class="demo-node-label" x="62" y="105">${T.nodes[0]}</text></g>
  <g class="demo-topology-node core"><rect x="224" y="77" width="126" height="46" rx="9"/><circle cx="248" cy="100" r="10"/><text class="demo-node-index" x="248" y="104" text-anchor="middle">02</text><text class="demo-node-label" x="266" y="105">${T.nodes[1]}</text></g>
  <g class="demo-topology-node soc"><rect x="446" y="25" width="134" height="50" rx="9"/><circle cx="470" cy="50" r="10"/><text class="demo-node-index" x="470" y="54" text-anchor="middle">03</text><text class="demo-node-label" x="488" y="55">${T.nodes[2]}</text></g>
  <g class="demo-topology-node case"><rect x="446" y="127" width="134" height="50" rx="9"/><circle cx="470" cy="152" r="10"/><text class="demo-node-index" x="470" y="156" text-anchor="middle">04</text><text class="demo-node-label" x="488" y="157">${T.nodes[3]}</text></g>
 </svg><div class="demo-topology-mobile" role="img" aria-label="${T.nexus}"><span class="topology-mobile-node">${T.nodes[0]}</span><span class="topology-mobile-arrow">↓</span><span class="topology-mobile-node core">${T.nodes[1]}</span><span class="topology-mobile-arrow">↙ &nbsp;&nbsp; ↘</span><div class="topology-mobile-branches"><span class="topology-mobile-node">${T.nodes[2]}</span><span class="topology-mobile-node">${T.nodes[3]}</span></div></div>`;
 const sec=document.createElement('section');sec.className='experience-lab';sec.innerHTML=`<div class="experience-lab-head"><div><small>${T.xp}</small><h2>${T.xpTitle}</h2></div><p>${T.xpSub}</p></div><div class="experience-lab-grid"><div class="experience-index">${T.xps.map((x,i)=>`<button type="button" data-xp="${i}" class="${i===0?'active':''}"><b>${x[1]}</b><span>${x[2]}</span></button>`).join('')}</div><article class="experience-panel"></article></div><div class="project-demo-grid"><article class="demo-card"><header><div><small>${T.demo}</small><b>${T.lab}</b></div><span class="demo-badge">${T.sim}</span></header><div class="demo-flow">${rows}</div></article><article class="demo-card"><header><div><small>${T.demo}</small><b>${T.nexus}</b></div><span class="demo-badge">${T.sim}</span></header><div class="demo-node-map demo-node-map--diagram">${nodes}</div></article></div><p style="margin:12px 0 0;color:#757a80;font:600 10px/1.55 'JetBrains Mono',monospace;letter-spacing:.04em">${T.demoSub}</p>`;
 exp.insertAdjacentElement('beforebegin',sec);
 const panel=sec.querySelector('.experience-panel');const btns=[...sec.querySelectorAll('[data-xp]')];
 const render=i=>{const x=T.xps[i];panel.innerHTML=`<div class="xp-no">${x[0]} / ${T.experienceLabel}</div><h3>${x[1]}</h3><span class="xp-date">${x[2]}</span><p>${x[3]}</p><div class="xp-tags">${x[4].split('|').map(t=>`<span>${t}</span>`).join('')}</div>`;btns.forEach((b,j)=>b.classList.toggle('active',j===i));};
 btns.forEach((b,i)=>b.addEventListener('click',()=>render(i)));render(0);
}
})();


/* SOURCE 7: home-14.js */
(()=>{
'use strict';
const lang=(document.documentElement.lang||'en').toLowerCase();
const L=lang==='uk'?'uk':lang==='cs'?'cs':'en';
const cv=L==='uk'?'cv-uk.html':L==='cs'?'cv-cz.html':'cv.html';
const email='onel1t111252@gmail.com';
const T={
 en:{stats:[['03','IT INTERNSHIPS'],['09','PORTFOLIO PROJECTS'],['03','LANGUAGE VERSIONS'],['03','FLAGSHIP CYBER PROJECTS']],cv:'CV',mail:'EMAIL',git:'GITHUB',copy:'EMAIL COPIED',skip:'Skip to main content',quick:'Quick actions',newTab:'opens in a new tab'},
 uk:{stats:[['03','IT-ПРАКТИКИ'],['09','ПРОЄКТІВ У ПОРТФОЛІО'],['03','МОВНІ ВЕРСІЇ'],['03','ФЛАГМАНСЬКІ КІБЕРПРОЄКТИ']],cv:'CV',mail:'EMAIL',git:'GITHUB',copy:'EMAIL СКОПІЙОВАНО',skip:'Перейти до основного вмісту',quick:'Швидкі дії',newTab:'відкривається в новій вкладці'},
 cs:{stats:[['03','IT PRAXE'],['09','PROJEKTŮ V PORTFOLIU'],['03','JAZYKOVÉ VERZE'],['03','HLAVNÍ KYBERNETICKÉ PROJEKTY']],cv:'CV',mail:'E-MAIL',git:'GITHUB',copy:'E-MAIL ZKOPÍROVÁN',skip:'Přejít na hlavní obsah',quick:'Rychlé akce',newTab:'otevře se na nové kartě'}
}[L];

if(!document.querySelector('.skip-link')){const a=document.createElement('a');a.className='skip-link';a.href='#about';a.textContent=T.skip;document.body.prepend(a);}
const about=document.getElementById('about');if(about){about.classList.add('fact-stats');const stats=about.querySelectorAll('.stats>div');stats.forEach((el,i)=>{if(!T.stats[i])return;const b=el.querySelector('b'),s=el.querySelector('span');if(b)b.textContent=T.stats[i][0];if(s)s.textContent=T.stats[i][1];});}
if(!document.querySelector('.mobile-action-dock')){const d=document.createElement('nav');d.className='mobile-action-dock';d.setAttribute('aria-label',T.quick);d.innerHTML=`<a href="${cv}">${T.cv}</a><button type="button" data-copy-mail>${T.mail}</button><a href="https://github.com/onel1t111252-bit" target="_blank" rel="noopener">${T.git}</a>`;document.body.appendChild(d);const b=d.querySelector('[data-copy-mail]');b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(email);const old=b.textContent;b.textContent=T.copy;setTimeout(()=>b.textContent=old,1500)}catch{location.href=`mailto:${email}`}});}

// Lightweight navigation prefetch: only after intent, never on initial load.
const prefetched=new Set();const prefetch=href=>{if(!href||prefetched.has(href)||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('http'))return;prefetched.add(href);const l=document.createElement('link');l.rel='prefetch';l.href=href;document.head.appendChild(l);};
document.addEventListener('pointerover',e=>{const a=e.target.closest('a[href]');if(a)prefetch(a.getAttribute('href'));},{passive:true});

// Keep external links explicit for keyboard/screen-reader users.
document.querySelectorAll('a[target="_blank"]').forEach(a=>{if(!a.getAttribute('aria-label'))a.setAttribute('aria-label',`${a.textContent.trim()} (${T.newTab})`);});
})();


/* SOURCE 8: home-15.js */
(()=>{
'use strict';
const lang=(document.documentElement.lang||'en').toLowerCase();
const L=lang==='uk'?'uk':lang==='cs'?'cs':'en';
const T={
 en:{label:'PRIMARY FLAGSHIP PROJECT',title:'ONEL1T AEGIS',text:'A local-first defensive security operations platform connecting synthetic incidents, asset context, risk decisions, response playbooks and analyst reporting in one safe training environment.',open:'OPEN AEGIS',study:'VIEW CASE STUDY',tags:['DEFENSIVE SECURITY','INCIDENT TRIAGE','ASSET CONTEXT','RISK','RESPONSE PLAYBOOKS','REPORTING'],nodes:['INCIDENTS','ASSETS','RISK','RESPONSE'],stats:[['03','IT INTERNSHIPS'],['09','PORTFOLIO PROJECTS'],['03','LANGUAGE VERSIONS'],['03','FLAGSHIP CYBER PROJECTS']]},
 uk:{label:'ГОЛОВНИЙ ПРОЄКТ ПОРТФОЛІО',title:'ONEL1T AEGIS',text:'Локальна навчальна платформа кіберзахисту, що поєднує синтетичні інциденти, контекст активів, оцінювання ризиків, сценарії реагування та звітність аналітика в одному безпечному середовищі.',open:'ВІДКРИТИ AEGIS',study:'ПЕРЕГЛЯНУТИ ОПИС ПРОЄКТУ',tags:['КІБЕРЗАХИСТ','ОПРАЦЮВАННЯ ІНЦИДЕНТІВ','КОНТЕКСТ АКТИВІВ','РИЗИКИ','СЦЕНАРІЇ РЕАГУВАННЯ','ЗВІТНІСТЬ'],nodes:['ІНЦИДЕНТИ','АКТИВИ','РИЗИКИ','РЕАГУВАННЯ'],stats:[['03','IT-ПРАКТИКИ'],['09','ПРОЄКТІВ У ПОРТФОЛІО'],['03','МОВНІ ВЕРСІЇ'],['03','КЛЮЧОВІ КІБЕРБЕЗПЕКОВІ ПРОЄКТИ']]},
 cs:{label:'HLAVNÍ PROJEKT PORTFOLIA',title:'ONEL1T AEGIS',text:'Lokální výuková platforma kybernetické bezpečnosti, která propojuje syntetické incidenty, kontext aktiv, hodnocení rizik, postupy reakce a reporty analytika v jednom bezpečném prostředí.',open:'OTEVŘÍT AEGIS',study:'ZOBRAZIT PŘÍPADOVOU STUDII',tags:['KYBERNETICKÁ BEZPEČNOST','ZPRACOVÁNÍ INCIDENTŮ','KONTEXT AKTIV','RIZIKA','POSTUPY REAKCE','REPORTING'],nodes:['INCIDENTY','AKTIVA','RIZIKA','REAKCE'],stats:[['03','ODBORNÉ IT PRAXE'],['09','PROJEKTŮ V PORTFOLIU'],['03','JAZYKOVÉ VERZE'],['03','KLÍČOVÉ KYBERBEZPEČNOSTNÍ PROJEKTY']]}
}[L];
const projects=document.getElementById('projects');
if(projects&&!document.querySelector('.aegis-showcase')){
 const sec=document.createElement('section');sec.className='aegis-showcase';
 sec.innerHTML=`<div class="aegis-showcase-inner"><div class="aegis-copy"><span class="aegis-label">${T.label}</span><h3>${T.title}</h3><p>${T.text}</p><div class="aegis-tags">${T.tags.map(x=>`<span>${x}</span>`).join('')}</div><div class="aegis-actions"><a href="projects/aegis/index.html?lang=${L}">${T.open} ↗</a><a href="projects/aegis/case-study.html?lang=${L}">${T.study} ↗</a></div></div><div class="aegis-visual" aria-hidden="true"><span class="aegis-ring r1"></span><span class="aegis-ring r2"></span><span class="aegis-core">AEGIS</span><span class="aegis-node n1">${T.nodes[0]}</span><span class="aegis-node n2">${T.nodes[1]}</span><span class="aegis-node n3">${T.nodes[2]}</span><span class="aegis-node n4">${T.nodes[3]}</span></div></div>`;
 const ph=projects.querySelector('.ph');if(ph)ph.insertAdjacentElement('afterend',sec);else projects.prepend(sec);
}
const about=document.getElementById('about');
if(about){const stats=about.querySelectorAll('.stats>div');stats.forEach((el,i)=>{if(!T.stats[i])return;const b=el.querySelector('b'),s=el.querySelector('span');if(b)b.textContent=T.stats[i][0];if(s)s.textContent=T.stats[i][1];});}
})();

/* SOURCE 9: home-position-persistence.js */
/* Last-section memory: no duplicate scroll listener and no URL rewrites during scrolling. */
(()=>{
  'use strict';
  const KEY='onel1t-home-last-section';
  const ids=new Set(
    [...document.querySelectorAll('.nav a[href^="#"],.rail nav a[href^="#"]')]
      .map(a=>a.getAttribute('href').slice(1))
  );
  let lastSaved='';
  const remember=id=>{
    if(!ids.has(id)||id===lastSaved)return;
    lastSaved=id;
    try{localStorage.setItem(KEY,id)}catch(_){}
  };
  document.addEventListener('onel1t-section-change',e=>remember(e.detail?.id));
  const hash=decodeURIComponent(location.hash.slice(1));
  let previous='';
  try{previous=localStorage.getItem(KEY)||''}catch(_){}
  const target=ids.has(hash)?hash:(ids.has(previous)?previous:'');
  /* Explicit links already have native browser hash navigation. */
  if(target&&!ids.has(hash)){
    const restore=()=>{
      const el=document.getElementById(target);
      if(el)requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:'instant'}));
    };
    if(document.readyState==='complete')restore();
    else window.addEventListener('load',restore,{once:true});
  }
})();


/* SOURCE 10: home-ui-stability.js */
(()=>{
'use strict';

const lang=(document.documentElement.lang||'en').toLowerCase();
const L=lang==='uk'?'uk':lang==='cs'?'cs':'en';
const cvHref=L==='uk'?'cv-uk.html':L==='cs'?'cv-cz.html':'cv.html';
const safeSession={
  get(k){try{return sessionStorage.getItem(k)}catch{return null}},
  set(k,v){try{sessionStorage.setItem(k,v)}catch{}}
};

/* --- Recruiter view: rebuild the control so it cannot be double-toggled by
   older additive scripts. --- */
const recruiterText={
  en:{off:'RECRUITER VIEW',on:'VISUAL VIEW'},
  uk:{off:'РЕЖИМ ДЛЯ РЕКРУТЕРА',on:'ВІЗУАЛЬНИЙ РЕЖИМ'},
  cs:{off:'REŽIM PRO RECRUITERY',on:'VIZUÁLNÍ REŽIM'}
}[L];

function installRecruiterToggle(){
  const tools=document.querySelector('.topbar .tools');
  if(!tools)return;

  tools.querySelectorAll('.recruiter-toggle').forEach(el=>el.remove());

  const button=document.createElement('button');
  button.type='button';
  button.className='recruiter-toggle';
  button.setAttribute('aria-pressed','false');
  button.innerHTML=`<i aria-hidden="true"></i><span>${recruiterText.off}</span>`;

  const apply=on=>{
    document.body.classList.toggle('recruiter-view',on);
    button.setAttribute('aria-pressed',String(on));
    button.querySelector('span').textContent=on?recruiterText.on:recruiterText.off;
    safeSession.set('onel1t-recruiter-view',on?'1':'0');
  };

  button.addEventListener('click',e=>{
    e.preventDefault();
    apply(!document.body.classList.contains('recruiter-view'));
  });

  tools.prepend(button);
  apply(safeSession.get('onel1t-recruiter-view')==='1');
}

/* --- Command palette: remove the older generated palette and rebuild a
   self-contained one with a physical KeyK shortcut. --- */
const paletteText={
  en:{cmd:'COMMAND',search:'Search portfolio…',esc:'ESC',hint:'↑↓ navigate · Enter open · Esc close',empty:'NO MATCHES'},
  uk:{cmd:'КОМАНДИ',search:'Пошук у портфоліо…',esc:'ESC',hint:'↑↓ навігація · Enter відкрити · Esc закрити',empty:'НІЧОГО НЕ ЗНАЙДЕНО'},
  cs:{cmd:'PŘÍKAZY',search:'Hledat v portfoliu…',esc:'ESC',hint:'↑↓ navigace · Enter otevřít · Esc zavřít',empty:'NIC NENALEZENO'}
}[L];

const actions={
  en:[
    ['HM','Home','Hero and portfolio overview','#home'],
    ['PR','Projects','Flagship systems and utilities','#projects'],
    ['AE','AEGIS','Open the defensive security platform',`projects/aegis/index.html?lang=${L}`],
    ['CL','Cyber Lab','Open the interactive cybersecurity lab','projects/cyber-lab/index.html'],
    ['NX','NEXUS','Open the cyber intelligence workspace','projects/nexus/index.html'],
    ['CV','CV','Open CV',cvHref],
    ['GH','GitHub','Open public source and build history','https://github.com/onel1t111252-bit'],
    ['CT','Contact','Jump to contact section','#contact']
  ],
  uk:[
    ['ГЛ','Головна','Головний екран та огляд портфоліо','#home'],
    ['ПР','Проєкти','Флагманські системи та утиліти','#projects'],
    ['AE','AEGIS','Відкрити платформу кіберзахисту',`projects/aegis/index.html?lang=${L}`],
    ['CL','Cyber Lab','Відкрити інтерактивну лабораторію','projects/cyber-lab/index.html'],
    ['NX','NEXUS','Відкрити cyber intelligence workspace','projects/nexus/index.html'],
    ['CV','CV','Відкрити резюме',cvHref],
    ['GH','GitHub','Відкрити GitHub','https://github.com/onel1t111252-bit'],
    ['КТ','Контакти','Перейти до контактів','#contact']
  ],
  cs:[
    ['DM','Domů','Hlavní obrazovka a přehled portfolia','#home'],
    ['PR','Projekty','Hlavní systémy a nástroje','#projects'],
    ['AE','AEGIS','Otevřít platformu kybernetické bezpečnosti',`projects/aegis/index.html?lang=${L}`],
    ['CL','Cyber Lab','Otevřít interaktivní laboratoř','projects/cyber-lab/index.html'],
    ['NX','NEXUS','Otevřít cyber intelligence workspace','projects/nexus/index.html'],
    ['CV','CV','Otevřít životopis',cvHref],
    ['GH','GitHub','Otevřít GitHub','https://github.com/onel1t111252-bit'],
    ['KT','Kontakt','Přejít ke kontaktu','#contact']
  ]
}[L];

function installCommandPalette(){
  document.querySelectorAll('.command-overlay').forEach(el=>el.remove());
  document.querySelectorAll('.quick-command').forEach(el=>el.remove());

  const overlay=document.createElement('div');
  overlay.className='command-overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML=`<div class="command-box" role="dialog" aria-modal="true" aria-label="${paletteText.cmd}">
    <div class="command-head"><span>›</span><input type="search" autocomplete="off" spellcheck="false" placeholder="${paletteText.search}" aria-label="${paletteText.search}"><kbd>${paletteText.esc}</kbd></div>
    <div class="command-list"></div>
    <div class="command-foot"><span>${paletteText.hint}</span><span>ONEL1T // QUICK NAV</span></div>
  </div>`;
  document.body.appendChild(overlay);

  const input=overlay.querySelector('input');
  const list=overlay.querySelector('.command-list');
  let visible=[...actions];
  let active=0;

  const render=()=>{
    list.innerHTML=visible.length
      ? visible.map((a,i)=>`<button type="button" class="command-item${i===active?' active':''}" data-i="${i}"><span class="command-icon">${a[0]}</span><span class="command-copy"><b>${a[1]}</b><small>${a[2]}</small></span><span class="command-key">↵</span></button>`).join('')
      : `<div class="command-empty">${paletteText.empty}</div>`;
  };

  const close=()=>{
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
  };

  const open=()=>{
    visible=[...actions];
    active=0;
    input.value='';
    render();
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    requestAnimationFrame(()=>input.focus());
  };

  const go=a=>{
    if(!a)return;
    close();
    const href=a[3];
    if(href.startsWith('http')){
      window.open(href,'_blank','noopener');
      return;
    }
    if(href.startsWith('#')){
      const target=document.querySelector(href);
      if(target){target.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',href);}
      return;
    }
    location.href=href;
  };

  input.addEventListener('input',()=>{
    const q=input.value.trim().toLowerCase();
    visible=actions.filter(a=>(a[1]+' '+a[2]).toLowerCase().includes(q));
    active=0;
    render();
  });

  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){
      e.preventDefault();
      if(visible.length)active=Math.min(active+1,visible.length-1);
      render();
    }else if(e.key==='ArrowUp'){
      e.preventDefault();
      if(visible.length)active=Math.max(active-1,0);
      render();
    }else if(e.key==='Enter'){
      e.preventDefault();
      go(visible[active]);
    }else if(e.key==='Escape'){
      e.preventDefault();
      close();
    }
  });

  list.addEventListener('click',e=>{
    const item=e.target.closest('.command-item');
    if(item)go(visible[Number(item.dataset.i)]);
  });

  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});

  const tools=document.querySelector('.topbar .tools');
  if(tools){
    const button=document.createElement('button');
    button.type='button';
    button.className='quick-command';
    button.innerHTML=`${paletteText.cmd}<kbd>Ctrl K</kbd>`;
    button.addEventListener('click',e=>{e.preventDefault();open();});
    const gh=tools.querySelector('.gh');
    if(gh)tools.insertBefore(button,gh);else tools.appendChild(button);
  }

  /* Physical KeyK makes the shortcut independent of EN/UA/CZ keyboard layout. */
  window.addEventListener('keydown',e=>{
    const shortcut=(e.ctrlKey||e.metaKey)&&!e.altKey&&(e.code==='KeyK'||String(e.key).toLowerCase()==='k');
    if(shortcut){
      e.preventDefault();
      e.stopImmediatePropagation();
      overlay.classList.contains('open')?close():open();
    }else if(e.key==='Escape'&&overlay.classList.contains('open')){
      e.preventDefault();
      close();
    }
  },true);

  render();
}

installRecruiterToggle();
installCommandPalette();
})();


document.documentElement.classList.add('home-enhancements-ready');
