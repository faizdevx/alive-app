// GATE 2027 Journey: syllabus data and pure maths. No DOM; checked by test.js.
// Everything shown on screen is derived from D.gate records by these functions. Nothing here is a hardcoded score.
(function (root) {
  'use strict';
  var J = {};
  J.LINKS = {
    da: 'https://thegategrind.online/syllabus?branch=Data+Science+and+Artificial+Intelligence',
    cs: 'https://thegategrind.online/syllabus?branch=Computer+Science',
    apt: 'https://thegategrind.online/aptitude',
    gc: 'https://www.goclasses.in/s/pages/gate-da-test-series'
  };
  J.TARGET = { da: 69, cs: 77 };
  J.NAME = { da: 'GATE DA', cs: 'GATE CS' };
  J.MASTERY = ['Not Started', 'Learning', 'PYQ Pending', 'Testing', 'Revision Pending', 'Strong', 'Mastered'];
  var MSCORE = [0, .15, .35, .55, .7, .85, 1];
  J.STAGES = ['Foundation Stage', 'Syllabus Completion Stage', 'Question Practice Stage', 'Test Preparation Stage', 'Mock Conversion Stage', 'Final Revision Stage'];
  // Map level shown for each stage (spec: Base Camp 0 … Summit 7).
  J.STAGE_LEVEL = [[1, 'Foundation Foothills'], [1, 'Foundation Foothills'], [2, 'Question Forest'], [3, 'Boss Ridge'], [6, 'Mock Arena'], [6, 'Mock Arena']];
  // DSA screenshot labels -> numbers on your 0-10 scale (shown in the app next to the label).
  J.GRADE = { 'S+': 10, S: 9, 'A+': 8.5, A: 7.5, 'B+': 6.5, B: 5, C: 4 };
  J.PRIO = [[9, 'Master'], [7, 'Strong'], [4, 'Basic'], [0, 'Skip']];
  J.prioName = function (p) { if (p == null) return 'Unrated'; for (var i = 0; i < J.PRIO.length; i++) if (p >= J.PRIO[i][0]) return J.PRIO[i][1]; return 'Skip'; };

  // The GATE Grind aptitude banks (counts as listed on the site).
  J.APT = [['Grammar and Vocabulary', 723], ['Reading Comprehension and Narrative Sequencing', 102], ['Data Interpretation, Arithmetic and Number Computation', 641],
    ['Algebra, Geometry and Mensuration', 486], ['Probability, Statistics and Combinatorics', 59], ['Logical Reasoning, Deduction and Analogy', 584], ['Spatial Reasoning and Visualization', 335]];

  // Topic lists per subject. "|S+" etc = a priority label; no label = unrated (never invented).
  var POOL = {
    la: ['Eigenvalues & Eigenvectors', 'Matrices & Matrix Properties', 'Vector Spaces & Subspaces', 'Rank, Nullity & Fundamental Subspaces', 'Systems of Linear Equations', 'Gaussian Elimination', 'Projection Matrices', 'SVD', 'Quadratic Forms', 'Determinants', 'LU Decomposition', 'Orthogonal Matrices / Orthogonality', 'Idempotent Matrices', 'Partition Matrices', 'Diagonalization'],
    calc: ['Limits', 'Continuity', 'Differentiability', 'Maxima & Minima', 'Single-Variable Optimization', 'Taylor Series', 'Functions of a Single Variable', 'Mean Value Theorem / Rolle\'s Theorem', 'Basic Derivative Applications', 'Basic Integration', 'Multivariable Calculus', 'Vector Calculus', 'Differential Equations', 'Green/Gauss/Stokes', 'Fourier/Laplace/Complex Analysis'],
    ps: ['Conditional Probability & Bayes\' Theorem', 'Random Variables', 'PMF / PDF / CDF', 'Expectation & Variance', 'Common Probability Distributions', 'Binomial & Poisson', 'Normal Distribution', 'Joint Distributions', 'Covariance & Correlation', 'Law of Total Probability / Total Expectation', 'Counting / Permutations & Combinations', 'Statistical Inference / Hypothesis Testing', 'Confidence Intervals / Estimation', 'Exponential Distribution', 'Uniform Distribution', 't / Chi-square Distributions', 'CLT', 'Median / Mode / Basic Descriptive Statistics'],
    ml: ['Linear Regression', 'Logistic Regression / Classification', 'Loss Functions & Evaluation Metrics', 'Gradient Descent / SGD', 'Regularization: L1 / L2 / Ridge', 'PCA', 'Bias–Variance Tradeoff', 'Clustering: K-means / K-medoids', 'Hierarchical Clustering', 'Cross-Validation', 'Naive Bayes', 'Decision Trees', 'k-NN', 'SVM / Maximum-Margin Concepts', 'MLP / Neural Networks', 'Parameter Counting in Neural Networks', 'Ensemble Methods', 'Advanced Deep Learning', 'LDA'],
    ai: ['First-Order / Predicate Logic', 'Logical Entailment & Equivalence', 'Search Algorithms', 'BFS / DFS / Uniform-Cost Search', 'A* Search & Heuristics', 'Minimax & Game Trees', 'Propositional Logic', 'Knowledge Representation', 'Adversarial Search / Alpha-Beta Pruning', 'Uncertainty / Probabilistic Reasoning', 'AI Agents / Rational Agents', 'Planning', 'Constraint Satisfaction', 'Advanced AI / Deep Learning', 'Uninformed / Informed Search', 'Adversarial Search', 'Conditional Independence', 'Variable Elimination', 'Sampling'],
    ga: ['Reading Comprehension', 'Logical / Analytical Reasoning', 'Numerical Reasoning', 'Data Interpretation', 'Percentages, Ratios & Proportions', 'Averages / Statistics', 'Probability & P&C', 'Geometry & Mensuration', 'Number Systems / Numerical Computation', 'Series / Numerical Patterns', 'Grammar', 'Vocabulary / Contextual Meaning', 'Analogy', 'Spatial Aptitude', 'Logarithms / Powers / Exponents'],
    os: ['Process Synchronization', 'Memory Management & Paging', 'CPU Scheduling', 'Deadlocks', 'Processes & Threads', 'Virtual Memory', 'Page Replacement', 'System Calls / Process Creation', 'File Systems', 'Disk Scheduling', 'IPC', 'Threads', 'I/O & Protection'],
    cn: ['IP Addressing + Subnetting + CIDR', 'TCP', 'Flow Control', 'Error Control', 'IP Fragmentation', 'Routing Algorithms', 'Congestion Control', 'UDP + Sockets', 'MAC / Ethernet', 'IPv4 Header', 'Application Layer: DNS/HTTP/SMTP/FTP', 'Switching', 'ARP / DHCP / ICMP / NAT', 'OSI / TCP-IP Models', 'Circuit / Virtual-Circuit Switching'],
    dm: ['Graph Theory', 'Propositional & Predicate Logic', 'Relations & Functions', 'Combinatorics / Counting', 'Recurrence Relations', 'Set Theory', 'Partial Orders / Posets', 'Lattices', 'Groups / Monoids', 'Generating Functions', 'Graph Coloring', 'Trees / Spanning Trees', 'Pigeonhole Principle', 'Mathematical Induction'],
    dl: ['Boolean Algebra & Logic Gates', 'K-Maps / Boolean Minimization', 'Number Systems & Representations', 'Combinational Circuits', 'Sequential Circuits', 'Flip-Flops', 'Counters', 'Adders / Subtractors', 'Multiplexers / Decoders / Encoders', 'Finite-State / Sequential Analysis', 'Computer Arithmetic', 'Floating-Point Representation', 'Timing / Propagation Delay', 'Memory / PLDs'],
    c: ['Pointers & Pointer Arithmetic', 'Arrays & Multidimensional Arrays', 'Functions + Parameter Passing', 'Recursion', 'Operators + Precedence', 'Control Flow / Loops', 'Strings / Character Arrays', 'Structures / Unions', 'Scope, Lifetime & Storage Classes', 'Dynamic Memory Allocation', 'Bitwise Operators', 'Data Types / Type Conversion', 'Preprocessor / Macros', 'Compilation / Linking Basics', 'Enums / Typedef / Misc. Syntax'],
    coa: ['Cache Memory', 'Instruction Pipelining', 'Addressing Modes', 'Instruction Set / Machine Instructions', 'Memory Hierarchy', 'Pipeline Hazards', 'CPU Datapath / Control Unit', 'ALU & Arithmetic Operations', 'Virtual/Physical Address & Memory Calculations', 'I/O, Interrupts & DMA', 'Secondary Storage', 'Disk/Storage Hardware Details'],
    dsa: ['Python Programming & Code Tracing|S+', 'Time & Space Complexity|S', 'Recursion & Recurrence', 'Sorting: Selection/Bubble/Insertion|S', 'Merge Sort & Quick Sort|S', 'Binary Search|S', 'BFS & DFS|S', 'Binary Trees & Traversals|A+', 'Hash Tables & Collision Resolution|A+', 'Stacks|A', 'Queues|A', 'Shortest Path|B+', 'Linked Lists|B', 'Graph Fundamentals', 'Linear Search|C', 'Deque'],
    db: ['SQL & Query Processing', 'Functional Dependencies', 'Candidate Keys + Attribute Closure', 'Normalization: 1NF–BCNF', 'Relational Algebra', 'B+ Trees / Indexing', 'OLAP / Data Warehousing', 'Integrity Constraints', 'ER Model', 'Tuple Relational Calculus', 'Lossless Join + Dependency Preservation', 'File Organization', 'Data Transformation', 'Data Types']
  };

  // GATE Grind checkpoints: "name|bank size|sub;sub". Bank blank = not legible on your screenshot (editable in the app).
  // t: topic -> checkpoint index, one number per pool entry; -1 = not part of this paper/subject.
  // A checkpoint no topic maps to becomes its own topic (e.g. CS TOC, Compiler Design).
  var SUBJ = {
    da: [
      { id: 'ps', name: 'Probability and Statistics', region: 'Probability & Statistics Valley', marks: 18.3,
        cps: ['Counting, probability axioms, conditional probability and Bayes theorem|9', 'Random variables, discrete and continuous distributions|13', 'Mean, median, mode, standard deviation, correlation and covariance|8', 'Conditional expectation and variance|4', 'Central limit theorem, confidence intervals and hypothesis tests|2'],
        t: { ps: [0, 1, 1, 2, 1, 1, 1, 3, 2, 3, 0, 4, 4, 1, 1, 4, 4, 2] } },
      { id: 'la', name: 'Linear Algebra', region: 'Linear Algebra Peaks', marks: 10,
        cps: ['Vector spaces, linear independence, rank and nullity|4', 'Special matrices|5|Projection;Orthogonal;Idempotent;Quadratic forms', 'Systems of linear equations and Gaussian elimination|2', 'Eigenvalues, eigenvectors and determinant|7', 'LU and singular value decomposition|1'],
        t: { la: [3, 1, 0, 0, 2, 2, 1, 4, 1, 3, 4, 1, 1, 1, 3] } },
      { id: 'calc', name: 'Calculus and Optimization', region: 'Calculus & Optimization Forest', marks: 6.3,
        cps: ['Limits, continuity and differentiability|7', 'Taylor series, maxima and minima, single-variable optimization|6'],
        t: { calc: [0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0] } },
      { id: 'pdsa', name: 'Programming, Data Structures and Algorithms', region: 'Programming & DSA Workshop', marks: 16,
        cps: ['Programming in Python|10', 'Stacks, queues, linked lists, trees and hash tables|8', 'Searching and sorting algorithms|6', 'Divide and conquer|2|Mergesort;Quicksort', 'Graph theory and basic graph algorithms|5'],
        t: { dsa: [0, 2, 3, 2, 3, 2, 4, 1, 1, 1, 1, 4, 1, 4, 2, 1] } },
      { id: 'db', name: 'Database Management and Warehousing', region: 'Database & Warehousing City', marks: 12,
        cps: ['ER model and relational model|1', 'Relational algebra, tuple calculus and SQL|9', 'Integrity constraints and normal forms|6', 'File organization and indexing|3', 'Data transformation|1|Normalization;Discretization;Sampling;Compression', 'Data warehouse modelling and OLAP|3'],
        t: { db: [1, 2, 2, 2, 1, 3, 5, 2, 0, 1, 2, 3, 4, 0] } },
      { id: 'ml', name: 'Machine Learning', region: 'Machine Learning Research Lab', marks: 14.3,
        cps: ['Supervised learning: Regression|4', 'Supervised learning: Classification|12', 'Bias-variance trade-off and cross-validation|1', 'Multi-layer perceptron and feed-forward neural networks|4', 'Unsupervised learning: Clustering|4', 'Dimensionality reduction and principal component analysis|3'],
        t: { ml: [0, 1, 1, 0, 0, 5, 2, 4, 4, 2, 1, 1, 1, 1, 3, 3, 1, 3, 5] } },
      { id: 'ai', name: 'Artificial Intelligence', region: 'Artificial Intelligence Citadel', marks: 8,
        cps: ['Search|2|Informed search;Uninformed search;Adversarial search', 'Logic|2|Propositional logic;Predicate logic', 'Reasoning under uncertainty|3|Bayesian networks;Inference'],
        t: { ai: [1, 1, 0, 0, 0, 0, 1, 1, 0, 2, 0, 0, 0, 2, 0, 0, 2, 2, 2] } }
    ],
    cs: [
      { id: 'em', name: 'Engineering Mathematics', region: 'Engineering Mathematics Plateau', marks: 14.6,
        cps: ['Discrete Mathematics: Propositional and First Order Logic|', 'Discrete Mathematics: Sets, Relations, Functions, Partial Orders and Lattices|', 'Discrete Mathematics: Monoids and Groups|', 'Discrete Mathematics: Graphs (Connectivity, Matchings, Coloring)|',
          'Discrete Mathematics: Combinatorics (Counting, Recurrence Relations, Generating Functions)|', 'Linear Algebra|', 'Calculus|', 'Probability and Statistics|'],
        t: { dm: [3, 0, 1, 4, 4, 1, 1, 1, 2, 4, 3, 3, 4, 0], la: 5, calc: 6, ps: 7 } },
      { id: 'dl', name: 'Digital Logic', region: 'Digital Logic Circuits', marks: 7.1,
        cps: ['Boolean Algebra and Minimization|', 'Combinational Circuits|', 'Sequential Circuits|', 'Number Representation and Arithmetic|', 'Number Representation and Floating Point Arithmetic|'],
        t: { dl: [0, 0, 3, 1, 2, 2, 2, 1, 1, 2, 3, 4, 1, 1] } },
      { id: 'coa', name: 'Computer Organization and Architecture', region: 'Architecture Foundry', marks: 8.5,
        cps: ['Instruction Set and Addressing Modes|', 'ALU and Control Unit Design|', 'Memory Interfacing and Hierarchy|', 'I/O Interface||Interrupts;DMA', 'Instruction Pipelining and Pipeline Hazards|'],
        t: { coa: [2, 4, 0, 0, 2, 4, 1, 1, 2, 3, 2, 2] } },
      { id: 'pds', name: 'Programming and Data Structures', region: 'Programming & DS Workshop', marks: 9.6,
        cps: ['Programming in C|', 'Recursion|', 'Arrays|', 'Stacks and Queues|', 'Linked Lists|', 'Trees and Binary Search Trees|', 'Binary Heaps|', 'Graphs|'],
        t: { c: [0, 2, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0], dsa: [-1, -1, -1, -1, -1, -1, -1, 5, -1, 3, 3, -1, 4, 7, -1, 3] } },
      { id: 'algo', name: 'Algorithms', region: 'Algorithm Bridges', marks: 7,
        cps: ['Searching, Sorting and Hashing|', 'Hashing|', 'Asymptotic Analysis and Time/Space Complexity|', 'Greedy Techniques|', 'Dynamic Programming|', 'Divide-and-Conquer|', 'Graph Algorithms||Traversals;Minimum Spanning Trees;Shortest Paths'],
        t: { dsa: [-1, 2, 2, 0, 5, 0, 6, -1, 1, -1, -1, 6, -1, -1, 0, -1] } },
      { id: 'toc', name: 'Theory of Computation', region: 'Automata Caverns', marks: 7.1,
        cps: ['Regular Expressions and Finite Automata|', 'Context-free Grammars and Pushdown Automata|', 'Regular and Context-free Languages, Pumping Lemmas|', 'Turing Machines and Undecidability|'], t: {} },
      { id: 'cd', name: 'Compiler Design', region: 'Compiler Keep', marks: 4.4,
        cps: ['Lexical Analysis|', 'Parsing and Syntax Analysis|', 'Syntax-Directed Translation|', 'Runtime Environments|', 'Intermediate Code Generation|', 'Code Optimization and Data Flow Analysis|'], t: {} },
      { id: 'os', name: 'Operating Systems', region: 'Operating System Fortress', marks: 8.6,
        cps: ['System Calls, Processes, Threads and IPC|', 'Concurrency and Synchronization|', 'Deadlock|', 'CPU and I/O Scheduling|', 'Memory Management and Virtual Memory|', 'File Systems and Disk Performance|'],
        t: { os: [1, 4, 3, 2, 0, 4, 4, 0, 5, 5, 0, 0, 5] } },
      { id: 'dbs', name: 'Databases', region: 'Database Vaults', marks: 7.1,
        cps: ['ER-Model and Database Architecture|', 'Relational Model||Relational Algebra;Tuple Calculus;SQL', 'Integrity Constraints and Normal Forms|', 'File Organization and Indexing||B Trees;B+ Trees', 'Transactions and Concurrency Control|'],
        t: { db: [1, 2, 2, 2, 1, 3, -1, 2, 0, 1, 2, 3, -1, 0] } },
      { id: 'cn', name: 'Computer Networks', region: 'Network Summit Ridge', marks: 8.1,
        cps: ['Principles of Layering|', 'Basics of Switching and Performance Metrics|', 'Data Link Layer||Error Detection;Medium Access Control;Flow Control', 'Routing||Distance Vector;Link State Routing', 'IPv4||Addressing;CIDR;Fragmentation;NAT', 'TCP||Flow Control;Congestion Control;Socket API', 'Application Layer||DNS;HTTP'],
        t: { cn: [4, 5, 2, 2, 4, 3, 5, 5, 2, 4, 6, 1, 4, 0, 1] } }
    ]
  };
  var GA_MAP = [1, 5, 2, 2, 2, 4, 4, 3, 2, 2, 0, 0, 5, 6, 3]; // your 15 GA topics -> 7 GATE Grind aptitude banks

  // GO Classes GATE DA test series (Question Set 2): visible schedule. subj = DA subject it tests.
  J.GC = [['Linear Algebra', 7, 'la'], ['Probability & Statistics', 9, 'ps'], ['Calculus & Optimization', 6, 'calc'], ['DBMS & Data Warehousing', 8, 'db'], ['Python Programming', 2, 'pdsa'],
    ['Machine Learning', 12, 'ml'], ['Data Structures & Algorithms', 8, 'pdsa'], ['Artificial Intelligence', 3, 'ai'], ['Aptitude', 10, 'ga'], ['Rapid Fire Tests', 3, 'rf'], ['Full-Length Mock GATE Tests', 20, 'mock']];
  J.GC_AD = 'Page headline: 85+ tests, 17+ mocks, 8 core subjects, 1,800+ questions. Visible schedule: 88 tests (55 core + 10 aptitude + 3 rapid fire + 20 mocks).';
  J.gcTests = function () { var a = []; J.GC.forEach(function (g, i) { for (var k = 1; k <= g[1]; k++) a.push({ id: 'gc.' + i + '.' + k, group: i, name: g[0] + (g[2] === 'mock' ? ' · Mock ' : ' · Test ') + k, subj: g[2] }); }); return a; };

  // ---------- build the lookup tables ----------
  J.T = {}; J.P = {};
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  Object.keys(POOL).forEach(function (k) {
    POOL[k] = POOL[k].map(function (s) { var a = s.split('|'), id = k + ':' + slug(a[0]); J.T[id] = { id: id, name: a[0], pool: k, prio: a[1] ? J.GRADE[a[1]] : null, grade: a[1] || '' }; return id; });
  });
  ['da', 'cs'].forEach(function (p) {
    J.P[p] = SUBJ[p].map(function (s) {
      var key = p + '.' + s.id, cps = s.cps.map(function (c, i) { var a = c.split('|'); return { id: key + '.' + i, name: a[0], bank: +a[1] || null, subs: a[2] ? a[2].split(';') : [], topics: [], subj: key }; });
      Object.keys(s.t).forEach(function (pool) { if (typeof s.t[pool] !== 'number' && s.t[pool].length !== POOL[pool].length) throw new Error('map length ' + key + ' ' + pool); POOL[pool].forEach(function (tid, i) { var c = typeof s.t[pool] === 'number' ? s.t[pool] : s.t[pool][i]; if (c >= 0) cps[c].topics.push(tid); }); });
      cps.forEach(function (c) { if (!c.topics.length) { var id = 'g:' + c.id; J.T[id] = { id: id, name: c.name, pool: 'g', prio: null, grade: '' }; c.topics.push(id); } });
      var topics = []; cps.forEach(function (c) { c.topics.forEach(function (t) { if (topics.indexOf(t) < 0) topics.push(t); }); });
      return { id: s.id, key: key, paper: p, name: s.name, region: s.region, marks: s.marks, cps: cps, topics: topics };
    });
  });
  J.GA = { key: 'ga', name: 'General Aptitude', region: 'Shared Aptitude Bridge', marks: 15, cps: J.APT.map(function (a, i) { return { id: 'ga.' + i, name: a[0], bank: a[1], subs: [], topics: [] }; }) };
  POOL.ga.forEach(function (tid, i) { J.GA.cps[GA_MAP[i]].topics.push(tid); });
  J.GA.topics = POOL.ga.slice();
  J.subj = function (key) { var p = key.split('.')[0]; return p === 'ga' ? J.GA : (J.P[p] || []).filter(function (s) { return s.key === key; })[0]; };
  J.cp = function (id) { var s = J.subj(id.split('.').slice(0, 2).join('.')) || (id.indexOf('ga.') === 0 ? J.GA : null); return s ? s.cps.filter(function (c) { return c.id === id; })[0] : null; };
  J.cpOfTopic = function (p, tid) { var r = null; J.P[p].forEach(function (s) { s.cps.forEach(function (c) { if (!r && c.topics.indexOf(tid) >= 0) r = c; }); }); return r; };

  // ---------- helpers ----------
  function n(x) { x = +x; return isFinite(x) ? x : 0; }
  function nn(x) { return x === '' || x == null || !isFinite(+x) ? null : +x; }
  J.nn = nn;
  function obj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
  J.days = function (a, b) { return Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5); };
  J.add = function (d, k) { var t = new Date(Date.parse(d + 'T12:00:00Z') + k * 864e5); return t.toISOString().slice(0, 10); };
  function median(a) { if (!a.length) return null; var s = a.slice().sort(function (x, y) { return x - y; }), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  J.median = median;
  function avg(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : null; }
  function r1(x) { return x == null ? null : Math.round(x * 10) / 10; }

  // Repairs a missing or damaged D.gate (fresh start, bad import). Never drops valid records.
  J.ensure = function (g) {
    g = obj(g) ? g : {};
    ['audit', 'topics', 'cps', 'tests', 'base', 'target', 'exam', 'apt'].forEach(function (k) { if (!obj(g[k])) g[k] = {}; });
    ['da', 'cs'].forEach(function (p) { if (!(n(g.target[p]) > 0)) g.target[p] = J.TARGET[p]; if (!/^(\d{4}-\d{2}-\d{2})?$/.test(String(g.exam[p] || ''))) g.exam[p] = ''; });
    if (!(n(g.apt.target) > 0)) g.apt.target = 20;
    if (!obj(g.apt.days)) g.apt.days = {};
    if (!obj(g.mocks)) g.mocks = {};
    ['da', 'cs'].forEach(function (p) { if (!Array.isArray(g.mocks[p])) g.mocks[p] = []; });
    ['mistakes', 'shop', 'spent'].forEach(function (k) { if (!Array.isArray(g[k])) g[k] = []; });
    if (!g.shop.length && !g.shopSet) { g.shop = [{ id: 's1', name: '1 hour of gaming', cost: 30 }, { id: 's2', name: 'Movie night', cost: 80 }, { id: 's3', name: 'Outing with friends', cost: 150 }]; g.shopSet = true; }
    if (!obj(g.road)) g.road = {};
    ['step', 'note'].forEach(function (k) { if (!obj(g.road[k])) g.road[k] = {}; });
    if (!Array.isArray(g.road.skip)) g.road.skip = [];
    g.v = 1;
    return g;
  };

  // ---------- question stats ----------
  // Unique coverage: a question with an ID counts once; anonymous counts are capped at the bank size.
  J.cpStat = function (g, cp) {
    var r = g.cps[cp.id] || {}, q = obj(r.q) ? r.q : {}, ids = Object.keys(q), bank = n(r.bank) || cp.bank || 30;
    var idOk = 0, fixed = 0, idBad = 0;
    ids.forEach(function (k) { if (q[k] === 'ok') idOk++; else if (q[k] === 'fixed') fixed++; else idBad++; });
    var room = Math.max(0, bank - ids.length), anonAtt = Math.min(Math.max(0, n(r.n)), room), anonOk = Math.min(Math.max(0, n(r.ok)), anonAtt);
    var att = Math.min(bank, ids.length + anonAtt), ok = Math.min(att, idOk + anonOk);
    return { bank: bank, bankKnown: !!(n(r.bank) || cp.bank), att: att, ok: ok, wrong: att - ok, fixed: fixed, open: idBad, solved: Math.min(bank, ok + fixed), cov: att / bank, acc: att ? ok / att : null, passed: !!r.passed };
  };
  J.aptStat = function (g) {
    var t = J.APT.map(function () { return { n: 0, ok: 0 }; });
    Object.keys(g.apt.days).forEach(function (d) { var c = (g.apt.days[d] || {}).cat || {}; Object.keys(c).forEach(function (i) { if (t[i]) { t[i].n += n((c[i] || [])[0]); t[i].ok += n((c[i] || [])[1]); } }); });
    return t.map(function (x, i) { return { name: J.APT[i][0], bank: J.APT[i][1], n: x.n, ok: x.ok, cov: Math.min(1, x.n / J.APT[i][1]), acc: x.n ? x.ok / x.n : null }; });
  };
  // Baseline from the audit for one subject: what you already solved before using the app.
  function base(g, key) {
    var b = g.base[key] || {}, ok = nn(b.ok), bad = nn(b.bad), pyq = nn(b.pyq), acc = nn(b.acc);
    var att = ok != null || bad != null ? n(ok) + n(bad) : n(pyq), good = ok != null ? ok : acc != null ? Math.round(att * acc / 100) : null;
    return { att: att, ok: good };
  }
  J.base = base;
  J.prio = function (g, tid) { var r = g.topics[tid] || {}; return nn(r.prio) != null ? nn(r.prio) : J.T[tid].prio; };
  function weight(pr) { return pr == null ? 5 : pr <= 2 ? 0 : pr; } // Skip = 0, unrated = middle

  J.topicStatus = function (g, tid, cs, today) {
    var r = g.topics[tid] || {}, learn = n(r.learn), test = nn(r.test), rev = r.rev && /^\d{4}-\d{2}-\d{2}$/.test(r.rev) ? J.days(r.rev, today) : null;
    var open = g.mistakes.filter(function (m) { return !m.fixedAt && (m.topic === tid || (cs.id && m.cp === cs.id)); }).length;
    var s;
    if (!learn && !cs.att && test == null) s = 0;
    else if (learn < 2) s = 1; // lectures alone never get past Learning
    else if (cs.cov < .6) s = 2;
    else if (test == null || test < 60 || cs.acc == null || cs.acc < .7) s = 3;
    else if (rev == null || rev > 21) s = 4;
    else if (cs.acc >= .85 && rev <= 30 && !open) s = 6;
    else s = 5;
    return { s: s, name: J.MASTERY[s], m: MSCORE[s], learn: learn, test: test, revAgo: rev, open: open };
  };

  // Tests recorded for a paper (GO Classes slots count for DA; your own tests carry their paper).
  J.testList = function (g, p) {
    return Object.keys(g.tests).map(function (id) { return Object.assign({}, g.tests[id], { id: id }); }).filter(function (t) {
      if (!t.done) return false;
      if (t.id.indexOf('gc.') === 0) { var gi = +t.id.split('.')[1], gs = (J.GC[gi] || [])[2]; return p === 'da' && gs && gs !== 'mock'; }
      return t.paper === p;
    }).map(function (t) {
      var gi = t.id.indexOf('gc.') === 0 ? +t.id.split('.')[1] : -1, subj = gi >= 0 ? J.GC[gi][2] : t.subj;
      var pc = nn(t.score) != null && n(t.max) > 0 ? n(t.score) / n(t.max) * 100 : nn(t.acc);
      return { id: t.id, subj: subj, kind: gi >= 0 && J.GC[gi][2] === 'rf' ? 'rapid' : t.kind || 'topic', pct: pc, at: t.at || '' };
    });
  };

  // ---------- mocks ----------
  J.mockStats = function (list, target) {
    var a = (list || []).filter(function (m) { return nn(m.score) != null; }).slice().sort(function (x, y) { return (x.date || '') < (y.date || '') ? -1 : (x.date || '') > (y.date || '') ? 1 : n(x.no) - n(y.no); });
    var sc = a.map(function (m) { return n(m.score); }), last5 = sc.slice(-5), med5 = median(last5);
    var est = sc.length >= 3 ? med5 : null, slope = null;
    if (last5.length >= 2) { var xm = (last5.length - 1) / 2, ym = avg(last5), num = 0, den = 0; last5.forEach(function (y, i) { num += (i - xm) * (y - ym); den += (i - xm) * (i - xm); }); slope = num / den; }
    return {
      n: sc.length, list: a, scores: sc, latest: sc.length ? sc[sc.length - 1] : null, avg: r1(avg(sc)), median: r1(median(sc)), med5: r1(med5), best: sc.length ? Math.max.apply(null, sc) : null,
      est: r1(est), conf: sc.length >= 5 ? 'Based on latest 5 mocks' : sc.length >= 3 ? 'LOW CONFIDENCE' : 'INSUFFICIENT DATA', gap: est == null ? null : r1(target - est), slope: r1(slope),
      summit: sc.length >= 5 && med5 >= target, // the summit needs a sustained latest-5 median, not finished topics
      gain: sc.length >= 2 ? Math.max.apply(null, sc) - sc[0] : 0
    };
  };

  // ---------- one paper, fully analysed ----------
  J.analyze = function (g, p, today) {
    var target = n(g.target[p]) || J.TARGET[p], seen = {};
    var tests = J.testList(g, p), A = { paper: p, target: target, subjects: [], topics: [] };
    var wSum = 0, wLearn = 0, bank = 0, att = 0, okK = 0, attK = 0, pts = 0, max = 0, learned = 0, fresh = 0, testedW = 0, allW = 0;
    J.P[p].forEach(function (s) {
      var S = { key: s.key, id: s.id, name: s.name, region: s.region, marks: s.marks, bank: 0, att: 0, okK: 0, attK: 0, solved: 0, cps: [], topics: [], pts: 0, max: 0, passedCps: 0 };
      s.cps.forEach(function (c) {
        var cs = J.cpStat(g, c); cs.id = c.id; S.cps.push(cs);
        S.bank += cs.bank; S.att += cs.att; S.okK += cs.ok; S.attK += cs.att; S.solved += cs.solved; if (cs.passed) S.passedCps++;
        S.max += 8; S.pts += (cs.passed ? 2 : 0) + 6 * cs.solved / cs.bank; // each correct answer is a small step up
        c.topics.forEach(function (tid) {
          var st = J.topicStatus(g, tid, cs, today), pr = J.prio(g, tid), w = weight(pr);
          var T = { id: tid, name: J.T[tid].name, prio: pr, grade: J.T[tid].grade, w: w, cp: c.id, subj: s.key, st: st, cs: cs, marks: s.marks };
          S.topics.push(T); A.topics.push(T);
          if (seen[tid]) return; seen[tid] = 1;
          wSum += w; wLearn += w * st.learn / 2; allW += w; if (st.test != null) testedW += w;
          if (st.learn === 2) { learned++; if (st.revAgo != null && st.revAgo <= 30) fresh++; }
          var tp = (st.learn === 2 ? 3 : st.learn === 1 ? 1 : 0) + (st.test >= 60 ? 4 : 0) + (st.revAgo != null && st.revAgo <= 21 ? 1 : 0);
          S.max += 8 * w / 5; S.pts += tp * w / 5;
        });
      });
      var b = base(g, s.key); S.att = Math.min(S.bank, S.att + b.att); if (b.ok != null) { S.okK += b.ok; S.attK += b.att; }
      S.acc = S.attK ? S.okK / S.attK : null; S.cov = S.att / S.bank;
      S.boss = tests.some(function (t) { return t.subj === s.id && t.kind === 'subject' && t.pct >= 60; });
      S.max += 10; S.pts += S.boss ? 10 : 0;
      S.prog = S.max ? S.pts / S.max : 0;
      S.mastery = avg(S.topics.map(function (t) { return t.st.m; })) || 0;
      bank += S.bank; att += S.att; okK += S.okK; attK += S.attK; pts += S.pts; max += S.max;
      A.subjects.push(S);
    });
    A.syl = wSum ? wLearn / wSum : 0;
    A.cov = bank ? att / bank : 0;
    A.acc = attK ? okK / attK : null;
    A.att = att; A.bank = bank;
    var tt = tests.filter(function (t) { return t.kind === 'topic' && t.pct != null; }).map(function (t) { return t.pct; });
    var topicMarks = A.topics.filter(function (t) { return t.st.test != null; }).map(function (t) { return t.st.test; });
    A.topicTestAvg = r1(avg(tt.concat(topicMarks)));
    A.subjTestAvg = r1(avg(tests.filter(function (t) { return t.kind === 'subject' && t.pct != null; }).map(function (t) { return t.pct; })));
    A.testsDone = tests.length;
    A.testedShare = allW ? testedW / allW : 0;
    A.revFresh = learned ? fresh / learned : null;
    A.mock = J.mockStats(g.mocks[p], target);
    A.campaign = max ? pts / max : 0; // game progress: never used for predicted marks
    A.qReady = Math.round(100 * (A.cov * .5 + (A.acc || 0) * .5));
    A.mReady = A.mock.est == null ? null : Math.min(100, Math.round(A.mock.est / target * 100));
    var e = A.mock.est;
    A.stage = A.syl < .3 ? 0 : A.syl < .7 ? 1 : (A.cov < .5 || A.acc == null || A.acc < .65) ? 2 : A.testedShare < .5 ? 3 : (e == null || e < target - 8) ? 4 : 5;
    var withAcc = A.subjects.filter(function (s) { return s.attK >= 10 && s.acc != null; }).sort(function (a, b) { return b.acc - a.acc; });
    var half = Math.min(3, Math.ceil(withAcc.length / 2)); A.strong = withAcc.slice(0, half); A.weak = withAcc.slice(Math.max(half, withAcc.length - 3)).reverse(); // a subject is never both
    var uniq = {}; A.uniqTopics = A.topics.filter(function (t) { if (uniq[t.id]) return false; uniq[t.id] = 1; return true; });
    A.hiPrio = A.uniqTopics.filter(function (t) { return t.prio != null && t.prio >= 7 && t.st.s < 5; }).sort(function (a, b) { return b.prio - a.prio || b.marks - a.marks; });
    A.revDue = A.uniqTopics.filter(function (t) { return t.st.s === 4 || (t.st.learn === 2 && (t.st.revAgo == null || t.st.revAgo > 21) && t.w); }).sort(function (a, b) { return b.w - a.w; });
    var cats = {}; g.mistakes.forEach(function (m) { if (m.paper === p) cats[m.cat || 'Other'] = (cats[m.cat || 'Other'] || 0) + 1; });
    A.mistakeCats = Object.keys(cats).map(function (k) { return [k, cats[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    A.next = J.rank(A)[0] || null;
    return A;
  };

  // Ranks what to do next: priority × subject marks × how unfinished it is, tilted by the current stage.
  var TILT = [[1.6, 1.6, 1, .8, .6, .6, .4], [1.4, 1.5, 1.2, 1, .8, .6, .4], [.8, 1, 1.7, 1.3, 1, .7, .4], [.6, .8, 1.2, 1.7, 1.1, .8, .4], [.6, .7, 1.2, 1.5, 1.3, 1, .5], [.5, .6, 1, 1.3, 1.6, 1, .5]];
  J.rank = function (A) {
    return A.uniqTopics.filter(function (t) { return t.w > 0 && t.st.s < 6; }).map(function (t) {
      return { t: t, score: t.w * t.marks * (1 - t.st.m) * TILT[A.stage][t.st.s] };
    }).sort(function (a, b) { return b.score - a.score; }).map(function (x) { return x.t; });
  };
  // What a topic needs next, and why, in plain words.
  J.action = function (t) {
    var s = t.st.s, pr = t.prio == null ? 'unrated' : 'priority ' + t.prio + ' (' + J.prioName(t.prio) + ')', why = pr + ', subject worth ~' + t.marks + ' marks';
    if (s <= 1) return { verb: 'Learn', why: 'Not learned yet: ' + why + '.' };
    if (s === 2) return { verb: 'Solve PYQs', why: Math.round(t.cs.cov * 100) + '% of its question bank tried. Questions, not lectures, move readiness.' };
    if (s === 3) return t.st.test == null ? { verb: 'Topic test', why: 'Questions done but no test yet. A test proves it under time.' } : { verb: 'Repair', why: 'Accuracy ' + (t.cs.acc == null ? '?' : Math.round(t.cs.acc * 100) + '%') + ', test ' + t.st.test + '%. Fix mistakes before moving on.' };
    if (s === 4) return { verb: 'Revise', why: t.st.revAgo == null ? 'Never revised. Unrevised topics fade by exam day.' : 'Last revised ' + t.st.revAgo + ' days ago.' };
    return { verb: 'Polish', why: 'Strong already; mastery needs 85% accuracy and no open mistakes.' };
  };

  // ---------- daily aptitude (shared by DA and CS, stored once) ----------
  J.aptDay = function (g, d) { var x = g.apt.days[d]; return x ? { n: n(x.n), ok: n(x.ok), t: n(x.t) || n(g.apt.target) || 20, min: n(x.min) } : { n: 0, ok: 0, t: n(g.apt.target) || 20, min: 0 }; };
  J.apt = function (g, today) {
    var start = g.start || today, done = function (d) { var x = J.aptDay(g, d); return x.n >= x.t; };
    var td = J.aptDay(g, today), yest = J.add(today, -1), missed = [];
    for (var d = start; d < today; d = J.add(d, 1)) if (!done(d)) missed.push(d); // today is never "missed" while it is still running
    var streak = 0, k = done(today) ? today : yest; while (k >= start && done(k)) { streak++; k = J.add(k, -1); }
    var best = 0, run = 0; for (var e = start; e <= today; e = J.add(e, 1)) { if (done(e)) { run++; best = Math.max(best, run); } else if (e < today) run = 0; }
    var tot = 0, ok = 0, days = 0; Object.keys(g.apt.days).forEach(function (x) { var y = J.aptDay(g, x); tot += y.n; ok += y.ok; if (y.n >= y.t) days++; });
    return { state: td.n >= td.t ? 'Completed' : 'Pending', today: td, streak: streak, best: best, missed: missed, yMissed: yest >= start && !done(yest), total: tot, acc: tot ? ok / tot : null, doneDays: days, cats: J.aptStat(g) };
  };

  // ---------- XP, coins, loot, achievements (all derived from records) ----------
  J.xp = function (g, today) {
    var x = 0, seenT = {};
    ['da', 'cs'].forEach(function (p) {
      J.P[p].forEach(function (s) {
        s.cps.forEach(function (c) {
          var cs = J.cpStat(g, c); x += 2 * cs.ok + cs.wrong + (cs.passed ? 15 : 0);
          c.topics.forEach(function (t) { if (seenT[t]) return; seenT[t] = 1; var r = g.topics[t] || {}; x += n(r.learn) === 2 ? 10 : n(r.learn) === 1 ? 3 : 0; if (nn(r.test) >= 60) x += 40; if (r.rev) x += 5; });
        });
      });
      J.testList(g, p).forEach(function (t) { x += 10 + (t.pct >= 60 ? (t.kind === 'subject' ? 120 : 25) : 0); });
      var best = null; J.mockStats(g.mocks[p], 0).scores.forEach(function (s) { x += 60; if (best != null && s > best) x += Math.min(50, Math.round((s - best) * 5)); best = best == null ? s : Math.max(best, s); });
    });
    J.GA.topics.forEach(function (t) { var r = g.topics[t] || {}; x += n(r.learn) === 2 ? 10 : n(r.learn) === 1 ? 3 : 0; });
    Object.keys(g.apt.days).forEach(function (d) { var y = J.aptDay(g, d); x += y.ok + (y.n >= y.t ? 10 : 0); });
    g.mistakes.forEach(function (m) { if (m.fixedAt) x += 3; }); // recovery XP
    return Math.round(x + J.roadXp(g, today));
  };
  J.coins = function (g, xp) { return Math.floor(xp / 10) - g.spent.reduce(function (s, r) { return s + n(r.cost); }, 0); };
  J.LOOT = ['Bronze Pickaxe', 'Eigen Lens', 'Bayes Compass', 'Gradient Boots', 'Pointer Dagger', 'Cache Amulet', 'Kernel Lantern', 'Pumping Hammer', 'Lattice Shield', 'Heap Gauntlet', 'Mutex Ring', 'Router Cloak', 'Recursion Mirror', 'Proof Quill', 'Sigma Banner', 'Tensor Gem'];
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003; return h; }
  // Cosmetic drops for cleared checkpoints and bosses. Fixed per item, add nothing to progress or marks.
  J.inventory = function (g) {
    var inv = [];
    Object.keys(g.cps).forEach(function (id) { if ((g.cps[id] || {}).passed) inv.push({ from: id, item: J.LOOT[hash(id) % J.LOOT.length], rare: hash(id) % 7 === 0 }); });
    Object.keys(g.topics).forEach(function (id) { if (nn((g.topics[id] || {}).test) >= 60) inv.push({ from: id, item: J.LOOT[hash(id + 'b') % J.LOOT.length], rare: hash(id) % 5 === 0 }); });
    return inv;
  };
  J.achievements = function (g, an, ap) {
    var all = an.da.topics.concat(an.cs.topics), att = an.da.att + an.cs.att, ok = 0;
    ['da', 'cs'].forEach(function (p) { an[p].subjects.forEach(function (s) { s.cps.forEach(function (c) { ok += c.ok + c.fixed; }); }); });
    var subjs = an.da.subjects.concat(an.cs.subjects), sweep = subjs.some(function (s) { var hi = s.topics.filter(function (t) { return t.prio != null && t.prio >= 9; }); return hi.length && hi.every(function (t) { return t.st.s === 6; }); });
    var best = function (p) { return an[p].mock.best || 0; };
    return [['flag', 'First 50 PYQs', att >= 50], ['star', '100 questions right', ok >= 100], ['check', 'First topic cleared', all.some(function (t) { return t.st.s >= 5; })],
      ['crown', 'First region boss', subjs.some(function (s) { return s.boss; })], ['bolt', 'First 80% accuracy', ['da', 'cs'].some(function (p) { return an[p].acc >= .8 && an[p].att >= 30; })],
      ['shield', 'High-priority sweep', sweep], ['sword', 'First subject test passed', subjs.some(function (s) { return s.boss; })], ['mount', 'First full mock', an.da.mock.n + an.cs.mock.n > 0],
      ['fire', '+10 marks comeback', an.da.mock.gain >= 10 || an.cs.mock.gain >= 10], ['star', 'DA 60+ mock', best('da') >= 60], ['star', 'CS 65+ mock', best('cs') >= 65],
      ['crown', 'DA 69+ summit', an.da.mock.summit], ['crown', 'CS 77+ summit', an.cs.mock.summit], ['bolt', 'Aptitude 7-day streak', ap.best >= 7]];
  };

  // ---------- quests and the roadmap ----------
  var CADENCE = [0, 0, 21, 14, 7, 3.5]; // days between full mocks per stage (0 = not yet)
  J.quests = function (g, an, ap, today, RD) {
    var q = [];
    if (ap.state !== 'Completed') q.push({ kind: 'apt', title: 'Daily aptitude: ' + ap.today.n + '/' + ap.today.t + ' questions', why: ap.yMissed ? 'Yesterday was missed, streak reset. Restart today; nothing you solved is lost.' : 'GA is 15 marks in both papers. Streak ' + ap.streak + ' days.' });
    var open = g.mistakes.filter(function (m) { return !m.fixedAt; });
    if (open.length) q.push({ kind: 'mist', title: 'Recovery Camp: retry ' + open.length + ' wrong question' + (open.length > 1 ? 's' : ''), why: 'A fixed mistake earns recovery XP and stops the same marks leaking twice.' });
    if (RD) {
      J.roadNext(g, RD, 2).forEach(function (x) {
        var C = RD.ch[x.ch];
        if (x.kind === 'topic') q.push({ kind: 'road', ch: x.ch, id: x.id, title: J.STEPS[x.step] + ': ' + J.T[x.id].name, why: 'Chapter ' + (x.ch + 1) + ' · ' + C.name + '. Next step on the map.' });
        else if (x.kind === 'cp') q.push({ kind: 'road', ch: x.ch, cp: x.cp, title: 'Attempt every question: ' + x.name, why: x.att + '/' + x.bank + ' attempted. Reality Stage clears when every DA bank is attempted.' });
        else q.push({ kind: 'mock', paper: 'da', title: 'Harden: record a test or mock', why: 'Each subject moves with your test and mock scores.' });
      });
      if (RD.backlog.length) q.push({ kind: 'backlog', title: 'Backlog: ' + RD.backlog.length + ' topic' + (RD.backlog.length > 1 ? 's' : '') + ' left behind', why: 'Earlier chapters. Finish any time; they count the moment they are done.' });
    }
    ['da', 'cs'].forEach(function (p) {
      var A = an[p];
      if (!RD) J.rank(A).slice(0, 2).forEach(function (t) { var a = J.action(t); q.push({ kind: 'topic', paper: p, id: t.id, cp: t.cp, title: J.NAME[p] + ' · ' + a.verb + ': ' + t.name, why: a.why }); });
      var gap = CADENCE[A.stage], last = A.mock.list.length ? A.mock.list[A.mock.list.length - 1].date : '';
      if (gap && (!last || J.days(last, today) >= gap)) q.push({ kind: 'mock', paper: p, title: J.NAME[p] + ' · Full mock due', why: J.STAGES[A.stage] + ': one mock every ' + (gap < 7 ? '3–4 days' : Math.round(gap / 7) + ' week' + (gap > 7 ? 's' : '')) + '. ' + (A.mock.n < 3 ? 'Need 3 for any score estimate.' : 'Keeps the estimate honest.') });
    });
    return q;
  };
  J.plan = function (g, A, today) {
    var ex = g.exam[A.paper], weeks = ex ? Math.max(1, Math.ceil(J.days(today, ex) / 7)) : null, left = Math.max(0, A.bank - A.att);
    var ms = [], todo = A.subjects.filter(function (s) { return !s.boss; });
    if (A.syl < .7) ms.push('Learn the high-priority topics: syllabus ' + Math.round(A.syl * 100) + '% → 70%');
    if (A.cov < .6) ms.push('PYQ coverage ' + Math.round(A.cov * 100) + '% → 60% of the GATE Grind banks');
    if (todo.length) ms.push('Defeat the next region boss: ' + todo.sort(function (a, b) { return b.prog - a.prog; })[0].region + ' (pass a subject test ≥ 60%)');
    if (A.mock.n < 3) ms.push('Write ' + (3 - A.mock.n) + ' more full mock' + (A.mock.n === 2 ? '' : 's') + ' to unlock a score estimate');
    else if (!A.mock.summit) ms.push('Latest-5 median ' + A.mock.med5 + ' → ' + A.target + ' (summit)');
    var stage = A.stage, perWeek = weeks ? Math.ceil(left / weeks) : Math.min(left, 70);
    return {
      weeks: weeks, milestones: ms,
      week: [left ? 'Solve ' + perWeek + ' new questions this week' + (weeks ? ' (' + left + ' left over ' + weeks + ' weeks)' : '') : 'All bank questions tried: re-solve your mistakes',
        stage >= 2 ? (stage >= 3 ? 3 : 2) + ' topic tests this week' : 'Finish learning 3 high-priority topics this week',
        stage >= 3 ? '1 subject test this week' : 'Pass ' + 2 + ' GATE Grind checkpoints'],
      mocks: CADENCE[stage] ? 'Full mock every ' + (CADENCE[stage] < 7 ? '3–4 days' : Math.round(CADENCE[stage] / 7) + ' week(s)') : 'No full mocks yet: questions first',
      revision: A.revDue.slice(0, 5).map(function (t) { return t.name; })
    };
  };

  // ---------- v2.9 roadmap campaign: one ordered climb (pattern of the study roadmap, no dates) ----------
  // Each lane entry is [label, item, item...]; an item is a subject key ('da.la') or one checkpoint ('da.ps.0').
  J.ROAD = [
    { name: 'Math Foundations', img: 'study', da: [['Linear Algebra', 'da.la'], ['Calculus', 'da.calc'], ['Probability basics', 'da.ps.0', 'da.ps.1']], cs: [['Discrete Mathematics', 'cs.em.0', 'cs.em.1', 'cs.em.2', 'cs.em.3', 'cs.em.4']] },
    { name: 'Consolidation Camp', kind: 'camp', img: 'camp', da: [], cs: [] },
    { name: 'DSA + Python', img: 'dev', da: [['Python + DSA', 'da.pdsa']], cs: [['Programming & DS', 'cs.pds'], ['Algorithms', 'cs.algo']] },
    { name: 'Probability & Statistics', img: 'study', da: [['Probability & Statistics', 'da.ps.2', 'da.ps.3', 'da.ps.4']], cs: [['Digital Logic', 'cs.dl']] },
    { name: 'ML + DBMS', img: 'analytics', da: [['Machine Learning', 'da.ml'], ['DBMS & Warehousing', 'da.db']], cs: [['COA', 'cs.coa'], ['Databases', 'cs.dbs']] },
    { name: 'Artificial Intelligence', img: 'diag', da: [['Artificial Intelligence', 'da.ai']], cs: [['Operating Systems', 'cs.os'], ['Computer Networks', 'cs.cn']] },
    { name: 'Syllabus Wrap', kind: 'wrap', img: 'recover', da: [], cs: [['Theory of Computation', 'cs.toc'], ['Compiler Design', 'cs.cd']] },
    { name: 'Reality Stage', kind: 'real', img: 'study', da: [], cs: [] },
    { name: 'Hardening Stage', kind: 'hard', img: 'boss', da: [], cs: [] }
  ];
  J.STEPS = ['Concept', 'GATE Grind', 'PYQ', 'Mistakes', 'Short note', 'Revisit + test'];
  J.itemCps = function (it) { var s = J.subj(it); return s ? s.cps : [J.cp(it)]; };
  function laneOf(groups, skip) {
    return groups.map(function (gr) {
      var cps = [], tops = [];
      gr.slice(1).forEach(function (it) { J.itemCps(it).forEach(function (c) { cps.push(c); c.topics.forEach(function (t) { if (tops.indexOf(t) < 0 && !(skip && skip[t])) tops.push(t); }); }); });
      return { name: gr[0], cps: cps, topics: tops };
    });
  }
  // The six roadmap steps for one topic. 1-3 are taps (Concept is also the "learn: Done" field); 4 and 6 come from records.
  J.steps = function (g, tid) {
    var r = g.topics[tid] || {}, rs = n(g.road.step[tid]), cp = J.cpOfTopic('da', tid) || J.cpOfTopic('cs', tid);
    var cst = cp ? J.cpStat(g, cp) : null;
    var s1 = n(r.learn) === 2 || rs >= 1, s2 = rs >= 2 || !!(cp && (g.cps[cp.id] || {}).passed) || !!(cst && cst.bank > 0 && cst.att >= cst.bank), s3 = rs >= 3;
    var open = g.mistakes.filter(function (m) { return !m.fixedAt && (m.topic === tid || (!m.topic && cp && m.cp === cp.id)); }).length;
    var s = [s1, s2, s3, s3 && !open, !!g.road.note[tid], !!r.rev && nn(r.test) >= 60];
    return { s: s, k: s3 ? 3 : s2 ? 2 : s1 ? 1 : 0, open: open, cp: cp ? cp.id : '', att: cst ? cst.att : 0, bank: cst ? cst.bank : 0 };
  };
  // What to do next on the map: the first unfinished items of the current chapter, in roadmap order.
  J.roadNext = function (g, RD, max) {
    var C = RD.ch[RD.cur], out = [];
    if (C.kind === 'real') J.P.da.forEach(function (s) { s.cps.forEach(function (c) { var st = J.cpStat(g, c); if (st.att < st.bank) out.push({ kind: 'cp', ch: C.i, cp: c.id, name: c.name, att: st.att, bank: st.bank }); }); });
    else if (C.kind === 'hard') out.push({ kind: 'hard', ch: C.i });
    else C.da.forEach(function (l) { l.topics.forEach(function (t) { var st = RD.steps(t); if (C.kind === 'camp' ? !st.s[4] : st.k < 3) out.push({ kind: 'topic', ch: C.i, id: t, cp: st.cp, step: C.kind === 'camp' ? 4 : st.k }); }); });
    return out.slice(0, max || 1);
  };
  // Hardness 0-100 per subject: 0.6 x old + 0.4 x newest score %, from subject/topic tests and mock subject rows, oldest first.
  J.hard = function (g, p) {
    var ev = J.testList(g, p).filter(function (t) { return t.kind !== 'rapid' && t.pct != null; }).map(function (t) { return { s: t.subj, pct: Math.max(0, Math.min(100, t.pct)), d: t.at || '' }; });
    g.mocks[p].forEach(function (m) { var pt = obj(m.parts) ? m.parts : {}; Object.keys(pt).forEach(function (k) { var x = pt[k]; if (Array.isArray(x) && n(x[1]) > 0) ev.push({ s: k, pct: Math.max(0, Math.min(100, n(x[0]) / n(x[1]) * 100)), d: m.date || '' }); }); });
    ev = ev.map(function (e, i) { e.i = i; return e; }).sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : a.i - b.i; });
    return J.P[p].map(function (s) {
      var h = null, prev = null, up = 0, cnt = 0;
      ev.forEach(function (e) { if (e.s !== s.id) return; prev = h; h = h == null ? e.pct : .6 * h + .4 * e.pct; if (prev != null && h > prev) up++; cnt++; });
      return { id: s.id, key: s.key, name: s.name, h: r1(h), prev: r1(prev), n: cnt, up: up, trend: h == null || prev == null ? 0 : h > prev ? 1 : h < prev ? -1 : 0, forge: h != null && h < 40 };
    });
  };
  function realOf(g, cps) { var b = 0, a = 0, full = 0; cps.forEach(function (c) { var st = J.cpStat(g, c); b += st.bank; a += st.att; if (st.att >= st.bank) full++; }); return { bank: b, att: a, pct: b ? a / b : 0, full: full, cps: cps.length }; }
  function allCps(p) { var a = []; J.P[p].forEach(function (s) { a = a.concat(s.cps); }); return a; }
  J.road = function (g, today) {
    var allDa = [], seen = {}, chs = [];
    J.ROAD.forEach(function (c, i) {
      var C = { i: i, name: c.name, kind: c.kind || 'learn', img: c.img, da: [], cs: [] };
      if (C.kind === 'learn') { C.da = laneOf(c.da); var mine = {}; C.da.forEach(function (l) { l.topics.forEach(function (t) { mine[t] = 1; if (!seen[t]) { seen[t] = 1; allDa.push(t); } }); }); C.cs = laneOf(c.cs, mine); }
      if (C.kind === 'wrap') C.cs = laneOf(c.cs);
      chs.push(C);
    });
    var st = {}, stp = function (t) { return st[t] || (st[t] = J.steps(g, t)); };
    var real = { da: realOf(g, allCps('da')), cs: realOf(g, allCps('cs')) };
    real.subj = J.P.da.concat(J.P.cs).map(function (s) { var o = realOf(g, s.cps); o.key = s.key; o.name = s.name; o.paper = s.paper; return o; });
    var summit = J.mockStats(g.mocks.da, n(g.target.da) || J.TARGET.da).summit;
    chs.forEach(function (C) {
      var tops = [];
      if (C.kind === 'learn') C.da.forEach(function (l) { tops = tops.concat(l.topics); });
      if (C.kind === 'camp') { chs[0].da.forEach(function (l) { tops = tops.concat(l.topics); }); C.da = [{ name: 'Revise ' + chs[0].name + ': short note per topic', cps: [], topics: tops }]; }
      if (C.kind === 'wrap') { tops = allDa.filter(function (t) { return stp(t).k < 3; }); C.da = [{ name: 'Unfinished DA topics', cps: [], topics: tops }]; }
      C.total = tops.length;
      C.done = C.kind === 'camp' ? tops.filter(function (t) { return stp(t).s[4]; }).length : tops.filter(function (t) { return stp(t).k >= 3; }).length;
      C.cleared = C.kind === 'real' ? real.da.pct >= 1 : C.kind === 'hard' ? summit : C.kind === 'wrap' ? !tops.length : C.total > 0 && C.done === C.total;
      // Climb inside a learning chapter: each topic gives a third for Concept, GATE Grind and PYQ, so concepts move you up first.
      C.kc = [1, 2, 3].map(function (k) { return tops.filter(function (t) { return stp(t).k >= k; }).length; });
      C.prog = C.kind === 'real' ? real.da.pct : C.kind === 'hard' || C.kind === 'wrap' ? (C.cleared ? 1 : 0) : !C.total ? 0 :
        C.kind === 'learn' ? (C.kc[0] + C.kc[1] + C.kc[2]) / (3 * C.total) : C.done / C.total;
      var csT = []; C.cs.forEach(function (l) { csT = csT.concat(l.topics); });
      C.csTotal = csT.length; C.csDone = csT.filter(function (t) { return stp(t).k >= 3; }).length;
    });
    var skip = g.road.skip;
    chs.forEach(function (C, i) {
      var P = chs[i - 1];
      C.skipped = skip.indexOf(i) >= 0 && !C.cleared;
      C.open = i === 0 || (P.open && (P.cleared || skip.indexOf(i - 1) >= 0)) || (C.kind === 'hard' && P.open && real.da.pct >= .8);
    });
    var cur = 0; chs.forEach(function (C, i) { if (C.open) cur = i; });
    for (var i = 0; i < chs.length; i++) if (chs[i].open && !chs[i].cleared && skip.indexOf(i) < 0) { cur = i; break; }
    // Backlog: DA work left behind in chapters below the current one (skipped or passed by). It counts again the moment it is finished.
    var backlog = [];
    chs.forEach(function (C) {
      if (C.i >= cur || C.cleared) return;
      if (C.kind === 'learn') C.da.forEach(function (l) { l.topics.forEach(function (t) { if (stp(t).k < 3) backlog.push({ ch: C.i, t: t }); }); });
      if (C.kind === 'camp') C.da[0].topics.forEach(function (t) { if (!stp(t).s[4]) backlog.push({ ch: C.i, t: t, note: true }); });
    });
    return { ch: chs, cur: cur, backlog: backlog, real: real, steps: stp, allDa: allDa, hard: { da: J.hard(g, 'da'), cs: J.hard(g, 'cs') }, summit: summit };
  };
  // Topics whose checkpoints are all fully attempted on GATE Grind ("Reality cleared"), DA and CS counted once.
  J.realTopics = function (g) {
    var out = [], seen = {};
    ['da', 'cs'].forEach(function (p) { J.P[p].forEach(function (s) { s.topics.forEach(function (t) { if (seen[t]) return; seen[t] = 1; var cps = s.cps.filter(function (c) { return c.topics.indexOf(t) >= 0; }); if (cps.every(function (c) { var st = J.cpStat(g, c); return st.att >= st.bank; })) out.push(t); }); }); });
    return out;
  };
  // XP from the roadmap: step taps, notes, cleared chapters, Reality (50 per topic + 1 per question of a finished bank), Hardening rises.
  J.roadXp = function (g, today) {
    if (!obj(g.road) || !obj(g.road.step)) return 0;
    var x = 0, RD = J.road(g, today);
    Object.keys(g.road.step).forEach(function (t) { var k = n(g.road.step[t]); x += (k >= 2 ? 5 : 0) + (k >= 3 ? 8 : 0); });
    x += 4 * Object.keys(g.road.note).filter(function (t) { return g.road.note[t]; }).length;
    RD.ch.forEach(function (C) { if (C.cleared && C.kind !== 'hard') x += 100; });
    ['da', 'cs'].forEach(function (p) { allCps(p).forEach(function (c) { var st = J.cpStat(g, c); if (st.att >= st.bank) x += st.bank; }); });
    x += 50 * J.realTopics(g).length;
    ['da', 'cs'].forEach(function (p) { RD.hard[p].forEach(function (h) { x += 10 * h.up; }); });
    return x;
  };

  root.J = J;
  if (typeof module !== 'undefined') module.exports = J;
})(typeof window !== 'undefined' ? window : this);
