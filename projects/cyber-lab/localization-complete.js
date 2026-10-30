(() => {
'use strict';

const loader=document.createElement('script');
loader.src='localization-base.js?v=20261030-1';
loader.onload=()=>{
  installAcademyLocalizationFix();
  installSocLocalizationFix();
};
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

function installSocLocalizationFix(){
  const soc=document.getElementById('view-soc');
  if(!soc)return;

  const bases=new WeakMap();
  const texts={
    'Likely brute-force or credential-stuffing activity':{
      uk:'Ймовірна атака перебором або підстановкою викрадених облікових даних',
      cs:'Pravděpodobná aktivita typu brute-force nebo credential stuffing'
    },
    'Routine successful login with no indicators':{
      uk:'Звичайний успішний вхід без ознак підозрілої активності',
      cs:'Běžné úspěšné přihlášení bez podezřelých indikátorů'
    },
    'Confirmed malware infection':{
      uk:'Підтверджене зараження шкідливим ПЗ',
      cs:'Potvrzená infekce malwarem'
    },
    'Immediately declare data theft confirmed':{
      uk:'Негайно визнати викрадення даних підтвердженим',
      cs:'Okamžitě prohlásit krádež dat za potvrzenou'
    },
    'Correlate with endpoint process, baseline, and destination context':{
      uk:'Зіставити з процесом на кінцевій точці, базовою активністю та контекстом призначення',
      cs:'Porovnat s procesem na koncovém zařízení, běžným profilem provozu a kontextem cíle'
    },
    'Ignore because outbound traffic is normal':{
      uk:'Ігнорувати, оскільки вихідний трафік є нормальним',
      cs:'Ignorovat, protože odchozí provoz je běžný'
    },
    'Forward the attachment to colleagues to verify':{
      uk:'Переслати вкладення колегам для перевірки',
      cs:'Přeposlat přílohu kolegům k ověření'
    },
    'Open it in a normal workstation to inspect':{
      uk:'Відкрити його на звичайній робочій станції для перевірки',
      cs:'Otevřít ji na běžné pracovní stanici a zkontrolovat'
    },
    'Preserve the message, avoid opening the file, and report through the approved process':{
      uk:'Зберегти повідомлення, не відкривати файл і повідомити через затверджений процес',
      cs:'Uchovat zprávu, soubor neotevírat a nahlásit jej schváleným postupem'
    },
    'Verify authorization and actor, scope affected hosts, and escalate under the incident playbook':{
      uk:'Перевірити авторизацію та виконавця, визначити охоплені хости й ескалювати згідно з планом реагування',
      cs:'Ověřit oprávnění a aktéra, určit dotčené hostitele a eskalovat podle plánu reakce na incident'
    },
    'Assume it is approved because an admin account did it':{
      uk:'Вважати зміну схваленою, бо її виконав обліковий запис адміністратора',
      cs:'Považovat změnu za schválenou, protože ji provedl účet správce'
    },
    'Delete all accounts on the server':{
      uk:'Видалити всі облікові записи на сервері',
      cs:'Smazat všechny účty na serveru'
    },
    'Repeated failures followed by success from the same unfamiliar source are suspicious. Validate with the user, inspect MFA and related sign-ins, and follow account-containment procedures if warranted.':{
      uk:'Повторні невдалі спроби, після яких стався успішний вхід із того самого незнайомого джерела, є підозрілими. Підтвердьте подію з користувачем, перевірте MFA та пов’язані входи й за потреби дійте за процедурою захисту облікового запису.',
      cs:'Opakované neúspěšné pokusy následované úspěšným přihlášením ze stejného neznámého zdroje jsou podezřelé. Ověřte událost s uživatelem, zkontrolujte MFA a související přihlášení a podle potřeby postupujte podle procesu ochrany účtu.'
    },
    'The pattern merits investigation but does not prove exfiltration. Correlate process telemetry, asset role, destination reputation, and normal traffic patterns before deciding containment.':{
      uk:'Ця закономірність потребує розслідування, але не доводить ексфільтрацію. Перед рішенням про ізоляцію зіставте телеметрію процесу, роль активу, репутацію призначення та звичайні шаблони трафіку.',
      cs:'Tento vzorec vyžaduje prověření, ale nedokazuje exfiltraci. Před rozhodnutím o izolaci porovnejte telemetrii procesu, roli aktiva, reputaci cíle a běžné vzorce provozu.'
    },
    'Do not open or distribute suspicious attachments. Preserve relevant evidence, report through the established channel, and follow the organization’s phishing response process.':{
      uk:'Не відкривайте й не поширюйте підозрілі вкладення. Збережіть відповідні докази, повідомте через встановлений канал і дотримуйтеся процесу реагування організації на фішинг.',
      cs:'Podezřelé přílohy neotevírejte ani nešiřte. Uchovejte relevantní důkazy, nahlaste událost zavedeným kanálem a postupujte podle procesu organizace pro reakci na phishing.'
    },
    'Unexpected privilege changes can indicate compromise or misconfiguration. Verify the change record and actor, preserve logs, assess scope, and escalate using approved response procedures.':{
      uk:'Неочікувані зміни привілеїв можуть свідчити про компрометацію або помилкову конфігурацію. Перевірте запис про зміну та виконавця, збережіть журнали, оцініть масштаб і ескалюйте згідно із затвердженими процедурами реагування.',
      cs:'Neočekávané změny oprávnění mohou znamenat kompromitaci nebo chybnou konfiguraci. Ověřte záznam změny a aktéra, uchovejte logy, posuďte rozsah a eskalujte podle schválených postupů reakce.'
    },
    'Next scenario →':{uk:'Наступний сценарій →',cs:'Další scénář →'},
    'Finish session ✓':{uk:'Завершити сесію ✓',cs:'Dokončit relaci ✓'}
  };
  const feedback={
    'CORRECT — +25 XP':{uk:'ПРАВИЛЬНО — +25 XP',cs:'SPRÁVNĚ — +25 XP'},
    'NOT QUITE':{uk:'НЕ ЗОВСІМ',cs:'NE TAK DOCELA'}
  };

  const lang=()=>document.documentElement.lang==='uk'?'uk':document.documentElement.lang==='cs'?'cs':'en';

  function detectBase(text){
    let m;
    if(texts[text])return {kind:'exact',text};
    if((m=text.match(/^([A-C]\. )(.+)$/))&&texts[m[2]])return {kind:'answer',prefix:m[1],text:m[2]};
    for(const prefix of Object.keys(feedback)){
      if(text===prefix)return {kind:'feedbackOnly',prefix};
      if(text.startsWith(prefix)){
        const reason=text.slice(prefix.length).trim();
        if(texts[reason])return {kind:'feedbackReason',prefix,reason};
      }
    }
    return null;
  }

  function renderBase(base,l){
    if(base.kind==='exact')return l==='en'?base.text:texts[base.text][l];
    if(base.kind==='answer')return base.prefix+(l==='en'?base.text:texts[base.text][l]);
    if(base.kind==='feedbackOnly')return l==='en'?base.prefix:feedback[base.prefix][l];
    if(base.kind==='feedbackReason'){
      const p=l==='en'?base.prefix:feedback[base.prefix][l];
      const r=l==='en'?base.reason:texts[base.reason][l];
      return p+'\n\n'+r;
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

  function walk(root=soc){
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
  observer.observe(soc,{subtree:true,childList:true,characterData:true});

  new MutationObserver(()=>walk()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  walk();
  setTimeout(walk,100);
}
})();
