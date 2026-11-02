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
