(()=>{
'use strict';
let lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('onel1t-lang')||'en';lang=lang==='ua'?'uk':lang==='cz'?'cs':lang;lang=['en','uk','cs'].includes(lang)?lang:'en';
const project=document.body.dataset.project;
const isLab=project==='cyber-lab';
const C={
 en:{features:'Core features',stack:'Technology',lessons:'What I learned',challenge:'Challenge',goal:'Goal',live:isLab?'OPEN CYBER LAB':'OPEN NEXUS',source:'VIEW SOURCE',galleryLabel:'INTERFACE GALLERY',galleryTitle:'Inside the build',cover:'Live project interface',coverSub:isLab?'Cyber Lab overview':'NEXUS workspace overview',panel1:isLab?'SOC EVENT FLOW':'SOC + OSINT WORKSPACE',panel1Sub:isLab?'Safe simulated incident workflow':'Investigation and case context',panel2:isLab?'NETWORK LAB VIEW':'CASE & REPORT FLOW',panel2Sub:isLab?'Interactive learning topology':'Structured analysis workflow',note:'Gallery combines the real project cover with stylized module previews. Demo values are illustrative, not live user data.',metric1:'CLIENT-SIDE',metric2:isLab?'SOC SIMULATION':'CASE TRACKING',metric3:'3 LANGUAGES'},
 uk:{features:'Ключові можливості',stack:'Технології',lessons:'Що я вивчив',challenge:'Завдання',goal:'Мета',live:isLab?'ВІДКРИТИ CYBER LAB':'ВІДКРИТИ NEXUS',source:'ПЕРЕГЛЯНУТИ КОД',galleryLabel:'ГАЛЕРЕЯ ІНТЕРФЕЙСУ',galleryTitle:'Що всередині проєкту',cover:'Живий інтерфейс проєкту',coverSub:isLab?'Огляд Cyber Lab':'Огляд workspace NEXUS',panel1:isLab?'ПОТІК SOC-ПОДІЙ':'SOC + OSINT WORKSPACE',panel1Sub:isLab?'Безпечний симульований incident workflow':'Розслідування та контекст справ',panel2:isLab?'МЕРЕЖЕВА ЛАБОРАТОРІЯ':'СПРАВИ ТА ЗВІТИ',panel2Sub:isLab?'Інтерактивна навчальна топологія':'Структурований workflow аналізу',note:'Галерея поєднує реальний cover проєкту зі стилізованими preview модулів. Значення демонстраційні, а не реальні дані користувачів.',metric1:'CLIENT-SIDE',metric2:isLab?'SOC-СИМУЛЯЦІЯ':'ВЕДЕННЯ СПРАВ',metric3:'3 МОВИ'},
 cs:{features:'Klíčové funkce',stack:'Technologie',lessons:'Co jsem se naučil',challenge:'Výzva',goal:'Cíl',live:isLab?'OTEVŘÍT CYBER LAB':'OTEVŘÍT NEXUS',source:'ZOBRAZIT KÓD',galleryLabel:'GALERIE ROZHRANÍ',galleryTitle:'Uvnitř projektu',cover:'Živé rozhraní projektu',coverSub:isLab?'Přehled Cyber Lab':'Přehled workspace NEXUS',panel1:isLab?'SOC EVENT FLOW':'SOC + OSINT WORKSPACE',panel1Sub:isLab?'Bezpečně simulovaný incident workflow':'Vyšetřování a kontext případů',panel2:isLab?'SÍŤOVÁ LABORATOŘ':'PŘÍPADY A REPORTY',panel2Sub:isLab?'Interaktivní výuková topologie':'Strukturovaný analytický workflow',note:'Galerie kombinuje skutečný cover projektu se stylizovanými náhledy modulů. Hodnoty jsou ilustrační, nikoli živá uživatelská data.',metric1:'CLIENT-SIDE',metric2:isLab?'SOC SIMULACE':'CASE TRACKING',metric3:'3 JAZYKY'}
}[lang];
const liveHref='index.html';
const sourceHref='https://github.com/onel1t111252-bit/onel1t/tree/main/projects/'+project;
const homeHref=lang==='uk'?'../../index-uk.html':lang==='cs'?'../../index-cz.html':'../../index.html';
const brand=document.querySelector('.brand');if(brand)brand.href=homeHref;
document.querySelectorAll('[data-copy="features"]').forEach(e=>e.textContent=C.features);
document.querySelectorAll('[data-copy="stack"]').forEach(e=>e.textContent=C.stack);
document.querySelectorAll('[data-copy="lessons"]').forEach(e=>e.textContent=C.lessons);
document.querySelectorAll('[data-copy="challenge"]').forEach(e=>e.textContent=C.challenge);
document.querySelectorAll('[data-copy="goal"]').forEach(e=>e.textContent=C.goal);
document.querySelectorAll('[data-live]').forEach(e=>{e.textContent=C.live;e.href=liveHref});
document.querySelectorAll('[data-source]').forEach(e=>{e.textContent=C.source;e.href=sourceHref;e.target='_blank';e.rel='noopener'});
if(!document.querySelector('link[href$="case-study-11.css"]')){const css=document.createElement('link');css.rel='stylesheet';css.href='../case-study-11.css?v=20261030-1';document.head.appendChild(css)}
if(!document.querySelector('.case-gallery')){
 const stack=document.getElementById('stack')?.closest('.section');
 const gallery=document.createElement('section');gallery.className='case-gallery';
 const cover=isLab?'../../assets/optimized/cyber-lab-cover.webp':'../../assets/optimized/nexus-cover.webp';
 const firstEvents=isLab?['AUTH_OK','POLICY','NET_MAP']:['CASE_OPEN','OSINT_NOTE','REPORT'];
 gallery.innerHTML=`<div class="case-gallery-head"><span>${C.galleryLabel}</span><h2>${C.galleryTitle}</h2></div><div class="gallery-grid"><article class="gallery-shot cover"><img src="${cover}" alt="${C.cover}"><div class="gallery-label"><b>${C.cover}</b><span>${C.coverSub}</span></div></article><article class="gallery-shot ui-shot"><div class="ui-bar"><span>${C.panel1}</span><i></i></div><div class="ui-grid"><div class="ui-card wide"><small>EVENT STREAM</small>${firstEvents.map((x,i)=>`<div class="event-line"><span>0${i+1}</span><strong>${x}</strong><em>${i===2?'READY':'OK'}</em></div>`).join('')}</div><div class="ui-card"><small>STATUS</small><b>${isLab?'ONLINE':'ACTIVE'}</b><p>${C.panel1Sub}</p></div><div class="ui-card"><small>MODE</small><b>${isLab?'TRAINING':'ANALYSIS'}</b><p>ONEL1T // LOCAL UI</p></div></div></article><article class="gallery-shot ui-shot"><div class="ui-bar"><span>${C.panel2}</span><i></i></div><div class="ui-grid"><div class="ui-card wide"><small>${isLab?'LAB TOPOLOGY':'WORKFLOW MAP'}</small><div class="mini-nodes"><span class="mini-node">${isLab?'PC':'OSINT'}</span><span class="mini-node">CORE</span><span class="mini-node">${isLab?'SOC':'CASE'}</span></div></div><div class="ui-card wide"><small>WORKFLOW</small><p>${C.panel2Sub}</p></div></div></article></div><div class="case-metrics"><div><small>ARCHITECTURE</small><strong>${C.metric1}</strong></div><div><small>FLAGSHIP</small><strong>${C.metric2}</strong></div><div><small>LOCALIZATION</small><strong>${C.metric3}</strong></div></div><div class="gallery-note"><b>NOTE:</b> ${C.note}</div>`;
 if(stack)stack.before(gallery);else document.querySelector('.cta')?.closest('.section')?.before(gallery);
}
})();
