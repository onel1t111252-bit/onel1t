(() => {
'use strict';

function init(){
  const form=document.getElementById('osintForm');
  const input=document.getElementById('targetInput');
  const type=document.getElementById('targetType');
  const priority=document.getElementById('targetPriority');
  const question=document.getElementById('targetQuestion');
  const result=document.getElementById('osintResult');
  const button=form && form.querySelector('button');
  if(!form||!input||!type||!priority||!question||!result||!button) return;

  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getLang=()=>document.documentElement.lang==='uk'?'uk':document.documentElement.lang==='cs'?'cs':'en';
  const typeKey=()=>['domain','ipv4','url','note'][type.selectedIndex]||'domain';
  const priorityKey=()=>['medium','low','high'][priority.selectedIndex]||'medium';

  const copy={
    uk:{
      placeholder:'Яку загальнодоступну інформацію потрібно перевірити?',
      created:'Картку OSINT створено',target:'Ціль',type:'Тип',priority:'Пріоритет',question:'Дослідницьке запитання',validation:'Перевірка формату',valid:'Формат виглядає коректно',invalid:'Формат потребує перевірки',steps:'Рекомендований план дослідження',saved:'Збережено лише в поточному поданні',local:'Ця картка створена локально. Жодних зовнішніх OSINT-запитів сайт не виконує.',
      invalidMsg:'Значення не відповідає вибраному типу цілі. Перевірте введення та спробуйте ще раз.',
      types:{domain:'Домен',ipv4:'IPv4-адреса',url:'URL',note:'Дослідницька нотатка'},
      priorities:{medium:'Середній',low:'Низький',high:'Високий'},
      defaultQuestion:'Перевірити доступну публічну інформацію, зафіксувати джерела та відокремити підтверджені факти від припущень.',
      plans:{
        domain:['Підтвердьте правильність доменного імені та межі дослідження','Перевіряйте лише загальнодоступні реєстри, офіційні сторінки та опубліковану документацію','Фіксуйте джерело, дату перевірки й рівень достовірності кожного факту'],
        ipv4:['Переконайтеся, що IP-адреса входить у дозволені межі дослідження','Використовуйте лише публічні довідкові джерела та офіційні реєстри','Не робіть висновків про власника або призначення адреси без підтвердження з кількох джерел'],
        url:['Перевірте структуру URL та домен, не відкриваючи підозрілий вміст без потреби','Порівняйте адресу з офіційними публічними джерелами й документацією','Зафіксуйте, що підтверджено, а що залишається лише припущенням'],
        note:['Сформулюйте конкретне дослідницьке запитання','Зберіть підтвердження лише з надійних загальнодоступних джерел','Запишіть джерела, часові мітки та невизначеність перед формуванням висновку']
      }
    },
    cs:{
      placeholder:'Které veřejně dostupné informace je třeba ověřit?',
      created:'OSINT list byl vytvořen',target:'Cíl',type:'Typ',priority:'Priorita',question:'Výzkumná otázka',validation:'Kontrola formátu',valid:'Formát vypadá správně',invalid:'Formát vyžaduje kontrolu',steps:'Doporučený plán výzkumu',saved:'Uloženo pouze v aktuálním zobrazení',local:'Tento list byl vytvořen lokálně. Web neprovádí žádné externí OSINT dotazy.',
      invalidMsg:'Hodnota neodpovídá zvolenému typu cíle. Zkontrolujte vstup a zkuste to znovu.',
      types:{domain:'Doména',ipv4:'IPv4 adresa',url:'URL',note:'Výzkumná poznámka'},
      priorities:{medium:'Střední',low:'Nízká',high:'Vysoká'},
      defaultQuestion:'Ověřit dostupné veřejné informace, zaznamenat zdroje a oddělit potvrzená fakta od předpokladů.',
      plans:{
        domain:['Potvrďte správnost doménového jména a rozsah výzkumu','Používejte pouze veřejné registry, oficiální stránky a publikovanou dokumentaci','U každého zjištění zaznamenejte zdroj, datum ověření a míru jistoty'],
        ipv4:['Ověřte, že IP adresa spadá do povoleného rozsahu výzkumu','Používejte pouze veřejné referenční zdroje a oficiální registry','Nevyvozujte závěry o vlastníkovi nebo účelu adresy bez potvrzení z více zdrojů'],
        url:['Zkontrolujte strukturu URL a doménu, aniž byste zbytečně otevírali podezřelý obsah','Porovnejte adresu s oficiálními veřejnými zdroji a dokumentací','Zaznamenejte, co je potvrzené a co zůstává pouze předpokladem'],
        note:['Formulujte konkrétní výzkumnou otázku','Shromažďujte potvrzení pouze z důvěryhodných veřejných zdrojů','Před závěrem zaznamenejte zdroje, časové údaje a nejistoty']
      }
    },
    en:{
      placeholder:'What public information needs verification?',
      created:'OSINT worksheet created',target:'Target',type:'Type',priority:'Priority',question:'Research question',validation:'Format validation',valid:'Format looks valid',invalid:'Format needs review',steps:'Suggested research plan',saved:'Saved to current view only',local:'This worksheet was created locally. The site performs no external OSINT lookups.',
      invalidMsg:'This value does not match the selected target type. Check the input and try again.',
      types:{domain:'Domain',ipv4:'IPv4 address',url:'URL',note:'Research note'},
      priorities:{medium:'Medium',low:'Low',high:'High'},
      defaultQuestion:'Verify available public information, record sources, and separate confirmed facts from assumptions.',
      plans:{
        domain:['Confirm the domain name and authorized research scope','Use only public registries, official pages and published documentation','Record the source, verification date and confidence level for each finding'],
        ipv4:['Confirm the IP address is within the authorized research scope','Use only public reference sources and official registries','Do not infer ownership or purpose without corroboration from multiple sources'],
        url:['Validate the URL structure and domain without unnecessarily opening suspicious content','Compare the address with official public sources and documentation','Record what is confirmed and what remains an assumption'],
        note:['Define a specific research question','Collect corroboration only from reputable public sources','Record sources, timestamps and uncertainty before drawing a conclusion']
      }
    }
  };

  let last=null;

  function validate(value,key){
    if(key==='domain') return /^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(value);
    if(key==='ipv4') return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value) && value.split('.').every(n=>Number(n)>=0&&Number(n)<=255);
    if(key==='url'){
      try{const u=new URL(value);return u.protocol==='https:'||u.protocol==='http:';}catch(_){return false;}
    }
    return value.length>=3;
  }

  function updatePlaceholder(){
    question.placeholder=copy[getLang()].placeholder;
  }

  function render(payload){
    const c=copy[getLang()];
    const ok=validate(payload.value,payload.typeKey);
    result.classList.add('show');
    result.style.display='block';

    if(!ok){
      result.innerHTML='<div class="card-head"><h2>'+esc(c.invalid)+'</h2><span class="tag red">'+esc(c.validation)+'</span></div><p class="muted" style="font-size:12px">'+esc(c.invalidMsg)+'</p><div class="notice">'+esc(c.local)+'</div>';
      return;
    }

    const plan=c.plans[payload.typeKey];
    result.innerHTML=
      '<div class="card-head"><h2>'+esc(c.created)+'</h2><span>'+esc(payload.id)+'</span></div>'+
      '<div class="result-item"><b>'+esc(c.target)+'</b><span>'+esc(payload.value)+'</span></div>'+
      '<div class="result-item"><b>'+esc(c.type)+'</b><span>'+esc(c.types[payload.typeKey])+'</span></div>'+
      '<div class="result-item"><b>'+esc(c.priority)+'</b><span>'+esc(c.priorities[payload.priorityKey])+'</span></div>'+
      '<div class="result-item"><b>'+esc(c.validation)+'</b><span class="tag green">'+esc(c.valid)+'</span></div>'+
      '<div style="margin:14px 0"><b style="font-size:11px">'+esc(c.question)+'</b><p class="muted" style="font-size:12px;line-height:1.7">'+esc(payload.question||c.defaultQuestion)+'</p></div>'+
      '<b style="font-size:11px">'+esc(c.steps)+'</b><ol style="padding-left:20px;color:var(--muted);font-size:12px">'+plan.map(x=>'<li style="margin:8px 0">'+esc(x)+'</li>').join('')+'</ol>'+
      '<span class="tag green">'+esc(c.saved)+'</span><div class="notice">'+esc(c.local)+'</div>';

    requestAnimationFrame(()=>result.scrollIntoView({behavior:'smooth',block:'nearest'}));
  }

  function run(){
    const value=input.value.trim();
    if(!value){input.focus();return false;}
    last={
      id:'OS-'+Math.random().toString(36).slice(2,7).toUpperCase(),
      value,
      typeKey:typeKey(),
      priorityKey:priorityKey(),
      question:question.value.trim()
    };
    render(last);
    return false;
  }

  form.setAttribute('action','javascript:void(0)');
  button.type='button';
  button.id='createOsintWorksheetBtn';
  updatePlaceholder();

  form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();run();},true);
  button.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();run();},true);

  new MutationObserver(()=>{
    updatePlaceholder();
    if(last) render(last);
  }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
