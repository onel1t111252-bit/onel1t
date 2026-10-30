(()=>{
'use strict';
let lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('onel1t-lang')||'en';lang=lang==='ua'?'uk':lang==='cz'?'cs':lang;lang=['en','uk','cs'].includes(lang)?lang:'en';
const project=document.body.dataset.project;
const M={
 en:{features:'Core features',stack:'Technology',lessons:'What I learned',challenge:'Challenge',goal:'Goal',live:project==='cyber-lab'?'OPEN CYBER LAB':'OPEN NEXUS',source:'VIEW SOURCE'},
 uk:{features:'Ключові можливості',stack:'Технології',lessons:'Що я вивчив',challenge:'Завдання',goal:'Мета',live:project==='cyber-lab'?'ВІДКРИТИ CYBER LAB':'ВІДКРИТИ NEXUS',source:'ПЕРЕГЛЯНУТИ КОД'},
 cs:{features:'Klíčové funkce',stack:'Technologie',lessons:'Co jsem se naučil',challenge:'Výzva',goal:'Cíl',live:project==='cyber-lab'?'OTEVŘÍT CYBER LAB':'OTEVŘÍT NEXUS',source:'ZOBRAZIT KÓD'}
}[lang];
const liveHref='index.html';
const sourceHref='https://github.com/onel1t111252-bit/onel1t/tree/main/projects/'+project;
const homeHref=lang==='uk'?'../../index-uk.html':lang==='cs'?'../../index-cz.html':'../../index.html';
const brand=document.querySelector('.brand');if(brand)brand.href=homeHref;
document.querySelectorAll('[data-copy="features"]').forEach(e=>e.textContent=M.features);
document.querySelectorAll('[data-copy="stack"]').forEach(e=>e.textContent=M.stack);
document.querySelectorAll('[data-copy="lessons"]').forEach(e=>e.textContent=M.lessons);
document.querySelectorAll('[data-copy="challenge"]').forEach(e=>e.textContent=M.challenge);
document.querySelectorAll('[data-copy="goal"]').forEach(e=>e.textContent=M.goal);
document.querySelectorAll('[data-live]').forEach(e=>{e.textContent=M.live;e.href=liveHref});
document.querySelectorAll('[data-source]').forEach(e=>{e.textContent=M.source;e.href=sourceHref;e.target='_blank';e.rel='noopener'});
})();
