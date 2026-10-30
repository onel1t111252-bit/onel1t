(()=>{
'use strict';
const lang=(document.documentElement.lang||'en').toLowerCase();
const L=lang==='uk'?'uk':lang==='cs'?'cs':'en';
const T={
 en:{label:'NEW PRIMARY FLAGSHIP',title:'ONEL1T AEGIS',text:'A local-first defensive security operations platform that connects synthetic incidents, asset context, risk decisions, response playbooks and analyst reporting in one safe training workspace.',open:'OPEN AEGIS',read:'PROJECT README',stats:[['03','IT INTERNSHIPS'],['09','PORTFOLIO PROJECTS'],['03','LANGUAGE VERSIONS'],['03','FLAGSHIP CYBER PROJECTS']]},
 uk:{label:'НОВИЙ ГОЛОВНИЙ FLAGSHIP',title:'ONEL1T AEGIS',text:'Local-first defensive security operations платформа, яка поєднує синтетичні інциденти, контекст активів, ризики, playbook-и реагування та звітність аналітика в одному безпечному навчальному workspace.',open:'ВІДКРИТИ AEGIS',read:'README ПРОЄКТУ',stats:[['03','IT-ПРАКТИКИ'],['09','ПРОЄКТІВ У ПОРТФОЛІО'],['03','МОВНІ ВЕРСІЇ'],['03','ФЛАГМАНСЬКІ CYBER-ПРОЄКТИ']]},
 cs:{label:'NOVÝ HLAVNÍ FLAGSHIP',title:'ONEL1T AEGIS',text:'Local-first defensive security operations platforma propojující syntetické incidenty, kontext aktiv, rizika, reakční playbooky a reporting analytika v jednom bezpečném výukovém workspace.',open:'OTEVŘÍT AEGIS',read:'README PROJEKTU',stats:[['03','IT PRAXE'],['09','PROJEKTŮ V PORTFOLIU'],['03','JAZYKOVÉ VERZE'],['03','HLAVNÍ CYBER PROJEKTY']]}
}[L];
const projects=document.getElementById('projects');
if(projects&&!document.querySelector('.aegis-showcase')){
 const sec=document.createElement('section');sec.className='aegis-showcase';sec.innerHTML=`<div class="aegis-showcase-inner"><div class="aegis-copy"><span class="aegis-label">${T.label}</span><h3>${T.title}</h3><p>${T.text}</p><div class="aegis-tags"><span>DEFENSIVE SECURITY</span><span>INCIDENT TRIAGE</span><span>ASSET CONTEXT</span><span>RISK</span><span>PLAYBOOKS</span><span>REPORTING</span></div><div class="aegis-actions"><a href="projects/aegis/index.html">${T.open} ↗</a><a href="https://github.com/onel1t111252-bit/onel1t/blob/main/projects/aegis/README.md" target="_blank" rel="noopener">${T.read} ↗</a></div></div><div class="aegis-visual" aria-hidden="true"><span class="aegis-ring r1"></span><span class="aegis-ring r2"></span><span class="aegis-core">AEGIS</span><span class="aegis-node n1">INCIDENTS</span><span class="aegis-node n2">ASSETS</span><span class="aegis-node n3">RISK</span><span class="aegis-node n4">PLAYBOOKS</span></div></div>`;
 const ph=projects.querySelector('.ph');if(ph)ph.insertAdjacentElement('afterend',sec);else projects.prepend(sec);
}
const about=document.getElementById('about');if(about){const stats=about.querySelectorAll('.stats>div');stats.forEach((el,i)=>{if(!T.stats[i])return;const b=el.querySelector('b'),s=el.querySelector('span');if(b)b.textContent=T.stats[i][0];if(s)s.textContent=T.stats[i][1];});}
})();