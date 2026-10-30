(() => {
'use strict';

const ANSWERS={
  'Likely brute-force or credential-stuffing activity':{ua:'Ймовірна атака перебором або підстановкою викрадених облікових даних',cz:'Pravděpodobná aktivita typu brute-force nebo credential stuffing'},
  'Routine successful login with no indicators':{ua:'Звичайний успішний вхід без ознак підозрілої активності',cz:'Běžné úspěšné přihlášení bez podezřelých indikátorů'},
  'Confirmed malware infection':{ua:'Підтверджене зараження шкідливим ПЗ',cz:'Potvrzená infekce malwarem'},
  'Immediately declare data theft confirmed':{ua:'Негайно визнати викрадення даних підтвердженим',cz:'Okamžitě prohlásit krádež dat za potvrzenou'},
  'Correlate with endpoint process, baseline, and destination context':{ua:'Зіставити з процесом на кінцевій точці, базовою активністю та контекстом призначення',cz:'Porovnat s procesem na koncovém zařízení, běžným profilem provozu a kontextem cíle'},
  'Ignore because outbound traffic is normal':{ua:'Ігнорувати, оскільки вихідний трафік є нормальним',cz:'Ignorovat, protože odchozí provoz je běžný'},
  'Forward the attachment to colleagues to verify':{ua:'Переслати вкладення колегам для перевірки',cz:'Přeposlat přílohu kolegům k ověření'},
  'Open it in a normal workstation to inspect':{ua:'Відкрити його на звичайній робочій станції для перевірки',cz:'Otevřít ji na běžné pracovní stanici a zkontrolovat'},
  'Preserve the message, avoid opening the file, and report through the approved process':{ua:'Зберегти повідомлення, не відкривати файл і повідомити через затверджений процес',cz:'Uchovat zprávu, soubor neotevírat a nahlásit jej schváleným postupem'},
  'Verify authorization and actor, scope affected hosts, and escalate under the incident playbook':{ua:'Перевірити авторизацію та виконавця, визначити охоплені хости й ескалювати згідно з планом реагування',cz:'Ověřit oprávnění a aktéra, určit dotčené hostitele a eskalovat podle plánu reakce na incident'},
  'Assume it is approved because an admin account did it':{ua:'Вважати зміну схваленою, бо її виконав обліковий запис адміністратора',cz:'Považovat změnu za schválenou, protože ji provedl účet správce'},
  'Delete all accounts on the server':{ua:'Видалити всі облікові записи на сервері',cz:'Smazat všechny účty na serveru'}
};

const QUESTION={
  en:'1. How would you classify this event?',
  ua:'1. Як би ви класифікували цю подію?',
  cz:'1. Jak byste tuto událost klasifikovali?'
};

const REVERSE=new Map();
for(const [base,loc] of Object.entries(ANSWERS)){
  REVERSE.set(base,base);
  REVERSE.set(loc.ua,base);
  REVERSE.set(loc.cz,base);
}

function currentLang(){
  const active=document.querySelector('.language-switch button.active[data-lang]');
  if(active?.dataset.lang)return active.dataset.lang;
  try{
    const saved=localStorage.getItem('onel1t-lang');
    if(saved==='ua'||saved==='cz'||saved==='en')return saved;
  }catch(e){}
  return document.documentElement.lang==='uk'?'ua':document.documentElement.lang==='cs'?'cz':'en';
}

function translateAnswer(button,lang){
  const raw=button.textContent.trim();
  const m=raw.match(/^([A-C]\.\s*)(.+)$/);
  if(!m)return;
  const base=button.dataset.socAnswerBase||REVERSE.get(m[2]);
  if(!base)return;
  button.dataset.socAnswerBase=base;
  const text=lang==='en'?base:ANSWERS[base]?.[lang]||base;
  const next=m[1]+text;
  if(button.textContent!==next)button.textContent=next;
}

let applying=false;
function apply(){
  if(applying)return;
  const soc=document.getElementById('view-soc');
  if(!soc)return;
  applying=true;
  try{
    const lang=currentLang();
    const question=soc.querySelector('#soc-answers')?.previousElementSibling;
    const questionText=QUESTION[lang]||QUESTION.en;
    if(question&&question.tagName==='H3'&&question.textContent!==questionText){
      question.textContent=questionText;
    }
    soc.querySelectorAll('#soc-answers .answer').forEach(btn=>translateAnswer(btn,lang));
  } finally {
    applying=false;
  }
}

const soc=document.getElementById('view-soc');
if(soc){
  // SOC re-renders answer buttons with innerHTML/appendChild. Watching child-list
  // changes is enough and avoids a characterData feedback loop.
  const observer=new MutationObserver(()=>setTimeout(apply,0));
  observer.observe(soc,{subtree:true,childList:true});
}
new MutationObserver(()=>setTimeout(apply,0)).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
document.addEventListener('click',e=>{
  if(e.target.closest('.language-switch button[data-lang]')){
    setTimeout(apply,0);
    setTimeout(apply,80);
  }
});
apply();
setTimeout(apply,100);
})();
