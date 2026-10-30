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
if(hero&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&matchMedia('(pointer:fine)').matches){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--hx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');hero.style.setProperty('--hy',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')},{passive:true})}

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
document.querySelectorAll('a[href^="projects/"]').forEach(a=>{a.addEventListener('click',e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||reduced)return;if(a.target==='_blank')return;e.preventDefault();document.body.classList.add('page-leaving');setTimeout(()=>location.href=a.href,150)})});
})();
