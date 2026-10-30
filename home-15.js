(()=>{
'use strict';
const lang=(document.documentElement.lang||'en').toLowerCase();
const L=lang==='uk'?'uk':lang==='cs'?'cs':'en';
const T={
 en:{label:'NEW PRIMARY FLAGSHIP',title:'ONEL1T AEGIS',text:'A local-first defensive security operations platform that connects synthetic incidents, asset context, risk decisions, response playbooks and analyst reporting in one safe training workspace.',open:'OPEN AEGIS',read:'PROJECT README',tags:['DEFENSIVE SECURITY','INCIDENT TRIAGE','ASSET CONTEXT','RISK','PLAYBOOKS','REPORTING'],nodes:['INCIDENTS','ASSETS','RISK','PLAYBOOKS'],stats:[['03','IT INTERNSHIPS'],['09','PORTFOLIO PROJECTS'],['03','LANGUAGE VERSIONS'],['03','FLAGSHIP CYBER PROJECTS']]},
 uk:{label:'ГОЛОВНИЙ ФЛАГМАНСЬКИЙ ПРОЄКТ',title:'ONEL1T AEGIS',text:'Локальна платформа кіберзахисту, що поєднує синтетичні інциденти, контекст активів, оцінювання ризиків, сценарії реагування та звітність аналітика в одному безпечному навчальному середовищі.',open:'ВІДКРИТИ AEGIS',read:'README ПРОЄКТУ',tags:['КІБЕРЗАХИСТ','ОПРАЦЮВАННЯ ІНЦИДЕНТІВ','КОНТЕКСТ АКТИВІВ','РИЗИКИ','СЦЕНАРІЇ РЕАГУВАННЯ','ЗВІТНІСТЬ'],nodes:['ІНЦИДЕНТИ','АКТИВИ','РИЗИКИ','РЕАГУВАННЯ'],stats:[['03','IT-ПРАКТИКИ'],['09','ПРОЄКТІВ У ПОРТФОЛІО'],['03','МОВНІ ВЕРСІЇ'],['03','ФЛАГМАНСЬКІ КІБЕРПРОЄКТИ']]},
 cs:{label:'HLAVNÍ VLÁJKOVÝ PROJEKT',title:'ONEL1T AEGIS',text:'Lokální platforma kybernetické obrany, která propojuje syntetické incidenty, kontext aktiv, hodnocení rizik, postupy reakce a reporting analytika v jednom bezpečném výukovém prostředí.',open:'OTEVŘÍT AEGIS',read:'README PROJEKTU',tags:['KYBERNETICKÁ OBRANA','ZPRACOVÁNÍ INCIDENTŮ','KONTEXT AKTIV','RIZIKA','POSTUPY REAKCE','REPORTING'],nodes:['INCIDENTY','AKTIVA','RIZIKA','REAKCE'],stats:[['03','IT PRAXE'],['09','PROJEKTŮ V PORTFOLIU'],['03','JAZYKOVÉ VERZE'],['03','HLAVNÍ CYBER PROJEKTY']]}
}[L];
const projects=document.getElementById('projects');
if(projects&&!document.querySelector('.aegis-showcase')){
 const sec=document.createElement('section');sec.className='aegis-showcase';
 const langParam=L==='uk'?'uk':L==='cs'?'cs':'en';
 sec.innerHTML=`<div class="aegis-showcase-inner"><div class="aegis-copy"><span class="aegis-label">${T.label}</span><h3>${T.title}</h3><p>${T.text}</p><div class="aegis-tags">${T.tags.map(x=>`<span>${x}</span>`).join('')}</div><div class="aegis-actions"><a href="projects/aegis/index.html?lang=${langParam}">${T.open} ↗</a><a href="https://github.com/onel1t111252-bit/onel1t/blob/main/projects/aegis/README.md" target="_blank" rel="noopener">${T.read} ↗</a></div></div><div class="aegis-visual" aria-hidden="true"><span class="aegis-ring r1"></span><span class="aegis-ring r2"></span><span class="aegis-core">AEGIS</span><span class="aegis-node n1">${T.nodes[0]}</span><span class="aegis-node n2">${T.nodes[1]}</span><span class="aegis-node n3">${T.nodes[2]}</span><span class="aegis-node n4">${T.nodes[3]}</span></div></div>`;
 const ph=projects.querySelector('.ph');if(ph)ph.insertAdjacentElement('afterend',sec);else projects.prepend(sec);
}
const about=document.getElementById('about');if(about){const stats=about.querySelectorAll('.stats>div');stats.forEach((el,i)=>{if(!T.stats[i])return;const b=el.querySelector('b'),s=el.querySelector('span');if(b)b.textContent=T.stats[i][0];if(s)s.textContent=T.stats[i][1];});}
})();