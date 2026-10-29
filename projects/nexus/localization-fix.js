(() => {
'use strict';

const currentLang=()=>document.documentElement.lang==='uk'?'uk':document.documentElement.lang==='cs'?'cs':'en';

const T={
'Language':['Мова','Jazyk'],
'Workspace /':['Робочий простір /','Pracovní prostor /'],
'North America':['Північна Америка','Severní Amerika'],
'South America':['Південна Америка','Jižní Amerika'],
'Asia-Pacific':['Азійсько-Тихоокеанський регіон','Asijsko-pacifický region'],
'Elevated sample activity':['Підвищена тестова активність','Zvýšená ukázková aktivita'],
'Moderate sample activity':['Помірна тестова активність','Střední ukázková aktivita'],
'Low sample activity':['Низька тестова активність','Nízká ukázková aktivita'],
'Several fictional indicators in this illustrative view.':['Кілька вигаданих індикаторів у цьому демонстраційному поданні.','Několik fiktivních indikátorů v tomto ilustračním zobrazení.'],
'A fictional mix of low and medium-priority indicators.':['Вигадане поєднання індикаторів низького та середнього пріоритету.','Fiktivní směs indikátorů s nízkou a střední prioritou.'],
'Illustrative cluster only; not a live measurement.':['Лише демонстраційний кластер; це не вимірювання в реальному часі.','Pouze ilustrační shluk; nejde o živé měření.'],
'A small fictional signal count in this demo.':['Невелика кількість вигаданих сигналів у цій демонстрації.','Malý počet fiktivních signálů v této ukázce.'],

'Reading file locally and calculating SHA-256…':['Локальне читання файла та обчислення SHA-256…','Místní čtení souboru a výpočet SHA-256…'],
'Unavailable in this browser':['Недоступно в цьому браузері','V tomto prohlížeči není k dispozici'],
'File name':['Назва файла','Název souboru'],
'Size':['Розмір','Velikost'],
'MIME type':['Тип MIME','Typ MIME'],
'Unknown / not provided':['Невідомо / не вказано','Neznámé / neuvedeno'],
'Last modified':['Остання зміна','Poslední změna'],
'Copy hash':['Копіювати хеш','Kopírovat hash'],
'SHA-256 copied':['SHA-256 скопійовано','SHA-256 zkopírován'],
'Select and copy the hash manually':['Виділіть і скопіюйте хеш вручну','Označte a zkopírujte hash ručně'],
'Could not read this file in the browser. Try a smaller file or a modern browser.':['Не вдалося прочитати цей файл у браузері. Спробуйте менший файл або сучасний браузер.','Soubor se v prohlížeči nepodařilo přečíst. Zkuste menší soubor nebo moderní prohlížeč.'],

'No events match those filters.':['Жодна подія не відповідає цим фільтрам.','Žádná událost neodpovídá těmto filtrům.'],
'Evidence sample':['Зразок доказів','Ukázka důkazů'],
'Response decision':['Рішення щодо реагування','Rozhodnutí o reakci'],
'Not assessed':['Не оцінено','Nehodnoceno'],
'Choose the best next action. This is a learning score, not an automated incident verdict.':['Оберіть найкращу наступну дію. Це навчальна оцінка, а не автоматичний висновок щодо інциденту.','Vyberte nejlepší další krok. Jde o výukové hodnocení, nikoli automatický verdikt incidentu.'],
'Choose an action to receive feedback.':['Оберіть дію, щоб отримати оцінку.','Vyberte akci a zobrazte zpětnou vazbu.'],
'Analyst notes':['Нотатки аналітика','Poznámky analytika'],
'Observations, evidence references and next steps':['Спостереження, посилання на докази та наступні кроки','Pozorování, odkazy na důkazy a další kroky'],
'Record what you verified, what remains unknown, and the next action…':['Запишіть, що перевірено, що залишається невідомим і якою буде наступна дія…','Zaznamenejte, co bylo ověřeno, co zůstává neznámé a jaký bude další krok…'],
'Save note to timeline':['Зберегти нотатку в хронологію','Uložit poznámku do časové osy'],
'Export incident report':['Експортувати звіт про інцидент','Exportovat zprávu o incidentu'],
'Analyst activity timeline':['Хронологія дій аналітика','Časová osa činnosti analytika'],
'No analyst actions recorded yet.':['Дії аналітика ще не зафіксовані.','Zatím nejsou zaznamenány žádné akce analytika.'],
'Synthetic training data only. No live Windows host, identity provider, EDR, firewall, database or SIEM is connected.':['Лише синтетичні навчальні дані. Жоден реальний Windows-хост, провайдер ідентифікації, EDR, міжмережевий екран, база даних або SIEM не підключені.','Pouze syntetická výuková data. Není připojen žádný živý host Windows, poskytovatel identity, EDR, firewall, databáze ani SIEM.'],
'Browser storage is unavailable':['Сховище браузера недоступне','Úložiště prohlížeče není k dispozici'],
'Add a note before saving':['Додайте нотатку перед збереженням','Před uložením přidejte poznámku'],
'Analyst note saved':['Нотатку аналітика збережено','Poznámka analytika byla uložena'],
'Best-practice choice.':['Оптимальний вибір.','Volba podle osvědčeného postupu.'],
'Review recommended response.':['Перегляньте рекомендовану відповідь.','Zkontrolujte doporučenou reakci.'],
'Response decision scored':['Рішення щодо реагування оцінено','Rozhodnutí o reakci bylo vyhodnoceno'],
'Incident report exported':['Звіт про інцидент експортовано','Zpráva o incidentu byla exportována'],

'Critical':['Критичний','Kritický'],
'High':['Високий','Vysoký'],
'Medium':['Середній','Střední'],
'Low':['Низький','Nízký'],
'Open':['Відкрито','Otevřeno'],
'Acknowledged':['Підтверджено','Potvrzeno'],
'Investigating':['Розслідується','Probíhá šetření'],
'Contained':['Локалізовано','Omezeno'],
'Resolved':['Закрито','Vyřešeno'],
'Closed':['Закрито','Uzavřeno'],
'Unassigned':['Не призначено','Nepřiřazeno'],
'Tier 1 queue':['Черга Tier 1','Fronta Tier 1'],
'IT Operations':['ІТ-операції','IT provoz'],
'SOC Monitoring':['Моніторинг SOC','Monitorování SOC'],
'Acknowledge':['Підтвердити','Potvrdit'],
'Start investigation':['Почати розслідування','Zahájit šetření'],
'Mark contained':['Позначити як локалізовану','Označit jako omezenou'],
'Close incident':['Закрити інцидент','Uzavřít incident'],

'Identity & Access':['Ідентифікація та доступ','Identita a přístup'],
'Network':['Мережа','Síť'],
'Configuration':['Конфігурація','Konfigurace'],
'Availability':['Доступність','Dostupnost'],
'Endpoint':['Кінцева точка','Koncový bod'],
'Monitoring':['Моніторинг','Monitorování'],
'Data Access':['Доступ до даних','Přístup k datům'],
'Credential Access':['Доступ до облікових даних','Přístup k přihlašovacím údajům'],
'Command and Control':['Командування та керування','Command and Control'],
'Defense Evasion':['Обхід захисту','Obcházení ochrany'],
'Privilege Escalation':['Підвищення привілеїв','Zvýšení oprávnění'],
'Persistence':['Закріплення','Perzistence'],
'Collection':['Збір даних','Sběr dat'],
'Not mapped':['Не зіставлено','Nenamapováno'],
'Routine operational event':['Штатна операційна подія','Běžná provozní událost'],
'Routine monitoring event':['Штатна подія моніторингу','Běžná monitorovací událost'],

'Repeated authentication failures':['Повторні невдалі спроби автентифікації','Opakovaná neúspěšná ověření'],
'Unexpected outbound connection':['Неочікуване вихідне з’єднання','Neočekávané odchozí spojení'],
'Policy configuration changed':['Змінено конфігурацію політики','Změna konfigurace zásady'],
'Scheduled backup completed':['Планове резервне копіювання завершено','Plánované zálohování dokončeno'],
'Unusual privilege request':['Незвичний запит привілеїв','Neobvyklý požadavek na oprávnění'],
'New service observed':['Виявлено нову службу','Zjištěna nová služba'],
'Log collector heartbeat':['Сигнал життєздатності збирача журналів','Heartbeat sběrače protokolů'],
'Possible data access anomaly':['Можлива аномалія доступу до даних','Možná anomálie přístupu k datům'],

'IDP-004 · Failed logon burst':['IDP-004 · Серія невдалих входів','IDP-004 · Série neúspěšných přihlášení'],
'NET-021 · Rare destination':['NET-021 · Рідкісне призначення','NET-021 · Neobvyklý cíl'],
'CFG-008 · Firewall policy update':['CFG-008 · Оновлення політики міжмережевого екрана','CFG-008 · Aktualizace zásady firewallu'],
'OPS-002 · Backup job completed':['OPS-002 · Завдання резервного копіювання завершено','OPS-002 · Úloha zálohování dokončena'],
'IAM-013 · Privilege elevation request':['IAM-013 · Запит підвищення привілеїв','IAM-013 · Požadavek na zvýšení oprávnění'],
'EDR-006 · New service inventory item':['EDR-006 · Нова служба в інвентаризації','EDR-006 · Nová služba v inventáři'],
'MON-001 · Collector heartbeat':['MON-001 · Heartbeat збирача','MON-001 · Heartbeat sběrače'],
'DB-017 · Unusual read volume':['DB-017 · Незвичний обсяг читання','DB-017 · Neobvyklý objem čtení'],

'T1110 · Brute Force':['T1110 · Перебір облікових даних','T1110 · Hrubá síla'],
'T1071.001 · Web Protocols':['T1071.001 · Вебпротоколи','T1071.001 · Webové protokoly'],
'T1562.004 · Disable or Modify System Firewall':['T1562.004 · Вимкнення або зміна системного міжмережевого екрана','T1562.004 · Vypnutí nebo změna systémového firewallu'],
'T1098 · Account Manipulation':['T1098 · Маніпуляції з обліковим записом','T1098 · Manipulace s účtem'],
'T1543.003 · Windows Service':['T1543.003 · Служба Windows','T1543.003 · Služba Windows'],
'T1213 · Data from Information Repositories':['T1213 · Дані з інформаційних сховищ','T1213 · Data z informačních úložišť'],

'17 failed logons for account j.smith across 94 seconds. No successful authentication is present in this sample window. Validate identity-provider logs and confirm whether the source is an approved scanner or a real endpoint.':['За 94 секунди зафіксовано 17 невдалих входів для облікового запису j.smith. У цьому тестовому вікні немає успішної автентифікації. Перевірте журнали провайдера ідентифікації та з’ясуйте, чи є джерело дозволеним сканером або реальним кінцевим пристроєм.','Během 94 sekund bylo zaznamenáno 17 neúspěšných přihlášení k účtu j.smith. V tomto ukázkovém okně není úspěšné ověření. Ověřte protokoly poskytovatele identity a zjistěte, zda je zdroj schválený skener nebo skutečný koncový bod.'],
'A fictional web server contacted a destination not seen in the sample baseline. The destination uses TEST-NET documentation space; no real traffic was observed. Check process ownership, DNS history and approved egress policy.':['Вигаданий вебсервер звернувся до призначення, якого не було в тестовому базовому профілі. Адреса належить до документаційного простору TEST-NET; реального трафіку не спостерігалося. Перевірте процес-ініціатор, історію DNS і дозволену політику вихідного трафіку.','Fiktivní webový server kontaktoval cíl, který nebyl v ukázkovém baseline. Cíl používá dokumentační prostor TEST-NET; žádný skutečný provoz nebyl pozorován. Ověřte vlastníka procesu, historii DNS a schválenou zásadu odchozího provozu.'],
'A fictional gateway policy changed outside the expected maintenance window. Compare the actor, change ticket, before/after rules and approval record before deciding whether to escalate.':['Вигадану політику шлюзу змінено поза очікуваним вікном обслуговування. Перед ескалацією зіставте виконавця, заявку на зміну, правила до/після та запис про погодження.','Fiktivní zásada brány byla změněna mimo očekávané servisní okno. Před eskalací porovnejte aktéra, změnový tiket, pravidla před/po změně a schválení.'],
'The scheduled backup completed and reported a successful status. Confirm expected timing and verify the backup integrity check before closing the event.':['Планове резервне копіювання завершилося успішно. Перед закриттям події підтвердьте очікуваний час виконання та перевірте цілісність резервної копії.','Plánované zálohování bylo úspěšně dokončeno. Před uzavřením události ověřte očekávaný čas a kontrolu integrity zálohy.'],
'A fictional service account requested a role outside its normal profile. Check deployment records, token identity and the least-privilege policy. Do not revoke access solely from this alert without validating service impact.':['Вигаданий службовий обліковий запис запросив роль поза своїм звичайним профілем. Перевірте записи розгортання, ідентичність токена та політику мінімальних привілеїв. Не відкликайте доступ лише на підставі цього сповіщення без оцінки впливу на сервіс.','Fiktivní servisní účet požádal o roli mimo svůj běžný profil. Ověřte záznamy nasazení, identitu tokenu a zásadu nejmenších oprávnění. Přístup neodebírejte pouze na základě tohoto upozornění bez ověření dopadu na službu.'],
'A new service was reported by fictional inventory telemetry. Verify the binary path, signer, install time and change ticket against the approved software baseline.':['Вигадана інвентаризаційна телеметрія повідомила про нову службу. Перевірте шлях до бінарного файла, підпис, час встановлення та заявку на зміну щодо погодженого базового набору ПЗ.','Fiktivní inventární telemetrie nahlásila novou službu. Ověřte cestu k binárnímu souboru, podepisující subjekt, čas instalace a změnový tiket vůči schválenému softwarovému baseline.'],
'The log collector sent its expected heartbeat. Correlate ingestion delay and event volume with the normal operating range; this sample does not represent a live SIEM.':['Збирач журналів надіслав очікуваний heartbeat. Зіставте затримку приймання та обсяг подій із нормальним робочим діапазоном; цей приклад не є реальною SIEM.','Sběrač protokolů odeslal očekávaný heartbeat. Porovnejte zpoždění příjmu a objem událostí s běžným provozním rozsahem; tato ukázka nepředstavuje živý SIEM.'],
'A fictional service account read substantially more rows than its sample baseline. Validate the query, job schedule and data owner approval; preserve relevant database audit records before taking containment action.':['Вигаданий службовий обліковий запис прочитав значно більше рядків, ніж у тестовому базовому профілі. Перевірте запит, розклад завдання та погодження власника даних; перед локалізацією збережіть релевантні аудиторські записи бази даних.','Fiktivní servisní účet přečetl výrazně více řádků než v ukázkovém baseline. Ověřte dotaz, plán úlohy a schválení vlastníka dat; před omezením zachovejte relevantní auditní záznamy databáze.'],

'Gateway · GW-01':['Шлюз · GW-01','Brána · GW-01'],
'Network edge':['Мережевий периметр','Síťový okraj'],
'Routes lab traffic between fictional segments.':['Маршрутизує лабораторний трафік між вигаданими сегментами.','Směruje laboratorní provoz mezi fiktivními segmenty.'],
'Web server · WEB-01':['Вебсервер · WEB-01','Webový server · WEB-01'],
'Application tier':['Рівень застосунків','Aplikační vrstva'],
'Hosts a fictional demonstration web service.':['Розміщує вигаданий демонстраційний вебсервіс.','Hostuje fiktivní demonstrační webovou službu.'],
'Database · DB-01':['База даних · DB-01','Databáze · DB-01'],
'Data tier':['Рівень даних','Datová vrstva'],
'Review':['Перевірити','Prověřit'],
'Synthetic anomaly signal attached to this demo node.':['До цього демовузла прив’язано синтетичний сигнал аномалії.','K tomuto demo uzlu je připojen syntetický signál anomálie.'],
'Workstation · WS-07':['Робоча станція · WS-07','Pracovní stanice · WS-07'],
'Synthetic authentication-failure signal attached to this demo node.':['До цього демовузла прив’язано синтетичний сигнал невдалої автентифікації.','K tomuto demo uzlu je připojen syntetický signál neúspěšného ověření.'],
'Log collector · SIEM':['Збирач журналів · SIEM','Sběrač protokolů · SIEM'],
'Collects the sample events displayed in SOC Operations.':['Збирає тестові події, показані в модулі SOC Operations.','Shromažďuje ukázkové události zobrazené v modulu SOC Operations.'],
'App service · API-02':['Служба застосунку · API-02','Aplikační služba · API-02'],
'Fictional API service node for topology exploration.':['Вигаданий вузол API-сервісу для дослідження топології.','Fiktivní uzel API služby pro průzkum topologie.'],
'Backup node · BK-01':['Вузол резервного копіювання · BK-01','Zálohovací uzel · BK-01'],
'Resilience':['Відмовостійкість','Odolnost'],
'Represents a fictional backup target; no device connection exists.':['Представляє вигадану ціль резервного копіювання; з’єднання з реальними пристроями немає.','Představuje fiktivní cíl zálohování; žádné spojení se skutečným zařízením neexistuje.'],
'SELECTED ASSET':['ВИБРАНИЙ АКТИВ','VYBRANÝ PROSTŘEDEK'],
'Demo status':['Демо-статус','Demo stav'],
'Connected lab nodes':['Підключені лабораторні вузли','Připojené laboratorní uzly'],
'Sample telemetry':['Тестова телеметрія','Ukázková telemetrie'],
'＋ Create case from asset':['＋ Створити справу з активу','＋ Vytvořit případ z prostředku'],
'Asset details added to new case form':['Дані активу додано до форми нової справи','Podrobnosti prostředku byly přidány do formuláře nového případu'],

'Review simulated authentication alert':['Перевірити змодельоване сповіщення автентифікації','Prověřit simulované upozornění ověření identity'],
'Demo case for learning incident triage.':['Демонстраційна справа для навчання первинному аналізу інцидентів.','Demo případ pro nácvik třídění incidentů.'],
'Document fictional network topology':['Задокументувати вигадану топологію мережі','Zdokumentovat fiktivní topologii sítě'],
'Map lab nodes and note trust boundaries.':['Нанести лабораторні вузли на карту та позначити межі довіри.','Zmapovat laboratorní uzly a zaznamenat hranice důvěry.'],
'Practice public-source verification':['Практика перевірки відкритих джерел','Procvičit ověřování veřejných zdrojů'],
'Use authorized public sources and record provenance.':['Використовуйте дозволені відкриті джерела та фіксуйте походження даних.','Používejte oprávněné veřejné zdroje a zaznamenávejte původ dat.'],
'Starter example':['Стартовий приклад','Výchozí příklad'],
'No saved investigations yet. Create one using the form above.':['Збережених розслідувань ще немає. Створіть одне за допомогою форми вище.','Zatím nejsou uložena žádná vyšetřování. Vytvořte jedno pomocí formuláře výše.'],
'No notes':['Без нотаток','Bez poznámek'],
'Delete investigation':['Видалити розслідування','Smazat vyšetřování'],
'Investigation saved in this browser':['Розслідування збережено в цьому браузері','Vyšetřování bylo uloženo v tomto prohlížeči'],
'Investigation removed':['Розслідування видалено','Vyšetřování bylo odstraněno'],

'Workspace status':['Стан робочого простору','Stav pracovního prostoru'],
'Operational · demo mode':['Працює · деморежим','V provozu · demo režim'],
'Network lab':['Мережева лабораторія','Síťová laboratoř'],
'7 fictional nodes · no live connections':['7 вигаданих вузлів · без реальних підключень','7 fiktivních uzlů · bez živých spojení'],
'OSINT tools':['Інструменти OSINT','Nástroje OSINT'],
'Local input validation only · no external queries':['Лише локальна перевірка введення · без зовнішніх запитів','Pouze místní validace vstupu · bez externích dotazů'],
'Saved investigations':['Збережені розслідування','Uložená vyšetřování'],
'Generated at':['Створено','Vygenerováno'],
'Investigation register':['Реєстр розслідувань','Registr vyšetřování'],
'Workspace report exported':['Звіт робочого простору експортовано','Zpráva pracovního prostoru byla exportována'],

'Close event details':['Закрити деталі події','Zavřít podrobnosti události'],
'Close details':['Закрити деталі','Zavřít podrobnosti'],
'Severity':['Серйозність','Závažnost'],
'Status':['Статус','Stav'],
'Asset':['Актив','Prostředek'],
'Category':['Категорія','Kategorie'],
'Source / principal':['Джерело / обліковий запис','Zdroj / účet'],
'Detection rule':['Правило виявлення','Detekční pravidlo'],
'MITRE ATT&CK tactic':['Тактика MITRE ATT&CK','Taktika MITRE ATT&CK'],
'Technique':['Техніка','Technika'],
'Assigned queue':['Призначена черга','Přiřazená fronta'],

'Confirm the job was expected and verify backup integrity.':['Підтвердьте, що завдання було очікуваним, і перевірте цілісність резервної копії.','Ověřte, že úloha byla očekávaná, a zkontrolujte integritu zálohy.'],
'Event ID 4732 can record a member added to a local security group. Validate actor, group and approved change.':['Event ID 4732 може фіксувати додавання учасника до локальної групи безпеки. Перевірте виконавця, групу та погоджену зміну.','Event ID 4732 může zaznamenat přidání člena do místní bezpečnostní skupiny. Ověřte aktéra, skupinu a schválenou změnu.'],
'Verify binary path, signer, install time and change records. A new service alone does not prove persistence.':['Перевірте шлях до бінарного файла, підпис, час встановлення та записи змін. Наявність нової служби сама по собі не доводить закріплення.','Ověřte cestu k binárnímu souboru, podepisující subjekt, čas instalace a záznamy změn. Nová služba sama o sobě nedokazuje perzistenci.'],
'Compare heartbeat and ingestion delay with the actual monitoring baseline. Values are fictional.':['Порівняйте heartbeat і затримку приймання з реальним базовим рівнем моніторингу. Значення вигадані.','Porovnejte heartbeat a zpoždění příjmu se skutečným monitorovacím baseline. Hodnoty jsou fiktivní.'],
'Validate query, expected job schedule and data-owner approval. Preserve database audit evidence before containment.':['Перевірте запит, очікуваний розклад завдання та погодження власника даних. Перед локалізацією збережіть аудиторські докази бази даних.','Ověřte dotaz, očekávaný plán úlohy a schválení vlastníka dat. Před omezením zachovejte auditní důkazy databáze.']
};

const reverse={};
Object.entries(T).forEach(([en,v])=>{reverse[en]=en;reverse[v[0]]=en;reverse[v[1]]=en;});
const originals=new WeakMap();
const attrOriginals=new WeakMap();

function trExact(value,lang=currentLang()){
  const key=reverse[value]||value;
  if(!T[key]) return value;
  if(lang==='uk') return T[key][0];
  if(lang==='cs') return T[key][1];
  return key;
}

function trPattern(value,lang=currentLang()){
  let m;
  if((m=value.match(/^(\d+) adjacent lab nodes$/))){
    return lang==='uk'?`${m[1]} сусідніх лабораторних вузлів`:lang==='cs'?`${m[1]} sousedních laboratorních uzlů`:value;
  }
  if((m=value.match(/^(\d+) entries$/))){
    return lang==='uk'?`${m[1]} записів`:lang==='cs'?`${m[1]} záznamů`:value;
  }
  if((m=value.match(/^(\d+) simulated events · (\d+) open · (\d+) acknowledged$/))){
    return lang==='uk'?`${m[1]} змодельованих подій · ${m[2]} відкрито · ${m[3]} підтверджено`:lang==='cs'?`${m[1]} simulovaných událostí · ${m[2]} otevřených · ${m[3]} potvrzených`:value;
  }
  if((m=value.match(/^(\d+) stored in browser local storage$/))){
    return lang==='uk'?`${m[1]} збережено в локальному сховищі браузера`:lang==='cs'?`${m[1]} uloženo v místním úložišti prohlížeče`:value;
  }
  if((m=value.match(/^Response score: (\d+)\/100$/))){
    return lang==='uk'?`Оцінка відповіді: ${m[1]}/100`:lang==='cs'?`Hodnocení reakce: ${m[1]}/100`:value;
  }
  if((m=value.match(/^(\d[\d\s,.]*) bytes$/))){
    return lang==='uk'?`${m[1]} байт`:lang==='cs'?`${m[1]} bajtů`:value;
  }
  if((m=value.match(/^Review asset ([A-Z0-9-]+)$/))){
    return lang==='uk'?`Перевірити актив ${m[1]}`:lang==='cs'?`Prověřit prostředek ${m[1]}`:value;
  }
  if((m=value.match(/^([A-Z0-9-]+) · (Open|Acknowledged|Investigating|Contained|Resolved)$/))){
    return `${m[1]} · ${trExact(m[2],lang)}`;
  }
  return value;
}

function translateValue(value,lang=currentLang()){
  const exact=trExact(value,lang);
  return exact!==value?exact:trPattern(value,lang);
}

function translateTextNode(node,lang){
  if(!node || node.nodeType!==Node.TEXT_NODE) return;
  if(node.parentElement && /^(SCRIPT|STYLE|TEXTAREA|CODE|PRE)$/i.test(node.parentElement.tagName)) return;
  if(!originals.has(node)) originals.set(node,node.nodeValue);
  const original=originals.get(node);
  const trimmed=original.trim();
  if(!trimmed) return;
  const translated=translateValue(trimmed,lang);
  if(translated===trimmed && lang!=='en') return;
  node.nodeValue=original.replace(trimmed,translated);
}

function translateAttrs(el,lang){
  if(!(el instanceof Element)) return;
  const attrs=['placeholder','title','aria-label'];
  let store=attrOriginals.get(el);
  if(!store){store={};attrOriginals.set(el,store);}
  attrs.forEach(a=>{
    if(!el.hasAttribute(a)) return;
    if(!(a in store)) store[a]=el.getAttribute(a);
    const base=store[a];
    el.setAttribute(a,translateValue(base,lang));
  });
}

function walk(root=document.body){
  const lang=currentLang();
  if(root.nodeType===Node.TEXT_NODE){translateTextNode(root,lang);return;}
  if(!(root instanceof Element) && root!==document.body) return;
  if(root instanceof Element) translateAttrs(root,lang);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  let n;
  while((n=walker.nextNode())){
    if(n.nodeType===Node.TEXT_NODE) translateTextNode(n,lang);
    else translateAttrs(n,lang);
  }
  document.title=lang==='uk'?'ONEL1T NEXUS — платформа кіберрозвідки':lang==='cs'?'ONEL1T NEXUS — platforma kybernetické rozvědky':'ONEL1T NEXUS — Cyber Intelligence Platform';
}

function localizeSpecialFields(){
  const lang=currentLang();
  const title=document.getElementById('caseTitle');
  if(title && /^Review asset [A-Z0-9-]+$/.test(title.value)) title.value=trPattern(title.value,lang);
}

function localizedDownload(text,name){
  const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function exportWorkspaceLocalized(e){
  const b=e.target.closest('#downloadReport');
  if(!b) return;
  e.preventDefault();e.stopImmediatePropagation();
  walk(document.getElementById('view-reports')||document.body);
  const lang=currentLang();
  const h=lang==='uk'?'ONEL1T NEXUS — ЗВІТ РОБОЧОГО ПРОСТОРУ':lang==='cs'?'ONEL1T NEXUS — ZPRÁVA PRACOVNÍHO PROSTORU':'ONEL1T NEXUS — WORKSPACE REPORT';
  const notice=lang==='uk'?'ДЕМО: усі події та дані топології змодельовані.':lang==='cs'?'DEMO: všechny události a data topologie jsou simulované.':'DEMO NOTICE: All event and topology data are simulated.';
  const body=(document.getElementById('reportPreview')?.innerText||'').trim();
  localizedDownload(`${h}\n${new Date().toLocaleString(lang==='uk'?'uk-UA':lang==='cs'?'cs-CZ':'en-US')}\n\n${notice}\n\n${body}`,'onel1t-nexus-report.txt');
}

function exportIncidentLocalized(e){
  const b=e.target.closest('[data-export-incident]');
  if(!b) return;
  e.preventDefault();e.stopImmediatePropagation();
  walk(document.getElementById('eventDetailModal')||document.body);
  const lang=currentLang();
  const h=lang==='uk'?'ONEL1T NEXUS — ЗВІТ ПРО РОЗСЛІДУВАННЯ ІНЦИДЕНТУ':lang==='cs'?'ONEL1T NEXUS — ZPRÁVA O VYŠETŘOVÁNÍ INCIDENTU':'ONEL1T NEXUS — INCIDENT INVESTIGATION REPORT';
  const title=document.getElementById('eventDetailTitle')?.innerText||'';
  const id=document.getElementById('eventDetailId')?.innerText||'';
  const body=document.getElementById('eventDetailBody')?.innerText||'';
  localizedDownload(`${h}\n${id} · ${title}\n${new Date().toLocaleString(lang==='uk'?'uk-UA':lang==='cs'?'cs-CZ':'en-US')}\n\n${body}`,'onel1t-'+String(id||'incident').toLowerCase()+'-incident-report.txt');
}

document.addEventListener('click',exportWorkspaceLocalized,true);
document.addEventListener('click',exportIncidentLocalized,true);
document.addEventListener('click',e=>{if(e.target.closest('[data-node-case]')) setTimeout(()=>{localizeSpecialFields();walk(document.body);},0);});

const observer=new MutationObserver(records=>{
  let langChanged=false;
  records.forEach(r=>{
    if(r.type==='attributes'&&r.target===document.documentElement&&r.attributeName==='lang') langChanged=true;
    r.addedNodes.forEach(n=>{if(n.nodeType===Node.ELEMENT_NODE||n.nodeType===Node.TEXT_NODE) walk(n);});
  });
  if(langChanged){setTimeout(()=>{walk(document.body);localizeSpecialFields();},0);}
});

function init(){
  walk(document.body);
  localizeSpecialFields();
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  observer.observe(document.body,{subtree:true,childList:true});
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{walk(document.body);localizeSpecialFields();},20)));
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
