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
