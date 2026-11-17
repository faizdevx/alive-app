// Accenture Journey: "The Offer Tower". Topics from your roadmap, no dates or durations. Pure data + maths; checked by test.js.
(function (root) {
  'use strict';
  var AC = {};
  AC.CAT = { code: 'Coding', mcq: 'Technical MCQ', sql: 'SQL', fe: 'Frontend', cog: 'Cognitive', comm: 'Communication', mock: 'Assessment' };
  AC.WINGS = [['Foundation Wing', 'Priority A', '#1f5f5b'], ['Systems Wing', 'Priority B', '#4a2f6b'], ['Strategy Wing', 'Priority C', '#6b4a1f'], ['Assessment Penthouse', 'Full mocks', '#6b1f2a']];
  // Each task: "cat|title|sub;sub". Floors climb in roadmap order.
  var F = [
    ['Warehouse District', 'Supply distribution and procurement', 0, [
      'code|Rat Count House|Min consecutive houses to meet demand;Insufficient supply;Empty array', 'code|Product of Smallest Pair|Two smallest prices;Budget check', 'code|Reverse an array', 'code|Find maximum and minimum',
      'mcq|Programming basics (15 Qs)|Variables & data types;Arithmetic operators;Logical operators;Conditions;Operator precedence;Pseudocode tracing',
      'sql|SQL basics · SQLBolt 1–5|SELECT;FROM;WHERE;DISTINCT;ORDER BY;LIMIT', 'cog|Cognitive games (3 games, results logged)', 'comm|60-second intro + explain a project']],
    ['Supplier Exchange', 'Supplier analysis and inventory positioning', 0, [
      'code|Count Elements Within Difference|Absolute difference;Sorting', 'code|Large Small Sum|Even/odd indexes;Second-largest & second-smallest distinct', 'code|Find duplicate elements', 'code|Find missing number',
      'mcq|Arrays, strings & loops (15–20 Qs)|Arrays and strings;Indexing;Loops;Nested loops;Functions;Break and continue;Pre vs post increment',
      'fe|First HTML form|Heading;Input;Textarea;Button;Output paragraph;Placeholder;IDs and classes', 'fe|CSS box basics|Padding;Margin;Borders;Border-radius;Display', 'cog|Cognitive games', 'comm|Communication practice']],
    ['Vault of Accounts', 'Financial processing and account security', 0, [
      'code|Number of Carries', 'code|Password Checker|Min length;Uppercase;Digit;Whitespace;Prohibited characters;First-character rule', 'code|Sum of digits', 'code|String edge-case tests',
      'mcq|Bitwise pseudocode (15–20 Qs)|AND;OR;XOR;NOT;Left shift;Right shift;Binary arithmetic', 'sql|Joins and keys|INNER JOIN;LEFT JOIN;RIGHT JOIN;FULL OUTER JOIN;Primary key;Foreign key',
      'sql|Join queries|Students + Courses;Instructor + Section + Schedule']],
    ['Batch Yard', 'Warehouse batches and customer-chat processing', 0, [
      'code|Count Consecutive Blocks', 'code|Character Frequency', 'code|Remove Duplicate Consonants', 'code|Reverse a string', 'code|Count vowels and consonants', 'code|Variations|First non-repeating character;Anagram check',
      'mcq|OOP|Class and object;Inheritance;Polymorphism;Encapsulation;Abstraction;Overloading vs overriding;Constructors',
      'fe|DOM basics|Text in textarea;Hide element;Unhide element;Change button label;Change content;getElementById();.value;.textContent;.style.display']],
    ['Logistics Window', 'Logistics and sales-window analysis', 0, [
      'code|Variable-size Sliding Window|Shortest delivery period meeting a target;Expand and shrink;O(n)', 'code|Fixed-size Maximum Subarray|Best revenue over K days', 'code|Variations|Pair sum;Move zeros to the end',
      'mcq|DBMS|Primary key;Foreign key;Candidate key;Composite key;Normalization;1NF 2NF 3NF;ACID;Transactions',
      'sql|Aggregates · category revenue query|SUM(Quantity * Unit_Price);COUNT;SUM;AVG;MIN;MAX;GROUP BY']],
    ['Retail Watchtower', 'Retail performance and stack problems', 1, [
      'code|Leader Elements|Right-to-left;Maximum so far', 'code|Next Smaller Element|Monotonic stack', 'code|Stack tracing + second-largest variation',
      'mcq|Operating systems|Process vs thread;Scheduling;Context switching;Deadlock;Paging;Virtual memory;Semaphore and mutex;fork() and wait()',
      'fe|Two-input swap', 'fe|Shape selector|Triangle;Circle;Square;CSS class switch']],
    ['Payment Monitor Room', 'Payment monitoring and ASCII processing', 1, [
      'code|Three-digit Divisible Subarrays', 'code|ASCII Frequency Calculation|ABABC gives 9', 'code|Boundary and modulo tests',
      'mcq|Networking I|OSI model (all 7 layers);TCP/IP model;LAN MAN WAN;IP and MAC;Router switch hub;DNS;DHCP',
      'sql|Users who never raised a ticket|LEFT JOIN ... IS NULL;NOT EXISTS;NULL trap in NOT IN']],
    ['Gateway Rotunda', 'Payment gateway and array rotation', 1, [
      'code|Binary Expression Evaluation|AND, OR, XOR in strings', 'code|Array Rotation by K|Left and right rotation;Reverse algorithm;K % N',
      'mcq|Networking II|TCP vs UDP;HTTP vs HTTPS;IPv4 vs IPv6;Common ports;Firewalls;SSL/TLS;Wi-Fi security;MITM',
      'fe|Chatbot|Input + send button;sendMessage();trim();Empty-input check;Keypress event;setTimeout(500);Bot reply']],
    ['Reconciliation Dock', 'Inventory reconciliation and local peaks', 1, [
      'code|Missing Even Number', 'code|Local Peaks and Valleys', 'code|Variation · missing number in a sequence',
      'mcq|Cloud computing|Public, private, hybrid;IaaS PaaS SaaS;Scalability;Elasticity;Availability;Fault tolerance;Shared responsibility',
      'sql|Department analytics|GROUP BY;HAVING;COUNT(DISTINCT);SUM;ORDER BY;Join-inflated totals']],
    ['Palindrome Plaza', 'Palindrome and perfect-square problems', 1, [
      'code|Next Palindromic Perfect Square|404 gives 80', 'code|Variations|String palindrome;Number palindrome;Perfect-square check;Square-root iteration',
      'mcq|Cybersecurity|Symmetric & asymmetric encryption;Hashing;AuthN vs AuthZ;Phishing;Ransomware;MITM;MFA;WPA2 and WPA3;User Behaviour Analytics;Network access control',
      'fe|ASCII display page|Read input;First character;Code value;Display it;Empty check;map() and filter();className;Events']],
    ['Decoder Lab', 'Dynamic programming and SQL subqueries', 2, [
      'code|Decode Ways|Single-digit;Two-digit;Zeros;Overlapping subproblems', 'code|Climbing Stairs|dp[i] = dp[i-1] + dp[i-2]', 'code|Unique Paths',
      'mcq|Mixed programming|Stack and queue;Linear and binary search;Bubble, selection, insertion sort;Recursion;Time complexity',
      'sql|Subqueries|Above category average;Above average rating;Second-highest salary;Never ordered;Correlated;EXISTS / NOT EXISTS']],
    ['Robber\'s Vault', 'House Robber, number systems and practical coverage', 2, [
      'code|House Robber|dp[i] = max(dp[i-1], dp[i-2] + a[i])', 'code|Decimal to N-base|Repeated division;Remainders;Reverse', 'code|Autobiographical Number',
      'mcq|Office + extras|Excel formulas;PivotTables;Calculated fields;VLOOKUP;COUNTIF and SUMIF;Word mail merge;PowerPoint Slide Master;Outlook CC/BCC;Basic system design;CI/CD;Cloud traffic',
      'fe|Combined webpage from scratch|Textarea;Input;Display button;Hide/unhide;Swap;CSS;Dynamic text;Validation']],
    ['Simulation Arena I', 'Coding + MCQ mock. No notes, no Google, no AI.', 3, [
      'mock|60-min coding · 3 unseen business problems', 'mock|45 mixed MCQs|15 pseudocode;10 programming/OOP/DBMS;5 OS;5 networking;7 cloud/security;3 Office', 'cog|10 min cognitive games', 'mock|5 min mistake analysis']],
    ['Simulation Arena II', 'Practical mock: DSA + SQL + frontend', 3, [
      'mock|60-min practical|Business DSA problem;Multi-table SQL;HTML/CSS/JS change', 'mock|45 mixed MCQs', 'cog|5 min cognitive games', 'comm|5 min communication', 'mock|Final mistake-log review']]
  ];
  // Your older DSA archive: an optional basement, never blocks the climb.
  var ARCH = ['code|Knapsack · recursive', 'code|Knapsack · memoized', 'code|How to spot a knapsack problem', 'code|Subset Sum', 'code|Unbounded knapsack', 'code|Climbing stairs', 'code|Greedy',
    'code|Array mastery', 'code|String mastery', 'code|Set and Counter practice', 'code|Two pointer'];
  function tasks(list, fid) { return list.map(function (s, i) { var a = s.split('|'); return { id: fid + '.' + i, cat: a[0], title: a[1], subs: a[2] ? a[2].split(';') : [] }; }); }
  AC.FLOORS = F.map(function (f, i) { var id = 'f' + (i + 1); return { i: i, id: id, name: f[0], ctx: f[1], wing: f[2], mock: f[2] === 3, tasks: tasks(f[3], id) }; });
  AC.ARCH = { id: 'b1', name: 'Archive Dojo', ctx: 'Your older DSA training. Optional.', tasks: tasks(ARCH, 'b1') };
  function obj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
  function n(x) { x = +x; return isFinite(x) ? x : 0; }
  AC.ensure = function (a) {
    a = obj(a) ? a : {};
    if (!obj(a.done)) a.done = {};
    if (!obj(a.mocks)) a.mocks = {};
    return a;
  };
  // Everything shown is derived from a.done (task id -> date) and a.mocks (floor id -> scores).
  AC.stat = function (a) {
    var fl = AC.FLOORS.map(function (f) {
      var d = f.tasks.filter(function (t) { return a.done[t.id]; }).length;
      return { f: f, done: d, total: f.tasks.length, cleared: d === f.tasks.length, prog: d / f.tasks.length };
    });
    var cur = fl.length; for (var i = 0; i < fl.length; i++) if (!fl[i].cleared) { cur = i; break; }
    var all = 0, tot = 0; fl.forEach(function (x) { all += x.done; tot += x.total; });
    var arch = AC.ARCH.tasks.filter(function (t) { return a.done[t.id]; }).length;
    var mocks = AC.FLOORS.filter(function (f) { return f.mock; }).map(function (f) { var m = a.mocks[f.id] || {}; return { id: f.id, name: f.name, code: m.code, mcq: m.mcq }; });
    var wings = AC.WINGS.map(function (w, wi) { var xs = fl.filter(function (x) { return x.f.wing === wi; }); return { name: w[0], tag: w[1], col: w[2], cleared: xs.every(function (x) { return x.cleared; }) }; });
    var xp = 5 * (all + arch) + 30 * fl.filter(function (x) { return x.cleared; }).length + 40 * wings.filter(function (w) { return w.cleared; }).length +
      50 * mocks.filter(function (m) { return m.code != null || m.mcq != null; }).length;
    return { floors: fl, cur: cur, roof: cur === fl.length, done: all, total: tot, pct: tot ? all / tot : 0, arch: arch, archTotal: AC.ARCH.tasks.length, mocks: mocks, wings: wings, xp: xp,
      pos: cur === fl.length ? fl.length : cur + fl[cur].prog }; // climber height in floors
  };
  AC.task = function (id) { var r = null; AC.FLOORS.concat([AC.ARCH]).forEach(function (f) { f.tasks.forEach(function (t) { if (t.id === id) r = t; }); }); return r; };
  AC.clampMock = function (k, x) { x = Math.round(n(x)); return Math.max(0, Math.min(k === 'code' ? 3 : 45, x)); };
  root.AC = AC;
  if (typeof module !== 'undefined') module.exports = AC;
})(typeof window !== 'undefined' ? window : this);
