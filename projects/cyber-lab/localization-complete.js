(() => {
'use strict';

const loader=document.createElement('script');
loader.src='localization-base.js?v=20261030-2';
loader.onload=()=>{
  applyAcademyLocalization();
  setTimeout(applyAcademyLocalization,80);
};
loader.onerror=()=>console.error('Cyber Lab localization base failed to load');
document.head.appendChild(loader);

const QUESTIONS={
  'Which protocol translates domain names into IP addresses?':{
    uk:'Який протокол перетворює доменні імена на IP-адреси?',
    cs:'Který protokol převádí názvy domén na IP adresy?'
  },
  'What is the safest first step with a suspicious attachment?':{
    uk:'Який найбезпечніший перший крок із підозрілим вкладенням?',
    cs:'Jaký je nejbezpečnější první krok u podezřelé přílohy?'
  },
  'Why is multi-factor authentication useful?':{
    uk:'Чому багатофакторна автентифікація корисна?',
    cs:'Proč je vícefaktorové ověřování užitečné?'
  },
  'An alert is not yet proof of compromise. What should an analyst do?':{
    uk:'Сповіщення ще не є доказом компрометації. Що має зробити аналітик?',
    cs:'Upozornění ještě není důkazem kompromitace. Co má analytik udělat?'
  }
};

const REASONS={
  'DNS resolves human-readable domain names to IP addresses.':{
    uk:'DNS перетворює зрозумілі людині доменні імена на IP-адреси.',
    cs:'DNS převádí lidsky čitelné názvy domén na IP adresy.'
  },
  'Do not open or distribute suspicious files. Use the established reporting process.':{
    uk:'Не відкривайте й не поширюйте підозрілі файли. Використовуйте встановлений процес повідомлення.',
    cs:'Podezřelé soubory neotevírejte ani nešiřte. Použijte zavedený proces hlášení.'
  },
  'MFA adds an additional factor, reducing the risk from a stolen password.':{
    uk:'MFA додає додатковий фактор і зменшує ризик від викраденого пароля.',
    cs:'MFA přidává další faktor a snižuje riziko způsobené odcizeným heslem.'
  },
  'Validate the alert, correlate evidence, assess impact, then respond proportionately.':{
    uk:'Перевірте сповіщення, зіставте докази, оцініть вплив і лише потім реагуйте пропорційно.',
    cs:'Ověřte upozornění, porovnejte důkazy, posuďte dopad a poté reagujte přiměřeně.'
  }
};

function language(){
  return document.documentElement.lang==='uk'?'uk':document.documentElement.lang==='cs'?'cs':'en';
}

function translateAcademyText(text,lang){
  if(lang==='en')return null;
  let m=text.match(/^(\d+)\. (.+)$/);
  if(m&&QUESTIONS[m[2]])return m[1]+'. '+QUESTIONS[m[2]][lang];
  m=text.match(/^(\d+) min · (Completed|Lesson & key takeaways)$/);
  if(m){
    const suffix=m[2]==='Completed'?(lang==='uk'?'Завершено':'Dokončeno'):(lang==='uk'?'Урок і ключові висновки':'Lekce a hlavní poznatky');
    return (lang==='uk'?m[1]+' хв':m[1]+' min')+' · '+suffix;
  }
  m=text.match(/^LESSON (\d+) · (\d+) MIN$/);
  if(m)return (lang==='uk'?'УРОК ':'LEKCE ')+m[1]+' · '+(lang==='uk'?m[2]+' ХВ':m[2]+' MIN');
  for(const prefix of ['Correct! +10 XP.','Not quite.']){
    if(text.startsWith(prefix+' ')){
      const reason=text.slice(prefix.length+1);
      if(REASONS[reason]){
        const p=prefix==='Correct! +10 XP.'?(lang==='uk'?'Правильно! +10 XP.':'Správně! +10 XP.'):(lang==='uk'?'Не зовсім.':'Ne tak docela.');
        return p+' '+REASONS[reason][lang];
      }
    }
  }
  return null;
}

function applyAcademyLocalization(){
  const root=document.getElementById('view-academy');
  if(!root)return;
  const lang=language();
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    const raw=node.nodeValue;
    const trimmed=raw.trim();
    if(!trimmed)continue;
    if(!node.parentElement?.dataset.originalAcademyText){
      node.parentElement.dataset.originalAcademyText=trimmed;
    }
    const base=node.parentElement.dataset.originalAcademyText;
    const translated=lang==='en'?base:translateAcademyText(base,lang);
    if(translated){
      const lead=raw.match(/^\s*/)?.[0]||'';
      const tail=raw.match(/\s*$/)?.[0]||'';
      const next=lead+translated+tail;
      if(node.nodeValue!==next)node.nodeValue=next;
    }
  }
}

document.addEventListener('click',e=>{
  if(e.target.closest('.language-switch button[data-lang]') ||
     e.target.closest('#view-academy button') ||
     e.target.closest('[data-view="academy"]') ||
     e.target.closest('[data-go="academy"]')){
    setTimeout(applyAcademyLocalization,0);
    setTimeout(applyAcademyLocalization,80);
  }
});

setTimeout(applyAcademyLocalization,120);
})();
