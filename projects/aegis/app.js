(()=>{
'use strict';
const KEY='onel1t-aegis-state-v1';
const safeStore={get(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}},set(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}},clear(){try{localStorage.removeItem(KEY)}catch{}}};
const base={
 incidents:[
  {id:'INC-1042',title:'Repeated authentication failures',severity:'high',status:'open',time:'09:41',asset:'AUTH-GW-01',owner:'Identity',summary:'Synthetic training event: repeated failed sign-ins followed by a successful MFA-protected login.',disposition:'Review source context, validate account owner and document whether the pattern is expected.'},
  {id:'INC-1041',title:'Email link risk indicator',severity:'medium',status:'open',time:'09:27',asset:'MAIL-EDGE-01',owner:'Messaging',summary:'Synthetic suspicious-link indicator generated for a phishing-awareness drill. No external URL is contacted.',disposition:'Review message context, confirm user awareness and record defensive guidance.'},
  {id:'INC-1040',title:'Endpoint configuration drift',severity:'medium',status:'triaged',time:'08:56',asset:'WS-FIN-07',owner:'Endpoint',summary:'Synthetic endpoint drift event: a lab workstation is missing one expected hardening setting.',disposition:'Compare with baseline, record deviation and create a remediation task.'},
  {id:'INC-1039',title:'New administrative group membership',severity:'high',status:'resolved',time:'08:18',asset:'DC-LAB-01',owner:'Directory',summary:'Synthetic directory change event tied to an approved training task.',disposition:'Verified against the change record and resolved as expected activity.'},
  {id:'INC-1038',title:'Unexpected service restart',severity:'low',status:'resolved',time:'07:44',asset:'APP-LAB-02',owner:'Platform',summary:'Synthetic application service restart after a planned configuration update.',disposition:'Validated maintenance context and closed.'}
 ],
 assets:[
  {id:'DC-LAB-01',name:'Directory Controller',type:'Windows Server',owner:'Identity',criticality:'high',controls:['MFA admin','Audit logs','Backups'],note:'Synthetic directory service for training workflows.'},
  {id:'AUTH-GW-01',name:'Authentication Gateway',type:'Identity Gateway',owner:'Identity',criticality:'high',controls:['MFA','Rate limits','Sign-in logs'],note:'Synthetic authentication edge used for access drills.'},
  {id:'MAIL-EDGE-01',name:'Mail Security Edge',type:'Messaging',owner:'Messaging',criticality:'medium',controls:['Link checks','Sender policy','User training'],note:'Synthetic mail-security context; no real mail is processed.'},
  {id:'WS-FIN-07',name:'Finance Workstation 07',type:'Windows 11',owner:'Endpoint',criticality:'medium',controls:['EDR concept','Disk encryption','Hardening baseline'],note:'Synthetic workstation used to demonstrate configuration posture.'},
  {id:'APP-LAB-02',name:'Internal Lab App',type:'Web Application',owner:'Platform',criticality:'low',controls:['Backups','Change log','Access control'],note:'Local training application with synthetic telemetry.'},
  {id:'NET-CORE-01',name:'Core Network Segment',type:'Network',owner:'Infrastructure',criticality:'high',controls:['Segmentation','ACL concept','Monitoring'],note:'Logical network context for safe topology exercises.'}
 ],
 risks:[
  {id:'R-01',title:'Excessive privilege persistence',score:8,asset:'DC-LAB-01',treatment:'Reduce',next:'Review admin membership and document approval path.'},
  {id:'R-02',title:'User interaction with suspicious links',score:6,asset:'MAIL-EDGE-01',treatment:'Mitigate',next:'Awareness drill + messaging control review.'},
  {id:'R-03',title:'Endpoint baseline drift',score:5,asset:'WS-FIN-07',treatment:'Remediate',next:'Restore expected configuration and verify locally.'},
  {id:'R-04',title:'Single-point monitoring gap',score:4,asset:'NET-CORE-01',treatment:'Track',next:'Document visibility assumptions for the lab.'}
 ],
 playbooks:[
  {id:'PB-01',title:'Suspicious sign-in review',meta:['IDENTITY','TRIAGE'],steps:['Confirm the event is from the synthetic lab dataset.','Review affected asset and account context.','Check whether MFA or another expected control was present.','Classify the activity as expected, suspicious or unresolved.','Record the disposition and next action.']},
  {id:'PB-02',title:'Phishing-awareness response',meta:['MESSAGING','AWARENESS'],steps:['Keep analysis inside the safe lab; do not open unknown external links.','Review message indicators and user context.','Document which indicators made the message suspicious.','Provide safe user guidance and escalation criteria.','Record lessons learned for the training report.']},
  {id:'PB-03',title:'Configuration drift review',meta:['ENDPOINT','HARDENING'],steps:['Identify the expected baseline control.','Compare the synthetic asset state with the baseline.','Assess operational impact before changing configuration.','Record remediation action and verification step.','Close only after the expected state is documented.']}
 ],
 checks:{},language:'en',drillIndex:0
};
const clone=v=>JSON.parse(JSON.stringify(v));
let state=Object.assign(clone(base),safeStore.get()||{});if(!Array.isArray(state.incidents))state=clone(base);
const requestedLang=new URLSearchParams(location.search).get('lang');if(['en','uk','cs'].includes(requestedLang))state.language=requestedLang;

const T={
 en:{
  titles:{overview:'Operations Overview',incidents:'Incident Triage',assets:'Asset Inventory',risk:'Risk Register',playbooks:'Response Playbooks',reports:'Analyst Reports'},
  localMode:'LOCAL DEFENSE LAB',navOverview:'Overview',navIncidents:'Incidents',navAssets:'Assets',navRisk:'Risk',navPlaybooks:'Playbooks',navReports:'Reports',
  safeLab:'SAFE SIMULATION',safeCopy:'Synthetic data only. No live scanning, exploitation or external target interaction.',portfolio:'← Portfolio',
  eyebrow:'DEFENSIVE SECURITY OPERATIONS',reset:'Reset lab',resetConfirm:'Reset AEGIS local lab state?',loadDrill:'Load drill',
  heroKicker:'Unified defensive workspace',heroTitle:'See the system. Triage the signal. Document the response.',heroText:'AEGIS connects synthetic incidents, asset context, risk decisions, response playbooks and reporting in one local-first training environment.',
  reviewIncidents:'Review incidents',openPlaybooks:'Open playbooks',mOpen:'OPEN INCIDENTS',mOpenSub:'Need analyst review',mHigh:'HIGH PRIORITY',mHighSub:'Synthetic high-severity events',
  mAssets:'ASSETS',mAssetsSub:'Tracked lab systems',mRisk:'RISK ITEMS',mRiskSub:'Documented treatment decisions',liveQueue:'LIVE QUEUE',recentIncidents:'Recent incidents',
  viewAll:'VIEW ALL ↗',posture:'POSTURE',controlCoverage:'Control coverage',synthetic:'SYNTHETIC',architecture:'ARCHITECTURE',connectedWorkflow:'Connected defensive workflow',
  wfObserve:'Observe',wfObserveText:'Synthetic signals enter the queue.',wfContext:'Context',wfContextText:'Map events to affected assets.',wfDecide:'Decide',wfDecideText:'Prioritize and select a response path.',wfRecord:'Record',wfRecordText:'Capture actions, status and lessons learned.',
  incidentDesk:'INCIDENT DESK',triageQueue:'Triage queue',triageCopy:'Prioritize synthetic events, review asset context and document a defensive disposition.',
  all:'All',open:'Open',high:'High',resolved:'Resolved',triaged:'Triaged',low:'Low',medium:'Medium',
  assetContext:'ASSET CONTEXT',assetInventory:'Asset inventory',assetCopy:'Synthetic systems used to connect alerts with ownership, criticality and defensive controls.',searchAssets:'Search assets',
  riskRegister:'RISK REGISTER',treatmentDecisions:'Treatment decisions',riskCopy:'Keep risk discussion connected to assets, controls and next actions.',
  responseLibrary:'RESPONSE LIBRARY',playbookTitle:'Defensive playbooks',playbookCopy:'Structured checklists for safe classroom and portfolio simulations.',
  reporting:'REPORTING',reportTitle:'Analyst summary',reportCopy:'Generate a clean text summary from the current local lab state.',preview:'PREVIEW',currentSnapshot:'Current snapshot',downloadReport:'Download report',
  training:'TRAINING MODE',loadScenario:'Load a scenario',markTriaged:'Mark triaged',markResolved:'Resolve',reopen:'Reopen',asset:'Asset',owner:'Owner',status:'Status',time:'Time',
  recommended:'Recommended disposition',criticality:'Criticality',controls:'Controls',type:'Type',treatment:'Treatment',nextAction:'Next action',steps:'Steps',load:'LOAD SCENARIO',
  noIncidents:'No incidents.',defensive:'DEFENSIVE',
  coverage:[['Identity & access',86],['Endpoint baseline',72],['Messaging awareness',78],['Network context',68]],
  drills:[['Identity anomaly drill','Adds a new synthetic sign-in review event.'],['Phishing-awareness drill','Adds a safe suspicious-message training event.'],['Endpoint drift drill','Adds a synthetic configuration-baseline event.']],
  report:{title:'ONEL1T AEGIS — DEFENSIVE LAB REPORT',generated:'Generated',mode:'Mode: synthetic / local-first',summary:'SUMMARY',open:'Open incidents',resolved:'Resolved incidents',assets:'Tracked assets',risks:'Risk items',openTitle:'OPEN INCIDENTS',none:'- None',riskTitle:'RISK REGISTER',playbookTitle:'PLAYBOOK PROGRESS',note:'NOTE',noteText:'This portfolio lab uses synthetic data only and does not perform live scanning, exploitation or interaction with external targets.'}
 },
 uk:{
  titles:{overview:'Огляд операцій',incidents:'Опрацювання інцидентів',assets:'Інвентар активів',risk:'Реєстр ризиків',playbooks:'Сценарії реагування',reports:'Звіти аналітика'},
  localMode:'ЛОКАЛЬНА ЗАХИСНА ЛАБОРАТОРІЯ',navOverview:'Огляд',navIncidents:'Інциденти',navAssets:'Активи',navRisk:'Ризики',navPlaybooks:'Сценарії реагування',navReports:'Звіти',
  safeLab:'БЕЗПЕЧНА СИМУЛЯЦІЯ',safeCopy:'Лише синтетичні дані. Без сканування реальних систем, експлуатації вразливостей або взаємодії із зовнішніми цілями.',portfolio:'← Портфоліо',
  eyebrow:'ОПЕРАЦІЇ З КІБЕРЗАХИСТУ',reset:'Скинути лабораторію',resetConfirm:'Скинути локальний стан лабораторії AEGIS?',loadDrill:'Завантажити навчальний сценарій',
  heroKicker:'Єдиний простір для кіберзахисту',heroTitle:'Бачити систему. Оцінювати сигнали. Документувати реагування.',heroText:'AEGIS поєднує синтетичні інциденти, контекст активів, оцінювання ризиків, сценарії реагування та звітність в одному локальному навчальному середовищі.',
  reviewIncidents:'Переглянути інциденти',openPlaybooks:'Відкрити сценарії реагування',mOpen:'ВІДКРИТІ ІНЦИДЕНТИ',mOpenSub:'Потребують уваги аналітика',mHigh:'ВИСОКИЙ ПРІОРИТЕТ',mHighSub:'Синтетичні події високої критичності',
  mAssets:'АКТИВИ',mAssetsSub:'Системи навчальної лабораторії',mRisk:'РИЗИКИ',mRiskSub:'Задокументовані рішення щодо ризиків',liveQueue:'ПОТОЧНА ЧЕРГА',recentIncidents:'Останні інциденти',
  viewAll:'ПЕРЕГЛЯНУТИ ВСІ ↗',posture:'СТАН ЗАХИСТУ',controlCoverage:'Покриття засобами захисту',synthetic:'СИНТЕТИЧНІ ДАНІ',architecture:'АРХІТЕКТУРА',connectedWorkflow:'Пов’язаний процес кіберзахисту',
  wfObserve:'Спостереження',wfObserveText:'Синтетичні сигнали надходять у чергу.',wfContext:'Контекст',wfContextText:'Події пов’язуються з відповідними активами.',wfDecide:'Рішення',wfDecideText:'Визначається пріоритет і спосіб реагування.',wfRecord:'Фіксація',wfRecordText:'Зберігаються дії, статус і висновки.',
  incidentDesk:'ЦЕНТР ІНЦИДЕНТІВ',triageQueue:'Черга опрацювання',triageCopy:'Визначай пріоритет синтетичних подій, перевіряй контекст активів і документуй рішення щодо реагування.',
  all:'Усі',open:'Відкриті',high:'Високі',resolved:'Закриті',triaged:'Опрацьовано',low:'Низька',medium:'Середня',
  assetContext:'КОНТЕКСТ АКТИВІВ',assetInventory:'Інвентар активів',assetCopy:'Синтетичні системи, що пов’язують події з відповідальними командами, критичністю та засобами захисту.',searchAssets:'Пошук активів',
  riskRegister:'РЕЄСТР РИЗИКІВ',treatmentDecisions:'Рішення щодо ризиків',riskCopy:'Пов’язуй ризики з активами, засобами захисту та наступними діями.',
  responseLibrary:'БІБЛІОТЕКА РЕАГУВАННЯ',playbookTitle:'Сценарії реагування',playbookCopy:'Структуровані переліки дій для безпечних навчальних симуляцій.',
  reporting:'ЗВІТНІСТЬ',reportTitle:'Зведення аналітика',reportCopy:'Створи текстовий звіт на основі поточного локального стану лабораторії.',preview:'ПОПЕРЕДНІЙ ПЕРЕГЛЯД',currentSnapshot:'Поточний стан',downloadReport:'Завантажити звіт',
  training:'НАВЧАЛЬНИЙ РЕЖИМ',loadScenario:'Завантажити сценарій',markTriaged:'Позначити як опрацьований',markResolved:'Закрити інцидент',reopen:'Відкрити знову',asset:'Актив',owner:'Відповідальна команда',status:'Статус',time:'Час',
  recommended:'Рекомендована дія',criticality:'Критичність',controls:'Засоби захисту',type:'Тип',treatment:'Стратегія',nextAction:'Наступна дія',steps:'Кроки',load:'ЗАВАНТАЖИТИ СЦЕНАРІЙ',
  noIncidents:'Інцидентів немає.',defensive:'КІБЕРЗАХИСТ',
  coverage:[['Ідентифікація та доступ',86],['Базовий захист кінцевих пристроїв',72],['Захист пошти та обізнаність',78],['Контекст мережі',68]],
  drills:[['Аномалія автентифікації','Додає нову синтетичну подію для перевірки входу.'],['Навчальний сценарій фішингу','Додає безпечну синтетичну подію з підозрілим повідомленням.'],['Відхилення конфігурації','Додає синтетичну подію відхилення від базової конфігурації.']],
  report:{title:'ONEL1T AEGIS — ЗВІТ З НАВЧАЛЬНОЇ ЛАБОРАТОРІЇ КІБЕРЗАХИСТУ',generated:'Створено',mode:'Режим: синтетичні дані / локальна робота',summary:'ЗВЕДЕННЯ',open:'Відкриті інциденти',resolved:'Закриті інциденти',assets:'Активи під контролем',risks:'Пункти реєстру ризиків',openTitle:'ВІДКРИТІ ІНЦИДЕНТИ',none:'- Немає',riskTitle:'РЕЄСТР РИЗИКІВ',playbookTitle:'ВИКОНАННЯ СЦЕНАРІЇВ РЕАГУВАННЯ',note:'ПРИМІТКА',noteText:'Ця портфоліо-лабораторія використовує лише синтетичні дані та не виконує сканування реальних систем, експлуатацію вразливостей або взаємодію із зовнішніми цілями.'}
 },
 cs:{
  titles:{overview:'Přehled operací',incidents:'Zpracování incidentů',assets:'Inventář aktiv',risk:'Registr rizik',playbooks:'Postupy reakce',reports:'Reporty analytika'},
  localMode:'LOKÁLNÍ OBRANNÁ LABORATOŘ',navOverview:'Přehled',navIncidents:'Incidenty',navAssets:'Aktiva',navRisk:'Rizika',navPlaybooks:'Postupy reakce',navReports:'Reporty',
  safeLab:'BEZPEČNÁ SIMULACE',safeCopy:'Pouze syntetická data. Bez skenování reálných systémů, zneužívání zranitelností nebo interakce s externími cíli.',portfolio:'← Portfolio',
  eyebrow:'OPERACE KYBERNETICKÉ OBRANY',reset:'Resetovat laboratoř',resetConfirm:'Resetovat lokální stav laboratoře AEGIS?',loadDrill:'Načíst výukový scénář',
  heroKicker:'Jednotné prostředí kybernetické obrany',heroTitle:'Vidět systém. Vyhodnotit signál. Zdokumentovat reakci.',heroText:'AEGIS propojuje syntetické incidenty, kontext aktiv, hodnocení rizik, postupy reakce a reporting v jednom lokálním výukovém prostředí.',
  reviewIncidents:'Zkontrolovat incidenty',openPlaybooks:'Otevřít postupy reakce',mOpen:'OTEVŘENÉ INCIDENTY',mOpenSub:'Vyžadují pozornost analytika',mHigh:'VYSOKÁ PRIORITA',mHighSub:'Syntetické události vysoké závažnosti',
  mAssets:'AKTIVA',mAssetsSub:'Systémy výukové laboratoře',mRisk:'RIZIKA',mRiskSub:'Zdokumentovaná rozhodnutí o rizicích',liveQueue:'AKTUÁLNÍ FRONTA',recentIncidents:'Poslední incidenty',
  viewAll:'ZOBRAZIT VŠE ↗',posture:'STAV OBRANY',controlCoverage:'Pokrytí bezpečnostními opatřeními',synthetic:'SYNTETICKÁ DATA',architecture:'ARCHITEKTURA',connectedWorkflow:'Propojený proces kybernetické obrany',
  wfObserve:'Pozorování',wfObserveText:'Syntetické signály vstupují do fronty.',wfContext:'Kontext',wfContextText:'Události se propojí s příslušnými aktivy.',wfDecide:'Rozhodnutí',wfDecideText:'Určí se priorita a způsob reakce.',wfRecord:'Záznam',wfRecordText:'Uloží se kroky, stav a závěry.',
  incidentDesk:'CENTRUM INCIDENTŮ',triageQueue:'Fronta ke zpracování',triageCopy:'Určuj prioritu syntetických událostí, kontroluj kontext aktiv a dokumentuj rozhodnutí o reakci.',
  all:'Vše',open:'Otevřené',high:'Vysoké',resolved:'Vyřešené',triaged:'Zpracováno',low:'Nízká',medium:'Střední',
  assetContext:'KONTEXT AKTIV',assetInventory:'Inventář aktiv',assetCopy:'Syntetické systémy propojující události s odpovědnými týmy, kritičností a bezpečnostními opatřeními.',searchAssets:'Hledat aktiva',
  riskRegister:'REGISTR RIZIK',treatmentDecisions:'Rozhodnutí o rizicích',riskCopy:'Propojuj rizika s aktivy, bezpečnostními opatřeními a dalšími kroky.',
  responseLibrary:'KNIHOVNA REAKCÍ',playbookTitle:'Postupy reakce',playbookCopy:'Strukturované seznamy kroků pro bezpečné výukové simulace.',
  reporting:'REPORTING',reportTitle:'Souhrn analytika',reportCopy:'Vytvoř textový report z aktuálního lokálního stavu laboratoře.',preview:'NÁHLED',currentSnapshot:'Aktuální stav',downloadReport:'Stáhnout report',
  training:'VÝUKOVÝ REŽIM',loadScenario:'Načíst scénář',markTriaged:'Označit jako zpracovaný',markResolved:'Vyřešit incident',reopen:'Znovu otevřít',asset:'Aktivum',owner:'Odpovědný tým',status:'Stav',time:'Čas',
  recommended:'Doporučený postup',criticality:'Kritičnost',controls:'Bezpečnostní opatření',type:'Typ',treatment:'Strategie',nextAction:'Další krok',steps:'Kroky',load:'NAČÍST SCÉNÁŘ',
  noIncidents:'Žádné incidenty.',defensive:'KYBERNETICKÁ OBRANA',
  coverage:[['Identita a přístup',86],['Základní ochrana koncových zařízení',72],['Ochrana pošty a povědomí',78],['Síťový kontext',68]],
  drills:[['Anomálie přihlášení','Přidá novou syntetickou událost pro kontrolu přihlášení.'],['Výukový phishingový scénář','Přidá bezpečnou syntetickou událost s podezřelou zprávou.'],['Odchylka konfigurace','Přidá syntetickou událost odchylky od základní konfigurace.']],
  report:{title:'ONEL1T AEGIS — REPORT Z VÝUKOVÉ LABORATOŘE KYBERNETICKÉ OBRANY',generated:'Vytvořeno',mode:'Režim: syntetická data / lokální provoz',summary:'SOUHRN',open:'Otevřené incidenty',resolved:'Vyřešené incidenty',assets:'Sledovaná aktiva',risks:'Položky registru rizik',openTitle:'OTEVŘENÉ INCIDENTY',none:'- Žádné',riskTitle:'REGISTR RIZIK',playbookTitle:'PRŮBĚH POSTUPŮ REAKCE',note:'POZNÁMKA',noteText:'Tato portfoliová laboratoř používá pouze syntetická data a neprovádí skenování reálných systémů, zneužívání zranitelností ani interakci s externími cíli.'}
 }
};

const C={
 incidents:{
  uk:{
   'INC-1042':{title:'Повторні невдалі спроби автентифікації',owner:'Ідентифікація та доступ',summary:'Синтетична навчальна подія: кілька невдалих спроб входу, після яких відбувся успішний вхід із захистом MFA.',disposition:'Перевірити контекст джерела, підтвердити власника облікового запису та визначити, чи є така послідовність очікуваною.'},
   'INC-1041':{title:'Індикатор ризику в посиланні електронного листа',owner:'Поштова безпека',summary:'Синтетичний індикатор підозрілого посилання для навчального сценарію з протидії фішингу. Зовнішні URL не відкриваються.',disposition:'Перевірити контекст повідомлення, упевнитися, що користувач розуміє ризик, і зафіксувати рекомендації.'},
   'INC-1040':{title:'Відхилення конфігурації кінцевого пристрою',owner:'Кінцеві пристрої',summary:'Синтетична подія: на навчальній робочій станції відсутній один із передбачених параметрів посилення захисту.',disposition:'Порівняти з базовою конфігурацією, зафіксувати відхилення та створити завдання на виправлення.'},
   'INC-1039':{title:'Нове членство в адміністративній групі',owner:'Служба каталогів',summary:'Синтетична зміна в службі каталогів, пов’язана із затвердженим навчальним завданням.',disposition:'Зміна звірена із записом про затвердження та закрита як очікувана активність.'},
   'INC-1038':{title:'Неочікуваний перезапуск служби',owner:'Платформа',summary:'Синтетичний перезапуск служби застосунку після запланованої зміни конфігурації.',disposition:'Контекст технічного обслуговування підтверджено, інцидент закрито.'}
  },
  cs:{
   'INC-1042':{title:'Opakované neúspěšné pokusy o přihlášení',owner:'Identita a přístup',summary:'Syntetická výuková událost: několik neúspěšných přihlášení následovaných úspěšným přihlášením chráněným MFA.',disposition:'Prověřit kontext zdroje, potvrdit vlastníka účtu a zdokumentovat, zda je tento vzorec očekávaný.'},
   'INC-1041':{title:'Rizikový indikátor v odkazu e-mailu',owner:'Zabezpečení pošty',summary:'Syntetický indikátor podezřelého odkazu pro výukový phishingový scénář. Žádná externí URL se neotevírá.',disposition:'Prověřit kontext zprávy, ověřit povědomí uživatele a zaznamenat bezpečnostní doporučení.'},
   'INC-1040':{title:'Odchylka konfigurace koncového zařízení',owner:'Koncová zařízení',summary:'Syntetická událost: výukové pracovní stanici chybí jedno očekávané nastavení zpevnění systému.',disposition:'Porovnat se základní konfigurací, zaznamenat odchylku a vytvořit úkol k nápravě.'},
   'INC-1039':{title:'Nové členství v administrátorské skupině',owner:'Adresářová služba',summary:'Syntetická změna adresářové služby spojená se schváleným výukovým úkolem.',disposition:'Změna byla ověřena podle záznamu o schválení a uzavřena jako očekávaná aktivita.'},
   'INC-1038':{title:'Neočekávaný restart služby',owner:'Platforma',summary:'Syntetický restart aplikační služby po plánované změně konfigurace.',disposition:'Kontext údržby byl ověřen a incident uzavřen.'}
  }
 },
 assets:{
  uk:{
   'DC-LAB-01':{name:'Контролер служби каталогів',owner:'Ідентифікація та доступ',controls:['MFA для адміністраторів','Журнали аудиту','Резервні копії'],note:'Синтетична служба каталогів для навчальних сценаріїв.'},
   'AUTH-GW-01':{name:'Шлюз автентифікації',type:'Шлюз ідентифікації',owner:'Ідентифікація та доступ',controls:['MFA','Обмеження частоти спроб','Журнали входів'],note:'Синтетичний шлюз автентифікації для навчальних сценаріїв доступу.'},
   'MAIL-EDGE-01':{name:'Шлюз безпеки електронної пошти',type:'Поштова система',owner:'Поштова безпека',controls:['Перевірка посилань','Політика відправників','Навчання користувачів'],note:'Синтетичне середовище поштової безпеки; реальна пошта не обробляється.'},
   'WS-FIN-07':{name:'Робоча станція фінансового відділу 07',owner:'Кінцеві пристрої',controls:['Концепція EDR','Шифрування диска','Базова конфігурація захисту'],note:'Синтетична робоча станція для демонстрації контролю конфігурації.'},
   'APP-LAB-02':{name:'Внутрішній навчальний застосунок',type:'Вебзастосунок',owner:'Платформа',controls:['Резервні копії','Журнал змін','Контроль доступу'],note:'Локальний навчальний застосунок із синтетичною телеметрією.'},
   'NET-CORE-01':{name:'Основний сегмент мережі',type:'Мережа',owner:'Інфраструктура',controls:['Сегментація','Концепція ACL','Моніторинг'],note:'Логічний мережевий контекст для безпечних вправ із топологією.'}
  },
  cs:{
   'DC-LAB-01':{name:'Řadič adresářové služby',owner:'Identita a přístup',controls:['MFA pro administrátory','Auditní logy','Zálohy'],note:'Syntetická adresářová služba pro výukové scénáře.'},
   'AUTH-GW-01':{name:'Ověřovací brána',type:'Brána identity',owner:'Identita a přístup',controls:['MFA','Omezení četnosti pokusů','Logy přihlášení'],note:'Syntetická ověřovací brána pro výukové scénáře přístupu.'},
   'MAIL-EDGE-01':{name:'Brána zabezpečení e-mailu',type:'E-mailový systém',owner:'Zabezpečení pošty',controls:['Kontrola odkazů','Zásady odesílatelů','Školení uživatelů'],note:'Syntetické prostředí e-mailové bezpečnosti; skutečná pošta se nezpracovává.'},
   'WS-FIN-07':{name:'Pracovní stanice finančního oddělení 07',owner:'Koncová zařízení',controls:['Koncept EDR','Šifrování disku','Základní bezpečnostní konfigurace'],note:'Syntetická pracovní stanice pro demonstraci kontroly konfigurace.'},
   'APP-LAB-02':{name:'Interní výuková aplikace',type:'Webová aplikace',owner:'Platforma',controls:['Zálohy','Protokol změn','Řízení přístupu'],note:'Lokální výuková aplikace se syntetickou telemetrií.'},
   'NET-CORE-01':{name:'Hlavní síťový segment',type:'Síť',owner:'Infrastruktura',controls:['Segmentace','Koncept ACL','Monitoring'],note:'Logický síťový kontext pro bezpečná cvičení s topologií.'}
  }
 },
 risks:{
  uk:{
   'R-01':{title:'Надмірне збереження привілейованого доступу',treatment:'Зменшити',next:'Перевірити членство в адміністративних групах і задокументувати шлях погодження.'},
   'R-02':{title:'Взаємодія користувачів із підозрілими посиланнями',treatment:'Пом’якшити',next:'Провести навчальний сценарій і переглянути засоби захисту пошти.'},
   'R-03':{title:'Відхилення від базової конфігурації кінцевого пристрою',treatment:'Виправити',next:'Відновити очікувану конфігурацію та локально перевірити результат.'},
   'R-04':{title:'Недостатня видимість в окремій точці моніторингу',treatment:'Відстежувати',next:'Задокументувати припущення щодо видимості в межах лабораторії.'}
  },
  cs:{
   'R-01':{title:'Přetrvávání nadměrných oprávnění',treatment:'Omezit',next:'Prověřit členství v administrátorských skupinách a zdokumentovat schvalovací postup.'},
   'R-02':{title:'Interakce uživatelů s podezřelými odkazy',treatment:'Zmírnit',next:'Provést výukový scénář a zkontrolovat ochranu e-mailu.'},
   'R-03':{title:'Odchylka od základní konfigurace koncového zařízení',treatment:'Napravit',next:'Obnovit očekávanou konfiguraci a výsledek lokálně ověřit.'},
   'R-04':{title:'Nedostatečná viditelnost v jednom bodě monitoringu',treatment:'Sledovat',next:'Zdokumentovat předpoklady viditelnosti v rámci laboratoře.'}
  }
 },
 playbooks:{
  uk:{
   'PB-01':{title:'Перевірка підозрілого входу',meta:['ІДЕНТИФІКАЦІЯ','ОПРАЦЮВАННЯ'],steps:['Переконатися, що подія походить із синтетичного набору даних лабораторії.','Перевірити уражений актив і контекст облікового запису.','Перевірити, чи працював MFA або інший очікуваний засіб захисту.','Класифікувати активність як очікувану, підозрілу або таку, що потребує додаткового аналізу.','Зафіксувати рішення та наступну дію.']},
   'PB-02':{title:'Реагування на навчальний фішинг',meta:['ПОШТОВА БЕЗПЕКА','ОБІЗНАНІСТЬ'],steps:['Проводити аналіз лише в безпечній лабораторії та не відкривати невідомі зовнішні посилання.','Перевірити ознаки повідомлення й контекст користувача.','Задокументувати ознаки, через які повідомлення вважається підозрілим.','Надати безпечні рекомендації користувачу та визначити критерії ескалації.','Зафіксувати висновки для навчального звіту.']},
   'PB-03':{title:'Перевірка відхилення конфігурації',meta:['КІНЦЕВІ ПРИСТРОЇ','ПОСИЛЕННЯ ЗАХИСТУ'],steps:['Визначити очікуваний базовий засіб захисту.','Порівняти синтетичний стан активу з базовою конфігурацією.','Оцінити можливий вплив перед зміною конфігурації.','Зафіксувати дію з виправлення та крок перевірки.','Закривати завдання лише після документування очікуваного стану.']}
  },
  cs:{
   'PB-01':{title:'Kontrola podezřelého přihlášení',meta:['IDENTITA','ZPRACOVÁNÍ'],steps:['Ověřit, že událost pochází ze syntetické datové sady laboratoře.','Zkontrolovat dotčené aktivum a kontext účtu.','Ověřit, zda bylo přítomno MFA nebo jiné očekávané bezpečnostní opatření.','Klasifikovat aktivitu jako očekávanou, podezřelou nebo vyžadující další analýzu.','Zaznamenat rozhodnutí a další krok.']},
   'PB-02':{title:'Reakce na výukový phishing',meta:['E-MAILOVÁ BEZPEČNOST','POVĚDOMÍ'],steps:['Provádět analýzu pouze v bezpečné laboratoři a neotevírat neznámé externí odkazy.','Zkontrolovat indikátory zprávy a kontext uživatele.','Zdokumentovat znaky, kvůli nimž je zpráva považována za podezřelou.','Poskytnout bezpečné doporučení uživateli a určit kritéria eskalace.','Zaznamenat poznatky do výukového reportu.']},
   'PB-03':{title:'Kontrola odchylky konfigurace',meta:['KONCOVÁ ZAŘÍZENÍ','ZPEVNĚNÍ'],steps:['Určit očekávané základní bezpečnostní opatření.','Porovnat syntetický stav aktiva se základní konfigurací.','Posoudit možný dopad před změnou konfigurace.','Zaznamenat nápravné opatření a ověřovací krok.','Uzavřít až po zdokumentování očekávaného stavu.']}
  }
 }
};

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let currentView='overview',selectedIncident=state.incidents[0]?.id,filter='all';
const save=()=>safeStore.set(state);const txt=()=>T[state.language]||T.en;
const localized=(kind,item)=>{const lang=state.language;if(lang==='en')return item;const patch=C[kind]?.[lang]?.[item.id];return patch?{...item,...patch}:item};
const statusText=s=>{const t=txt();return t[s]||s};
const severityText=s=>{const t=txt();return t[s]||s};

function applyI18n(){
 const t=txt();
 $$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(t[k]!=null)el.textContent=t[k]});
 $$('[data-i18n-placeholder]').forEach(el=>{const k=el.dataset.i18nPlaceholder;if(t[k]!=null)el.placeholder=t[k]});
 $('#viewTitle').textContent=t.titles[currentView];
 $$('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===state.language));
 renderAll();
}
function switchView(v){currentView=v;$$('.side-nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));$$('[data-view-panel]').forEach(p=>p.classList.toggle('active',p.dataset.viewPanel===v));$('#viewTitle').textContent=txt().titles[v];if(v==='reports')renderReport();scrollTo({top:0,behavior:'smooth'})}
function sevClass(s){return s==='high'?'sev-high':s==='medium'?'sev-medium':'sev-low'}
function incidentRows(items){return items.map(raw=>{const i=localized('incidents',raw);return `<div class="incident-row ${raw.id===selectedIncident?'active':''}" data-incident="${raw.id}"><i class="severity ${sevClass(raw.severity)}"></i><div><h4>${i.title}</h4><p>${raw.id} · ${raw.asset} · ${statusText(raw.status).toUpperCase()}</p></div><time>${raw.time}</time></div>`}).join('')}
function filteredIncidents(){return state.incidents.filter(i=>filter==='all'||(filter==='open'&&i.status!=='resolved')||(filter==='high'&&i.severity==='high')||(filter==='resolved'&&i.status==='resolved'))}
function renderIncidents(){const list=$('#incidentList');if(list)list.innerHTML=incidentRows(filteredIncidents());const recent=$('#recentIncidents');if(recent)recent.innerHTML=incidentRows(state.incidents);$$('[data-incident]').forEach(r=>r.onclick=()=>{selectedIncident=r.dataset.incident;renderIncidents();renderIncidentDetail()});renderIncidentDetail()}
function renderIncidentDetail(){
 const box=$('#incidentDetail');if(!box)return;
 const raw=state.incidents.find(x=>x.id===selectedIncident)||state.incidents[0];
 if(!raw){box.innerHTML=`<p>${txt().noIncidents}</p>`;return}
 selectedIncident=raw.id;const i=localized('incidents',raw),t=txt();
 box.innerHTML=`<div class="detail-head"><div><span class="detail-id">${raw.id} · ${severityText(raw.severity).toUpperCase()}</span><h3>${i.title}</h3></div><span class="detail-status">${statusText(raw.status).toUpperCase()}</span></div><div class="detail-grid"><div><small>${t.asset}</small><b>${raw.asset}</b></div><div><small>${t.owner}</small><b>${i.owner}</b></div><div><small>${t.status}</small><b>${statusText(raw.status).toUpperCase()}</b></div><div><small>${t.time}</small><b>${raw.time}</b></div></div><p class="detail-copy">${i.summary}</p><div class="detail-grid"><div style="grid-column:1/-1"><small>${t.recommended}</small><b>${i.disposition}</b></div></div><div class="detail-actions"><button class="ghost" data-status="triaged">${t.markTriaged}</button><button class="primary" data-status="resolved">${t.markResolved}</button>${raw.status==='resolved'?`<button class="ghost" data-status="open">${t.reopen}</button>`:''}</div>`;
 box.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>{raw.status=b.dataset.status;save();renderAll()})
}
function renderMetrics(){const open=state.incidents.filter(i=>i.status!=='resolved').length;const high=state.incidents.filter(i=>i.severity==='high'&&i.status!=='resolved').length;$('#metricOpen').textContent=open;$('#metricHigh').textContent=high;$('#metricAssets').textContent=state.assets.length;$('#metricRisk').textContent=state.risks.length}
function renderCoverage(){const controls=txt().coverage;$('#coverageList').innerHTML=controls.map(([n,p])=>`<div class="coverage-item"><b>${n}</b><span>${p}%</span><div class="coverage-bar"><i style="width:${p}%"></i></div></div>`).join('')}
function renderAssets(query=''){
 const q=query.trim().toLowerCase(),t=txt();
 $('#assetGrid').innerHTML=state.assets.filter(raw=>{const a=localized('assets',raw);return !q||[raw.id,a.name,a.type,a.owner,...a.controls].join(' ').toLowerCase().includes(q)}).map(raw=>{const a=localized('assets',raw);return `<article class="asset-card"><header><span class="eyebrow">${raw.id}</span><span class="criticality critical-${raw.criticality}">${severityText(raw.criticality).toUpperCase()}</span></header><h3>${a.name}</h3><p>${a.note}</p><div class="detail-grid"><div><small>${t.type.toUpperCase()}</small><b>${a.type}</b></div><div><small>${t.owner.toUpperCase()}</small><b>${a.owner}</b></div></div><div class="asset-tags">${a.controls.map(c=>`<span>${c}</span>`).join('')}</div></article>`}).join('')
}
function renderRisk(){
 const t=txt();
 $('#riskGrid').innerHTML=state.risks.map(raw=>{const r=localized('risks',raw);return `<article class="risk-card"><header><span class="eyebrow">${raw.id}</span><span class="risk-score critical-${raw.score>=7?'high':raw.score>=5?'medium':'low'}">${raw.score}/10</span></header><h3>${r.title}</h3><p>${raw.asset}</p><div class="detail-grid"><div><small>${t.treatment.toUpperCase()}</small><b>${r.treatment}</b></div><div><small>${t.nextAction.toUpperCase()}</small><b>${r.next}</b></div></div><div class="risk-tags"><span>${raw.asset}</span><span>${t.defensive}</span></div></article>`}).join('')
}
function renderPlaybooks(){
 const t=txt();
 $('#playbookGrid').innerHTML=state.playbooks.map(raw=>{const pb=localized('playbooks',raw);return `<article class="playbook-card"><header><span class="eyebrow">${raw.id}</span><span>${(state.checks[raw.id]||[]).filter(Boolean).length}/${raw.steps.length}</span></header><h3>${pb.title}</h3><p>${t.steps}: ${raw.steps.length}</p><div class="playbook-meta">${pb.meta.map(m=>`<span>${m}</span>`).join('')}</div><div class="playbook-steps">${pb.steps.map((s,i)=>`<label class="playbook-step"><input type="checkbox" data-pb="${raw.id}" data-step="${i}" ${(state.checks[raw.id]||[])[i]?'checked':''}><span>${s}</span></label>`).join('')}</div></article>`}).join('');
 $$('[data-pb]').forEach(c=>c.onchange=()=>{state.checks[c.dataset.pb]=state.checks[c.dataset.pb]||[];state.checks[c.dataset.pb][+c.dataset.step]=c.checked;save();renderPlaybooks();renderReport()})
}
function reportText(){
 const t=txt(),r=t.report,now=new Date().toLocaleString(state.language==='uk'?'uk-UA':state.language==='cs'?'cs-CZ':undefined);
 const open=state.incidents.filter(i=>i.status!=='resolved'),resolved=state.incidents.filter(i=>i.status==='resolved');
 return `${r.title}
${r.generated}: ${now}
${r.mode}

${r.summary}
${r.open}: ${open.length}
${r.resolved}: ${resolved.length}
${r.assets}: ${state.assets.length}
${r.risks}: ${state.risks.length}

${r.openTitle}
${open.length?open.map(raw=>{const i=localized('incidents',raw);return `- ${raw.id} | ${severityText(raw.severity).toUpperCase()} | ${i.title} | ${raw.asset} | ${statusText(raw.status)}`}).join('\n'):r.none}

${r.riskTitle}
${state.risks.map(raw=>{const x=localized('risks',raw);return `- ${raw.id} | ${raw.score}/10 | ${x.title} | ${x.treatment} | ${x.next}`}).join('\n')}

${r.playbookTitle}
${state.playbooks.map(raw=>{const pb=localized('playbooks',raw),c=(state.checks[raw.id]||[]).filter(Boolean).length;return `- ${raw.id} ${pb.title}: ${c}/${raw.steps.length}`}).join('\n')}

${r.note}
${r.noteText}
`}
function renderReport(){const p=$('#reportPreview');if(p)p.textContent=reportText();const t=txt();$('#drillList').innerHTML=t.drills.map((d,i)=>`<div class="drill-card"><h4>${d[0]}</h4><p>${d[1]}</p><button type="button" data-drill="${i}">${t.load}</button></div>`).join('');$$('[data-drill]').forEach(b=>b.onclick=()=>loadDrill(+b.dataset.drill))}
const drillTemplates=[
 ()=>({id:`INC-${1100+state.incidents.length}`,title:'Unusual sign-in sequence',severity:'high',status:'open',time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),asset:'AUTH-GW-01',owner:'Identity',summary:'Synthetic identity drill: unusual sign-in sequence generated locally for analyst practice.',disposition:'Review authentication context, expected controls and account-owner confirmation.'}),
 ()=>({id:`INC-${1100+state.incidents.length}`,title:'Suspicious message drill',severity:'medium',status:'open',time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),asset:'MAIL-EDGE-01',owner:'Messaging',summary:'Synthetic phishing-awareness drill using local indicators only. No external link is loaded.',disposition:'Document suspicious indicators, user guidance and safe escalation criteria.'}),
 ()=>({id:`INC-${1100+state.incidents.length}`,title:'Baseline drift drill',severity:'medium',status:'open',time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),asset:'WS-FIN-07',owner:'Endpoint',summary:'Synthetic endpoint-baseline drift generated for defensive review.',disposition:'Compare expected hardening baseline, record deviation and verify remediation.'})
];
const drillLocal={
 uk:[
  {title:'Незвична послідовність входів',owner:'Ідентифікація та доступ',summary:'Синтетична подія автентифікації, згенерована локально для практики аналітика.',disposition:'Перевірити контекст автентифікації, очікувані засоби захисту та підтвердження власника облікового запису.'},
  {title:'Навчальна подія з підозрілим повідомленням',owner:'Поштова безпека',summary:'Синтетичний сценарій фішингу, що використовує лише локальні індикатори. Зовнішні посилання не відкриваються.',disposition:'Задокументувати підозрілі ознаки, рекомендації користувачу та безпечні критерії ескалації.'},
  {title:'Відхилення від базової конфігурації',owner:'Кінцеві пристрої',summary:'Синтетичне відхилення конфігурації кінцевого пристрою, створене для навчального аналізу.',disposition:'Порівняти з очікуваною базовою конфігурацією, зафіксувати відхилення та перевірити виправлення.'}
 ],
 cs:[
  {title:'Neobvyklá posloupnost přihlášení',owner:'Identita a přístup',summary:'Syntetická událost identity vytvořená lokálně pro procvičení práce analytika.',disposition:'Prověřit kontext ověřování, očekávaná bezpečnostní opatření a potvrzení vlastníka účtu.'},
  {title:'Výuková událost s podezřelou zprávou',owner:'Zabezpečení pošty',summary:'Syntetický phishingový scénář používající pouze lokální indikátory. Žádný externí odkaz se neotevírá.',disposition:'Zdokumentovat podezřelé indikátory, doporučení uživateli a bezpečná kritéria eskalace.'},
  {title:'Odchylka od základní konfigurace',owner:'Koncová zařízení',summary:'Syntetická odchylka konfigurace koncového zařízení vytvořená pro výukovou kontrolu.',disposition:'Porovnat s očekávanou základní konfigurací, zaznamenat odchylku a ověřit nápravu.'}
 ]
};
function loadDrill(i=state.drillIndex||0){const n=drillTemplates[i%drillTemplates.length]();const loc=drillLocal[state.language]?.[i%drillTemplates.length];if(loc)Object.assign(n,loc);state.incidents.unshift(n);selectedIncident=n.id;state.drillIndex=(i+1)%drillTemplates.length;save();renderAll();switchView('incidents')}
function renderAll(){renderMetrics();renderCoverage();renderIncidents();renderAssets($('#assetSearch')?.value||'');renderRisk();renderPlaybooks();renderReport()}
$$('.side-nav button').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
$$('[data-jump]').forEach(b=>b.onclick=()=>switchView(b.dataset.jump));
$$('[data-lang]').forEach(b=>b.onclick=()=>{state.language=b.dataset.lang;const u=new URL(location.href);u.searchParams.set('lang',state.language);history.replaceState(null,'',u);save();applyI18n()});
$$('#incidentFilters button').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;$$('#incidentFilters button').forEach(x=>x.classList.toggle('active',x===b));renderIncidents()});
$('#assetSearch').oninput=e=>renderAssets(e.target.value);
$('#loadDrill').onclick=()=>loadDrill();
$('#resetLab').onclick=()=>{if(confirm(txt().resetConfirm)){safeStore.clear();state=clone(base);state.language=document.documentElement.lang==='uk'?'uk':document.documentElement.lang==='cs'?'cs':'en';selectedIncident=state.incidents[0].id;filter='all';save();applyI18n();switchView('overview')}};
$('#downloadReport').onclick=()=>{const blob=new Blob([reportText()],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='onel1t-aegis-report.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
applyI18n();switchView('overview');
})();