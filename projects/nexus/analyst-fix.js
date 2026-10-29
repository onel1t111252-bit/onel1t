(() => {
'use strict';
const form=document.getElementById('analystForm');
const input=document.getElementById('analystInput');
const context=document.getElementById('analystContext');
const result=document.getElementById('analystResult');
if(!form||!input||!context||!result)return;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function analyze(raw,ctx){
 const text=raw.toLowerCase();
 let severity='Medium',summary='Подія потребує перевірки контексту та зіставлення із сусідніми подіями.',actions=['Перевірте час, джерело та задіяний актив','Порівняйте подію зі звичайною активністю','Збережіть докази та позначте те, що ще не підтверджено'];
 if(/failed login|authentication failure|brute|password spray|multiple login|невдал|автентиф|вхід|логін/.test(text)){severity='High';summary='Повторні невдалі спроби входу можуть бути помилкою користувача, автоматизацією або спробою підбору облікових даних. Для висновку потрібне зіставлення журналів.';actions=['Перевірте послідовність невдалих і успішних входів','Перегляньте джерело та задіяні облікові записи','Зіставте з MFA, пристроєм і часовим проміжком']}
 else if(/privilege|admin|sudo|role change|permission|привіл|адмін|прав/.test(text)){severity='High';summary='Зміни привілеїв варто перевірити за заявкою, виконавцем і журналами доступу.';actions=['Перевірте хто ініціював зміну','Зіставте з дозволеною заявкою або зміною','Перегляньте сусідні події аудиту']}
 else if(/exfil|large upload|outbound|beacon|command.and.control|c2|вихідн|передач|трафік/.test(text)){severity='High';summary='Незвична мережева активність потребує перевірки призначення, процесу та нормального профілю трафіку.';actions=['Перевірте призначення та процес-ініціатор','Порівняйте обсяг і час із базовою активністю','Збережіть релевантні мережеві та endpoint-журнали']}
 else if(/malware|ransomware|trojan|suspicious file|quarantine|шкідлив|вірус|троян|підозріл.*файл/.test(text)){severity='High';summary='Опис містить потенційний сигнал шкідливого файла. Потрібне підтвердження додатковою телеметрією.';actions=['Не запускайте підозрілий файл','Збережіть хеш та контекст сповіщення','Перевірте endpoint-телеметрію та походження файла']}
 else if(/timeout|heartbeat|backup completed|success|резервн|успішн|heartbeat/.test(text)){severity='Low';summary='Формулювання схоже на звичайну операційну подію, але перед закриттям варто перевірити очікуваний час і контекст.';actions=['Порівняйте з очікуваним розкладом','Перевірте пов’язані попередження або помилки','Зафіксуйте причину закриття події']}
 return {severity,summary,actions,ctx};
}
function render(){
 const raw=input.value.trim();
 if(!raw){result.classList.add('show');result.innerHTML='<div class="notice"><b>Введіть подію для аналізу.</b><br>Наприклад: 12 невдалих входів для admin з незнайомої IP-адреси.</div>';result.scrollIntoView({behavior:'smooth',block:'nearest'});return;}
 const a=analyze(raw,context.value);
 const cls=a.severity==='High'?'red':a.severity==='Low'?'green':'amber';
 result.classList.add('show');
 result.innerHTML='<div class="card-head"><h2>Результат локального аналізу</h2><span class="tag '+cls+'">'+esc(a.severity)+' · '+esc(a.ctx)+'</span></div><p style="font-size:13px">'+esc(a.summary)+'</p><b style="font-size:11px">Рекомендовані наступні кроки</b><ol style="padding-left:20px;color:var(--muted);font-size:12px">'+a.actions.map(x=>'<li style="margin:8px 0">'+esc(x)+'</li>').join('')+'</ol><div class="notice">Локальний rule-based аналіз: дані не надсилаються в мережу. Це навчальна рекомендація, а не автоматичний висновок.</div>';
 result.scrollIntoView({behavior:'smooth',block:'nearest'});
}
form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();render();},true);
})();
