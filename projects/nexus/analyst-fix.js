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
    uk:{title:'Результат локального аналізу',score:'Оцінка ризику',context:'Контекст',found:'Виявлені індикатори',summary:'Оцінка події',steps:'Рекомендовані наступні кроки',none:'Явних структурованих індикаторів не знайдено — аналіз виконано за текстовими ознаками.',empty:'Введіть опис інциденту або рядок журналу для аналізу.',local:'Аналіз виконано локально у браузері. Дані нікуди не надсилаються.',high:'Високий',medium:'Середній',low:'Низький'},
    cs:{title:'Výsledek lokální analýzy',score:'Hodnocení rizika',context:'Kontext',found:'Zjištěné indikátory',summary:'Vyhodnocení události',steps:'Doporučené další kroky',none:'Nebyly nalezeny zjevné strukturované indikátory — analýza vychází z textových znaků.',empty:'Zadejte popis incidentu nebo řádek protokolu.',local:'Analýza proběhla lokálně v prohlížeči. Data se nikam neodesílají.',high:'Vysoké',medium:'Střední',low:'Nízké'},
    en:{title:'Local analysis result',score:'Risk score',context:'Context',found:'Observed indicators',summary:'Event assessment',steps:'Recommended next steps',none:'No obvious structured indicators were found — the assessment is based on text signals.',empty:'Enter an incident description or log line to analyze.',local:'Analysis runs locally in your browser. No data is sent anywhere.',high:'High',medium:'Medium',low:'Low'}
  };

  function extract(raw){
    const ips=uniq((raw.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)||[]).filter(ip=>ip.split('.').every(n=>+n>=0&&+n<=255)));
    const urls=uniq(raw.match(/https?:\/\/[^\s<>"']+/gi)||[]);
    const domains=uniq((raw.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi)||[]).filter(x=>!ips.includes(x) && !urls.some(u=>u.includes(x))));
    const eventIds=uniq(raw.match(/\b(?:event(?:id)?[\s:=#-]*)?\d{4,6}\b/gi)||[]).slice(0,6);
    const accounts=uniq([...(raw.match(/(?:user|username|account|usr|користувач|обліков(?:ий|ого) запис)[\s:=#-]+[a-z0-9._@\\-]+/gi)||[]),...(raw.match(/\b(?:admin|administrator|root|svc-[a-z0-9._-]+)\b/gi)||[])]).slice(0,6);
    return {ips,urls,domains,eventIds,accounts};
  }

  function analyze(raw,ctx){
    const text=raw.toLowerCase();
    const indicators=extract(raw);
    let score=35, category='General', summary='', actions=[];

    const auth=/failed login|failed logon|authentication failure|brute|password spray|multiple login|невдал.{0,20}(вхід|логін|автентиф)|підбір.{0,15}парол|neúspěšn.{0,20}(přihl|ověř)/i.test(raw);
    const privilege=/privilege|sudo|role change|permission|administrator|admin rights|привіл|підвищ.{0,15}прав|адмін.{0,10}прав|oprávněn|privileg/i.test(raw);
    const malware=/malware|ransomware|trojan|suspicious file|quarantine|шкідлив|вірус|троян|підозріл.{0,10}файл|malware|trojan/i.test(raw);
    const network=/exfil|large upload|outbound|beacon|command.?and.?control|\bc2\b|rare destination|unusual traffic|вихідн.{0,15}трафік|передач.{0,15}дан|незвич.{0,15}трафік|odchozí|neobvykl.{0,15}provoz/i.test(raw);
    const data=/database|db read|select|rows_read|data access|баз.{0,10}дан|читан.{0,15}рядк|доступ.{0,15}дан|databáz|přístup.{0,15}dat/i.test(raw);
    const normal=/backup completed|heartbeat|success|успішн.{0,15}резерв|heartbeat|резервн.{0,15}коп|záloh.{0,15}dokon|úspěšn/i.test(raw);

    if(auth){category='Authentication';score=72;summary='Repeated authentication failures are a meaningful identity signal. They can come from user error or automation, but a burst, unfamiliar source, or later success raises the need for correlation.';actions=['Compare failed and successful logins in the same time window','Check source IP/device and the affected account','Correlate MFA, lockout and identity-provider events before escalation'];}
    if(privilege){category='Privilege / IAM';score=Math.max(score,78);summary='The event suggests a privilege or permission change. Validate whether the actor, target account and requested role match an approved change.';actions=['Identify the actor and target account','Check the approved change/access request','Review nearby audit events and scope affected systems'];}
    if(network){category='Network';score=Math.max(score,74);summary='The text contains an unusual network-activity signal. Destination, process ownership, volume and timing should be compared with the normal baseline.';actions=['Confirm destination, port and initiating process','Compare traffic volume/timing with the baseline','Preserve relevant network, DNS/proxy and endpoint logs'];}
    if(malware){category='Endpoint / Malware signal';score=Math.max(score,84);summary='The description contains a possible malicious-file or endpoint signal. One alert is not proof of compromise, so verify provenance and corroborating telemetry.';actions=['Do not execute the suspicious file','Record hash, path, signer and detection context','Correlate endpoint alerts and approved software/change records'];}
    if(data){category='Data access';score=Math.max(score,70);summary='The event may involve unusual data access. Validate the query or job, expected data owner approval and whether the volume differs from normal activity.';actions=['Check query/job identity and schedule','Compare accessed volume with the normal baseline','Preserve database/audit records and verify approval'];}
    if(normal && !(auth||privilege||network||malware||data)){category='Operational';score=18;summary='The wording looks closer to routine operational activity. Confirm expected timing and related warnings before closing it.';actions=['Compare with the expected schedule or health baseline','Check for related warnings/failures','Document the reason for closure'];}

    if(indicators.ips.length>1) score+=5;
    if(/critical|compromise|unauthorized|несанкціон|критич|скомпромет|kritick|neoprávně/i.test(raw)) score+=10;
    score=Math.max(5,Math.min(100,score));
    const severity=score>=70?'High':score>=40?'Medium':'Low';
    if(!summary){summary='The text does not match one strong predefined incident pattern, so it should be treated as a contextual triage case. Review the extracted indicators and validate them against surrounding events.';actions=['Confirm timestamp, source and affected asset','Compare with normal activity and nearby events','Document what is confirmed, unknown and what should be checked next'];}
    return {score,severity,category,summary,actions,indicators,ctx};
  }

  function run(){
    const raw=input.value.trim();
    const c=copy[lang()];
    if(!raw){
      result.classList.add('show');
      result.innerHTML='<div class="notice"><b>'+esc(c.empty)+'</b></div>';
      result.style.display='block';
      return false;
    }

    const a=analyze(raw,context.value);
    const cls=a.severity==='High'?'red':a.severity==='Low'?'green':'amber';
    const sevLabel=a.severity==='High'?c.high:a.severity==='Low'?c.low:c.medium;
    const chips=[];
    a.indicators.ips.forEach(x=>chips.push('IP: '+x));
    a.indicators.domains.forEach(x=>chips.push('Domain: '+x));
    a.indicators.urls.forEach(x=>chips.push('URL: '+x));
    a.indicators.accounts.forEach(x=>chips.push('Account: '+x));
    a.indicators.eventIds.forEach(x=>chips.push('Event: '+x));

    result.classList.add('show');
    result.style.display='block';
    result.innerHTML=
      '<div class="card-head"><h2>'+esc(c.title)+'</h2><span class="tag '+cls+'">'+esc(sevLabel)+' · '+a.score+'/100</span></div>'+
      '<div class="result-item"><b>'+esc(c.context)+'</b><span>'+esc(a.ctx)+' · '+esc(a.category)+'</span></div>'+
      '<div style="margin:14px 0"><b style="font-size:11px">'+esc(c.found)+'</b><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:8px">'+(chips.length?chips.map(x=>'<span class="tag">'+esc(x)+'</span>').join(''):'<span class="muted" style="font-size:12px">'+esc(c.none)+'</span>')+'</div></div>'+
      '<div style="margin:14px 0"><b style="font-size:11px">'+esc(c.summary)+'</b><p style="font-size:13px;line-height:1.7">'+esc(a.summary)+'</p></div>'+
      '<b style="font-size:11px">'+esc(c.steps)+'</b><ol style="padding-left:20px;color:var(--muted);font-size:12px">'+a.actions.map(x=>'<li style="margin:8px 0">'+esc(x)+'</li>').join('')+'</ol>'+
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
