(() => {
'use strict';

const loader=document.createElement('script');
loader.src='localization-base.js?v=20261030-1';
loader.onload=installAcademyLocalizationFix;
loader.onerror=()=>console.error('Cyber Lab localization base failed to load');
document.head.appendChild(loader);

function installAcademyLocalizationFix(){
  const academy=document.getElementById('view-academy');
  if(!academy)return;

  const bases=new WeakMap();
  const questions={
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
  const reasons={
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
  const suffixes={
    'Completed':{uk:'Завершено',cs:'Dokončeno'},
    'Lesson & key takeaways':{uk:'Урок і ключові висновки',cs:'Lekce a hlavní poznatky'}
  };
  const feedbackPrefixes={
    'Correct! +10 XP.':{uk:'Правильно! +10 XP.',cs:'Správně! +10 XP.'},
    'Not quite.':{uk:'Не зовсім.',cs:'Ne tak docela.'}
  };

  const lang=()=>document.documentElement.lang==='uk'?'uk':document.documentElement.lang==='cs'?'cs':'en';

  function detectBase(text){
    let m;
    if((m=text.match(/^(\d+)\. (.+)$/))&&questions[m[2]])return {kind:'question',n:m[1],text:m[2]};
    if((m=text.match(/^(\d+) min · (Completed|Lesson & key takeaways)$/)))return {kind:'lessonMeta',minutes:m[1],suffix:m[2]};
    if((m=text.match(/^LESSON (\d+) · (\d+) MIN$/)))return {kind:'lessonHeader',n:m[1],minutes:m[2]};
    for(const prefix of Object.keys(feedbackPrefixes)){
      if(text.startsWith(prefix+' ')){
        const reason=text.slice(prefix.length+1);
        if(reasons[reason])return {kind:'feedback',prefix,reason};
      }
    }
    return null;
  }

  function renderBase(base,l){
    if(base.kind==='question')return base.n+'. '+(l==='en'?base.text:questions[base.text][l]);
    if(base.kind==='lessonMeta'){
      if(l==='en')return base.minutes+' min · '+base.suffix;
      const duration=l==='uk'?base.minutes+' хв':base.minutes+' min';
      return duration+' · '+suffixes[base.suffix][l];
    }
    if(base.kind==='lessonHeader'){
      if(l==='en')return 'LESSON '+base.n+' · '+base.minutes+' MIN';
      return (l==='uk'?'УРОК ':'LEKCE ')+base.n+' · '+(l==='uk'?base.minutes+' ХВ':base.minutes+' MIN');
    }
    if(base.kind==='feedback'){
      if(l==='en')return base.prefix+' '+base.reason;
      return feedbackPrefixes[base.prefix][l]+' '+reasons[base.reason][l];
    }
    return '';
  }

  function translateNode(node){
    if(!node||node.nodeType!==Node.TEXT_NODE)return;
    const current=node.nodeValue.trim();
    if(!current)return;
    let base=bases.get(node);
    if(!base){
      base=detectBase(current);
      if(!base)return;
      bases.set(node,base);
    }
    const out=renderBase(base,lang());
    if(!out)return;
    const lead=node.nodeValue.match(/^\s*/)?.[0]||'';
    const tail=node.nodeValue.match(/\s*$/)?.[0]||'';
    const next=lead+out+tail;
    if(node.nodeValue!==next)node.nodeValue=next;
  }

  function walk(root=academy){
    if(root.nodeType===Node.TEXT_NODE){translateNode(root);return;}
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode()))translateNode(node);
  }

  const observer=new MutationObserver(records=>{
    for(const r of records){
      if(r.type==='characterData')translateNode(r.target);
      if(r.type==='childList')r.addedNodes.forEach(n=>walk(n));
    }
  });
  observer.observe(academy,{subtree:true,childList:true,characterData:true});

  new MutationObserver(()=>walk()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  walk();
  setTimeout(walk,100);
}
})();
