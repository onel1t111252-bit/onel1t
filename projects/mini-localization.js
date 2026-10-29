(() => {
'use strict';

const page=(location.pathname.split('/').filter(Boolean).slice(-2,-1)[0]||'').toLowerCase();
const supported=new Set(['password-strength-lab','ipv4-subnet-calculator','phishing-link-analyzer','security-log-triage']);
if(!supported.has(page)) return;

const baseText=new WeakMap();
const baseAttr=new WeakMap();

const common={
  '← Back to portfolio':['← Назад до портфоліо','← Zpět na portfolio'],
  'View source on GitHub ↗':['Переглянути код на GitHub ↗','Zobrazit zdrojový kód na GitHubu ↗'],
  'Clear':['Очистити','Vymazat'],
};

const maps={
'password-strength-lab':{
  ...common,
  'ONEL1T / SECURITY MINI-PROJECT 01':['ONEL1T / МІНІПРОЄКТ З БЕЗПЕКИ 01','ONEL1T / BEZPEČNOSTNÍ MINIPROJEKT 01'],
  'Password Strength Lab':['Лабораторія надійності паролів','Laboratoř síly hesla'],
  'A small client-side tool that checks common password-strength signals and explains what can be improved. Your input stays in this browser page and is not sent to a server.':['Невеликий локальний інструмент, який перевіряє типові ознаки надійності пароля та пояснює, що можна покращити. Введені дані залишаються у браузері й не надсилаються на сервер.','Malý lokální nástroj, který kontroluje běžné znaky síly hesla a vysvětluje, co lze zlepšit. Zadaná data zůstávají v prohlížeči a neodesílají se na server.'],
  'Test a password':['Перевірити пароль','Otestovat heslo'],
  'Enter a password to begin':['Введіть пароль, щоб почати','Začněte zadáním hesla'],
  'This is an educational estimate, not a guarantee of account security.':['Це навчальна оцінка, а не гарантія безпеки облікового запису.','Jde o vzdělávací odhad, nikoli záruku bezpečnosti účtu.'],
  'At least 12 characters':['Щонайменше 12 символів','Alespoň 12 znaků'],
  'Uppercase and lowercase':['Великі та малі літери','Velká a malá písmena'],
  'Contains a number':['Містить цифру','Obsahuje číslo'],
  'Contains a symbol':['Містить спеціальний символ','Obsahuje speciální znak'],
  'Not a common pattern':['Не є типовим шаблоном','Není běžným vzorem'],
  'Avoids common patterns':['Уникає типових шаблонів','Vyhýbá se běžným vzorům'],
  'Show password':['Показати пароль','Zobrazit heslo'],
  'Hide password':['Сховати пароль','Skrýt heslo'],
  'Privacy note: this demo does not store or transmit the password. Avoid entering a real password; use a made-up example.':['Примітка про приватність: демо не зберігає й не передає пароль. Не вводьте справжній пароль — використовуйте вигаданий приклад.','Poznámka k soukromí: demo heslo neukládá ani nepřenáší. Nezadávejte skutečné heslo; použijte smyšlený příklad.'],
  'Use a long, unique passphrase and enable MFA where possible.':['Використовуйте довгу унікальну парольну фразу та вмикайте MFA, де це можливо.','Používejte dlouhou jedinečnou přístupovou frázi a kde je to možné, zapněte MFA.'],
  'Try meeting more checks; length and uniqueness matter more than arbitrary complexity rules.':['Спробуйте виконати більше перевірок; довжина та унікальність важливіші за довільні правила складності.','Zkuste splnit více kontrol; délka a jedinečnost jsou důležitější než libovolná pravidla složitosti.'],
  'Nice checklist result. A unique password stored in a password manager is still recommended.':['Хороший результат перевірки. Усе одно рекомендовано використовувати унікальний пароль і менеджер паролів.','Dobrý výsledek kontroly. Stále je vhodné používat jedinečné heslo uložené ve správci hesel.'],
},
'ipv4-subnet-calculator':{
  ...common,
  'ONEL1T / NETWORKING MINI-PROJECT 02':['ONEL1T / МЕРЕЖЕВИЙ МІНІПРОЄКТ 02','ONEL1T / SÍŤOVÝ MINIPROJEKT 02'],
  'IPv4 Subnet Calculator':['Калькулятор IPv4-підмереж','Kalkulačka podsítí IPv4'],
  'Enter an IPv4 address and CIDR prefix to calculate the subnet mask, network address, broadcast address, and usable host range. Useful for networking fundamentals and lab planning.':['Введіть IPv4-адресу та CIDR-префікс, щоб розрахувати маску підмережі, адресу мережі, broadcast-адресу та діапазон доступних хостів. Корисно для вивчення мереж і планування лабораторій.','Zadejte IPv4 adresu a prefix CIDR pro výpočet masky podsítě, adresy sítě, broadcast adresy a rozsahu použitelných hostitelů. Užitečné pro základy sítí a plánování laboratoří.'],
  'IPv4 address':['IPv4-адреса','IPv4 adresa'],
  'CIDR prefix':['CIDR-префікс','Prefix CIDR'],
  'Calculate':['Розрахувати','Vypočítat'],
  'Educational tool for IPv4 CIDR calculations. It runs locally in your browser and does not send data anywhere.':['Навчальний інструмент для IPv4/CIDR-розрахунків. Працює локально у браузері та нікуди не надсилає дані.','Vzdělávací nástroj pro výpočty IPv4/CIDR. Běží lokálně v prohlížeči a nikam data neodesílá.'],
  'Network address':['Адреса мережі','Adresa sítě'],
  'Subnet mask':['Маска підмережі','Maska podsítě'],
  'Broadcast address':['Broadcast-адреса','Broadcast adresa'],
  'First usable host':['Перший доступний хост','První použitelný hostitel'],
  'Last usable host':['Останній доступний хост','Poslední použitelný hostitel'],
  'Total addresses':['Усього адрес','Celkem adres'],
  'Usable hosts':['Доступні хости','Použitelní hostitelé'],
  'Wildcard mask':['Wildcard-маска','Wildcard maska'],
  'Address binary':['Адреса у двійковому вигляді','Adresa v binárním tvaru'],
  'Enter a valid IPv4 address (four numbers from 0 to 255).':['Введіть коректну IPv4-адресу (чотири числа від 0 до 255).','Zadejte platnou IPv4 adresu (čtyři čísla od 0 do 255).'],
},
'phishing-link-analyzer':{
  ...common,
  'ONEL1T / CYBERSECURITY PROJECT 03':['ONEL1T / ПРОЄКТ З КІБЕРБЕЗПЕКИ 03','ONEL1T / PROJEKT KYBERBEZPEČNOSTI 03'],
  'Phishing Link Analyzer':['Аналізатор фішингових посилань','Analyzátor phishingových odkazů'],
  'Inspect a suspicious URL using transparent, browser-based heuristics. The tool flags common warning signs such as misleading URL structure, IP-based hosts, lookalike wording, URL shorteners and insecure schemes.':['Перевіряйте підозрілі URL за допомогою прозорих евристик у браузері. Інструмент позначає типові ознаки ризику: оманливу структуру URL, IP замість домену, схожі назви, скорочувачі посилань і небезпечні схеми.','Prověřujte podezřelé URL pomocí transparentních heuristik v prohlížeči. Nástroj označuje běžné varovné znaky, například matoucí strukturu URL, IP místo domény, napodobující názvy, zkracovače odkazů a nezabezpečená schémata.'],
  'URL to inspect':['URL для перевірки','URL ke kontrole'],
  'Analyze URL':['Проаналізувати URL','Analyzovat URL'],
  'Load sample':['Завантажити приклад','Načíst ukázku'],
  'Enter a URL and select Analyze URL to see the results.':['Введіть URL і натисніть «Проаналізувати URL», щоб побачити результат.','Zadejte URL a klikněte na „Analyzovat URL“ pro zobrazení výsledků.'],
  'Enter a URL first.':['Спочатку введіть URL.','Nejprve zadejte URL.'],
  'That does not look like a valid HTTP/HTTPS URL. Check the spelling and try again.':['Це не схоже на коректний HTTP/HTTPS URL. Перевірте написання та спробуйте ще раз.','Toto nevypadá jako platná HTTP/HTTPS URL. Zkontrolujte zápis a zkuste to znovu.'],
  'Privacy: analysis runs locally in this browser. The URL is not uploaded or checked against an online reputation service. This is an educational heuristic, not a verdict—never open a suspicious link just to test it.':['Приватність: аналіз виконується локально у браузері. URL не завантажується на сервер і не перевіряється через онлайн-сервіс репутації. Це навчальна евристика, а не остаточний висновок — не відкривайте підозріле посилання лише заради перевірки.','Soukromí: analýza probíhá lokálně v prohlížeči. URL se neodesílá na server ani nekontroluje pomocí online reputační služby. Jde o vzdělávací heuristiku, nikoli konečný verdikt — podezřelý odkaz neotevírejte jen kvůli testu.'],
  'Analysis summary':['Підсумок аналізу','Shrnutí analýzy'],
  'HTTPS connection':['HTTPS-з’єднання','HTTPS spojení'],
  'Host is an IP address':['Хост є IP-адресою','Hostitel je IP adresa'],
  'At-sign / user-info':['Символ @ / дані користувача','Znak @ / uživatelské údaje'],
  'Internationalized domain':['Інтернаціоналізований домен','Internacionalizovaná doména'],
  'Subdomain depth':['Глибина піддоменів','Hloubka subdomén'],
  'URL length':['Довжина URL','Délka URL'],
  'URL shortener':['Скорочувач URL','Zkracovač URL'],
  'Credential / urgency wording':['Слова про облікові дані / терміновість','Výrazy o přihlašování / naléhavosti'],
  'Possible brand wording':['Можлива імітація бренду','Možné napodobení značky'],
  'Hyphen-heavy hostname':['Багато дефісів у hostname','Hostname s mnoha pomlčkami'],
  'Encoded path characters':['Закодовані символи шляху','Kódované znaky v cestě'],
  'HIGH RISK':['ВИСОКИЙ РИЗИК','VYSOKÉ RIZIKO'],
  'CAUTION':['ОБЕРЕЖНО','POZOR'],
  'LOWER SIGNAL':['НИЗЬКИЙ РІВЕНЬ СИГНАЛІВ','MÉNĚ SIGNÁLŮ'],
},
'security-log-triage':{
  ...common,
  'ONEL1T / BLUE TEAM PROJECT 04':['ONEL1T / BLUE TEAM ПРОЄКТ 04','ONEL1T / BLUE TEAM PROJEKT 04'],
  'Security Log Triage Lab':['Лабораторія первинного аналізу логів','Laboratoř prvotní analýzy logů'],
  'Practice blue-team investigation with sample authentication logs. The analyzer looks for failed logins, invalid users, accepted sessions, privilege escalation and repeated activity, then groups matching events into a quick triage report.':['Тренуйте Blue Team-аналіз на прикладах журналів автентифікації. Аналізатор шукає невдалі входи, неіснуючих користувачів, успішні сеанси, підвищення привілеїв і повторювану активність, а потім формує короткий triage-звіт.','Procvičujte Blue Team analýzu na ukázkových autentizačních logách. Analyzátor hledá neúspěšná přihlášení, neplatné uživatele, úspěšné relace, zvýšení oprávnění a opakovanou aktivitu a poté vytvoří stručný triage report.'],
  'Paste sample or sanitized authentication logs':['Вставте приклад або очищені журнали автентифікації','Vložte ukázkové nebo anonymizované autentizační logy'],
  'Analyze logs':['Проаналізувати логи','Analyzovat logy'],
  'Load sample logs':['Завантажити приклад логів','Načíst ukázkové logy'],
  'Load the sample logs or paste sanitized log lines, then analyze.':['Завантажте приклад логів або вставте очищені рядки журналу, а потім запустіть аналіз.','Načtěte ukázkové logy nebo vložte anonymizované řádky a poté spusťte analýzu.'],
  'Paste at least one log line first.':['Спочатку вставте хоча б один рядок логу.','Nejprve vložte alespoň jeden řádek logu.'],
  'Privacy: log parsing is performed locally in your browser; content is not uploaded. Remove real usernames, public IPs, tokens and other sensitive details before using any log-analysis tool. This is a learning aid, not a SIEM or incident-response verdict.':['Приватність: розбір логів виконується локально у браузері, вміст не завантажується на сервер. Перед використанням будь-якого інструмента аналізу видаляйте справжні імена користувачів, публічні IP, токени та інші чутливі дані. Це навчальний інструмент, а не SIEM чи остаточний висновок щодо інциденту.','Soukromí: zpracování logů probíhá lokálně v prohlížeči a obsah se neodesílá na server. Před použitím nástroje odstraňte skutečná uživatelská jména, veřejné IP adresy, tokeny a další citlivé údaje. Jde o výukovou pomůcku, nikoli SIEM nebo konečný verdikt incidentu.'],
  'Triage report':['Triage-звіт','Triage report'],
  'REVIEW REQUIRED':['ПОТРІБНА ПЕРЕВІРКА','VYŽADUJE KONTROLU'],
  'EVENTS FOUND':['ПОДІЇ ЗНАЙДЕНО','NALEZENY UDÁLOSTI'],
  'Lines parsed':['Оброблено рядків','Zpracované řádky'],
  'Auth failures / invalid users':['Помилки входу / невалідні користувачі','Selhání přihlášení / neplatní uživatelé'],
  'Successful sessions':['Успішні сеанси','Úspěšné relace'],
  'Privilege events':['Події привілеїв','Události oprávnění'],
  'Account/policy changes':['Зміни облікових записів/політик','Změny účtů/zásad'],
  'Repeated source IPs':['Повторювані IP-джерела','Opakované zdrojové IP'],
  'Repeated failures':['Повторні невдалі спроби','Opakovaná selhání'],
  'High failure volume':['Велика кількість помилок входу','Vysoký počet neúspěšných přihlášení'],
  'No high-priority pattern detected':['Не виявлено шаблону високого пріоритету','Nebyl zjištěn vzor s vysokou prioritou'],
  'Line':['Рядок','Řádek'],
  'Detection':['Виявлення','Detekce'],
  'Priority':['Пріоритет','Priorita'],
  'Log excerpt':['Фрагмент логу','Výřez logu'],
  'Failed authentication':['Невдала автентифікація','Neúspěšné ověření'],
  'Invalid account attempt':['Спроба входу в невалідний обліковий запис','Pokus o neplatný účet'],
  'Successful authentication':['Успішна автентифікація','Úspěšné ověření'],
  'Privilege / sudo activity':['Активність привілеїв / sudo','Aktivita oprávnění / sudo'],
  'Pre-auth connection event':['Подія з’єднання до автентифікації','Událost spojení před ověřením'],
  'Account or policy change':['Зміна облікового запису або політики','Změna účtu nebo zásady'],
  'HIGH':['ВИСОКИЙ','VYSOKÁ'],
  'MEDIUM':['СЕРЕДНІЙ','STŘEDNÍ'],
  'LOW':['НИЗЬКИЙ','NÍZKÁ'],
  'Showing first 100 matched events.':['Показано перші 100 знайдених подій.','Zobrazeno prvních 100 odpovídajících událostí.'],
  'No events matched the built-in patterns. That does not mean the logs are clean.':['Жодна подія не збіглася з вбудованими шаблонами. Це не означає, що логи безпечні.','Žádná událost neodpovídala vestavěným vzorům. To neznamená, že jsou logy bez problémů.'],
}
};

function normalizeLang(v){
  if(v==='uk'||v==='ua') return 'ua';
  if(v==='cs'||v==='cz') return 'cz';
  return 'en';
}
function getLang(){
  try{return normalizeLang(localStorage.getItem('onel1t-lang')||document.documentElement.lang||'en')}catch(_){return normalizeLang(document.documentElement.lang||'en')}
}
function index(lang){return lang==='ua'?0:1}
function trExact(text,lang){
  if(lang==='en') return text;
  const row=maps[page][text];
  return row?row[index(lang)]:text;
}
function dynamic(text,lang){
  if(lang==='en') return text;
  const ua=lang==='ua';
  let m;
  if(page==='password-strength-lab'){
    if((m=text.match(/^(✓|○) (.+)$/))) return m[1]+' '+trExact(m[2],lang);
    if((m=text.match(/^(Weak|Fair|Good|Strong) · (\d)\/5 checks passed$/))) {
      const levels=ua?{Weak:'Слабкий',Fair:'Посередній',Good:'Хороший',Strong:'Надійний'}:{Weak:'Slabé',Fair:'Průměrné',Good:'Dobré',Strong:'Silné'};
      return levels[m[1]]+' · '+m[2]+'/5 '+(ua?'перевірок виконано':'kontrol splněno');
    }
  }
  if(page==='phishing-link-analyzer'){
    if((m=text.match(/^Heuristic signal score: (\d+)\/100\. (.+)$/))){
      const tails={
        'Several warning signs were detected. Avoid signing in or downloading files from this link.':ua?'Виявлено кілька попереджувальних ознак. Не входьте в облікові записи й не завантажуйте файли за цим посиланням.':'Bylo zjištěno několik varovných znaků. Přes tento odkaz se nepřihlašujte ani nestahujte soubory.',
        'Some warning signs were detected. Verify the domain through a trusted channel before proceeding.':ua?'Виявлено кілька попереджувальних ознак. Перед продовженням перевірте домен через надійне джерело.':'Byly zjištěny některé varovné znaky. Před pokračováním ověřte doménu důvěryhodným způsobem.',
        'Few signals were detected, but this does not establish that the site is safe.':ua?'Виявлено мало сигналів, але це не доводить, що сайт безпечний.':'Bylo zjištěno málo signálů, ale to nedokazuje, že je web bezpečný.'
      };
      return (ua?'Евристичний бал сигналів: ':'Heuristické skóre signálů: ')+m[1]+'/100. '+(tails[m[2]]||m[2]);
    }
    if((m=text.match(/^Parsed destination host: (.+) · Path: (.+)$/))) return (ua?'Визначений хост призначення: ':'Rozpoznaný cílový hostitel: ')+m[1]+' · '+(ua?'Шлях: ':'Cesta: ')+m[2];
    if((m=text.match(/^(\d+) hostname labels found\. (.+)$/))) return m[1]+' '+(ua?'частин hostname. ':'částí hostname. ')+(m[2]==='Deeply nested subdomains can hide the real registered domain.'?(ua?'Глибоко вкладені піддомени можуть приховувати справжній зареєстрований домен.':'Hluboce vnořené subdomény mohou skrývat skutečnou registrovanou doménu.'):(ua?'Незвично глибокої структури hostname не виявлено.':'Nebyla zjištěna neobvykle hluboká struktura hostname.'));
    if((m=text.match(/^(\d+) characters\. (.+)$/))) return m[1]+' '+(ua?'символів. ':'znaků. ')+(m[2].startsWith('Unusually long')?(ua?'Надто довгі URL можуть приховувати додаткові деталі шляху або параметрів.':'Neobvykle dlouhé URL mohou skrývat další části cesty nebo parametrů.'):(ua?'Сама довжина не є сильним сигналом ризику.':'Samotná délka není silný rizikový signál.'));
    const exactDetails={
      'Uses HTTPS. This protects data in transit, but does not prove a site is legitimate.':[ 'Використовується HTTPS. Це захищає дані під час передавання, але не доводить легітимність сайту.','Používá HTTPS. To chrání data při přenosu, ale nedokazuje legitimitu webu.' ],
      'Uses HTTP without transport encryption.':['Використовується HTTP без шифрування передавання.','Používá HTTP bez šifrování přenosu.'],
      'The link uses a raw IP address instead of a domain name.':['Посилання використовує IP-адресу замість доменного імені.','Odkaz používá IP adresu místo doménového jména.'],
      'No raw IP address detected in the host.':['У хості не виявлено IP-адресу замість домену.','V hostiteli nebyla zjištěna IP adresa místo domény.'],
      'An @ sign or embedded user information can obscure the actual destination.':['Символ @ або вбудовані дані користувача можуть приховувати справжнє призначення.','Znak @ nebo vložené uživatelské údaje mohou zakrýt skutečný cíl.'],
      'No embedded user information detected.':['Вбудованих даних користувача не виявлено.','Nebyly zjištěny vložené uživatelské údaje.'],
      'The hostname contains punycode. Inspect the spelling carefully for lookalike characters.':['Hostname містить punycode. Уважно перевірте написання на схожі символи.','Hostname obsahuje punycode. Pečlivě zkontrolujte zápis kvůli podobným znakům.'],
      'No punycode label detected.':['Punycode не виявлено.','Punycode nebyl zjištěn.'],
      'This is a known URL-shortening domain; the final destination is hidden.':['Це відомий сервіс скорочення URL; кінцеве призначення приховане.','Jde o známou službu zkracování URL; konečný cíl je skrytý.'],
      'No common shortener domain detected.':['Поширений домен-скорочувач не виявлено.','Nebyla zjištěna běžná zkracovací doména.'],
      'No common credential or urgency terms detected.':['Поширених слів про облікові дані або терміновість не виявлено.','Nebyly zjištěny běžné výrazy týkající se přihlášení nebo naléhavosti.'],
      'No obvious embedded brand-name pattern flagged.':['Очевидної імітації назви бренду не виявлено.','Nebyl zjištěn zjevný vzor napodobující značku.'],
      'No unusually high number of hyphens.':['Незвично великої кількості дефісів не виявлено.','Nebyl zjištěn neobvykle vysoký počet pomlček.'],
      'URL path/query includes percent-encoded characters. This can be normal but deserves inspection in context.':['Шлях або параметри URL містять percent-encoded символи. Це може бути нормальним, але потребує перевірки в контексті.','Cesta nebo parametry URL obsahují percent-encoded znaky. Může to být běžné, ale zaslouží kontrolu v kontextu.'],
      'No percent-encoded path/query characters detected.':['Закодованих символів у шляху/параметрах не виявлено.','V cestě/parametrech nebyly zjištěny kódované znaky.']
    };
    if(exactDetails[text]) return exactDetails[text][ua?0:1];
    if((m=text.match(/^Found wording often seen in lures: (.+)\. Context matters; legitimate sites may use these words\.$/))) return (ua?'Знайдено слова, які часто трапляються у приманках: ':'Nalezeny výrazy často používané v návnadách: ')+m[1]+(ua?'. Контекст важливий; легітимні сайти теж можуть використовувати ці слова.':'. Kontext je důležitý; legitimní weby mohou tato slova také používat.');
    if((m=text.match(/^Brand-like wording appears inside a longer hostname: (.+)\. Verify the registered domain independently\.$/))) return (ua?'У довшому hostname присутня назва, схожа на бренд: ':'V delším hostname se objevuje výraz podobný značce: ')+m[1]+(ua?'. Незалежно перевірте зареєстрований домен.':'. Nezávisle ověřte registrovanou doménu.');
    if((m=text.match(/^Hostname contains (\d+) hyphens; inspect for imitation or confusing naming\.$/))) return (ua?'Hostname містить ':'Hostname obsahuje ')+m[1]+(ua?' дефісів; перевірте можливу імітацію або заплутану назву.':' pomlček; zkontrolujte možné napodobení nebo matoucí název.');
  }
  if(page==='security-log-triage'){
    if((m=text.match(/^(\d+) event\(s\) matched\. Confirm that the changes were authorized\.$/))) return m[1]+(ua?' подій збіглося. Переконайтеся, що зміни були авторизовані.':' událostí odpovídá. Ověřte, že změny byly autorizované.');
    const exact={
      'Multiple failed authentication events may indicate guessing or misconfiguration.':['Численні невдалі спроби автентифікації можуть свідчити про підбір паролів або помилкову конфігурацію.','Více neúspěšných autentizačních událostí může znamenat hádání hesel nebo chybnou konfiguraci.'],
      'Review the raw events and correlate with other telemetry before drawing conclusions.':['Перегляньте сирі події та зіставте їх з іншою телеметрією перед висновками.','Před závěrem zkontrolujte surové události a porovnejte je s další telemetrií.']
    };
    if(exact[text]) return exact[text][ua?0:1];
  }
  return trExact(text,lang);
}

function translateTextNode(node,lang){
  const parent=node.parentElement;
  if(!parent||['SCRIPT','STYLE','TEXTAREA','PRE','CODE'].includes(parent.tagName)) return;
  if(!baseText.has(node)) baseText.set(node,node.nodeValue);
  const original=baseText.get(node);
  const lead=(original.match(/^\s*/)||[''])[0],trail=(original.match(/\s*$/)||[''])[0];
  const core=original.trim();
  if(!core) return;
  const out=dynamic(core,lang);
  node.nodeValue=lead+out+trail;
}
function translateAttrs(el,lang){
  for(const attr of ['placeholder','aria-label','title']){
    if(!el.hasAttribute||!el.hasAttribute(attr)) continue;
    let record=baseAttr.get(el);if(!record){record={};baseAttr.set(el,record)}
    if(!(attr in record)) record[attr]=el.getAttribute(attr);
    const original=record[attr];
    const attrs={
      'Type a sample password…':['Введіть тестовий пароль…','Zadejte zkušební heslo…'],
      'Paste SSH/Linux authentication logs here…':['Вставте сюди SSH/Linux журнали автентифікації…','Vložte sem SSH/Linux autentizační logy…']
    };
    const row=attrs[original];
    el.setAttribute(attr,lang==='en'?original:(row?row[index(lang)]:original));
  }
}
function walk(root,lang){
  if(root.nodeType===Node.TEXT_NODE){translateTextNode(root,lang);return}
  if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE) return;
  if(root.nodeType===Node.ELEMENT_NODE) translateAttrs(root,lang);
  root.childNodes.forEach(n=>walk(n,lang));
}
function setBackHref(lang){
  const a=document.querySelector('a.back');if(!a)return;
  a.href=lang==='ua'?'../../index-uk.html#projects':lang==='cz'?'../../index-cz.html#projects':'../../index.html#projects';
}
function apply(lang){
  lang=normalizeLang(lang);
  document.documentElement.lang=lang==='ua'?'uk':lang==='cz'?'cs':'en';
  document.querySelectorAll('.mini-lang-switch button').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',b.dataset.lang===lang?'true':'false')});
  walk(document.body,lang);setBackHref(lang);
  try{localStorage.setItem('onel1t-lang',lang)}catch(_){}
}
function addSwitch(){
  if(document.querySelector('.mini-lang-switch')) return;
  const style=document.createElement('style');style.textContent='.mini-lang-switch{display:flex;gap:6px;position:absolute;top:28px;right:28px;z-index:5}.mini-lang-switch button{border:1px solid rgba(255,255,255,.22);background:#090909;color:#aaa;padding:7px 9px;font:700 10px "JetBrains Mono",monospace;cursor:pointer}.mini-lang-switch button.active{border-color:#e51c2a;color:#fff;background:#21090d}@media(max-width:620px){.mini-lang-switch{top:18px;right:15px}}';document.head.append(style);
  const box=document.createElement('div');box.className='mini-lang-switch';box.setAttribute('aria-label','Language');box.innerHTML='<button type="button" data-lang="en">EN</button><button type="button" data-lang="ua">UA</button><button type="button" data-lang="cz">CZ</button>';
  const wrap=document.querySelector('.wrap')||document.body;wrap.prepend(box);
  box.addEventListener('click',e=>{const b=e.target.closest('button[data-lang]');if(b)apply(b.dataset.lang)});
}
addSwitch();
const initial=getLang();apply(initial);
let scheduled=false;
const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;apply(getLang())})});
observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:false});
})();
