(() => {
'use strict';

function init(){
  const form=document.getElementById('analystForm');
  const input=document.getElementById('analystInput');
  const context=document.getElementById('analystContext');
  const result=document.getElementById('analystResult');
  const button=document.getElementById('localAnalyzeBtn') || (form && form.querySelector('button'));
  if(!form||!input||!context||!result||!button) return;

  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uniq=a=>[...new Set(a.filter(Boolean))];
  const lang=()=>document.documentElement.lang==='uk'?'uk':document.documentElement.lang==='cs'?'cs':'en';

  const copy={
    uk:{
      title:'Результат локального аналізу',score:'Оцінка ризику',context:'Контекст',found:'Виявлені індикатори',summary:'Оцінка події',steps:'Рекомендовані наступні кроки',none:'Явних структурованих індикаторів не знайдено — аналіз виконано за текстовими ознаками.',empty:'Введіть опис інциденту або рядок журналу для аналізу.',local:'Аналіз виконано локально у браузері. Дані нікуди не надсилаються.',high:'Високий',medium:'Середній',low:'Низький',ip:'IP',domain:'Домен',url:'URL',account:'Обліковий запис',event:'Подія',
      categories:{general:'Загальний',auth:'Автентифікація',privilege:'Привілеї / IAM',network:'Мережева активність',malware:'Кінцева точка / сигнал шкідливого ПЗ',data:'Доступ до даних',operational:'Операційна подія'},
      assessments:{
        auth:{summary:'Повторні невдалі спроби автентифікації є важливим сигналом ідентифікаційної безпеки. Причиною може бути помилка користувача або автоматизація, але серія спроб, незнайоме джерело чи подальший успішний вхід потребують додаткової перевірки.',actions:['Порівняйте невдалі та успішні входи в одному часовому проміжку','Перевірте IP-адресу або пристрій-джерело та задіяний обліковий запис','Зіставте подію з MFA, блокуваннями та журналами провайдера ідентифікації перед ескалацією']},
        privilege:{summary:'Подія схожа на зміну привілеїв або дозволів. Потрібно перевірити, чи відповідають виконавець, цільовий обліковий запис і запитана роль погодженій зміні.',actions:['Визначте виконавця та цільовий обліковий запис','Перевірте погоджену заявку на зміну або доступ','Перегляньте сусідні події аудиту та визначте, які системи могли бути зачеплені']},
        network:{summary:'У тексті є ознаки незвичної мережевої активності. Призначення, процес-ініціатор, обсяг і час трафіку потрібно порівняти зі звичайним профілем.',actions:['Перевірте адресу призначення, порт і процес, що ініціював з’єднання','Порівняйте обсяг і час трафіку з базовою активністю','Збережіть релевантні мережеві журнали, DNS/proxy-дані та телеметрію кінцевої точки']},
        malware:{summary:'Опис містить можливий сигнал шкідливого файла або підозрілої активності на кінцевій точці. Одного сповіщення недостатньо для підтвердження компрометації, тому потрібна додаткова перевірка.',actions:['Не запускайте підозрілий файл','Зафіксуйте хеш, шлях, підпис і контекст спрацювання','Зіставте подію з endpoint-телеметрією та дозволеними змінами програмного забезпечення']},
        data:{summary:'Подія може стосуватися незвичного доступу до даних. Перевірте запит або завдання, погодження власника даних і відхилення обсягу доступу від нормальної активності.',actions:['Перевірте ідентичність запиту або завдання та його розклад','Порівняйте обсяг доступу зі звичайним базовим рівнем','Збережіть журнали бази даних або аудиту та перевірте наявність погодження']},
        operational:{summary:'Формулювання більше схоже на звичайну операційну подію. Перед закриттям перевірте очікуваний час виконання та пов’язані попередження.',actions:['Порівняйте подію з очікуваним розкладом або показниками здоров’я системи','Перевірте пов’язані попередження чи помилки','Зафіксуйте причину, через яку подію можна вважати штатною']},
        general:{summary:'Текст не відповідає одному чіткому шаблону інциденту, тому його варто розглядати як контекстний випадок первинного аналізу. Перевірте знайдені індикатори та зіставте їх із сусідніми подіями.',actions:['Підтвердьте час, джерело та задіяний актив','Порівняйте подію зі звичайною активністю та сусідніми записами','Зафіксуйте, що вже підтверджено, що залишається невідомим і що потрібно перевірити далі']}
      }
    },
    cs:{
      title:'Výsledek lokální analýzy',score:'Hodnocení rizika',context:'Kontext',found:'Zjištěné indikátory',summary:'Vyhodnocení události',steps:'Doporučené další kroky',none:'Nebyly nalezeny zjevné strukturované indikátory — analýza vychází z textových znaků.',empty:'Zadejte popis incidentu nebo řádek protokolu.',local:'Analýza proběhla lokálně v prohlížeči. Data se nikam neodesílají.',high:'Vysoké',medium:'Střední',low:'Nízké',ip:'IP',domain:'Doména',url:'URL',account:'Účet',event:'Událost',
      categories:{general:'Obecné',auth:'Autentizace',privilege:'Oprávnění / IAM',network:'Síťová aktivita',malware:'Koncový bod / signál malwaru',data:'Přístup k datům',operational:'Provozní událost'},
      assessments:{
        auth:{summary:'Opakovaná neúspěšná přihlášení jsou významným signálem v oblasti identity. Mohou být způsobena chybou uživatele nebo automatizací, ale série pokusů, neznámý zdroj či následné úspěšné přihlášení vyžadují další ověření.',actions:['Porovnejte neúspěšná a úspěšná přihlášení ve stejném časovém okně','Zkontrolujte zdrojovou IP adresu nebo zařízení a dotčený účet','Před eskalací porovnejte událost s MFA, blokacemi a protokoly poskytovatele identity']},
        privilege:{summary:'Událost naznačuje změnu oprávnění nebo rolí. Ověřte, zda aktér, cílový účet a požadovaná role odpovídají schválené změně.',actions:['Určete aktéra a cílový účet','Ověřte schválenou žádost o změnu nebo přístup','Zkontrolujte okolní auditní události a rozsah dotčených systémů']},
        network:{summary:'Text obsahuje signál neobvyklé síťové aktivity. Cíl, vlastnictví procesu, objem a čas provozu je vhodné porovnat s běžným profilem.',actions:['Ověřte cílovou adresu, port a proces, který spojení inicioval','Porovnejte objem a čas provozu s běžnou aktivitou','Uchovejte relevantní síťové protokoly, DNS/proxy data a telemetrii koncového bodu']},
        malware:{summary:'Popis obsahuje možný signál škodlivého souboru nebo podezřelé aktivity na koncovém bodu. Jedno upozornění samo o sobě nepotvrzuje kompromitaci, proto je nutné další ověření.',actions:['Nespouštějte podezřelý soubor','Zaznamenejte hash, cestu, podpis a kontext detekce','Porovnejte událost s telemetrií koncového bodu a schválenými změnami softwaru']},
        data:{summary:'Událost může souviset s neobvyklým přístupem k datům. Ověřte dotaz nebo úlohu, schválení vlastníka dat a to, zda se objem přístupu liší od běžného stavu.',actions:['Ověřte identitu dotazu nebo úlohy a její plán','Porovnejte objem přístupu s běžnou základní úrovní','Uchovejte databázové nebo auditní záznamy a ověřte schválení']},
        operational:{summary:'Formulace vypadá spíše jako běžná provozní událost. Před uzavřením ověřte očekávaný čas a související varování.',actions:['Porovnejte událost s očekávaným plánem nebo běžným stavem systému','Zkontrolujte související varování či chyby','Zdokumentujte důvod, proč lze událost považovat za běžnou']},
        general:{summary:'Text neodpovídá jednomu výraznému předdefinovanému typu incidentu, proto by měl být posouzen kontextově. Zkontrolujte nalezené indikátory a porovnejte je s okolními událostmi.',actions:['Potvrďte čas, zdroj a dotčené aktivum','Porovnejte událost s běžnou aktivitou a okolními záznamy','Zdokumentujte, co je potvrzené, co zůstává neznámé a co je třeba ověřit dále']}
      }
    },
    en:{
      title:'Local analysis result',score:'Risk score',context:'Context',found:'Observed indicators',summary:'Event assessment',steps:'Recommended next steps',none:'No obvious structured indicators were found — the assessment is based on text signals.',empty:'Enter an incident description or log line to analyze.',local:'Analysis runs locally in your browser. No data is sent anywhere.',high:'High',medium:'Medium',low:'Low',ip:'IP',domain:'Domain',url:'URL',account:'Account',event:'Event',
      categories:{general:'General',auth:'Authentication',privilege:'Privilege / IAM',network:'Network activity',malware:'Endpoint / Malware signal',data:'Data access',operational:'Operational event'},
      assessments:{
        auth:{summary:'Repeated authentication failures are a meaningful identity signal. They can come from user error or automation, but a burst, unfamiliar source, or later success raises the need for correlation.',actions:['Compare failed and successful logins in the same time window','Check source IP/device and the affected account','Correlate MFA, lockout and identity-provider events before escalation']},
        privilege:{summary:'The event suggests a privilege or permission change. Validate whether the actor, target account and requested role match an approved change.',actions:['Identify the actor and target account','Check the approved change/access request','Review nearby audit events and scope affected systems']},
        network:{summary:'The text contains an unusual network-activity signal. Destination, process ownership, volume and timing should be compared with the normal baseline.',actions:['Confirm destination, port and initiating process','Compare traffic volume/timing with the baseline','Preserve relevant network, DNS/proxy and endpoint logs']},
        malware:{summary:'The description contains a possible malicious-file or endpoint signal. One alert is not proof of compromise, so verify provenance and corroborating telemetry.',actions:['Do not execute the suspicious file','Record hash, path, signer and detection context','Correlate endpoint alerts and approved software/change records']},
        data:{summary:'The event may involve unusual data access. Validate the query or job, expected data owner approval and whether the volume differs from normal activity.',actions:['Check query/job identity and schedule','Compare accessed volume with the normal baseline','Preserve database/audit records and verify approval']},
        operational:{summary:'The wording looks closer to routine operational activity. Confirm expected timing and related warnings before closing it.',actions:['Compare with the expected schedule or health baseline','Check for related warnings/failures','Document the reason for closure']},
        general:{summary:'The text does not match one strong predefined incident pattern, so it should be treated as a contextual triage case. Review the extracted indicators and validate them against surrounding events.',actions:['Confirm timestamp, source and affected asset','Compare with normal activity and nearby events','Document what is confirmed, unknown and what should be checked next']}
      }
    }
  };

  function extract(raw){
    const ips=uniq((raw.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)||[]).filter(ip=>ip.split('.').every(n=>+n>=0&&+n<=255)));
    const urls=uniq(raw.match(/https?:\/\/[^\s<>"']+/gi)||[]);
    const domains=uniq((raw.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi)||[]).filter(x=>!ips.includes(x) && !urls.some(u=>u.includes(x))));
    const eventIds=uniq(raw.match(/\b(?:event(?:id)?[\s:=#-]*)?\d{4,6}\b/gi)||[]).slice(0,6);
    const accounts=uniq([...(raw.match(/(?:user|username|account|usr|користувач|обліков(?:ий|ого) запис|uživatel|účet)[\s:=#-]+[a-z0-9._@\\-]+/gi)||[]),...(raw.match(/\b(?:admin|administrator|root|svc-[a-z0-9._-]+)\b/gi)||[])]).slice(0,6);
    return {ips,urls,domains,eventIds,accounts};
  }

  function analyze(raw){
    const indicators=extract(raw);
    let score=35, key='general';
    const auth=/failed login|failed logon|authentication failure|brute|password spray|multiple login|невдал.{0,20}(вхід|логін|автентиф)|підбір.{0,15}парол|neúspěšn.{0,20}(přihl|ověř)/i.test(raw);
    const privilege=/privilege|sudo|role change|permission|administrator|admin rights|привіл|підвищ.{0,15}прав|адмін.{0,10}прав|oprávněn|privileg/i.test(raw);
    const malware=/malware|ransomware|trojan|suspicious file|quarantine|шкідлив|вірус|троян|підозріл.{0,10}файл|škodliv|podezřel.{0,10}soubor/i.test(raw);
    const network=/exfil|large upload|outbound|beacon|command.?and.?control|\bc2\b|rare destination|unusual traffic|вихідн.{0,15}трафік|передач.{0,15}дан|незвич.{0,15}трафік|odchozí|neobvykl.{0,15}provoz/i.test(raw);
    const data=/database|db read|select|rows_read|data access|баз.{0,10}дан|читан.{0,15}рядк|доступ.{0,15}дан|databáz|přístup.{0,15}dat/i.test(raw);
    const normal=/backup completed|heartbeat|success|успішн.{0,15}резерв|резервн.{0,15}коп|záloh.{0,15}dokon|úspěšn/i.test(raw);

    if(auth){key='auth';score=72;}
    if(privilege){key='privilege';score=Math.max(score,78);}
    if(network){key='network';score=Math.max(score,74);}
    if(malware){key='malware';score=Math.max(score,84);}
    if(data){key='data';score=Math.max(score,70);}
    if(normal && !(auth||privilege||network||malware||data)){key='operational';score=18;}
    if(indicators.ips.length>1) score+=5;
    if(/critical|compromise|unauthorized|несанкціон|критич|скомпромет|kritick|neoprávně/i.test(raw)) score+=10;
    score=Math.max(5,Math.min(100,score));
    const severity=score>=70?'High':score>=40?'Medium':'Low';
    return {score,severity,key,indicators};
  }

  function run(){
    const raw=input.value.trim();
    const locale=lang();
    const c=copy[locale];
    if(!raw){
      result.classList.add('show');
      result.innerHTML='<div class="notice"><b>'+esc(c.empty)+'</b></div>';
      result.style.display='block';
      return false;
    }

    const a=analyze(raw);
    const assessment=c.assessments[a.key] || c.assessments.general;
    const cls=a.severity==='High'?'red':a.severity==='Low'?'green':'amber';
    const sevLabel=a.severity==='High'?c.high:a.severity==='Low'?c.low:c.medium;
    const chips=[];
    a.indicators.ips.forEach(x=>chips.push(c.ip+': '+x));
    a.indicators.domains.forEach(x=>chips.push(c.domain+': '+x));
    a.indicators.urls.forEach(x=>chips.push(c.url+': '+x));
    a.indicators.accounts.forEach(x=>chips.push(c.account+': '+x));
    a.indicators.eventIds.forEach(x=>chips.push(c.event+': '+x));

    result.classList.add('show');
    result.style.display='block';
    result.innerHTML=
      '<div class="card-head"><h2>'+esc(c.title)+'</h2><span class="tag '+cls+'">'+esc(sevLabel)+' · '+a.score+'/100</span></div>'+
      '<div class="result-item"><b>'+esc(c.context)+'</b><span>'+esc(context.value)+' · '+esc(c.categories[a.key]||c.categories.general)+'</span></div>'+
      '<div style="margin:14px 0"><b style="font-size:11px">'+esc(c.found)+'</b><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:8px">'+(chips.length?chips.map(x=>'<span class="tag">'+esc(x)+'</span>').join(''):'<span class="muted" style="font-size:12px">'+esc(c.none)+'</span>')+'</div></div>'+
      '<div style="margin:14px 0"><b style="font-size:11px">'+esc(c.summary)+'</b><p style="font-size:13px;line-height:1.7">'+esc(assessment.summary)+'</p></div>'+
      '<b style="font-size:11px">'+esc(c.steps)+'</b><ol style="padding-left:20px;color:var(--muted);font-size:12px">'+assessment.actions.map(x=>'<li style="margin:8px 0">'+esc(x)+'</li>').join('')+'</ol>'+
      '<div class="notice">'+esc(c.local)+'</div>';

    requestAnimationFrame(()=>result.scrollIntoView({behavior:'smooth',block:'nearest'}));
    return false;
  }

  window.runNexusAnalyst=run;
  form.action='javascript:void(0)';
  button.type='button';
  form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();run();return false;},true);
  document.addEventListener('click',e=>{
    const b=e.target.closest('#localAnalyzeBtn');
    if(!b) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    run();
  },true);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
