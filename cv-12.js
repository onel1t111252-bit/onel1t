(()=>{
'use strict';
const lang=(document.documentElement.lang||'en').toLowerCase();
const L=lang==='uk'?'uk':lang==='cs'?'cs':'en';
const T={
 en:{
  nav:[['Profile','about'],['Skills','skills'],['Experience','experience'],['Projects','projects'],['Education','education']],
  ats:'ATS VIEW',visual:'VISUAL VIEW',quick:'RECRUITER QUICK VIEW',headline:'Cybersecurity student building practical systems, network and software skills.',
  intro:'Hands-on technical profile combining cybersecurity studies, network fundamentals, programming, support experience and portfolio projects.',
  values:['Security-minded','Hands-on learner','Network fundamentals','C++ / Python','Technical support'],
  stats:[['PRACTICE','03 internships','Security systems & IT workflows'],['FLAGSHIP','02 cyber projects','Cyber Lab + NEXUS'],['LANGUAGE VERSIONS','EN · UA · CZ','CV and portfolio'],['CURRENT DIRECTION','Cybersecurity','Networks · development']],
  matrix:'SKILL MAP',matrixSub:'Grouped for faster recruiter scanning',groups:[['SECURITY',['Cybersecurity','Blue Team concepts','Log analysis','Phishing analysis']],['NETWORKING',['Cisco Packet Tracer','IPv4 / CIDR','LAN / WAN','Routing basics']],['DEVELOPMENT',['C++','C#','Python','JavaScript','HTML / CSS']],['SYSTEMS',['Windows','Troubleshooting','Git / GitHub','Technical support']]],
  flagship:'FLAGSHIP CYBER PROJECTS',labDesc:'Interactive cybersecurity learning platform with SOC-style simulations, network visualization and defensive exercises.',nexusDesc:'Cyber intelligence workspace combining SOC triage, OSINT notes, network context, case tracking and report workflows.',live:'OPEN PROJECT',case:'CASE STUDY',
  contactLabel:'CONTACT',contactTitle:'Interested in the technical work behind ONEL1T?',contactText:'Explore the portfolio, review the source, or contact me directly.',email:'EMAIL',github:'GITHUB',copy:'COPY EMAIL',copied:'COPIED'
 },
 uk:{
  nav:[['Профіль','about'],['Навички','skills'],['Досвід','experience'],['Проєкти','projects'],['Освіта','education']],
  ats:'ATS РЕЖИМ',visual:'ВІЗУАЛЬНИЙ РЕЖИМ',quick:'ШВИДКИЙ ОГЛЯД ДЛЯ РЕКРУТЕРА',headline:'Студент кібербезпеки, який розвиває практичні навички в системах, мережах і розробці.',
  intro:'Практичний технічний профіль: кібербезпека, основи мереж, програмування, досвід підтримки та власні портфоліо-проєкти.',
  values:['Security-мислення','Практичне навчання','Основи мереж','C++ / Python','Технічна підтримка'],
  stats:[['ПРАКТИКА','03 IT-практики','Системи безпеки та IT-процеси'],['ФЛАГМАНИ','02 cyber-проєкти','Cyber Lab + NEXUS'],['МОВНІ ВЕРСІЇ','EN · UA · CZ','CV та портфоліо'],['ПОТОЧНИЙ НАПРЯМ','Кібербезпека','Мережі · розробка']],
  matrix:'КАРТА НАВИЧОК',matrixSub:'Згруповано для швидкого перегляду',groups:[['БЕЗПЕКА',['Кібербезпека','Blue Team concepts','Аналіз логів','Аналіз фішингу']],['МЕРЕЖІ',['Cisco Packet Tracer','IPv4 / CIDR','LAN / WAN','Основи маршрутизації']],['РОЗРОБКА',['C++','C#','Python','JavaScript','HTML / CSS']],['СИСТЕМИ',['Windows','Діагностика','Git / GitHub','Технічна підтримка']]],
  flagship:'ФЛАГМАНСЬКІ CYBER-ПРОЄКТИ',labDesc:'Інтерактивна платформа кібербезпеки із SOC-симуляціями, візуалізацією мережі та захисними навчальними вправами.',nexusDesc:'Cyber intelligence workspace для SOC triage, OSINT-нотаток, мережевого контексту, ведення справ і звітів.',live:'ВІДКРИТИ ПРОЄКТ',case:'CASE STUDY',
  contactLabel:'КОНТАКТ',contactTitle:'Цікавить технічна частина ONEL1T?',contactText:'Переглянь портфоліо, код або зв’яжися зі мною напряму.',email:'EMAIL',github:'GITHUB',copy:'КОПІЮВАТИ EMAIL',copied:'СКОПІЙОВАНО'
 },
 cs:{
  nav:[['Profil','about'],['Dovednosti','skills'],['Praxe','experience'],['Projekty','projects'],['Vzdělání','education']],
  ats:'ATS REŽIM',visual:'VIZUÁLNÍ REŽIM',quick:'RYCHLÝ PŘEHLED PRO RECRUITERA',headline:'Student kyberbezpečnosti rozvíjející praktické dovednosti v systémech, sítích a vývoji.',
  intro:'Praktický technický profil spojující studium kyberbezpečnosti, síťové základy, programování, podporu a vlastní portfolio projekty.',
  values:['Bezpečnostní přístup','Praktické učení','Síťové základy','C++ / Python','Technická podpora'],
  stats:[['PRAXE','03 IT praxe','Bezpečnostní systémy a IT procesy'],['HLAVNÍ PROJEKTY','02 cyber projekty','Cyber Lab + NEXUS'],['JAZYKOVÉ VERZE','EN · UA · CZ','CV a portfolio'],['AKTUÁLNÍ SMĚR','Kyberbezpečnost','Sítě · vývoj']],
  matrix:'MAPA DOVEDNOSTÍ',matrixSub:'Seskupeno pro rychlé čtení',groups:[['BEZPEČNOST',['Kyberbezpečnost','Blue Team concepts','Analýza logů','Analýza phishingu']],['SÍTĚ',['Cisco Packet Tracer','IPv4 / CIDR','LAN / WAN','Základy routingu']],['VÝVOJ',['C++','C#','Python','JavaScript','HTML / CSS']],['SYSTÉMY',['Windows','Troubleshooting','Git / GitHub','Technická podpora']]],
  flagship:'HLAVNÍ CYBER PROJEKTY',labDesc:'Interaktivní platforma kyberbezpečnosti se SOC simulacemi, vizualizací sítě a obrannými výukovými úlohami.',nexusDesc:'Cyber intelligence workspace pro SOC triage, OSINT poznámky, síťový kontext, správu případů a reportovací workflow.',live:'OTEVŘÍT PROJEKT',case:'CASE STUDY',
  contactLabel:'KONTAKT',contactTitle:'Zajímá vás technická práce za ONEL1T?',contactText:'Prohlédněte si portfolio, zdrojový kód nebo mě kontaktujte přímo.',email:'EMAIL',github:'GITHUB',copy:'KOPÍROVAT EMAIL',copied:'ZKOPÍROVÁNO'
 }
}[L];
const email='maxymdymchuk@gmail.com';

/* scroll progress */
const progress=document.createElement('div');progress.className='cv-progress';progress.setAttribute('aria-hidden','true');document.body.prepend(progress);
const updateProgress=()=>{const d=document.documentElement,m=d.scrollHeight-innerHeight;progress.style.transform=`scaleX(${m>0?Math.min(1,scrollY/m):0})`};addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress,{passive:true});updateProgress();

/* ids for existing cards */
const education=[...document.querySelectorAll('.cv-card')].find(x=>x.querySelector('.cv-title')?.dataset.index==='05');if(education)education.id='education';

/* ATS / clean mode */
const nav=document.querySelector('.cv-nav');
if(nav&&!nav.querySelector('.cv-view-toggle')){const toggle=document.createElement('button');toggle.type='button';toggle.className='cv-view-toggle';toggle.innerHTML=`<i></i><span>${T.ats}</span>`;const apply=on=>{document.body.classList.toggle('cv-ats',on);toggle.querySelector('span').textContent=on?T.visual:T.ats;toggle.setAttribute('aria-pressed',String(on));sessionStorage.setItem('onel1t-cv-ats',on?'1':'0')};toggle.addEventListener('click',()=>apply(!document.body.classList.contains('cv-ats')));nav.appendChild(toggle);apply(sessionStorage.getItem('onel1t-cv-ats')==='1');}

/* recruiter section navigation */
if(nav&&!document.querySelector('.cv-section-nav')){const q=document.createElement('nav');q.className='cv-section-nav';q.setAttribute('aria-label','CV sections');q.innerHTML=T.nav.map(([a,id])=>`<a href="#${id}" data-target="${id}">${a}</a>`).join('');nav.insertAdjacentElement('afterend',q);const links=[...q.querySelectorAll('a')];const sections=links.map(a=>document.getElementById(a.dataset.target)).filter(Boolean);if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>{const hit=es.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(hit)links.forEach(a=>a.classList.toggle('active',a.dataset.target===hit.target.id))},{rootMargin:'-20% 0px -65% 0px',threshold:[0,.2,.5]});sections.forEach(s=>io.observe(s));}}

/* recruiter quick view */
const strip=document.querySelector('.cv-strip');
if(strip&&!document.querySelector('.cv-recruiter')){const r=document.createElement('section');r.className='cv-recruiter';r.innerHTML=`<article class="cv-recruiter-main"><div class="cv-recruiter-eyebrow">${T.quick}</div><h2>${T.headline}</h2><p>${T.intro}</p><div class="cv-value-list">${T.values.map(x=>`<span>${x}</span>`).join('')}</div></article><aside class="cv-recruiter-side">${T.stats.map(x=>`<div><small>${x[0]}</small><strong>${x[1]}</strong><em>${x[2]}</em></div>`).join('')}</aside>`;strip.insertAdjacentElement('afterend',r);}

/* grouped skill map */
const skills=document.getElementById('skills');
if(skills&&!skills.querySelector('.cv-skill-matrix')){skills.classList.add('cv-skills-enhanced');const m=document.createElement('div');m.className='cv-skill-matrix';m.innerHTML=`<div class="cv-skill-matrix-head"><b>${T.matrix}</b><span>${T.matrixSub}</span></div><div class="cv-skill-groups">${T.groups.map((g,i)=>`<article class="cv-skill-group" data-no="0${i+1}"><h3>${g[0]}</h3><div>${g[1].map(x=>`<span>${x}</span>`).join('')}</div></article>`).join('')}</div>`;skills.appendChild(m);}

/* flagship cyber projects */
const projects=document.getElementById('projects');
if(projects&&!projects.querySelector('.cv-flagships')){const langParam=L==='uk'?'uk':L==='cs'?'cs':'en';const block=document.createElement('div');block.className='cv-flagships';block.innerHTML=`<article class="cv-flagship"><div class="cv-flagship-media"><img loading="lazy" decoding="async" src="assets/optimized/cyber-lab-cover.webp" alt="ONEL1T Cyber Lab"></div><div class="cv-flagship-copy"><div class="cv-flagship-code">${T.flagship} / 01</div><h3>ONEL1T Cyber Lab</h3><p>${T.labDesc}</p><div class="cv-flagship-meta"><span>CYBERSECURITY</span><span>BLUE TEAM</span><span>JAVASCRIPT</span></div><div class="cv-flagship-actions"><a href="projects/cyber-lab/index.html">${T.live} ↗</a><a href="projects/cyber-lab/case-study.html?lang=${langParam}">${T.case} ↗</a></div></div></article><article class="cv-flagship"><div class="cv-flagship-media"><img loading="lazy" decoding="async" src="assets/optimized/nexus-cover.webp" alt="ONEL1T NEXUS"></div><div class="cv-flagship-copy"><div class="cv-flagship-code">${T.flagship} / 02</div><h3>ONEL1T NEXUS</h3><p>${T.nexusDesc}</p><div class="cv-flagship-meta"><span>SOC</span><span>OSINT</span><span>WORKFLOWS</span></div><div class="cv-flagship-actions"><a href="projects/nexus/index.html">${T.live} ↗</a><a href="projects/nexus/case-study.html?lang=${langParam}">${T.case} ↗</a></div></div></article>`;const list=projects.querySelector('.cv-projects');if(list)list.before(block);else projects.appendChild(block);}

/* contact CTA */
const footer=document.querySelector('.cv-footer');
if(footer&&!document.querySelector('.cv-contact-cta')){const c=document.createElement('section');c.className='cv-contact-cta';c.innerHTML=`<div><small>${T.contactLabel}</small><h2>${T.contactTitle}</h2><p>${T.contactText}</p></div><div class="cv-contact-actions"><a href="mailto:${email}">${T.email} ↗</a><a href="https://github.com/onel1t111252-bit" target="_blank" rel="noopener">${T.github} ↗</a><button type="button" class="cv-copy-email">${T.copy}</button></div>`;footer.before(c);const b=c.querySelector('.cv-copy-email');b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(email);b.textContent=T.copied;b.classList.add('cv-copy-status');setTimeout(()=>{b.textContent=T.copy;b.classList.remove('cv-copy-status')},1800)}catch{location.href=`mailto:${email}`}});}
})();
