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