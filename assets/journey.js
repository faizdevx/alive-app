// ---------- Journey tab: GATE 2027, placement tower, your lab ----------
// The tower has a generic name (no company affiliation) and the lab is named after you, unless the edition file says otherwise.
function jPub() { return !(window.EDITION && EDITION.tower); }
function accName() { return jPub() ? 'Placement Tower' : EDITION.tower; }
function labName() { if (window.EDITION && EDITION.lab) return EDITION.lab; var n = String(D.profile.name || '').trim().split(/\s+/)[0]; return (n && n !== 'Hero' ? n : 'MY').toUpperCase() + ' LAB'; }
// Records live in D.gate, inside the same saved object and backup as everything else. All maths is in gate.js (J);
// this file draws screens and writes records. Loaded after the main script, so it uses its helpers (v, esc, bar, modal, toast, ico…).
function jg() { return (D.gate = J.ensure(D.gate)); }
var jTab = 'over', jPaper = 'da', jSubj = '', jOpenT = '', jQ = [], aStep = 0;
function jAll() { var g = jg(); return { da: J.analyze(g, 'da', today), cs: J.analyze(g, 'cs', today) }; }
function jP(x) { return x == null ? '—' : Math.round(x * 100) + '%'; }
function jB(x, cls) { return bar(x == null ? 0 : Math.round(Math.min(1, x) * 100), cls); }
function jN(x) { return x == null ? '—' : x; }
function jIn(id, label, value, ph, type) { return '<label>' + label + '<input id="' + id + '" ' + (type ? 'type="' + type + '"' : 'inputmode="decimal"') + ' value="' + esc(value == null ? '' : value) + '" placeholder="' + (ph || '') + '"></label>'; }
function jV(id) { var e = $(id); return e ? e.value.trim() : ''; }
function jNum(id) { var x = jV(id); return x === '' || !isFinite(+x) ? '' : +x; }
function jPT(fn) { return '<div class="row">' + ['da', 'cs'].map(function (p) { return '<button class="' + (jPaper === p ? 'on' : '') + '" onclick="jPaper=\'' + p + '\';' + fn + '">' + J.NAME[p] + '</button>'; }).join('') + '</div>'; }
function jOpen(url) { var e = A.openLink ? A.openLink(url) : (window.open(url, '_blank'), ''); if (e) toast(e); }
function jAchList() { var g = jg(), an = jAll(); return J.achievements(g, an, J.apt(g, today)); }

// Save a change, show the XP it earned, and celebrate anything newly unlocked.
function jAward(fn, quiet) {
  var g = jg(), x0 = J.xp(g, today), a0 = jAchList().filter(function (a) { return a[2]; }).map(function (a) { return a[1]; }), b0 = jRoadSnap(g);
  var r = fn(); save();
  var d = J.xp(g, today) - x0, neu = jAchList().filter(function (a) { return a[2] && a0.indexOf(a[1]) < 0; }), b1 = jRoadSnap(g);
  var newCh = b1.ch.filter(function (i) { return b0.ch.indexOf(i) < 0; }), newReal = b1.real.filter(function (t) { return b0.real.indexOf(t) < 0; });
  if (neu.length) jWin(neu[0][1]);
  else if (r && r.modal) r.modal();
  else if (newCh.length) jLoot('CHAPTER CLEARED', J.ROAD[newCh[0]].name, 'ch' + newCh[0], 'win').modal();
  else if (newReal.length) jLoot('REALITY CLEARED', J.T[newReal[0]].name + (newReal.length > 1 ? ' +' + (newReal.length - 1) + ' more' : ''), 'r' + newReal[0], 'win').modal();
  else if (b1.up > b0.up) jLoot('SUBJECT HARDENED ▲', 'Your latest score lifted its hardness.', 'h' + b1.up, 'comeback').modal();
  else if (!quiet) { toast(r && r.msg ? r.msg : d ? (d > 0 ? '+' : '') + d + ' XP' : 'Saved'); }
  buzz(d > 0 ? 25 : 10);
  return d;
}
function jWin(name) {
  var img = /summit/i.test(name) ? 'summit' : /comeback/i.test(name) ? 'comeback' : 'win', m = /(DA|CS) (\d+)\+ summit/.exec(name);
  buzz([40, 60, 40, 60, 120]);
  modal('<img class="jpic" src="' + jImg(img) + '" alt="">' + (m ? '<div class="ring gold" style="font-size:28px">GATE ' + m[1] + ' 2027<br>' + m[2] + '+ ACHIEVED</div><div class="muted">Latest-5 mock median at target. Earned on real mocks.</div>'
    : '<div class="ring gold" style="font-size:26px">ACHIEVEMENT</div><h2>' + esc(name) + '</h2>') + '<button class="pri" onclick="closeModal();jRe()">Continue</button>');
}
function jLoot(title, sub, id, img) {
  var it = J.LOOT[(function (s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003; return h; })(id + (img === 'boss' ? 'b' : '')) % J.LOOT.length];
  return { modal: function () { buzz([30, 40, 30, 40, 90]); modal('<img class="jpic" src="' + jImg((img || 'win')) + '" alt=""><div class="ring gold" style="font-size:26px">' + title + '</div><div class="px">' + esc(sub) + '</div>' +
    '<div class="panel" style="margin-top:12px">' + ico('chest', 28) + '<div class="px warn">Treasure: ' + it + '</div><div class="muted">Cosmetic only. Your marks come from mocks.</div></div><button class="pri" onclick="closeModal();jRe()">Continue</button>'); } };
}
function jRoadSnap(g) { var RD = J.road(g, today), up = 0; ['da', 'cs'].forEach(function (p) { RD.hard[p].forEach(function (h) { up += h.up; }); }); return { ch: RD.ch.filter(function (C) { return C.cleared; }).map(function (C) { return C.i; }), real: J.realTopics(g), up: up }; }
function jRe() { var n = stack[stack.length - 1]; if (R[n]) R[n](); }

// ---------- landing ----------
R.journey = function () {
  var g = jg(), started = !!g.audit.done, an = started ? jAll() : null, ap = J.apt(g, today);
  var sc = function (p) { var A = an[p]; return '<div><div class="muted px">' + J.NAME[p] + ' · ' + A.target + '+</div><b class="px">' + (A.mock.est == null ? 'NO EST.' : A.mock.est) + '</b></div>'; };
  v('journey', '<h1>JOURNEY</h1><div class="muted" style="margin:4px 0 14px">Big goals, played as campaigns. Pick one.</div>' +
    '<div class="jcard" onclick="jStart()"><img src="' + jImg('gate') + '" alt=""><span class="rib ok">AVAILABLE</span><div class="jb"><h2>GATE 2027</h2><div class="px warn">The Final Campaign</div>' +
      '<div class="muted" style="margin:6px 0">Prepare for GATE DA and GATE CS through syllabus completion, question practice, aptitude, test series and full-length mocks.</div>' +
      '<div class="g2 px"><div>DA target <b class="ok">' + g.target.da + '+</b></div><div>CS target <b class="ok">' + g.target.cs + '+</b></div></div>' +
      (started ? '<div class="g3" style="margin-top:8px">' + sc('da') + sc('cs') + '<div><div class="muted px">Aptitude</div><b class="px ' + (ap.state === 'Completed' ? 'ok' : 'warn') + '">' + ap.state.toUpperCase() + '</b></div></div>' : '') +
      '<button class="pri">' + (started ? 'Continue Journey' : 'Start Journey') + ' ' + ico('next', 14) + '</button></div></div>' +
    (function (st) { return '<div class="jcard" onclick="go(\'acc\')"><img src="' + jImg('acc') + '" alt=""><span class="rib ok">AVAILABLE</span><div class="jb"><h2>' + accName() + '</h2><div class="px warn">The Offer Tower' + (jPub() ? ' · Accenture-style pattern' : '') + '</div>' +
      '<div class="muted" style="margin:6px 0">Career preparation, placement readiness, aptitude, coding, interviews and professional development. Climb 14 floors of your roadmap topics.' + (jPub() ? ' Not affiliated with Accenture.' : '') + '</div>' +
      '<div class="g2 px"><div>Floor <b class="ok">' + (st.roof ? 'ROOF' : st.cur + 1 + '/14') + '</b></div><div>Tasks <b class="ok">' + st.done + '/' + st.total + '</b></div></div>' +
      '<button class="pri">' + (st.done ? 'Continue climbing' : 'Enter the tower') + ' ' + ico('next', 14) + '</button></div></div>'; })(AC.stat(ag())) +
    (function (s) { return '<div class="jcard" onclick="go(\'lab\')"><div class="jduo"><img src="' + jImg('dev') + '" alt=""><img src="' + jImg('dev2') + '" alt=""></div><span class="rib ok">AVAILABLE</span><div class="jb"><h2>' + esc(labName()) + '</h2><div class="px warn">Projects &amp; builds</div>' +
      '<div class="muted" style="margin:6px 0">My projects, each with its own todo list, sorted into folders.</div>' +
      '<div class="g3 px"><div>Projects <b class="ok">' + s.n + '</b></div><div>Done <b class="ok">' + s.ship + '</b></div><div>Todos <b class="ok">' + s.d + '/' + s.t + '</b></div></div>' +
      '<button class="pri">Open the lab ' + ico('next', 14) + '</button></div></div>'; })(lStat()));
};
function jStart() { var g = jg(); if (g.road.start) { jTab = 'over'; go('gate'); } else { rsI = 0; go('rstart'); } }

// ---------- baseline audit ----------
function aSteps() { return ['intro'].concat(J.P.da.map(function (s) { return s.key; }), ['da.tests'], J.P.cs.map(function (s) { return s.key; }), ['cs.tests', 'ga', 'done']); }
var LEARN = ['Not', 'Partial', 'Done'];
function aTopicRow(tid) {
  var r = jg().topics[tid] || {}, l = L.n(r.learn), pr = J.prio(jg(), tid);
  return '<div class="item"><span style="flex:1;min-width:0">' + esc(J.T[tid].name) + (pr != null ? ' <span class="muted px">' + (J.T[tid].grade || pr) + '</span>' : '') + '</span><span class="pick" style="flex:none">' +
    LEARN.map(function (x, i) { return '<button class="sm ' + (l === i ? 'on' : '') + '" onclick="aL(\'' + tid + '\',' + i + ')">' + x + '</button>'; }).join('') + '</span></div>';
}
function aL(tid, i) { var g = jg(); (g.topics[tid] = g.topics[tid] || {}).learn = i; save(); R.audit(); }
function aAll(key, i) { var g = jg(); J.subj(key).topics.forEach(function (t) { (g.topics[t] = g.topics[t] || {}).learn = i; }); save(); R.audit(); }
function aCp(id) { var g = jg(), r = g.cps[id] = g.cps[id] || {}; r.passed = !r.passed; if (r.passed) r.at = today; save(); R.audit(); }
function aBaseHtml(key) {
  var b = jg().base[key] || {};
  return '<div class="g3">' + jIn('a_pyq', 'PYQs solved', b.pyq, 'skip') + jIn('a_acc', 'Accuracy %', b.acc, 'skip') + jIn('a_ok', 'Correct', b.ok, 'skip') + jIn('a_bad', 'Wrong', b.bad, 'skip') + jIn('a_skip', 'Unattempted', b.skip, 'skip') +
    '<label>Last revised<input id="a_rev" type="date" value="' + esc(b.rev || '') + '"></label></div>';
}
function aReadBase(key) {
  if (!$('a_pyq')) return; var g = jg(), b = {};
  ['pyq', 'acc', 'ok', 'bad', 'skip'].forEach(function (k) { var x = jNum('a_' + k); if (x !== '') b[k] = Math.max(0, k === 'acc' ? Math.min(100, x) : x); });
  if (/^\d{4}-\d{2}-\d{2}$/.test(jV('a_rev'))) b.rev = jV('a_rev');
  g.base[key] = b;
}
function aRead() {
  var k = aSteps()[aStep], g = jg();
  if (J.subj(k) && k !== 'ga') aReadBase(k);
  if (k === 'da.tests') J.GC.forEach(function (gr, i) { if (gr[2] === 'mock') return; var c = jNum('a_gc' + i); if (c === '') return; for (var t = 1; t <= gr[1]; t++) { var id = 'gc.' + i + '.' + t, r = g.tests[id] = g.tests[id] || {}; if (t <= c) r.done = true; else if (r.done && r.score == null) delete r.done; } });
  if (k === 'ga' && $('a_apt')) { var x = jNum('a_apt'); if (x > 0) g.apt.target = Math.round(x); }
  save();
}
function aNext() { aRead(); aStep = Math.min(aSteps().length - 1, aStep + 1); R.audit(); window.scrollTo(0, 0); }
function aBack() { aRead(); if (aStep > 0) { aStep--; R.audit(); window.scrollTo(0, 0); } else goBack(); }
function aJump(k) { aRead(); aStep = aSteps().indexOf(k); R.audit(); window.scrollTo(0, 0); }
function aMocks(p) {
  var M = jg().mocks[p];
  return '<div class="panel"><h3>' + J.NAME[p] + ' full mocks so far</h3>' + (M.length ? M.map(function (m, i) { return '<div class="item" onclick="jMock(\'' + p + '\',' + i + ')"><span>' + esc(m.date || '?') + ' · #' + esc(m.no || i + 1) + '</span><b class="px">' + esc(m.score) + '/100</b></div>'; }).join('') : '<div class="muted">None recorded.</div>') +
    '<button onclick="jMock(\'' + p + '\',-1)">' + ico('plus', 16) + 'Add a past mock</button></div>';
}
R.audit = function () {
  var g = jg(), st = aSteps(), k = st[aStep], h = '<div class="top"><button class="ghost" onclick="aBack()" aria-label="Back">' + ico('back', 24) + '</button><h1>BASE CAMP</h1></div>' +
    bar(pct(aStep, st.length - 1), 'gold') + '<div class="muted px" style="margin-bottom:12px">Audit step ' + (aStep + 1) + ' / ' + st.length + '</div>';
  var next = function (t) { return '<button class="pri" onclick="aNext()">' + (t || 'Next') + ' ' + ico('next', 14) + '</button><button onclick="aJump(\'done\')">Skip to the report</button>'; };
  var S = J.subj(k);
  if (k === 'intro') h += '<img class="jpic" src="' + jImg('camp') + '" alt=""><div class="say">' + (g.audit.done ? 'Re-run the audit. Everything you saved is pre-filled, so you are editing, not starting over.' : 'Before the climb, tell me where you already stand. I don\'t assume you start from zero.') + '</div>' +
    '<div class="panel"><ol><li>GATE DA: each subject, topic by topic. Not, Partial or Done.</li><li>PYQs solved, accuracy, GATE Grind checkpoints passed.</li><li>GO Classes tests and past mocks.</li><li>GATE CS, then shared aptitude.</li></ol><div class="muted">Skip anything you don\'t know. Topics shared by DA and CS (maths, DBMS, DSA) are filled once and show up in both.</div></div>' + next('Begin');
  else if (k === 'da.tests') h += '<h2>GATE DA · tests &amp; mocks</h2><div class="panel" style="margin-top:10px"><h3>GO Classes tests attempted (Question Set 2)</h3><div class="muted">How many of each group you have written. Scores go in Test Series later.</div><div class="g2" style="margin-top:8px">' +
    J.GC.map(function (gr, i) { if (gr[2] === 'mock') return ''; var c = 0; for (var t = 1; t <= gr[1]; t++) if ((g.tests['gc.' + i + '.' + t] || {}).done) c++; return jIn('a_gc' + i, esc(gr[0]) + ' (of ' + gr[1] + ')', c || '', '0'); }).join('') + '</div></div>' + aMocks('da') + next();
  else if (k === 'cs.tests') h += '<h2>GATE CS · mocks</h2><div class="muted" style="margin:6px 0 10px">Any CS test series results go in Test Series → Your own tests.</div>' + aMocks('cs') + next();
  else if (k === 'ga') h += '<h2>Shared General Aptitude</h2><div class="muted" style="margin:6px 0 10px">15 marks in both papers. Stored once.</div><div class="panel">' + J.GA.topics.map(aTopicRow).join('') + '</div>' +
    '<div class="panel">' + jIn('a_apt', 'Daily aptitude target (questions)', g.apt.target, '20') + '</div>' + next();
  else if (k === 'done') { var an = jAll(); h += '<img class="jpic" src="' + jImg('diag') + '" alt=""><h2>Diagnostic report</h2><div class="muted" style="margin:4px 0 12px">Built from what you entered. Change anything later; it recalculates.</div>' + jDiag(an.da) + jDiag(an.cs) +
    '<button class="pri" onclick="aFinish()">' + ico('flag', 16) + 'Generate my journey</button>'; }
  else if (S) {
    var p = k.split('.')[0];
    h += '<div class="muted px">' + J.NAME[p] + ' · ~' + S.marks + ' marks</div><h2>' + esc(S.name) + '</h2>' +
      '<div class="row" style="margin-top:8px"><button class="sm" onclick="aAll(\'' + k + '\',2)">All done</button><button class="sm" onclick="aAll(\'' + k + '\',1)">All partial</button><button class="sm" onclick="aAll(\'' + k + '\',0)">All not</button></div>' +
      '<div class="panel" style="margin-top:10px"><h3>Topics</h3>' + S.topics.map(aTopicRow).join('') + '</div>' +
      '<div class="panel"><h3>GATE Grind checkpoints passed</h3>' + S.cps.map(function (c) { var on = (g.cps[c.id] || {}).passed; return '<label class="item" style="text-transform:none;letter-spacing:0;font-size:14px;color:var(--tx)"><span>' + esc(c.name) + (c.bank ? ' <span class="muted">(' + c.bank + ')</span>' : '') + '</span><input type="checkbox"' + (on ? ' checked' : '') + ' onchange="aCp(\'' + c.id + '\')"></label>'; }).join('') + '</div>' +
      '<div class="panel"><h3>Questions solved before the app</h3>' + aBaseHtml(k) + '</div>' + next();
  }
  v('audit', h);
};
function aFinish() {
  var g = jg(); g.audit.done = today; g.start = g.start || today; save();
  stack = ['journey', 'gate']; jTab = 'over'; show(); toast('Journey generated · ' + J.xp(g, today) + ' XP from past work');
}

// ---------- diagnosis + scorecards ----------
function jDiag(A) {
  var M = A.mock, li = function (a, f) { return a.length ? a.map(f).join('') : '<div class="muted">—</div>'; };
  return '<div class="panel"><div class="row sp"><h3 style="margin:0">' + J.NAME[A.paper] + '</h3><span class="chip on">' + J.STAGES[A.stage] + '</span></div>' +
    '<div class="g2" style="margin-top:10px">' +
    [['Priority-weighted syllabus', jP(A.syl)], ['PYQ coverage', jP(A.cov) + ' (' + A.att + '/' + A.bank + ')'], ['Question accuracy', jP(A.acc)], ['Topic-test avg', A.topicTestAvg == null ? '—' : A.topicTestAvg + '%'],
      ['Subject-test avg', A.subjTestAvg == null ? '—' : A.subjTestAvg + '%'], ['Revised in 30 days', jP(A.revFresh)], ['Full-mock estimate', M.est == null ? M.conf : M.est + ' / 100'], ['Gap to ' + A.target + '+', M.gap == null ? '—' : M.gap <= 0 ? 'on target' : M.gap + ' marks']]
      .map(function (x) { return '<div><div class="muted" style="font-size:12px">' + x[0] + '</div><b class="px">' + x[1] + '</b></div>'; }).join('') + '</div>' +
    '<h3 style="margin-top:12px">Strongest subjects</h3>' + li(A.strong, function (s) { return '<div class="item"><span>' + esc(s.name) + '</span><b class="px ok">' + jP(s.acc) + '</b></div>'; }) +
    '<h3 style="margin-top:12px">Weakest subjects</h3>' + li(A.weak, function (s) { return '<div class="item"><span>' + esc(s.name) + '</span><b class="px neg">' + jP(s.acc) + '</b></div>'; }) +
    '<h3 style="margin-top:12px">High-priority unfinished</h3>' + li(A.hiPrio.slice(0, 5), function (t) { return '<div class="item" onclick="jGoTopic(\'' + t.cp + '\',\'' + t.id + '\')"><span>' + esc(t.name) + '</span><span class="mb ms' + t.st.s + '">' + t.st.name + '</span></div>'; }) +
    (A.hiPrio.length ? '' : '<div class="muted">Rate topics (Master/Strong) to fill this list.</div>') +
    '<h3 style="margin-top:12px">Question-solving weaknesses</h3>' + li(A.mistakeCats.slice(0, 4), function (c) { return '<div class="item"><span>' + esc(c[0]) + '</span><b class="px neg">' + c[1] + '</b></div>'; }) +
    '<h3 style="margin-top:12px">Needs revision</h3>' + li(A.revDue.slice(0, 5), function (t) { return '<div class="item" onclick="jGoTopic(\'' + t.cp + '\',\'' + t.id + '\')"><span>' + esc(t.name) + '</span><span class="muted">' + (t.st.revAgo == null ? 'never' : t.st.revAgo + 'd ago') + '</span></div>'; }) +
    '<h3 style="margin-top:12px">Mock readiness</h3><div class="muted">' + (M.n < 3 ? 'Insufficient data: ' + M.n + ' of 3 mocks needed for any estimate. No number is guessed.' : 'Latest-5 median ' + M.med5 + ', best ' + M.best + ', trend ' + (M.slope > 0 ? '+' : '') + M.slope + '/mock. Summit needs 5 mocks with median ≥ ' + A.target + '.') + '</div></div>';
}

// ---------- the Ascension map ----------
function jRnd(s) { return function () { s = s * 16807 % 2147483647; return s / 2147483647; }; }
function jProp(t, x, y) {
  var R0 = function (a, b, w, h, c) { return '<rect x="' + a + '" y="' + b + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>'; };
  if (t === 'tree') return R0(x - 2, y - 6, 4, 6, '#4a3320') + R0(x - 9, y - 12, 18, 6, '#2f6b2a') + R0(x - 6, y - 18, 12, 6, '#3c8a33') + R0(x - 3, y - 24, 6, 6, '#4fa43f');
  if (t === 'peak') return R0(x - 15, y - 8, 30, 8, '#4b5563') + R0(x - 10, y - 16, 20, 8, '#5d6878') + R0(x - 5, y - 24, 10, 8, '#e8eddc');
  if (t === 'gear') return R0(x - 12, y - 14, 24, 14, '#6b4a2b') + R0(x - 14, y - 18, 28, 4, '#8a5f36') + R0(x - 3, y - 10, 6, 10, '#2a1c10') + R0(x + 6, y - 24, 4, 8, '#555');
  if (t === 'city') return R0(x - 12, y - 22, 9, 22, '#3f4b6b') + R0(x - 2, y - 30, 10, 30, '#4b5980') + R0(x + 9, y - 16, 7, 16, '#36405e') + R0(x, y - 26, 2, 2, '#f2c14e') + R0(x + 4, y - 20, 2, 2, '#f2c14e') + R0(x - 9, y - 16, 2, 2, '#f2c14e');
  if (t === 'lab') return R0(x - 13, y - 16, 26, 16, '#2c5560') + R0(x - 4, y - 26, 8, 10, '#3d7380') + R0(x - 9, y - 10, 4, 4, '#7fe0f0') + R0(x + 4, y - 10, 4, 4, '#7fe0f0');
  if (t === 'castle') return R0(x - 14, y - 18, 28, 18, '#5a4466') + R0(x - 14, y - 22, 6, 4, '#5a4466') + R0(x - 3, y - 22, 6, 4, '#5a4466') + R0(x + 8, y - 22, 6, 4, '#5a4466') + R0(x - 3, y - 9, 6, 9, '#1c1222');
  if (t === 'tent') return R0(x - 10, y - 4, 20, 4, '#b5651d') + R0(x - 7, y - 8, 14, 4, '#d07a2a') + R0(x - 4, y - 12, 8, 4, '#e8913a') + R0(x - 1, y - 15, 2, 3, '#e8eddc');
  if (t === 'snow') return R0(x - 16, y - 8, 32, 8, '#5d6878') + R0(x - 10, y - 18, 20, 10, '#8a96a8') + R0(x - 5, y - 26, 10, 8, '#ffffff');
  if (t === 'arena') return R0(x - 18, y - 14, 36, 14, '#6b2b2b') + R0(x - 18, y - 18, 36, 4, '#8a3a3a') + R0(x - 12, y - 10, 4, 10, '#1a0a0a') + R0(x - 2, y - 10, 4, 10, '#1a0a0a') + R0(x + 8, y - 10, 4, 10, '#1a0a0a');
  return '';
}
function jFlag(x, y, c, big, glow) {
  var s = big ? 1.5 : 1;
  return '<g' + (glow ? ' class="jglow"' : '') + '><rect x="' + (x - 9 * s) + '" y="' + (y - 3) + '" width="' + 18 * s + '" height="6" fill="#0a0c0a"/>' +
    '<rect x="' + (x - 1) + '" y="' + (y - 22 * s) + '" width="3" height="' + 22 * s + '" fill="#d9d2b8"/><rect x="' + (x + 2) + '" y="' + (y - 22 * s) + '" width="' + 12 * s + '" height="' + 8 * s + '" fill="' + c + '"/></g>';
}
function jMapAfter(p) {
  var m = $('jmap'), h = $('jhero'); if (!m || !h) return;
  var k = m.clientWidth / 360, x = +h.dataset.x, y = +h.dataset.y, g = jg();
  m.scrollTop = y * k - m.clientHeight * .6;
  setTimeout(function () { h.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }, 80);
  g.pos = g.pos || {}; if (!g.pos[p] || g.pos[p][0] !== x || g.pos[p][1] !== y) { g.pos[p] = [x, y]; save(); } // map position persists between visits
}
function jStrip(e) { var m = $('jmap'), r = e.currentTarget.getBoundingClientRect(); m.scrollTop = (e.clientY - r.top) / r.height * m.scrollHeight - m.clientHeight / 2; }
// ---------- solving questions ----------
var jSess = { ok: 0, bad: 0 };
var MCAT = ['Concept gap', 'Calculation slip', 'Misread question', 'Time pressure', 'Guessed', 'Forgot formula'];
function jSolve(cpId, tid) {
  jSess = { ok: 0, bad: 0, cp: cpId, tid: tid || '', last: null };
  jSolveDraw();
}
function jSolveDraw(wrong) {
  var g = jg(), cp = J.cp(jSess.cp), cs = J.cpStat(g, cp), p = cp.id.split('.')[0];
  modal('<div class="muted px">' + (p === 'ga' ? 'Aptitude' : J.NAME[p]) + (jSess.tid ? ' · ' + esc(J.T[jSess.tid].name) : '') + '</div><h2>' + esc(cp.name) + '</h2>' +
    '<div class="muted" style="margin:6px 0">' + cs.solved + '/' + cs.bank + (cs.bankKnown ? '' : '?') + ' solved · accuracy ' + jP(cs.acc) + ' · this session ' + jSess.ok + ' ✓ ' + jSess.bad + ' ✗</div>' +
    (wrong ? '<div class="panel" style="text-align:left"><div class="row" style="gap:10px;align-items:center"><img class="jth" src="' + jImg('recover') + '" alt=""><div><h3 style="margin:0">Recovery Camp</h3><div class="muted">No progress lost. Saved to the mistake notebook. Why was it wrong?</div></div></div>' +
      '<div style="margin-top:8px">' + MCAT.map(function (c) { return '<button class="tag" onclick="jWhy(\'' + c + '\')">' + c + '</button>'; }).join('') + '</div><input id="jwhy" placeholder="Note: what to remember next time"><button class="sm" onclick="jWhy()">Save note</button></div>' : '') +
    '<input id="jq" placeholder="Question ID (optional, e.g. GATE23-Q41)" autocomplete="off"><div class="row"><button class="pri" onclick="jAns(1)">' + ico('check', 16) + 'Correct</button><button onclick="jAns(0)" style="color:var(--bad)">' + ico('x', 16) + 'Wrong</button></div>' +
    '<details style="text-align:left"><summary class="muted px">Batch: log a whole session</summary><div class="g2">' + jIn('jbo', '+ correct', '', '0') + jIn('jbb', '+ wrong', '', '0') + '</div><button onclick="jBatch()">Add batch</button></details>' +
    '<div class="muted" style="font-size:12px">You mark right or wrong: ALIVE? can\'t see GATE Grind questions. A question ID counts once; without IDs, counts are capped at the bank size so repeats don\'t inflate progress.</div>' +
    '<button onclick="closeModal();jRe()">Done</button>');
  if ($('jq')) $('jq').focus();
}
function jMist(qid) {
  var g = jg(), m = { id: 'm' + Date.now() + '-' + g.mistakes.length, paper: jSess.cp.split('.')[0], cp: jSess.cp, topic: jSess.tid, qid: qid, cat: '', why: '', at: today };
  g.mistakes.push(m); jSess.last = m.id;
}
function jAns(ok) {
  var g = jg(), qid = jV('jq').replace(/[<>"`]/g, '').slice(0, 40), r = g.cps[jSess.cp] = g.cps[jSess.cp] || {}, msg = '';
  var d = jAward(function () {
    if (qid) {
      r.q = r.q || {}; var prev = r.q[qid];
      if (ok) {
        if (prev === 'ok' || prev === 'fixed') { msg = 'Already solved: no extra progress. '; return; }
        if (prev === 'bad') { r.q[qid] = 'fixed'; g.mistakes.forEach(function (m) { if (m.cp === jSess.cp && m.qid === qid && !m.fixedAt) m.fixedAt = today; }); msg = 'Recovered! '; }
        else r.q[qid] = 'ok';
      } else { if (prev) { msg = 'Already logged. '; return; } r.q[qid] = 'bad'; jMist(qid); }
    } else { r.n = L.n(r.n) + 1; if (ok) r.ok = L.n(r.ok) + 1; else jMist(''); }
  }, true);
  if (ok) { jSess.ok++; toast(msg + (d > 0 ? '+' + d + ' XP · climbed' : '')); } else { jSess.bad++; if (msg) toast(msg); buzz([20, 40, 20]); }
  if ($('modal').style.display === 'flex' && !/ACHIEVEMENT|ACHIEVED|CLEARED|HARDENED/.test($('modal').innerHTML)) jSolveDraw(!ok);
}
function jWhy(cat) { var g = jg(), m = g.mistakes.filter(function (x) { return x.id === jSess.last; })[0]; if (!m) return; if (cat) m.cat = cat; var w = jV('jwhy'); if (w) m.why = w.replace(/[<>"`]/g, ''); save(); toast(cat ? 'Tagged: ' + cat : 'Note saved'); if (!cat) jSolveDraw(); }
function jBatch() {
  var o = Math.max(0, Math.round(L.n(jV('jbo')))), b = Math.max(0, Math.round(L.n(jV('jbb')))); if (!o && !b) return;
  var g = jg(), r = g.cps[jSess.cp] = g.cps[jSess.cp] || {};
  jAward(function () { r.n = L.n(r.n) + o + b; r.ok = L.n(r.ok) + o; for (var i = 0; i < b; i++) jMist(''); });
  jSess.ok += o; jSess.bad += b; jSolveDraw(b > 0);
}
function jCamp() {
  var g = jg(), open = g.mistakes.filter(function (m) { return !m.fixedAt; }), fixed = g.mistakes.length - open.length;
  modal('<img class="jpic" src="' + jImg('recover') + '" alt=""><h2>Recovery Camp</h2><div class="muted" style="margin:6px 0">' + open.length + ' open · ' + fixed + ' fixed. Solve one again correctly: +3 recovery XP.</div><div style="text-align:left;max-height:40vh;overflow:auto">' +
    (open.length ? open.slice().reverse().map(function (m) { var cp = J.cp(m.cp || '') || { name: '?' }; return '<div class="item"><span style="min-width:0"><b class="px">' + esc(cp.name) + '</b><br><span class="muted">' + esc((m.qid ? m.qid + ' · ' : '') + (m.cat || 'untagged') + (m.why ? ' · ' + m.why : '') + ' · ' + m.at) + '</span></span><button class="sm" onclick="jFix(\'' + m.id + '\')">Fixed ✓</button></div>'; }).join('') : '<div class="muted">Camp is empty. Nice.</div>') +
    '</div><button onclick="closeModal();jRe()">Close</button>');
}
function jFix(id) {
  var g = jg(); jAward(function () { g.mistakes.forEach(function (m) { if (m.id === id) { m.fixedAt = today; if (m.qid && g.cps[m.cp] && g.cps[m.cp].q) g.cps[m.cp].q[m.qid] = 'fixed'; } }); });
  if (!/ACHIEVEMENT|CLEARED|HARDENED/.test($('modal').innerHTML)) jCamp();
}

// ---------- dashboard ----------
function jTabGo(t) { jTab = t; if (stack[stack.length - 1] !== 'gate') go('gate'); else { R.gate(); window.scrollTo(0, 0); } }
function jGoTopic(cpId, tid) { var cp = J.cp(cpId); if (!cp) return; if (cpId.indexOf('ga.') === 0) return jTabGo('apt'); jSubj = cp.subj; jOpenT = tid; go('jsub'); }
function jQuest(i) { var q = jQ[i]; if (!q) return; if (q.kind === 'apt') jTabGo('apt'); else if (q.kind === 'mist') jCamp(); else if (q.kind === 'mock') { jPaper = q.paper; jTabGo('mock'); } else if (q.kind === 'road') { if (q.cp) jSolve(q.cp, ''); else jChap(q.ch); } else if (q.kind === 'backlog') jBacklog(); else jGoTopic(q.cp, q.id); }
var JV = {};
R.gate = function () {
  var g = jg(), an = jAll(), ap = J.apt(g, today), xp = J.xp(g, today);
  var tabs = [['over', 'Map'], ['apt', 'Aptitude'], ['ts', 'Tests'], ['mock', 'Mocks'], ['ana', 'Stats']]; if (!JV[jTab]) jTab = 'over';
  v('gate', '<div class="top"><button class="ghost" onclick="goBack()" aria-label="Back">' + ico('back', 24) + '</button><div style="flex:1;min-width:0"><h1 style="font-size:18px">GATE 2027 · THE FINAL CAMPAIGN</h1><div class="muted px">' + fmt(xp) + ' XP</div></div>' +
    '<button class="ghost" onclick="jSet()" aria-label="Journey settings">' + ico('gear', 20) + '</button></div>' +
    '<div class="jtabs">' + tabs.map(function (t) { return '<button class="' + (jTab === t[0] ? 'on' : '') + '" onclick="jTabGo(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') + '</div>' + JV[jTab](g, an, ap));
  if (jTab === 'over') jMapAfter('road');
};
function jAptChip(ap) {
  var hr = new Date().getHours(), img = ap.state === 'Completed' ? 'win' : ap.yMissed && !ap.today.n ? 'burnout' : hr >= 18 ? 'timeout' : 'study';
  var cls = ap.state === 'Completed' ? 'ok' : ap.yMissed ? 'neg' : 'warn', txt = ap.state === 'Completed' ? 'COMPLETED' : ap.yMissed && !ap.today.n ? 'MISSED YESTERDAY · RESTART' : 'PENDING';
  return '<div class="item" onclick="jTabGo(\'apt\')"><span class="row" style="gap:10px;align-items:center;flex:none"><img class="jth sm" src="' + jImg(img) + '" alt=""><span><b class="px">Daily aptitude</b><br><span class="muted">' + ap.today.n + '/' + ap.today.t + ' today · streak ' + ap.streak + '</span></span></span><b class="px ' + cls + '">' + txt + '</b></div>';
}
JV.over = function (g, an, ap) {
  var RD = jRD(), C = RD.ch[RD.cur], nx = J.roadNext(g, RD, 1)[0]; jQ = J.quests(g, an, ap, today, RD);
  return jRoadMap(RD, g, ap) +
    '<div class="panel"><div class="row" style="gap:10px;align-items:center" onclick="jChap(' + RD.cur + ')"><img class="jth" src="' + jImg(C.img) + '" alt=""><div style="flex:1;min-width:0"><div class="muted px">Chapter ' + (RD.cur + 1) + ' of ' + RD.ch.length + ' ▸</div>' +
      '<div class="px" style="font-size:16px">' + esc(C.name) + '</div><div class="muted">' + esc(jChWhy(C, RD)) + '</div></div></div>' + jB(C.prog, 'gold') + jNextHtml(nx) + jAptChip(ap) + '</div>' +
    (RD.backlog.length ? '<div class="panel" onclick="jBacklog()"><div class="row sp"><h3 style="margin:0">Backlog</h3><b class="px neg">' + RD.backlog.length + ' ▸</b></div><div class="muted">Left behind in earlier chapters. It counts the moment it is done.</div></div>' : '') +
    '<div class="panel"><h3>Today\'s quests</h3>' + (jQ.length ? jQ.map(function (q, i) { return '<div class="q todo" onclick="jQuest(' + i + ')" style="align-items:flex-start;flex-direction:column;gap:0;border-bottom:2px solid var(--panel2);padding:7px 0"><span>' + ico('dot') + '<b style="color:var(--tx)">' + esc(q.title) + '</b></span><span class="muted" style="padding-left:22px">' + esc(q.why) + '</span></div>'; }).join('') : '<div class="muted">All clear.</div>') + '</div>' +
    '<div class="panel"><h3>Mocks</h3>' + ['da', 'cs'].map(function (p) { var M = an[p].mock; return '<div class="item" onclick="jPaper=\'' + p + '\';jTabGo(\'mock\')"><span>' + J.NAME[p] + ' · ' + M.n + ' mock' + (M.n === 1 ? '' : 's') + '</span><b class="px">' + (M.gap == null ? 'NO ESTIMATE YET' : M.gap <= 0 ? 'AT TARGET' : M.gap + ' TO ' + an[p].target) + '</b></div>'; }).join('') + '</div>' +
    '<div class="muted" style="margin-bottom:14px">The map moves with your study records. Predicted marks come only from real mocks.</div>';
};
// The one next step of the current chapter, with a button that does it
function jNextHtml(nx) {
  if (!nx) return '';
  var row = function (lab, name, btn, on) { return '<div class="item" style="gap:8px"><span style="min-width:0"><span class="muted px">NEXT · ' + lab + '</span><br>' + esc(name) + '</span><button class="pri" style="flex:none;width:auto;margin:0;padding:8px 12px" onclick="' + on + '">' + btn + '</button></div>'; };
  if (nx.kind === 'topic') return row(J.STEPS[nx.step].toUpperCase(), J.T[nx.id].name, nx.step === 1 ? 'Grind' : nx.step === 4 ? 'Write note' : 'Mark done', 'jStep(\'' + nx.id + '\',' + nx.step + ')');
  if (nx.kind === 'cp') return row('ATTEMPT EVERY QUESTION', nx.name + ' · ' + nx.att + '/' + nx.bank, 'Log', 'jSolve(\'' + nx.cp + '\',\'\')');
  return row('HARDEN', 'Record a test or mock', 'Mock', 'jPaper=\'da\';jTabGo(\'mock\')');
}
// Subject (region) detail: checkpoints with their topic cards
var PRIOS = ['', '10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5', '4', '2', '1', '0'];
function jTopicCard(T, g) {
  var r = g.topics[T.id] || {}, st = T.st, cs = T.cs;
  return '<details class="jt" data-t="' + T.id + '"' + (jOpenT === T.id ? ' open' : '') + ' ontoggle="if(this.open)jOpenT=this.dataset.t"><summary><span style="min-width:0">' + esc(T.name) + '</span><span class="mb ms' + st.s + '">' + st.name + '</span></summary>' +
    '<div class="muted" style="margin:6px 0">Priority: ' + (T.prio == null ? 'Unrated' : T.prio + ' · ' + J.prioName(T.prio)) + (T.grade ? ' (your label ' + T.grade + ')' : '') + ' · open mistakes ' + st.open + '</div>' +
    '<label>Learning</label><div class="pick">' + LEARN.map(function (x, i) { return '<button class="' + (st.learn === i ? 'on' : '') + '" onclick="jSetT(\'' + T.id + '\',\'learn\',' + i + ')">' + x + '</button>'; }).join('') + '</div>' +
    '<div class="g2"><label>Priority<select onchange="jSetT(\'' + T.id + '\',\'prio\',this.value)">' + PRIOS.map(function (x) { return '<option value="' + x + '"' + (String(r.prio == null ? '' : r.prio) === x ? ' selected' : '') + '>' + (x === '' ? (J.T[T.id].prio == null ? 'Unrated' : 'Default ' + J.T[T.id].prio) : x + ' · ' + J.prioName(+x)) + '</option>'; }).join('') + '</select></label>' +
    '<label>Best topic test %<input inputmode="decimal" value="' + esc(r.test == null ? '' : r.test) + '" onchange="jSetT(\'' + T.id + '\',\'test\',this.value)"></label>' +
    '<label>Topic tests taken<input inputmode="numeric" value="' + esc(r.tests == null ? '' : r.tests) + '" onchange="jSetT(\'' + T.id + '\',\'tests\',this.value)"></label>' +
    '<label>Last revision<input type="date" value="' + esc(r.rev || '') + '" onchange="jSetT(\'' + T.id + '\',\'rev\',this.value)"></label></div>' +
    '<div class="muted">GATE Grind questions: ' + cs.solved + '/' + cs.bank + ' · attempted ' + cs.att + ' · accuracy ' + jP(cs.acc) + '</div>' +
    '<label>Notes<input value="' + esc(r.notes || '') + '" onchange="jSetT(\'' + T.id + '\',\'notes\',this.value)"></label>' +
    '<div class="row"><button class="pri" onclick="jSolve(\'' + T.cp + '\',\'' + T.id + '\')">Solve</button><button onclick="jSetT(\'' + T.id + '\',\'rev\',today)">Revised today</button></div></details>';
}
function jSetT(tid, k, x) {
  var g = jg(), r = g.topics[tid] = g.topics[tid] || {}, before = L.n(r.test); jOpenT = tid;
  if (k === 'test' || k === 'tests' || k === 'prio') x = J.nn(x);
  if (k === 'test' && x != null) x = Math.max(0, Math.min(100, x));
  if (k === 'rev' && !/^\d{4}-\d{2}-\d{2}$/.test(x || '')) x = null;
  if (k === 'notes') x = String(x || '').replace(/[<>"`]/g, '');
  jAward(function () { if (x == null || x === '') delete r[k]; else r[k] = x; if (k === 'test' && x >= 60 && before < 60) return jLoot('TOPIC BOSS DEFEATED', J.T[tid].name, tid, 'boss'); });
  jRe();
}
function jCpSet(id, k, x) {
  var g = jg(), r = g.cps[id] = g.cps[id] || {}, was = r.passed;
  jAward(function () {
    if (k === 'passed') { r.passed = !r.passed; r.at = today; if (r.passed && !was) return jLoot('CHECKPOINT CLEARED', J.cp(id).name, id, 'win'); }
    if (k === 'bank') { x = J.nn(x); if (x > 0) r.bank = Math.round(x); else delete r.bank; }
  });
  jRe();
}
R.jsub = function () {
  var g = jg(), p = jSubj.split('.')[0], A = J.analyze(g, p, today), S = A.subjects.filter(function (s) { return s.key === jSubj; })[0]; if (!S) return v('jsub', hdr('REGION'));
  var b = g.base[S.key] || {};
  v('jsub', hdr(esc(S.region.toUpperCase())) + '<div class="panel"><div class="muted px">' + J.NAME[p] + ' · ' + esc(S.name) + ' · ~' + S.marks + ' marks</div>' +
    '<div class="g3" style="margin-top:8px"><div><div class="muted">Climbed</div><b class="px">' + jP(S.prog) + '</b></div><div><div class="muted">Questions</div><b class="px">' + S.att + '/' + S.bank + '</b></div><div><div class="muted">Accuracy</div><b class="px">' + jP(S.acc) + '</b></div></div>' +
    '<div class="muted" style="margin-top:6px">Region boss: ' + (S.boss ? '<b class="ok">DEFEATED</b>' : 'pass a subject test ≥ 60% (Test Series)') + '</div>' +
    '<details style="margin-top:8px"><summary class="muted px">Baseline before the app: ' + (b.pyq || b.ok || b.bad ? (J.base(g, S.key).att + ' questions') : 'none') + '</summary>' + aBaseHtml(S.key) + '<button onclick="aReadBase(\'' + S.key + '\');save();toast(\'Saved\');R.jsub()">Save baseline</button></details></div>' +
    S.cps.map(function (cs) {
      var cp = J.cp(cs.id);
      return '<div class="panel"><div class="row sp" style="align-items:flex-start;gap:8px"><b class="px" style="font-size:15px;flex:1">' + esc(cp.name) + '</b><label style="flex:none;display:flex;gap:6px;align-items:center">GRIND PASSED<input type="checkbox"' + (cs.passed ? ' checked' : '') + ' onchange="jCpSet(\'' + cs.id + '\',\'passed\')"></label></div>' +
        (cp.subs.length ? '<div class="muted" style="font-size:12px">' + cp.subs.map(esc).join(' · ') + '</div>' : '') +
        '<div class="row sp" style="margin-top:6px"><span class="muted">Solved ' + cs.solved + '/' + cs.bank + (cs.bankKnown ? '' : ' (bank size unknown: set it)') + ' · acc ' + jP(cs.acc) + '</span></div>' + jB(cs.cov, 'gold') +
        (cs.bankKnown && cp.bank ? '' : '<label>Bank size on GATE Grind<input inputmode="numeric" value="' + esc((g.cps[cs.id] || {}).bank || '') + '" placeholder="30" onchange="jCpSet(\'' + cs.id + '\',\'bank\',this.value)"></label>') +
        S.topics.filter(function (t) { return t.cp === cs.id; }).map(function (t) { return jTopicCard(t, g); }).join('') +
        '<button onclick="jSolve(\'' + cs.id + '\',\'\')">Solve questions here</button></div>';
    }).join(''));
};

// ---------- aptitude ----------
JV.apt = function (g, an, ap) {
  var hr = new Date().getHours(), img = ap.state === 'Completed' ? 'win' : ap.yMissed && !ap.today.n ? 'burnout' : hr >= 18 ? 'timeout' : 'study', cells = '';
  for (var i = 27; i >= 0; i--) { var d = L.addDays(today, -i), x = J.aptDay(g, d), c = d < (g.start || today) ? '' : x.n >= x.t ? 't3' : d === today ? '' : 'bad'; cells += '<i class="' + c + (i === 0 ? ' now' : '') + '" title="' + d + '"></i>'; }
  return '<img class="jpic" src="' + jImg(img) + '" alt=""><div class="panel"><div class="row sp"><h3 style="margin:0">Daily aptitude quest</h3><b class="px ' + (ap.state === 'Completed' ? 'ok' : 'warn') + '">' + ap.state.toUpperCase() + '</b></div>' +
    '<div class="big">' + ap.today.n + '<small class="muted" style="font-size:16px"> / ' + ap.today.t + '</small></div>' + bar(pct(ap.today.n, ap.today.t)) +
    (ap.yMissed && ap.state !== 'Completed' ? '<div class="neg" style="margin:6px 0">Yesterday ended without the target: streak reset. Every question you solved before is still counted. Restart today.</div>' : '') +
    '<div class="g3 ctr" style="margin-top:8px"><div><div class="muted">Streak</div><b class="px">' + ap.streak + 'd</b></div><div><div class="muted">Best</div><b class="px">' + ap.best + 'd</b></div><div><div class="muted">Accuracy</div><b class="px">' + jP(ap.acc) + '</b></div></div></div>' +
    '<div class="panel"><h3>Log a session</h3><div class="g3">' + jIn('ja_n', 'Questions', '', '20') + jIn('ja_ok', 'Correct', '', '') + jIn('ja_min', 'Minutes', '', 'timed') + '</div>' +
    '<label>Category<select id="ja_c">' + J.APT.map(function (a, i) { return '<option value="' + i + '">' + (i + 1) + '. ' + a[0] + '</option>'; }).join('') + '</select></label><button class="pri" onclick="jAptAdd()">' + ico('check', 16) + 'Add session</button>' +
    '<button onclick="jOpen(J.LINKS.apt)">Open GATE Grind aptitude ↗</button></div>' +
    '<div class="panel"><h3>Last 4 weeks</h3><div class="cal">' + cells + '</div><div class="legend muted"><span><i style="background:var(--acc)"></i>done</span><span><i style="background:var(--bad)"></i>missed</span></div></div>' +
    '<div class="panel"><h3>Categories (shared by DA and CS)</h3>' + ap.cats.map(function (c) { return '<div class="item"><span style="min-width:0">' + esc(c.name) + '<br><span class="muted">' + c.n + '/' + c.bank + ' · acc ' + jP(c.acc) + '</span></span><b class="px">' + jP(c.cov) + '</b></div>'; }).join('') + '</div>' +
    '<div class="panel"><h3>Your 15 GA topics</h3>' + J.GA.topics.map(function (t) { var r = g.topics[t] || {}, l = L.n(r.learn); return '<div class="item"><span>' + esc(J.T[t].name) + '</span><span class="pick" style="flex:none">' + LEARN.map(function (x, i) { return '<button class="sm ' + (l === i ? 'on' : '') + '" onclick="jSetT(\'' + t + '\',\'learn\',' + i + ')">' + x + '</button>'; }).join('') + '</span></div>'; }).join('') + '</div>' +
    '<div class="panel">' + jIn('ja_t', 'Daily target (questions)', g.apt.target, '20') + '<button onclick="jAptTarget()">Save target</button></div>';
};
function jAptAdd() {
  var nq = Math.round(L.n(jV('ja_n'))), ok = Math.round(L.n(jV('ja_ok'))), mn = L.n(jV('ja_min')), c = jV('ja_c');
  if (!(nq > 0)) return toast('How many questions?'); if (ok > nq) return toast('Correct can\'t exceed questions');
  var g = jg(), was = J.apt(g, today).state;
  jAward(function () {
    g.start = g.start || today;
    var d = g.apt.days[today] = g.apt.days[today] || { n: 0, ok: 0, min: 0, cat: {}, t: g.apt.target };
    d.n += nq; d.ok += Math.max(0, ok); d.min += Math.max(0, mn); d.cat = d.cat || {}; var x = d.cat[c] || [0, 0]; d.cat[c] = [x[0] + nq, x[1] + Math.max(0, ok)];
    if (was !== 'Completed' && d.n >= d.t) return { modal: function () { buzz([30, 50, 30]); modal('<img class="jpic" src="' + jImg('win') + '" alt=""><div class="ring gold" style="font-size:26px">APTITUDE DONE</div><div class="muted">The bridge grows a plank. Streak ' + J.apt(g, today).streak + ' days.</div><button class="pri" onclick="closeModal();jRe()">Continue</button>'); } };
  });
  jRe();
}
function jAptTarget() { var x = Math.round(L.n(jV('ja_t'))); if (!(x > 0)) return; var g = jg(); g.apt.target = x; if (g.apt.days[today]) g.apt.days[today].t = x; save(); toast('Target ' + x); jRe(); }

// ---------- test series (Question Set 2 + your own tests) ----------
JV.ts = function (g) {
  var tests = J.gcTests(), done = function (t) { return t.subj === 'mock' ? g.mocks.da.some(function (m) { return m.src === t.id; }) : !!(g.tests[t.id] || {}).done; };
  var own = Object.keys(g.tests).filter(function (id) { return id.indexOf('gc.') !== 0; });
  var nd = tests.filter(done).length;
  return '<div class="panel"><h3>GO Classes · GATE DA test series</h3><div class="big">' + nd + '<small class="muted" style="font-size:16px"> / 88</small></div>' + bar(pct(nd, 88)) +
    '<div class="muted">' + J.GC_AD + ' Opening the site never marks a test done.</div><button onclick="jOpen(J.LINKS.gc)">Open GO Classes ↗</button></div>' +
    J.GC.map(function (gr, i) {
      var ts = tests.filter(function (t) { return t.group === i; }), c = ts.filter(done).length;
      return '<details class="panel"><summary class="row sp"><b class="px">' + esc(gr[0]) + '</b><span class="px">' + c + '/' + gr[1] + '</span></summary>' + ts.map(function (t) {
        var r = g.tests[t.id] || {}, mk = t.subj === 'mock' ? g.mocks.da.filter(function (m) { return m.src === t.id; })[0] : null, pc = r.score != null && r.max ? Math.round(r.score / r.max * 100) : null;
        return '<div class="item" onclick="' + (mk ? 'jMock(\'da\',' + g.mocks.da.indexOf(mk) + ')' : t.subj === 'mock' ? 'jMock(\'da\',-1,\'' + t.id + '\')' : 'jTest(\'' + t.id + '\')') + '"><span>' + esc(r.name || t.name) + (r.kind === 'subject' ? ' <span class="chip">subject</span>' : '') + '</span><b class="px ' + (done(t) ? 'ok' : 'muted') + '">' +
          (mk ? esc(mk.score) + '/100' : r.done ? (pc != null ? pc + '%' : 'DONE') + (r.reviewed ? ' ✓' : '') : '—') + '</b></div>';
      }).join('') + '</details>';
    }).join('') +
    '<div class="panel"><h3>Your own tests (any paper, any source)</h3>' + (own.length ? own.map(function (id) { var r = g.tests[id]; return '<div class="item" onclick="jTest(\'' + id + '\')"><span>' + esc(r.name || 'Test') + ' <span class="muted">' + J.NAME[r.paper] + ' · ' + esc(r.kind || 'topic') + '</span></span><b class="px">' + (r.score != null && r.max ? Math.round(r.score / r.max * 100) + '%' : '—') + '</b></div>'; }).join('') : '<div class="muted">None yet.</div>') +
    '<button onclick="jTest(\'\')">' + ico('plus', 16) + 'Add a test</button></div>';
};
function jTest(id) {
  var g = jg(), gc = id.indexOf('gc.') === 0, r = id ? g.tests[id] || {} : { paper: jPaper, kind: 'topic' }, t = gc ? J.gcTests().filter(function (x) { return x.id === id; })[0] : null;
  var subjOpts = function (p) { return J.P[p].map(function (s) { return '<option value="' + s.id + '"' + (r.subj === s.id ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join(''); };
  modal('<h2>' + esc(gc ? t.name : id ? r.name : 'New test') + '</h2><div style="text-align:left;margin-top:10px">' +
    (gc ? '' : jIn('jt_name', 'Name', r.name || '', 'e.g. ME CS OS test 3', 'text') + '<div class="g2"><label>Paper<select id="jt_p" onchange="jTestP(this.value)"><option value="da"' + (r.paper === 'da' ? ' selected' : '') + '>GATE DA</option><option value="cs"' + (r.paper === 'cs' ? ' selected' : '') + '>GATE CS</option></select></label><label>Subject<select id="jt_s">' + subjOpts(r.paper || 'da') + '</select></label></div>') +
    (gc && t.subj === 'rf' || gc && t.subj === 'ga' ? '' : '<label>Kind<select id="jt_k"><option value="topic"' + (r.kind !== 'subject' ? ' selected' : '') + '>Topic-wise test</option><option value="subject"' + (r.kind === 'subject' ? ' selected' : '') + '>Subject-wise test (region boss)</option></select></label>') +
    '<label class="item" style="text-transform:none;font-size:15px;color:var(--tx)"><span>Attempted</span><input type="checkbox" id="jt_done"' + (r.done || !g.tests[id] ? ' checked' : '') + '></label>' +
    '<div class="g3">' + jIn('jt_sc', 'Score', r.score) + jIn('jt_mx', 'Out of', r.max) + jIn('jt_acc', 'Accuracy %', r.acc) + jIn('jt_ok', 'Correct', r.ok) + jIn('jt_bad', 'Incorrect', r.bad) + jIn('jt_skip', 'Unattempted', r.skip) + jIn('jt_min', 'Minutes', r.min) + '</div>' +
    '<label>Mistake notes<textarea id="jt_note">' + esc(r.notes || '') + '</textarea></label><label class="item" style="text-transform:none;font-size:15px;color:var(--tx)"><span>Reviewed (mistakes analysed)</span><input type="checkbox" id="jt_rev"' + (r.reviewed ? ' checked' : '') + '></label></div>' +
    '<button class="pri" onclick="jTestSave(\'' + id + '\')">Save</button>' + (id ? '<button onclick="jTestDel(\'' + id + '\')">' + (gc ? 'Clear result' : 'Delete') + '</button>' : '') + '<button onclick="closeModal()">Cancel</button>');
}
function jTestP(p) { $('jt_s').innerHTML = J.P[p].map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + '</option>'; }).join(''); }
function jTestSave(id) {
  var g = jg(), gc = id.indexOf('gc.') === 0, r = {}, sc = jNum('jt_sc'), mx = jNum('jt_mx');
  if (sc !== '' && mx !== '' && sc > mx) return toast('Score is more than the maximum');
  if (!id) id = 'x' + Date.now();
  var old = g.tests[id] || {};
  if (!gc) { r.name = jV('jt_name').replace(/[<>"`]/g, '') || 'Test'; r.paper = jV('jt_p'); r.subj = jV('jt_s'); }
  if ($('jt_k')) r.kind = jV('jt_k');
  r.done = $('jt_done').checked || sc !== ''; // a score means it was attempted
  r.reviewed = $('jt_rev').checked; r.notes = jV('jt_note').replace(/[<>"`]/g, ''); r.at = old.at || today;
  ['sc:score', 'mx:max', 'acc:acc', 'ok:ok', 'bad:bad', 'skip:skip', 'min:min'].forEach(function (k) { var a = k.split(':'), x = jNum('jt_' + a[0]); if (x !== '') r[a[1]] = Math.max(0, x); });
  var wasBoss = old.kind === 'subject' && old.max && old.score / old.max >= .6, isBoss = r.kind === 'subject' && r.done && r.max && r.score / r.max >= .6;
  closeModal();
  jAward(function () { g.tests[id] = r; if (isBoss && !wasBoss) { var s = gc ? J.GC[+id.split('.')[1]][0] : r.name; return jLoot('REGION BOSS DEFEATED', s, id, 'boss'); } });
  jRe();
}
function jTestDel(id) { if (!confirm('Delete this test result?')) return; var g = jg(); closeModal(); jAward(function () { delete g.tests[id]; }); jRe(); }

// ---------- mock arena ----------
function jChart(M, target) {
  if (M.n < 2) return '<div class="muted">The trend chart appears after 2 mocks.</div>';
  var w = 320, h = 150, sx = function (i) { return 24 + i * (w - 34) / (M.n - 1); }, sy = function (s) { return h - 18 - Math.max(0, Math.min(100, s)) / 100 * (h - 30); };
  var pts = M.scores.map(function (s, i) { return sx(i) + ',' + sy(s); }).join(' '), ty = sy(target);
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:auto;display:block"><rect width="' + w + '" height="' + h + '" fill="#0a0c0a"/>' +
    [0, 25, 50, 75, 100].map(function (v0) { return '<line x1="22" x2="' + (w - 6) + '" y1="' + sy(v0) + '" y2="' + sy(v0) + '" stroke="#1f271c"/><text x="2" y="' + (sy(v0) + 4) + '" class="jlab2">' + v0 + '</text>'; }).join('') +
    '<line x1="22" x2="' + (w - 6) + '" y1="' + ty + '" y2="' + ty + '" stroke="#f2c14e" stroke-dasharray="6 4"/><text x="' + (w - 70) + '" y="' + (ty - 4) + '" class="jlab2" fill="#f2c14e">target ' + target + '</text>' +
    (M.med5 != null ? '<line x1="22" x2="' + (w - 6) + '" y1="' + sy(M.med5) + '" y2="' + sy(M.med5) + '" stroke="#7fa7d9" stroke-dasharray="2 4"/>' : '') +
    '<polyline points="' + pts + '" fill="none" stroke="#9bd35a" stroke-width="3"/>' + M.scores.map(function (s, i) { return '<rect x="' + (sx(i) - 3) + '" y="' + (sy(s) - 3) + '" width="6" height="6" fill="#e8eddc"/>'; }).join('') + '</svg>' +
    '<div class="legend muted"><span><i style="background:#9bd35a"></i>score</span><span><i style="background:#f2c14e"></i>target</span><span><i style="background:#7fa7d9"></i>latest-5 median</span></div>';
}
JV.mock = function (g, an) {
  var A = an[jPaper], M = A.mock;
  return jPT('R.gate()') + '<img class="jpic" src="' + jImg('boss') + '" alt=""><div class="panel"><div class="row sp"><h3 style="margin:0">' + J.NAME[jPaper] + ' Mock Arena · target ' + A.target + '+</h3><span class="muted px">' + M.n + ' mocks</span></div>' +
    '<div class="g3" style="margin-top:10px">' + [['Latest', M.latest], ['Average', M.avg], ['Median', M.median], ['Best', M.best], ['Latest-5 median', M.med5], ['Trend /mock', M.slope == null ? null : (M.slope > 0 ? '+' : '') + M.slope]].map(function (x) { return '<div><div class="muted" style="font-size:12px">' + x[0] + '</div><b class="px">' + jN(x[1]) + '</b></div>'; }).join('') + '</div>' +
    '<div class="row sp" style="margin-top:10px"><span>Estimate</span><b class="px">' + (M.est == null ? 'INSUFFICIENT DATA' : M.est + ' · ' + M.conf) + '</b></div><div class="row sp"><span>Distance to ' + A.target + '</span><b class="px ' + (M.gap != null && M.gap <= 0 ? 'ok' : 'neg') + '">' + (M.gap == null ? '—' : M.gap <= 0 ? 'ON TARGET' : M.gap + ' marks') + '</b></div>' +
    '<div style="margin-top:10px">' + jChart(M, A.target) + '</div><button class="pri" onclick="jMock(\'' + jPaper + '\',-1)">' + ico('plus', 16) + 'Record a full mock</button></div>' +
    '<div class="panel"><h3>History (never merged with ' + (jPaper === 'da' ? 'CS' : 'DA') + ')</h3>' + (M.n ? g.mocks[jPaper].map(function (m, i) { return { m: m, i: i }; }).sort(function (a, b) { return (b.m.date || '') < (a.m.date || '') ? -1 : 1; }).map(function (x) {
      var m = x.m; return '<div class="item" onclick="jMock(\'' + jPaper + '\',' + x.i + ')"><span>' + esc(m.date || '?') + ' · #' + esc(m.no || '') + '<br><span class="muted">GA ' + jN(m.ga) + '/15 · subject ' + jN(m.subj) + '/85 · acc ' + (m.acc != null && m.acc !== '' ? esc(m.acc) + '%' : '—') + (m.neg ? ' · −' + esc(m.neg) : '') + '</span></span><b class="px">' + esc(m.score) + '</b></div>';
    }).join('') : '<div class="muted">No mocks yet. 3 are needed for any estimate.</div>') + '</div>';
};
function jMock(p, i, src) {
  var g = jg(), m = i >= 0 ? g.mocks[p][i] : { date: today, no: g.mocks[p].length + 1, src: src || '' };
  modal('<h2>' + J.NAME[p] + ' mock ' + (i >= 0 ? '#' + esc(m.no) : '') + '</h2>' + (m.src ? '<div class="muted">' + esc((J.gcTests().filter(function (t) { return t.id === m.src; })[0] || {}).name || m.src) + '</div>' : '') + '<div style="text-align:left;margin-top:10px"><div class="g2">' +
    '<label>Date<input id="jm_date" type="date" value="' + esc(m.date || today) + '"></label>' + jIn('jm_no', 'Mock number', m.no) + '</div><div class="g3">' + jIn('jm_score', 'Score /100', m.score) + jIn('jm_ga', 'GA /15', m.ga) + jIn('jm_subj', 'Subject /85', m.subj) +
    jIn('jm_ok', 'Correct', m.ok) + jIn('jm_bad', 'Incorrect', m.bad) + jIn('jm_skip', 'Unattempted', m.skip) + jIn('jm_acc', 'Accuracy %', m.acc) + jIn('jm_min', 'Minutes', m.min) + jIn('jm_neg', 'Negative lost', m.neg) + '</div>' +
    jIn('jm_weak', 'Weakest subjects', m.weak, 'e.g. ML, Calculus', 'text') + jIn('jm_cats', 'Mistake categories', m.cats, 'e.g. time pressure, silly', 'text') + jParts(p, m) + '</div>' +
    '<button class="pri" onclick="jMockSave(\'' + p + '\',' + i + ',\'' + esc(m.src || '') + '\')">Save mock</button>' + (i >= 0 ? '<button onclick="jMockDel(\'' + p + '\',' + i + ')">Delete</button>' : '') + '<button onclick="closeModal()">Cancel</button>');
}
function jMockSave(p, i, src) {
  var g = jg(), sc = jNum('jm_score'), ga = jNum('jm_ga'), sj = jNum('jm_subj');
  if (sc === '' || sc < -33 || sc > 100) return toast('Score must be between -33 and 100');
  if (ga !== '' && ga > 15) return toast('GA is out of 15'); if (sj !== '' && sj > 85) return toast('Subject is out of 85');
  var m = { date: /^\d{4}-\d{2}-\d{2}$/.test(jV('jm_date')) ? jV('jm_date') : today, no: jNum('jm_no'), score: sc, src: src };
  ['ga', 'subj', 'ok', 'bad', 'skip', 'acc', 'min', 'neg'].forEach(function (k) { var x = jNum('jm_' + k); if (x !== '') m[k] = k === 'neg' ? Math.abs(x) : x; });
  m.weak = jV('jm_weak').replace(/[<>"`]/g, ''); m.cats = jV('jm_cats').replace(/[<>"`]/g, '');
  var pt = jPartsRead(p); if (Object.keys(pt).length) m.parts = pt;
  closeModal();
  jAward(function () { if (i >= 0) g.mocks[p][i] = m; else g.mocks[p].push(m); return { msg: 'Mock saved · boss fight logged' }; });
  jRe();
}
function jMockDel(p, i) { if (!confirm('Delete this mock?')) return; var g = jg(); closeModal(); jAward(function () { g.mocks[p].splice(i, 1); }); jRe(); }

// ---------- analytics, roadmap, rewards ----------
JV.ana = function (g, an, ap) {
  var xp = J.xp(g, today), coins = J.coins(g, xp), inv = J.inventory(g), ach = J.achievements(g, an, ap);
  var plan = function (p) { var P = J.plan(g, an[p], today); return '<div class="panel"><h3>' + J.NAME[p] + ' roadmap' + (P.weeks ? ' · ' + P.weeks + ' weeks left' : ' · set exam date for a countdown') + '</h3>' +
    '<b class="px">Milestones</b>' + P.milestones.map(function (x) { return '<div class="q todo"><span>' + ico('flag') + esc(x) + '</span></div>'; }).join('') +
    '<b class="px">This week</b>' + P.week.map(function (x) { return '<div class="q todo"><span>' + ico('dot') + esc(x) + '</span></div>'; }).join('') +
    '<b class="px">Mock schedule</b><div class="muted">' + esc(P.mocks) + '</div><b class="px">Revise next</b><div class="muted">' + (P.revision.length ? P.revision.map(esc).join(' · ') : 'Nothing due.') + '</div></div>'; };
  var subj = '<div class="panel"><h3>Subjects</h3>' + ['da', 'cs'].map(function (p) { return '<div class="muted px" style="margin-top:6px">' + J.NAME[p] + '</div>' + an[p].subjects.map(function (S) { return '<div class="item" onclick="jSubj=\'' + S.key + '\';go(\'jsub\')"><span>' + esc(S.name) + '</span><b class="px">' + S.att + '/' + S.bank + ' · ' + jP(S.acc) + '</b></div>'; }).join(''); }).join('') + '<div class="muted">Questions attempted · accuracy. Tap a subject for bank sizes and topic details.</div></div>';
  return '<img class="jpic" src="' + jImg('analytics') + '" alt="">' + subj + jDiag(an.da) + plan('da') + jDiag(an.cs) + plan('cs') +
    '<div class="panel"><div class="row sp"><h3 style="margin:0">Achievements</h3><span class="muted px">' + ach.filter(function (a) { return a[2]; }).length + ' / ' + ach.length + '</span></div><div class="ach" style="margin-top:10px">' + ach.map(function (a) { return '<div class="' + (a[2] ? '' : 'lock') + '">' + ico(a[0]) + '<span>' + a[1] + '</span></div>'; }).join('') + '</div></div>' +
    '<div class="panel"><h3>Inventory · ' + inv.length + ' items</h3>' + (inv.length ? '<div class="chips">' + inv.map(function (x) { return '<span class="chip ' + (x.rare ? 'on' : '') + '">' + esc(x.item) + (x.rare ? ' ★' : '') + '</span>'; }).join('') + '</div>' : '<div class="muted">Clear checkpoints and beat bosses for loot. Loot is cosmetic.</div>') + '</div>' +
    '<div class="panel"><div class="row sp"><h3 style="margin:0">Reward shop</h3><b class="px warn">' + coins + ' coins</b></div><div class="muted" style="margin:4px 0 8px">10 XP = 1 coin. XP comes only from study records. Rewards never fix a missed milestone.</div>' +
    g.shop.map(function (s) { return '<div class="item"><span>' + esc(s.name) + '</span><span class="row" style="flex:none;gap:6px;align-items:center"><b class="px">' + s.cost + 'c</b><button class="sm" onclick="jBuy(\'' + s.id + '\')">Redeem</button><button class="sm ghost" onclick="jShopDel(\'' + s.id + '\')">' + ico('x', 14) + '</button></span></div>'; }).join('') +
    '<div class="g2" style="margin-top:8px">' + jIn('js_n', 'Reward', '', 'e.g. new game', 'text') + jIn('js_c', 'Cost (coins)', '', '50') + '</div><button onclick="jShopAdd()">Add reward</button>' +
    (g.spent.length ? '<h3 style="margin-top:10px">Redeemed</h3>' + g.spent.slice(-5).reverse().map(function (s) { return '<div class="item"><span>' + esc(s.name) + '</span><span class="muted">' + esc(s.at) + ' · ' + s.cost + 'c</span></div>'; }).join('') : '') + '</div>';
};
function jBuy(id) { var g = jg(), s = g.shop.filter(function (x) { return x.id === id; })[0], c = J.coins(g, J.xp(g, today)); if (!s) return; if (c < s.cost) return toast('Need ' + (s.cost - c) + ' more coins'); if (!confirm('Redeem "' + s.name + '" for ' + s.cost + ' coins?')) return; g.spent.push({ id: s.id, name: s.name, cost: s.cost, at: today }); save(); toast('Enjoy: ' + s.name); jRe(); }
function jShopAdd() { var n0 = jV('js_n').replace(/[<>"`]/g, ''), c = Math.round(L.n(jV('js_c'))); if (!n0 || !(c > 0)) return toast('Name and cost please'); jg().shop.push({ id: 's' + Date.now(), name: n0, cost: c }); save(); jRe(); }
function jShopDel(id) { var g = jg(); g.shop = g.shop.filter(function (x) { return x.id !== id; }); save(); jRe(); }

// ---------- settings: exam dates, targets, import/export ----------
function jSet() {
  var g = jg();
  modal('<h2>Journey settings</h2><div style="text-align:left;margin-top:10px"><div class="g2"><label>DA exam date<input id="je_da" type="date" value="' + esc(g.exam.da) + '"></label><label>CS exam date<input id="je_cs" type="date" value="' + esc(g.exam.cs) + '"></label>' +
    jIn('je_tda', 'DA target', g.target.da) + jIn('je_tcs', 'CS target', g.target.cs) + '</div><div class="muted">Check the official GATE 2027 schedule for dates.</div>' +
    '<button class="pri" onclick="jSetSave()">Save</button><button onclick="closeModal();rsI=0;go(\'rstart\')">Chapter start questions</button>' +
    '<button onclick="A.copy(JSON.stringify(jg()));toast(\'Journey copied\')">Copy Journey data</button><textarea id="je_imp" placeholder="Paste Journey data to import a baseline"></textarea><button onclick="jImport()">Import Journey data</button>' +
    '<button onclick="jReset()" style="color:var(--bad)">Reset Journey</button>' + (Array.isArray(D.gateBak) && D.gateBak.length ? '<button onclick="jUndoReset()">Undo reset (backup ' + esc(D.gateBak[D.gateBak.length - 1].at) + ')</button>' : '') +
    '<div class="muted">The full app backup (Me → Backup) already includes the Journey.</div></div><button onclick="closeModal()">Close</button>');
}
function jSetSave() {
  var g = jg(); ['da', 'cs'].forEach(function (p) { var d = jV('je_' + p); g.exam[p] = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : ''; var t = jNum('je_t' + p); if (t > 0 && t <= 100) g.target[p] = t; });
  save(); closeModal(); toast('Saved'); jRe();
}
function jImport() {
  var o; try { o = L.sanitize({ profile: {}, days: {}, gate: JSON.parse(jV('je_imp')) }).gate; } catch (e) { return toast('Not Journey data'); }
  if (!o || typeof o !== 'object' || !confirm('Replace your Journey records with this data? Fitness data is not touched.')) return;
  autoBackup('before journey import', true);
  D.gate = J.ensure(o); save(); closeModal(); toast('Journey imported'); jRe();
}

// ---------- v2.9 roadmap campaign: chapter map, chapter screen, quick start ----------
var jCh = 0, rsI = 0;
function jRD() { return J.road(jg(), today); }
var CHCOL = ['#283147', '#2a2418', '#3a2d1c', '#15331f', '#183a40', '#36223e', '#2d3a22', '#3a3221', '#3d1818'];
var CHPROP = ['peak', 'tent', 'gear', 'tree', 'lab', 'castle', 'tree', 'city', 'arena'];
function jRoadMap(RD, g, ap) {
  var W = 360, base = 90, top = 110, hb = RD.ch.map(function (C) { return C.kind === 'learn' ? 120 + 34 * C.da.length : 130; });
  var H = base + top + hb.reduce(function (a, b) { return a + b; }, 0), y = H - base, s = '', labels = '', trail = [[125, H - 30]], rnd = jRnd(17), bands = [];
  var band = function (y0, y1, col, th, label, info, lock, ly) {
    var o = '<rect x="0" y="' + y0 + '" width="' + W + '" height="' + (y1 - y0) + '" fill="' + col + '"' + (lock ? ' opacity=".45"' : '') + '/><rect x="0" y="' + y0 + '" width="' + W + '" height="3" fill="#050705" opacity=".5"/>';
    for (var yy = y0 + 72; yy < y1 - 8; yy += 56) o += jProp(th, Math.round(26 + rnd() * 18), yy); // left column only: labels and trails own the rest
    ly = ly || y0; labels += '<text x="8" y="' + (ly + 16) + '" class="jlab">' + esc(label) + '</text>' + (info ? '<text x="8" y="' + (ly + 30) + '" class="jlab2">' + esc(info) + '</text>' : '');
    return o;
  };
  s += band(H - base, H, '#2a2418', '', 'BASE CAMP', g.road.start ? 'start done ' + g.road.start : 'tap to answer the start questions');
  var bl = {}; RD.backlog.forEach(function (b) { bl[b.ch] = (bl[b.ch] || 0) + 1; });
  var flagCol = function (done, tot, lock) { return lock ? '#3a3f38' : tot && done === tot ? '#f2c14e' : done ? '#7fa7d9' : '#8a9580'; };
  var nodes = '', side = '';
  RD.ch.forEach(function (C, i) {
    var y1 = y, y0 = y - hb[i], lock = !C.open; y = y0; bands.push([y0, y1, CHCOL[i]]);
    var info = C.kind === 'real' ? Math.round(RD.real.da.pct * 100) + '% of DA banks attempted' : C.kind === 'hard' ? (RD.summit ? 'SUMMIT RULE MET' : 'tests + mocks move each subject') :
      C.kind === 'wrap' ? (C.total ? C.total + ' DA topics left' : 'nothing left') : (C.kind === 'learn' ? jBuckets(C) : C.done + '/' + C.total + ' notes') + (C.cs.length ? ' · CS ' + C.csDone + '/' + C.csTotal : '');
    s += '<g onclick="jChap(' + i + ')">' + band(y0, y1, CHCOL[i], CHPROP[i], (i + 1) + '. ' + C.name.toUpperCase() + (C.cleared ? ' ✓' : C.skipped ? ' (SKIPPED)' : ''), info, lock) + '</g>';
    var pts = C.kind === 'learn' ? C.da.map(function (l, j) { return [Math.round(125 + 40 * Math.sin((i * 3 + j) * 1.1)), Math.round(y1 - 46 - j * (hb[i] - 110) / Math.max(1, C.da.length - 1))]; }) : [[Math.round(125 + 35 * Math.sin(i * 1.7)), Math.round((y0 + y1) / 2 + 10)]];
    pts.forEach(function (q, j) {
      trail.push(q);
      var h;
      if (C.kind === 'learn') { var l = C.da[j], kk = function (k) { return l.topics.filter(function (t) { return RD.steps(t).k >= k; }).length; }, d = kk(3), g2 = kk(2), c1 = kk(1), n0 = l.topics.length || 1, bx = q[0] + 16, bw = 84;
        var seg = function (a, b, c) { return b > a ? '<rect x="' + (bx + Math.round(a / n0 * bw)) + '" y="' + (q[1] - 1) + '" width="' + Math.max(1, Math.round((b - a) / n0 * bw)) + '" height="5" fill="' + c + '"/>' : ''; };
        h = jFlag(q[0], q[1], lock ? '#3a3f38' : d === n0 ? '#f2c14e' : c1 ? '#7fa7d9' : '#8a9580', 0, i === RD.cur && d < n0) + '<text x="' + bx + '" y="' + (q[1] - 8) + '" class="jlab2">' + esc(l.name.length > 22 ? l.name.slice(0, 21) + '…' : l.name) + '</text>' +
          '<rect x="' + (bx - 1) + '" y="' + (q[1] - 2) + '" width="' + (bw + 2) + '" height="7" fill="#0a0c0a"/>' + seg(0, d, '#f2c14e') + seg(d, g2, '#7fa7d9') + seg(g2, c1, '#9bd35a') + '<text x="' + (bx + bw + 5) + '" y="' + (q[1] + 5) + '" class="jlab2">' + d + '/' + n0 + '</text>'; }
      else if (C.kind === 'camp') h = jProp('tent', q[0], q[1] + 4) + '<text x="' + (q[0] + 16) + '" y="' + (q[1] - 8) + '" class="jlab2">notes ' + C.done + '/' + C.total + '</text>';
      else if (C.kind === 'hard') h = jProp('arena', q[0], q[1] + 4);
      else h = jFlag(q[0], q[1], C.cleared ? '#f2c14e' : lock ? '#3a3f38' : '#e2604d', 1, i === RD.cur);
      nodes += '<g onclick="jChap(' + i + ')" style="cursor:pointer"><rect x="' + (q[0] - 20) + '" y="' + (q[1] - 30) + '" width="40" height="40" fill="transparent"/>' + h + '</g>';
    });
    if (C.kind === 'real') { var bw = 120, bx = 120, by = y0 + 40; nodes += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="8" fill="#0a0c0a" stroke="#050705"/><rect x="' + bx + '" y="' + by + '" width="' + Math.round(bw * Math.min(1, RD.real.da.pct)) + '" height="8" fill="#9bd35a"/>'; }
    if (bl[i]) nodes += '<g onclick="jBacklog()" style="cursor:pointer">' + jFlag(40, y1 - 24, '#e2604d', 0, 1) + '<text x="52" y="' + (y1 - 18) + '" class="jlab2">BACKLOG ' + bl[i] + '</text></g>';
    C.cs.forEach(function (l, j) { // CS side trail: optional, never blocks
      var d = l.topics.filter(function (t) { return RD.steps(t).k >= 3; }).length, qy = Math.round(y1 - 40 - j * 40);
      side += '<g onclick="jChap(' + i + ')"><rect x="314" y="' + (qy - 26) + '" width="46" height="34" fill="transparent"/>' + jFlag(332, qy, flagCol(d, l.topics.length, lock), 0) + '<text x="314" y="' + (qy + 14) + '" class="jlab2">CS ' + d + '/' + l.topics.length + '</text></g>';
    });
  });
  var sy0 = 0, sy1 = y; trail.push([125, Math.round(sy1 - 50)]);
  s += band(sy0, sy1, RD.summit ? '#5a4a12' : '#1b1b2a', 'snow', 'SUMMIT · GATE DA ' + jg().target.da + '+ (FEB)', RD.summit ? 'ACHIEVED on real mocks' : 'opens on a latest-5 mock median ≥ target', 0, 36);
  var line = trail.map(function (q) { return q.join(','); }).join(' ');
  s += '<line x1="332" y1="' + (H - base) + '" x2="332" y2="' + sy1 + '" stroke="#7fa7d9" stroke-width="2" stroke-dasharray="3 6" opacity=".6"/><text x="290" y="' + (H - base - 6) + '" class="jlab2">CS SIDE TRAIL</text>';
  s += '<polyline points="' + line + '" fill="none" stroke="#050705" stroke-width="10"/><polyline points="' + line + '" fill="none" stroke="#c9ae5c" stroke-width="5" stroke-dasharray="8 5"/>';
  var pk = Math.min(16, ap.doneDays), by2 = H - 22;
  s += '<g onclick="jTabGo(\'apt\')"><text x="8" y="' + (by2 - 6) + '" class="jlab2">APTITUDE BRIDGE · ' + ap.doneDays + ' days · streak ' + ap.streak + '</text>';
  for (var k = 0; k < 16; k++) s += '<rect x="' + (8 + k * 9) + '" y="' + by2 + '" width="7" height="8" fill="' + (k < pk ? '#b07a3a' : '#2a2418') + '" stroke="#050705"/>';
  s += '</g>' + nodes + side + jFlag(125, Math.round(sy1 - 50), RD.summit ? '#f2c14e' : '#3a3f38', 1, RD.summit);
  // the climber: inside the current chapter, as far up as its progress
  var C = RD.ch[RD.cur], allDone = RD.ch.every(function (c) { return c.cleared; }), yb = 0, ytop; for (var q = 0; q <= RD.cur; q++) yb += hb[q];
  var hy = allDone ? sy1 - 50 : Math.round(H - base - (yb - hb[RD.cur]) - 24 - C.prog * (hb[RD.cur] - 60)), hx = 180;
  for (var t = 1; t < trail.length; t++) { var a = trail[t - 1], b = trail[t]; if (hy <= a[1] && hy >= b[1]) { hx = Math.round(a[0] + (b[0] - a[0]) * (a[1] - hy) / Math.max(1, a[1] - b[1])); break; } }
  var open = g.mistakes.filter(function (m) { return !m.fixedAt; }).length;
  if (open) s += '<g onclick="jCamp()" style="cursor:pointer">' + jProp('tent', 300, H - 34) + '<text x="352" y="' + (H - 14) + '" text-anchor="end" class="jlab2">RECOVERY ' + open + '</text></g>';
  s += labels;
  var from = g.pos && g.pos.road && isFinite(g.pos.road[0]) ? g.pos.road : [hx, hy];
  s += '<g id="jhero" data-x="' + hx + '" data-y="' + hy + '" style="transform:translate(' + from[0] + 'px,' + from[1] + 'px);transition:transform 1.4s steps(14)"><rect x="-16" y="-3" width="32" height="5" fill="#050705" opacity=".5"/><image href="' + jImg('hero') + '" x="-20" y="-46" width="40" height="43"/></g>';
  var strip = '<div class="jstrip" onclick="jStrip(event)">' + bands.map(function (b) { return '<i style="top:' + (b[0] / H * 100) + '%;height:' + ((b[1] - b[0]) / H * 100) + '%;background:' + b[2] + '"></i>'; }).join('') + '<b style="top:' + (hy / H * 100) + '%"></b></div>';
  return '<div class="jwrap">' + (RD.backlog.length ? '<div class="jbl px" onclick="jBacklog()">BACKLOG ' + RD.backlog.length + ' ▸</div>' : '') + '<div class="jban px">CH ' + (RD.cur + 1) + ' · ' + (allDone ? 'SUMMIT' : C.name.toUpperCase()) + '</div>' + strip + '<div id="jmap"><svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' + s + '</svg></div></div>';
}
// Where each topic of a chapter stands: these four numbers add up to the topic count
function jBuckets(C) { var k = C.kc; return 'PYQ ' + k[2] + ' · Grind ' + (k[1] - k[2]) + ' · Concept ' + (k[0] - k[1]) + ' · new ' + (C.total - k[0]); }
function jChWhy(C, RD) {
  if (C.kind === 'learn') return jBuckets(C) + ' (' + C.total + ' DA topics). Map bars: gold PYQ, blue Grind, green Concept. Every step moves you up; all at PYQ clears the chapter.' + (C.cs.length ? ' CS side trail is optional.' : '');
  if (C.kind === 'camp') return 'Short note for every Math Foundations topic: ' + C.done + '/' + C.total + '.';
  if (C.kind === 'wrap') return C.total ? C.total + ' DA topics still below PYQ (incl. skipped chapters).' : 'Every DA topic at PYQ.';
  if (C.kind === 'real') return RD.real.da.att + '/' + RD.real.da.bank + ' DA GATE Grind questions attempted. Every question = Reality cleared.';
  return 'GO Classes tests + mocks harden each subject. Summit by the mock rule.';
}
// Ladder of the six roadmap steps for a topic
function jLadder(tid, RD) {
  var st = RD.steps(tid), tip = ['', '', '', 'Recovery Camp', 'Short note', 'Revision + topic test ≥ 60%'];
  return '<div class="lad"><div class="row sp"><span style="min-width:0">' + esc(J.T[tid].name) + '</span><span class="muted px" style="flex:none">' + st.s.filter(Boolean).length + '/6</span></div><div class="lsteps">' +
    J.STEPS.map(function (x, i) { return '<button class="sm' + (st.s[i] ? ' on' : '') + '" title="' + tip[i] + '" onclick="jStep(\'' + tid + '\',' + i + ')">' + (st.s[i] ? '✓' : i + 1) + ' ' + x + '</button>'; }).join('') + '</div></div>';
}
function jStep(tid, i) { if (i === 1) return jGrind(tid); if (i === 3) return jCamp(); if (i === 4) return jNote(tid); if (i === 5) return jRevT(tid); jStepSet(tid, i); }
function jStepSet(tid, i) {
  var g = jg(), st = J.steps(g, tid), cur = i === 1 ? L.n(g.road.step[tid]) : st.k; // Grind toggles only your own tick
  var k = cur >= i + 1 ? i : i + 1, r = g.topics[tid] = g.topics[tid] || {};
  jAward(function () { if (k) g.road.step[tid] = k; else delete g.road.step[tid]; if (k >= 1) r.learn = 2; else if (i === 0) r.learn = 0; });
  jRe();
}
// GATE Grind: done by your tick, a passed checkpoint, or every question of its bank logged
function jGrind(tid) {
  var g = jg(), st = J.steps(g, tid), cp = st.cp && J.cp(st.cp), mine = L.n(g.road.step[tid]) >= 2;
  modal('<h2>GATE Grind</h2><div class="muted">' + esc(J.T[tid].name) + '</div>' +
    (cp ? '<div class="panel" style="text-align:left"><div class="muted px">' + esc(cp.name) + '</div><div><b class="px">' + st.att + '/' + st.bank + '</b> questions logged</div>' + jB(st.bank ? st.att / st.bank : 0, 'gold') + '</div>' : '') +
    '<div class="muted" style="margin:6px 0">' + (st.s[1] ? 'Grind is DONE for this topic.' : 'Done when you tick it, pass the checkpoint, or log every question of its bank.') + '</div>' +
    (cp ? '<button class="pri" onclick="closeModal();jSolve(\'' + cp.id + '\',\'' + tid + '\')">Log questions</button>' : '') +
    (mine ? '<button onclick="closeModal();jStepSet(\'' + tid + '\',1)">Undo my Grind tick</button>' : st.s[1] ? '' : '<button onclick="closeModal();jStepSet(\'' + tid + '\',1)">Mark Grind done</button>') + '<button onclick="closeModal()">Close</button>');
}
function jRevT(tid) {
  var r = jg().topics[tid] || {};
  modal('<h2>Revisit + test</h2><div class="muted">' + esc(J.T[tid].name) + '. Done when revised and a topic test is 60% or more.</div><div style="text-align:left;margin-top:8px"><label>Last revision<input id="jr_d" type="date" value="' + esc(r.rev || '') + '"></label>' + jIn('jr_t', 'Best topic test %', r.test) + '</div>' +
    '<button class="pri" onclick="jRevSave(\'' + tid + '\')">Save</button><button onclick="$(\'jr_d\').value=today">Revised today</button><button onclick="closeModal()">Cancel</button>');
}
function jRevSave(tid) { var d = jV('jr_d'), t = jV('jr_t'); closeModal(); jSetT(tid, 'rev', d); jSetT(tid, 'test', t); }
function jNote(tid) {
  var g = jg(), x = g.road.note[tid];
  modal('<h2>Short note</h2><div class="muted">' + esc(J.T[tid].name) + '</div><textarea id="jn_t" placeholder="Optional: the one line to remember">' + esc(x && x !== '✓' ? x : '') + '</textarea>' +
    '<button class="pri" onclick="jNoteSave(\'' + tid + '\',1)">' + ico('check', 16) + 'Note written</button>' + (x ? '<button onclick="jNoteSave(\'' + tid + '\',0)">Not written</button>' : '') + '<button onclick="closeModal()">Cancel</button>');
}
function jNoteSave(tid, on) { var g = jg(), t = jV('jn_t').replace(/[<>"`]/g, '').slice(0, 300); closeModal(); jAward(function () { if (on) g.road.note[tid] = t || '✓'; else delete g.road.note[tid]; }); jRe(); }
function jChap(i) { jCh = i; go('chap'); }
function jBacklog() {
  var RD = jRD(), by = {};
  RD.backlog.forEach(function (b) { (by[b.ch] = by[b.ch] || []).push(b); });
  modal('<img class="jpic" src="' + jImg('recover') + '" alt=""><h2>Backlog · ' + RD.backlog.length + '</h2><div class="muted" style="margin:6px 0">Topics left below PYQ (or without a short note) in chapters you already passed. Finish them later: the chapter clears and the XP lands then.</div><div style="text-align:left;max-height:45vh;overflow:auto">' +
    Object.keys(by).map(function (i) { return '<h3 style="margin-top:10px">' + (+i + 1) + '. ' + esc(J.ROAD[i].name) + ' · ' + by[i].length + '</h3>' + by[i].map(function (b) { var st = RD.steps(b.t); return '<div class="item" onclick="closeModal();jChap(' + i + ')"><span>' + esc(J.T[b.t].name) + '</span><span class="muted px">' + (b.note ? 'note' : J.STEPS[st.k] || 'PYQ') + ' next</span></div>'; }).join(''); }).join('') +
    '</div><button onclick="closeModal()">Close</button>');
}
// Reset: start the Journey over. The old Journey is kept as a backup (last 3) so a reset can be undone. Fitness data untouched.
function jReset() {
  modal('<img class="jpic" src="' + jImg('comeback') + '" alt=""><h2>Reset Journey?</h2><div class="muted" style="margin:8px 0">Starts GATE 2027 from zero and asks the start questions again. Your current Journey (' + fmt(J.xp(jg(), today)) + ' XP, tests, mocks, topics) is kept as a backup: Undo reset in settings brings it back. Fitness data is not touched.</div>' +
    '<button class="pri" style="background:var(--bad)" onclick="jResetGo()">Reset Journey</button><button onclick="closeModal()">Cancel</button>');
}
function jResetGo() {
  autoBackup('before journey reset', true);
  var b = Array.isArray(D.gateBak) ? D.gateBak : [];
  b.push({ at: today, data: JSON.parse(JSON.stringify(jg())) }); D.gateBak = b.slice(-3);
  D.gate = J.ensure({}); save(); closeModal(); rsI = 0; jTab = 'over'; stack = ['journey', 'rstart']; show(); toast('Journey reset · backup kept');
}
function jUndoReset() {
  var b = D.gateBak; if (!Array.isArray(b) || !b.length) return;
  var last = b[b.length - 1];
  if (!confirm('Bring back the Journey saved on ' + last.at + '? The current one is kept as a backup instead.')) return;
  b[b.length - 1] = { at: today, data: JSON.parse(JSON.stringify(jg())) }; // swap, so undo can be undone
  D.gate = J.ensure(last.data); save(); closeModal(); stack = ['journey', 'gate']; jTab = 'over'; show(); toast('Journey restored');
}
function jSkip(i) {
  modal('<img class="jpic" src="' + jImg('timeout') + '" alt=""><h2>Skip ahead?</h2><div class="muted" style="margin:8px 0">' + esc(J.ROAD[i].name) + ' stays marked unfinished. Its DA topics wait for you in Syllabus Wrap.</div>' +
    '<button class="pri" onclick="jSkipGo(' + i + ')">Skip ahead</button><button onclick="closeModal()">Stay</button>');
}
function jSkipGo(i) { var g = jg(); closeModal(); if (g.road.skip.indexOf(i) < 0) g.road.skip.push(i); save(); toast('Skipped · climb on'); jCh = J.road(g, today).cur; R.chap(); }
function jUnskip(i) { var g = jg(); g.road.skip = g.road.skip.filter(function (x) { return x !== i; }); save(); R.chap(); }
function jLane(l, RD, cs) {
  return '<div class="panel"><div class="row sp"><h3 style="margin:0">' + (cs ? 'CS · ' : '') + esc(l.name) + '</h3><span class="muted px">' + l.topics.filter(function (t) { return RD.steps(t).k >= 3; }).length + '/' + l.topics.length + '</span></div>' +
    (l.cps.length ? '<div class="muted" style="font-size:12px;margin:4px 0">GATE Grind: ' + l.cps.map(function (c) { var s = J.cpStat(jg(), c); return '<a onclick="jSolve(\'' + c.id + '\',\'\')">' + esc(c.name.slice(0, 28)) + ' ' + s.att + '/' + s.bank + '</a>'; }).join(' · ') + '</div>' : '') +
    (l.topics.length ? l.topics.map(function (t) { return jLadder(t, RD); }).join('') : '<div class="muted">Nothing here.</div>') + '</div>';
}
R.chap = function () {
  var g = jg(), RD = J.road(g, today), C = RD.ch[jCh]; if (!C) return v('chap', hdr('CHAPTER'));
  var h = hdr('CH ' + (jCh + 1) + ' · ' + esc(C.name.toUpperCase())) + '<img class="jpic" src="' + jImg((C.cleared ? 'win' : C.img)) + '" alt="">' +
    '<div class="panel"><div class="row sp"><b class="px ' + (C.cleared ? 'ok' : C.open ? 'warn' : 'neg') + '">' + (C.cleared ? 'CLEARED' : C.skipped ? 'SKIPPED · UNFINISHED' : C.open ? 'IN PROGRESS' : 'LOCKED') + '</b><span class="muted px">' + Math.round(C.prog * 100) + '%</span></div>' + jB(C.prog, 'gold') +
    '<div class="muted" style="margin-top:6px">' + esc(jChWhy(C, RD)) + '</div>' + (!C.open ? '<div class="muted">Locks are guidance: you can still work here.</div>' : '') +
    (C.open && !C.cleared && jCh < RD.ch.length - 1 && !C.skipped ? '<button onclick="jSkip(' + jCh + ')">Skip ahead</button>' : '') + (C.skipped ? '<button onclick="jUnskip(' + jCh + ')">Come back to this chapter</button>' : '') + '</div>';
  if (C.kind === 'learn' || C.kind === 'camp' || C.kind === 'wrap') {
    h += '<div class="muted" style="margin:4px 0 8px">Flow: ' + J.STEPS.join(' → ') + '. Tap any step. Grind also completes when its question bank is fully logged.</div>';
    h += C.da.map(function (l) { return jLane(l, RD); }).join('');
    if (C.cs.length) h += '<details class="panel"' + (C.kind === 'wrap' ? ' open' : '') + '><summary class="row sp"><b class="px">CS side trail · optional</b><span class="px">' + C.csDone + '/' + C.csTotal + '</span></summary><div class="muted">Recommended for GATE CS (PSU). Never blocks a DA chapter.</div>' +
      C.cs.map(function (l) { return jLane(l, RD, 1); }).join('') + '</details>';
  } else if (C.kind === 'real') {
    var rt = J.realTopics(g), row = function (S) { var s0 = J.subj(S.key); return '<details class="panel"><summary class="row sp"><b class="px" style="font-size:14px">' + esc(S.name) + '</b><span class="px ' + (S.pct >= 1 ? 'ok' : '') + '">' + S.att + '/' + S.bank + '</span></summary>' + jB(S.pct, 'gold') +
      s0.cps.map(function (c) { var st = J.cpStat(g, c); return '<div class="item" onclick="jSolve(\'' + c.id + '\',\'\')"><span style="min-width:0">' + (st.att >= st.bank ? ico('check', 12) + ' ' : '') + esc(c.name) + '<br><span class="muted">' + st.att + '/' + st.bank + (st.bankKnown ? '' : '?') + ' attempted · acc ' + jP(st.acc) + '</span></span><b class="px">' + jP(st.cov) + '</b></div>'; }).join('') +
      '<div class="muted">Topics cleared: ' + s0.topics.filter(function (t) { return rt.indexOf(t) >= 0; }).length + '/' + s0.topics.length + '</div></details>'; };
    h += '<div class="panel"><h3>The level of reality</h3><div class="muted">Attempt every GATE Grind question of every checkpoint. A topic whose banks are all attempted is REALITY CLEARED: +50 XP, plus 1 XP per question of each finished bank. A question ID counts once; repeats never fake it.</div>' +
      '<div class="g2" style="margin-top:8px"><div><div class="muted">DA</div><b class="px">' + jP(RD.real.da.pct) + '</b></div><div><div class="muted">CS (optional)</div><b class="px">' + jP(RD.real.cs.pct) + '</b></div></div><div class="muted">' + rt.length + ' topics REALITY CLEARED</div><button onclick="jOpen(J.LINKS.da)">Open GATE Grind DA ↗</button></div>' +
      RD.real.subj.filter(function (S) { return S.paper === 'da'; }).map(row).join('') + '<h3>CS side trail · optional</h3>' + RD.real.subj.filter(function (S) { return S.paper === 'cs'; }).map(row).join('');
  } else {
    var hrow = function (H) { return '<div class="item"><span>' + esc(H.name) + '<br><span class="muted">' + (H.n ? H.n + ' scores' + (H.prev != null ? ' · was ' + H.prev : '') : 'no scores yet') + '</span></span><b class="px ' + (H.h == null ? '' : H.forge ? 'neg' : H.h >= 70 ? 'ok' : 'warn') + '">' + (H.h == null ? '—' : H.h + (H.trend > 0 ? ' ▲' : H.trend < 0 ? ' ▼' : '')) + '</b></div>'; };
    var forge = RD.hard.da.filter(function (H) { return H.forge; });
    h += '<img class="jpic" src="' + jImg('boss') + '" alt=""><div class="panel"><h3>Hardness · GATE DA</h3><div class="muted">Each subject: 0.6 × old + 0.4 × newest score %. GO Classes subject/topic tests count automatically; for mocks, enter subject-wise marks in the mock form. +10 XP each time a subject rises. Falling costs nothing.</div>' +
      RD.hard.da.map(hrow).join('') + '<div class="row"><button class="pri" onclick="jTabGo(\'ts\')">Record a test</button><button onclick="jPaper=\'da\';jMock(\'da\',-1)">Record a mock</button></div></div>' +
      (forge.length ? '<div class="panel"><h3>Re-forge (hardness below 40)</h3>' + forge.map(function (H) { return '<div class="item" onclick="jSubj=\'' + H.key + '\';go(\'jsub\')"><span>' + esc(H.name) + '</span><span class="muted">re-solve PYQs, fix mistakes</span></div>'; }).join('') + '</div>' : '') +
      '<details class="panel"><summary class="row sp"><b class="px">Hardness · GATE CS (optional)</b></summary>' + RD.hard.cs.map(hrow).join('') + '</details>' +
      '<div class="panel"><h3>Summit (Feb)</h3><div class="muted">' + (RD.summit ? 'GATE DA latest-5 mock median at target. Summit reached.' : 'Opens on 5 mocks with a latest-5 median ≥ ' + g.target.da + '. Hardness never replaces mocks.') + '</div><button onclick="jPaper=\'da\';jTabGo(\'mock\')">Mock Arena</button></div>';
  }
  v('chap', h);
};
// Quick start: one question per topic, chapter by chapter
function rsList() { return J.ROAD.map(function (c, i) { return i; }).filter(function (i) { return !J.ROAD[i].kind || J.ROAD[i].kind === 'wrap'; }); }
var RS = ['Not started', 'Concept done', 'GATE Grind done', 'PYQ done'];
function rsRow(tid, RD) {
  var k = RD.steps(tid).k;
  return '<div class="item" style="flex-direction:column;align-items:stretch;gap:4px"><span>' + esc(J.T[tid].name) + '</span><span class="pick">' + RS.map(function (x, i) { return '<button class="sm ' + (k === i ? 'on' : '') + '" onclick="rsSet([\'' + tid + '\'],' + i + ')">' + x + '</button>'; }).join('') + '</span></div>';
}
function rsSet(ts, k) { var g = jg(); ts.forEach(function (t) { var r = g.topics[t] = g.topics[t] || {}; if (k) g.road.step[t] = k; else delete g.road.step[t]; if (k) r.learn = 2; else if (L.n(r.learn) === 2) r.learn = 0; }); save(); var y = window.scrollY; R.rstart(); window.scrollTo(0, y); }
function rsLane(l, RD) {
  return '<div class="panel"><div class="row sp"><h3 style="margin:0">' + esc(l.name) + '</h3></div><div class="row" style="margin:6px 0">' + RS.slice(1).map(function (x, i) { return '<button class="sm" onclick="rsSet(' + esc(JSON.stringify(l.topics)).replace(/&quot;/g, '\'') + ',' + (i + 1) + ')">All ' + ['concept', 'Grind', 'PYQ'][i] + '</button>'; }).join('') + '</div>' + l.topics.map(function (t) { return rsRow(t, RD); }).join('') + '</div>';
}
R.rstart = function () {
  var g = jg(), RD = J.road(g, today), L0 = rsList(), i = L0[Math.min(rsI, L0.length - 1)], C = RD.ch[i], last = rsI >= L0.length - 1;
  var h = '<div class="top"><button class="ghost" onclick="if(rsI>0){rsI--;R.rstart();window.scrollTo(0,0)}else goBack()" aria-label="Back">' + ico('back', 24) + '</button><h1>WHERE DO YOU STAND?</h1></div>' + bar(pct(rsI, L0.length - 1), 'gold') +
    '<div class="muted px" style="margin-bottom:10px">Step ' + (rsI + 1) + ' / ' + L0.length + ' · chapter ' + (i + 1) + ': ' + esc(C.name) + '</div>';
  if (rsI === 0) h += '<div class="panel"><h3>Your targets</h3><div class="g2">' + jIn('rs_tda', 'GATE DA target', g.target.da) + jIn('rs_tcs', 'GATE CS target', g.target.cs) + '</div><div class="muted">Marks out of 100. The summit opens when your latest 5 mocks reach it.</div></div>' + '<img class="jpic" src="' + jImg('camp') + '" alt=""><div class="say">One question per topic: how far did you get? The map is built from your answers. Already-saved progress is pre-filled.</div>';
  if (C.kind === 'wrap') h += '<div class="muted" style="margin-bottom:8px">CS-only topics (optional side trail).</div>' + C.cs.map(function (l) { return rsLane(l, RD); }).join('');
  else h += C.da.map(function (l) { return rsLane(l, RD); }).join('') + (C.cs.length ? '<details class="panel"><summary class="row sp"><b class="px">CS side trail · optional</b></summary>' + C.cs.map(function (l) { return rsLane(l, RD); }).join('') + '</details>' : '');
  h += last ? '<button class="pri" onclick="rsDone()">' + ico('flag', 16) + 'Build my map</button>' : '<button class="pri" onclick="rsTargets();save();rsI++;R.rstart();window.scrollTo(0,0)">Next ' + ico('next', 14) + '</button><button onclick="rsDone()">Skip the rest · build my map</button>';
  v('rstart', h);
};
function rsTargets() { var g = jg(); ['da', 'cs'].forEach(function (p) { var t = jNum('rs_t' + p); if (t > 0 && t <= 100) g.target[p] = t; }); }
function rsDone() {
  rsTargets(); var g = jg(); g.road.start = today; if (!g.audit.done) g.audit.done = today; g.start = g.start || today; save();
  stack = ['journey', 'gate']; jTab = 'over'; show(); toast('Map built · chapter ' + (J.road(g, today).cur + 1));
}
// Mock form: optional subject-wise marks feed Hardening
function jParts(p, m) {
  var pt = m.parts || {};
  return '<details' + (Object.keys(pt).length ? ' open' : '') + '><summary class="muted px">Subject-wise marks (optional, for Hardening)</summary>' + J.P[p].map(function (s) { var x = pt[s.id] || []; return '<div class="g3" style="align-items:end"><span style="font-size:13px">' + esc(s.name) + '</span>' + jIn('jp_' + s.id + '_g', 'Got', x[0]) + jIn('jp_' + s.id + '_m', 'Out of', x[1]) + '</div>'; }).join('') + '</details>';
}
function jPartsRead(p) {
  var o = {}; J.P[p].forEach(function (s) { var a = jNum('jp_' + s.id + '_g'), b = jNum('jp_' + s.id + '_m'); if (a !== '' && b > 0) o[s.id] = [Math.max(-b, Math.min(b, a)), b]; });
  return o;
}

// ---------- Accenture Journey: The Offer Tower (records in D.acc, maths in acc.js) ----------
function ag() { return (D.acc = AC.ensure(D.acc)); }
var aFl = 0;
var ACAT_ORDER = ['code', 'mcq', 'sql', 'fe', 'cog', 'comm', 'mock'];
function aImg(i) { var f = AC.FLOORS[i]; return f.mock ? 'boss' : ['acc', 'dev', 'dev2', 'study'][i % 4]; }
function aTowerMap(st, a) {
  var W = 360, roofH = 200, fH = 74, lH = 72, bH = 70, nF = AC.FLOORS.length, H = roofH + nF * fH + lH + bH, bx = 36, bw = 236, rnd = jRnd(5), s = '', lab = '';
  var fTop = function (i) { return H - bH - lH - (i + 1) * fH; };
  // night sky, twinkling stars, drifting clouds
  s += '<rect width="' + W + '" height="' + H + '" fill="#0b1020"/><rect y="' + (H - bH) + '" width="' + W + '" height="' + bH + '" fill="#1a140e"/>';
  for (var k = 0; k < 46; k++) s += '<rect class="astar" style="animation-delay:' + (rnd() * 3).toFixed(1) + 's" x="' + Math.round(rnd() * W) + '" y="' + Math.round(rnd() * (H - bH - 20)) + '" width="2" height="2" fill="#dfe8ff"/>';
  [[30, 18], [140, 26], [420, 34]].forEach(function (c, i) { s += '<g class="aclo" style="animation-duration:' + c[1] + 's;animation-delay:-' + (i * 7) + 's"><g transform="translate(0,' + c[0] + ')"><rect x="0" y="6" width="54" height="10" fill="#2a3352"/><rect x="10" y="0" width="30" height="8" fill="#2a3352"/></g></g>'; });
  // rooftop: helipad, neon sign, searchlight
  var rt = roofH - 6;
  s += '<polygon class="abeam" points="' + (bx + 40) + ',' + (rt - 40) + ' ' + (bx + 10) + ',0 ' + (bx + 80) + ',0" fill="#fff6c8" opacity=".12"/>';
  s += '<rect x="' + (bx + 30) + '" y="' + (rt - 40) + '" width="20" height="40" fill="#2b3346"/><rect x="' + (bx + 34) + '" y="' + (rt - 46) + '" width="12" height="8" fill="#f2c14e"/>';
  s += '<text x="' + (bx + bw / 2 + 20) + '" y="' + (rt - 64) + '" text-anchor="middle" class="aneon" style="font-family:Pix,monospace;font-size:20px;fill:' + (st.roof ? '#f2c14e' : '#ff5fa8') + ';paint-order:stroke;stroke:#2a0a1a;stroke-width:4px">OFFER TOWER</text>';
  s += '<ellipse cx="' + (bx + bw - 60) + '" cy="' + (rt - 8) + '" rx="34" ry="8" fill="' + (st.roof ? '#f2c14e' : '#3a4256') + '"/><text x="' + (bx + bw - 60) + '" y="' + (rt - 4) + '" text-anchor="middle" class="jlab2">H</text>';
  s += '<rect x="' + bx + '" y="' + (rt) + '" width="' + bw + '" height="6" fill="#4b5568"/>';
  lab += '<text x="8" y="' + (rt - 20) + '" class="jlab">ROOFTOP</text><text x="8" y="' + (rt - 8) + '" class="jlab2">' + (st.roof ? 'OFFER LETTER HELIPAD · REACHED' : 'clear all 14 floors') + '</text>';
  // floors
  AC.FLOORS.forEach(function (f, i) {
    var y = fTop(i), F = st.floors[i], w = AC.WINGS[f.wing], cur = i === st.cur, n0 = f.tasks.length, sp = Math.min(25, (bw - 20) / n0);
    s += '<g onclick="aFloor(' + i + ')" style="cursor:pointer"><rect x="' + bx + '" y="' + y + '" width="' + bw + '" height="' + fH + '" fill="' + w[2] + '"' + (i > st.cur ? ' opacity=".55"' : '') + '/><rect x="' + bx + '" y="' + y + '" width="' + bw + '" height="3" fill="#050705" opacity=".6"/>';
    f.tasks.forEach(function (t, j) { var on = !!ag().done[t.id]; s += '<rect' + (cur && !on ? ' class="awin" style="animation-delay:' + (j * .15).toFixed(2) + 's"' : '') + ' x="' + Math.round(bx + 10 + j * sp) + '" y="' + (y + 32) + '" width="' + Math.min(15, sp - 4) + '" height="18" fill="' + (on ? '#ffd76a' : '#121a2c') + '" stroke="#050705"/>'; });
    s += '</g>';
    if (i === 0 || AC.FLOORS[i - 1].wing !== f.wing) lab += '<text x="' + (bx + bw - 4) + '" y="' + (y + fH - 6) + '" text-anchor="end" class="jlab2" style="fill:#c9d1bd">' + w[1].toUpperCase() + '</text>';
    lab += '<text x="' + (bx + 6) + '" y="' + (y + 16) + '" class="jlab2">F' + (i + 1) + ' · ' + esc(f.name.toUpperCase()) + (F.cleared ? ' ✓' : '') + '</text><text x="' + (bx + 6) + '" y="' + (y + 66) + '" class="jlab2" style="fill:#9fb0c8">' + F.done + '/' + F.total + '</text>';
  });
  // lobby + basement archive
  var ly = H - bH - lH;
  s += '<g onclick="aFloor(-1)"><rect x="' + bx + '" y="' + ly + '" width="' + bw + '" height="' + lH + '" fill="#2b3346"/><rect x="' + (bx + bw / 2 - 26) + '" y="' + (ly + 26) + '" width="52" height="46" fill="#9fd8ff" opacity=".35"/><rect x="' + (bx + bw / 2 - 1) + '" y="' + (ly + 26) + '" width="2" height="46" fill="#050705"/></g>';
  lab += '<text x="' + (bx + 6) + '" y="' + (ly + 16) + '" class="jlab2">LOBBY · ' + st.done + '/' + st.total + ' TASKS</text>';
  var by = H - bH + 8;
  s += '<g onclick="aFloor(-2)" style="cursor:pointer"><rect x="' + (bx + 20) + '" y="' + by + '" width="' + (bw - 40) + '" height="' + (bH - 16) + '" fill="#2a2014" stroke="#050705"/>';
  AC.ARCH.tasks.forEach(function (t, j) { s += '<rect x="' + (bx + 30 + j * 17) + '" y="' + (by + 24) + '" width="11" height="12" fill="' + (ag().done[t.id] ? '#9bd35a' : '#141008') + '" stroke="#050705"/>'; });
  s += '</g>'; lab += '<text x="' + (bx + 26) + '" y="' + (by + 14) + '" class="jlab2">B1 · ARCHIVE DOJO · ' + st.arch + '/' + st.archTotal + ' (optional)</text>';
  // glass elevator shaft and the car carrying you
  var sx = bx + bw + 8, top = rt - 4, bot = H - bH;
  s += '<rect x="' + sx + '" y="' + top + '" width="46" height="' + (bot - top) + '" fill="#9fd8ff" opacity=".08" stroke="#5a7aa0"/><rect x="' + (sx + 6) + '" y="' + top + '" width="2" height="' + (bot - top) + '" fill="#5a7aa0"/><rect x="' + (sx + 38) + '" y="' + top + '" width="2" height="' + (bot - top) + '" fill="#5a7aa0"/>';
  var cy = st.roof ? top + 46 : st.pos <= 0 ? bot - 6 : Math.round(H - bH - lH - st.pos * fH - 4);
  var from = a.pos && isFinite(a.pos[1]) ? a.pos : [sx + 23, cy];
  s += lab + '<g id="ahero" data-x="' + (sx + 23) + '" data-y="' + cy + '" style="transform:translate(' + from[0] + 'px,' + from[1] + 'px);transition:transform 1.8s cubic-bezier(.5,0,.3,1)">' +
    '<rect x="-21" y="-50" width="42" height="50" fill="#1b2335" stroke="#f2c14e" stroke-width="2"/><image href="' + jImg('hero') + '" x="-17" y="-46" width="34" height="37"/><rect x="-21" y="-6" width="42" height="6" fill="#f2c14e"/>' +
    '<text x="0" y="-54" text-anchor="middle" class="jlab2 aneon" style="fill:#9bd35a">' + (st.roof ? 'ROOF' : st.pos <= 0 ? 'LOBBY' : 'F' + (st.cur + 1)) + '</text></g>';
  var strip = '<div class="jstrip" onclick="aStrip(event)">' + AC.FLOORS.map(function (f, i) { var y = fTop(i); return '<i style="top:' + (y / H * 100) + '%;height:' + (fH / H * 100) + '%;background:' + (st.floors[i].cleared ? '#f2c14e' : AC.WINGS[f.wing][2]) + '"></i>'; }).join('') + '<b style="top:' + (cy / H * 100) + '%"></b></div>';
  return '<div class="jwrap"><div class="jban px">' + (st.roof ? 'ROOFTOP' : 'F' + (st.cur + 1) + ' · ' + esc(AC.FLOORS[st.cur].name.toUpperCase())) + '</div>' + strip +
    '<div id="amap" class="amap"><svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' + s + '</svg></div></div>';
}
function aMapAfter() {
  var m = $('amap'), h = $('ahero'); if (!m || !h) return;
  var k = m.clientWidth / 360, x = +h.dataset.x, y = +h.dataset.y, a = ag();
  m.scrollTop = y * k - m.clientHeight * .6;
  setTimeout(function () { h.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }, 120);
  if (!a.pos || a.pos[0] !== x || a.pos[1] !== y) { a.pos = [x, y]; save(); }
}
function aStrip(e) { var m = $('amap'), r = e.currentTarget.getBoundingClientRect(); m.scrollTop = (e.clientY - r.top) / r.height * m.scrollHeight - m.clientHeight / 2; }
function aFloor(i) { if (i === -1) return toast('Lobby: start climbing at Floor 1'); aFl = i; go('afloor'); }
// Save, then celebrate a cleared floor, a cleared wing or the rooftop
function aAward(fn) {
  var a = ag(), s0 = AC.stat(a); fn(); save(); var s1 = AC.stat(a), d = s1.xp - s0.xp;
  var newF = s1.floors.filter(function (x, i) { return x.cleared && !s0.floors[i].cleared; })[0], newW = s1.wings.filter(function (w, i) { return w.cleared && !s0.wings[i].cleared; })[0];
  var pop = function (img, t, sub) { buzz([30, 50, 30, 50, 120]); modal('<img class="jpic" src="' + jImg(img) + '" alt=""><div class="ring gold" style="font-size:24px">' + t + '</div><div class="px" style="margin:8px 0">' + sub + '</div><div class="muted">+' + d + ' XP</div><button class="pri" onclick="closeModal();aRe()">Continue</button>'); };
  if (s1.roof && !s0.roof) pop('summit', 'ROOFTOP REACHED', 'Every roadmap topic done. Selection isn\'t guaranteed: your mock scores are the real indicator.');
  else if (newW) pop('win', 'WING CLEARED', esc(newW.name) + ' · ' + newW.tag);
  else if (newF) pop('win', 'FLOOR CLEARED', esc(newF.f.name) + (s1.roof ? '' : '<br>Elevator unlocked: F' + (s1.cur + 1) + ' · ' + esc(AC.FLOORS[s1.cur].name)));
  else { toast(d ? (d > 0 ? '+' : '') + d + ' XP' : 'Saved'); buzz(d > 0 ? 25 : 10); }
}
function aRe() { var n = stack[stack.length - 1]; if (R[n]) R[n](); }
function aTick(id) { var a = ag(); aAward(function () { if (a.done[id]) delete a.done[id]; else a.done[id] = today; }); aRe(); }
R.acc = function () {
  var a = ag(), st = AC.stat(a), F = st.roof ? null : st.floors[st.cur];
  v('acc', '<div class="top"><button class="ghost" onclick="goBack()" aria-label="Back">' + ico('back', 24) + '</button><div style="flex:1;min-width:0"><h1 style="font-size:18px">' + accName().toUpperCase() + ' · THE OFFER TOWER</h1><div class="muted px">' + fmt(st.xp) + ' XP · ' + st.done + '/' + st.total + ' tasks</div></div>' +
    '<button class="ghost" onclick="aSet()" aria-label="Tower settings">' + ico('gear', 20) + '</button></div>' +
    aTowerMap(st, a) +
    (F ? '<div class="panel" onclick="aFloor(' + st.cur + ')"><div class="row" style="gap:10px;align-items:center"><img class="jth" src="' + jImg(aImg(st.cur)) + '" alt=""><div style="flex:1;min-width:0"><div class="muted px">Floor ' + (st.cur + 1) + ' of 14 · ' + AC.WINGS[F.f.wing][0] + '</div>' +
      '<div class="px" style="font-size:16px">' + esc(F.f.name) + '</div><div class="muted">' + esc(F.f.ctx) + ' · ' + F.done + '/' + F.total + ' done</div></div></div>' + jB(F.prog, 'gold') + '</div>'
      : '<div class="panel"><img class="jpic" src="' + jImg('summit') + '" alt=""><h3>Rooftop reached</h3><div class="muted">All roadmap topics done. Keep the mocks sharp: they are the real indicator.</div></div>') +
    '<div class="panel"><h3>Wings</h3>' + st.wings.map(function (w) { return '<div class="item"><span>' + esc(w.name) + ' <span class="muted">' + w.tag + '</span></span><b class="px ' + (w.cleared ? 'ok' : '') + '">' + (w.cleared ? 'CLEARED' : '—') + '</b></div>'; }).join('') +
      '<div class="item" onclick="aFloor(-2)"><span>Archive Dojo <span class="muted">optional DSA</span></span><b class="px">' + st.arch + '/' + st.archTotal + '</b></div></div>' +
    '<div class="panel"><h3>Mock results</h3>' + st.mocks.map(function (m) { return '<div class="item" onclick="aFloor(' + (+m.id.slice(1) - 1) + ')"><span>' + esc(m.name) + '</span><b class="px">' + (m.code == null && m.mcq == null ? 'not taken' : 'code ' + (m.code == null ? '—' : m.code + '/3') + ' · MCQ ' + (m.mcq == null ? '—' : m.mcq + '/45')) + '</b></div>'; }).join('') +
      '<div class="muted" style="margin-top:6px">Finishing the tower means every topic was attempted. Your independent mock performance is the actual indicator.</div></div>');
  aMapAfter();
};
R.afloor = function () {
  var a = ag(), arch = aFl === -2, f = arch ? AC.ARCH : AC.FLOORS[aFl], st = AC.stat(a), F = arch ? null : st.floors[aFl];
  var done = f.tasks.filter(function (t) { return a.done[t.id]; }).length, h = hdr(arch ? 'B1 · ARCHIVE DOJO' : 'F' + (aFl + 1) + ' · ' + esc(f.name.toUpperCase()));
  h += '<img class="jpic" src="' + jImg((F && F.cleared ? 'win' : arch ? 'dev' : aImg(aFl))) + '" alt=""><div class="panel"><div class="muted px">' + (arch ? 'Optional · never blocks the climb' : AC.WINGS[f.wing][0] + ' · ' + AC.WINGS[f.wing][1]) + '</div><div style="margin:4px 0">' + esc(f.ctx) + '</div>' +
    '<div class="row sp"><b class="px ' + (done === f.tasks.length ? 'ok' : 'warn') + '">' + (done === f.tasks.length ? 'CLEARED' : 'IN PROGRESS') + '</b><span class="px">' + done + '/' + f.tasks.length + '</span></div>' + jB(done / f.tasks.length, 'gold') + '</div>';
  ACAT_ORDER.forEach(function (c) {
    var ts = f.tasks.filter(function (t) { return t.cat === c; }); if (!ts.length) return;
    h += '<div class="panel"><h3>' + AC.CAT[c] + '</h3>' + ts.map(function (t) { var on = !!a.done[t.id]; return '<div class="item atask' + (on ? ' on' : '') + '" onclick="aTick(\'' + t.id + '\')"><span class="abox">' + (on ? '✓' : '') + '</span><span style="flex:1;min-width:0">' + esc(t.title) +
      (t.subs.length ? '<span class="asubs">' + t.subs.map(esc).join(' · ') + '</span>' : '') + '</span></div>'; }).join('') + '</div>';
  });
  if (f.mock) { var m = a.mocks[f.id] || {}; h += '<div class="panel"><h3>Your score</h3><div class="g2">' + jIn('am_code', 'Coding solved (of 3)', m.code) + jIn('am_mcq', 'MCQ correct (of 45)', m.mcq) + '</div><button class="pri" onclick="aMockSave(\'' + f.id + '\')">Save score</button></div>'; }
  if (!arch) h += '<div class="row">' + (aFl > 0 ? '<button onclick="aFl--;R.afloor()">▼ F' + aFl + '</button>' : '') + (aFl < 13 ? '<button onclick="aFl++;R.afloor()">▲ F' + (aFl + 2) + '</button>' : '') + '</div>';
  v('afloor', h);
};
function aMockSave(id) {
  var a = ag(), c = jNum('am_code'), q = jNum('am_mcq');
  aAward(function () { var m = {}; if (c !== '') m.code = AC.clampMock('code', c); if (q !== '') m.mcq = AC.clampMock('mcq', q); if (m.code == null && m.mcq == null) delete a.mocks[id]; else { m.at = today; a.mocks[id] = m; } });
  aRe();
}
// Reset keeps a backup (last 3), so it can be undone. GATE and fitness data untouched.
function aSet() {
  var b = D.accBak;
  modal('<h2>Tower settings</h2><div style="text-align:left;margin-top:10px"><button onclick="aReset()" style="color:var(--bad)">Reset the tower</button>' +
    (Array.isArray(b) && b.length ? '<button onclick="aUndo()">Undo reset (backup ' + esc(b[b.length - 1].at) + ')</button>' : '') + '<div class="muted">Reset clears every tick and mock score here and keeps a backup. GATE and fitness data are not touched.</div></div><button onclick="closeModal()">Close</button>');
}
function aReset() {
  if (!confirm('Reset the Offer Tower? Your ticks are kept as a backup you can undo.')) return;
  autoBackup('before tower reset', true);
  var b = Array.isArray(D.accBak) ? D.accBak : []; b.push({ at: today, data: JSON.parse(JSON.stringify(ag())) }); D.accBak = b.slice(-3);
  D.acc = AC.ensure({}); save(); closeModal(); toast('Tower reset · backup kept'); aRe();
}
function aUndo() {
  var b = D.accBak; if (!Array.isArray(b) || !b.length) return; var last = b[b.length - 1];
  if (!confirm('Bring back the tower saved on ' + last.at + '? The current one becomes the backup.')) return;
  b[b.length - 1] = { at: today, data: JSON.parse(JSON.stringify(ag())) }; D.acc = AC.ensure(last.data); save(); closeModal(); toast('Tower restored'); aRe();
}

// ---------- Lab: projects with sub-todos, sortable into named folders (records in D.lab) ----------
function lg() { var l = D.lab && typeof D.lab === 'object' ? D.lab : (D.lab = {}); if (!Array.isArray(l.p)) l.p = []; if (!Array.isArray(l.f)) l.f = []; return l; }
function lId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function lFind(id) { return lg().p.filter(function (p) { return p.id === id; })[0]; }
function lFold(id) { return lg().f.filter(function (f) { return f.id === id; })[0]; }
function lTodo(p) { if (!Array.isArray(p.todos)) p.todos = []; var d = p.todos.filter(function (t) { return t.done; }).length; return { d: d, n: p.todos.length, all: p.todos.length > 0 && d === p.todos.length }; }
function lStat() { var l = lg(), s = { n: l.p.length, ship: 0, d: 0, t: 0, f: l.f.length }; l.p.forEach(function (p) { var k = lTodo(p); s.d += k.d; s.t += k.n; if (k.all) s.ship++; }); return s; }
var lP = '';
function lOpts(sel) { return '<option value="">No folder</option>' + lg().f.map(function (f) { return '<option value="' + f.id + '"' + (f.id === sel ? ' selected' : '') + '>' + esc(f.name) + '</option>'; }).join(''); }
function lRow(p) { var k = lTodo(p); return '<div class="item" onclick="lP=\'' + p.id + '\';go(\'lproj\')"><span style="flex:1;min-width:0">' + (k.all ? '✓ ' : '') + esc(p.name) + '</span><b class="px ' + (k.all ? 'ok' : '') + '">' + k.d + '/' + k.n + '</b></div>'; }
R.lab = function () {
  var l = lg(), s = lStat(), h = hdr(esc(labName()));
  h += '<div class="panel"><div class="g3 px"><div><div class="muted">Projects</div><b class="ok" style="font-size:22px">' + s.n + '</b></div><div><div class="muted">Done</div><b class="ok" style="font-size:22px">' + s.ship + '</b></div><div><div class="muted">Todos</div><b style="font-size:22px">' + s.d + '/' + s.t + '</b></div></div>' + jB(s.t ? s.d / s.t : 0, 'gold') + '</div>';
  h += '<div class="panel"><h3>New project</h3>' + jIn('l_name', 'Name', '', 'e.g. Portfolio site', 'text') + '<label>Folder<select id="l_fold">' + lOpts('') + '</select></label><button class="pri" onclick="lAdd()">Add project</button>' +
    jIn('l_fname', 'New folder', '', 'e.g. Freelance', 'text') + '<button onclick="lAddF()">Create folder</button></div>';
  l.f.forEach(function (f) {
    var ps = l.p.filter(function (p) { return p.folder === f.id; });
    h += '<div class="panel"><h3>' + esc(f.name) + ' <span class="muted px">' + ps.length + '</span></h3>' +
      (ps.length ? ps.map(lRow).join('') : '<div class="muted">Empty. Move a project here from its page.</div>') +
      '<div class="row"><button onclick="lRenF(\'' + f.id + '\')">Rename folder</button><button onclick="lDelF(\'' + f.id + '\')" style="color:var(--bad)">Delete folder</button></div></div>';
  });
  var loose = l.p.filter(function (p) { return !lFold(p.folder); });
  if (loose.length || !l.f.length) h += '<div class="panel"><h3>' + (l.f.length ? 'No folder' : 'Projects') + ' <span class="muted px">' + loose.length + '</span></h3>' + (loose.length ? loose.map(lRow).join('') : '<div class="muted">No projects yet. Add one above.</div>') + '</div>';
  v('lab', h);
};
function lAdd() { var n = jV('l_name'); if (!n) return toast('Give the project a name'); lg().p.push({ id: lId(), name: n.slice(0, 80), folder: jV('l_fold'), todos: [], at: today }); save(); toast('Project added'); R.lab(); }
function lAddF() { var n = jV('l_fname'); if (!n) return toast('Give the folder a name'); lg().f.push({ id: lId(), name: n.slice(0, 40) }); save(); toast('Folder created'); R.lab(); }
function lRen(k, id) { var o = k === 'f' ? lFold(id) : lFind(id); if (!o) return; modal('<h2>Rename</h2>' + jIn('l_ren', 'Name', o.name, '', 'text') + '<button class="pri" onclick="lRenGo(\'' + k + '\',\'' + id + '\')">Save</button><button onclick="closeModal()">Cancel</button>'); }
function lRenF(id) { lRen('f', id); }
function lRenGo(k, id) { var n = jV('l_ren'); if (!n) return toast('Name can\'t be empty'); var o = k === 'f' ? lFold(id) : lFind(id); if (o) o.name = n.slice(0, k === 'f' ? 40 : 80); save(); closeModal(); jRe(); }
// Deleting a folder never deletes its projects: they go back to "No folder".
function lDelF(id) { var f = lFold(id); if (!f || !confirm('Delete folder "' + f.name + '"? Its projects move to No folder.')) return; var l = lg(); l.f = l.f.filter(function (x) { return x.id !== id; }); l.p.forEach(function (p) { if (p.folder === id) p.folder = ''; }); save(); R.lab(); }
R.lproj = function () {
  var p = lFind(lP); if (!p) { goBack(); return; }
  var k = lTodo(p), h = hdr(esc(p.name));
  h += '<div class="panel"><div class="row sp"><b class="px ' + (k.all ? 'ok' : 'warn') + '">' + (k.all ? 'DONE' : 'IN PROGRESS') + '</b><span class="px">' + k.d + '/' + k.n + '</span></div>' + jB(k.n ? k.d / k.n : 0, 'gold') +
    '<label>Folder<select onchange="lMove(this.value)">' + lOpts(p.folder) + '</select></label></div>';
  h += '<div class="panel"><h3>Todos</h3>' + (p.todos.length ? p.todos.map(function (t, i) { return '<div class="item atask' + (t.done ? ' on' : '') + '" onclick="lTick(' + i + ')"><span class="abox">' + (t.done ? '✓' : '') + '</span><span style="flex:1;min-width:0">' + esc(t.t) + '</span><button class="sm" onclick="event.stopPropagation();lDelT(' + i + ')" aria-label="Delete todo">✕</button></div>'; }).join('') : '<div class="muted">No todos yet.</div>') +
    jIn('l_todo', 'Add todo', '', 'e.g. Write README', 'text') + '<button class="pri" onclick="lAddT()">Add todo</button></div>';
  h += '<div class="row"><button onclick="lRen(\'p\',lP)">Rename</button><button onclick="lDelP()" style="color:var(--bad)">Delete project</button></div>';
  v('lproj', h);
};
function lAddT() { var n = jV('l_todo'), p = lFind(lP); if (!n || !p) return toast('Type a todo first'); lTodo(p); p.todos.push({ t: n.slice(0, 140), done: false }); save(); R.lproj(); }
function lTick(i) { var p = lFind(lP); if (!p || !p.todos[i]) return; var was = lTodo(p).all; p.todos[i].done = !p.todos[i].done; save(); if (!was && lTodo(p).all) { buzz([30, 50, 30, 50, 120]); toast('Project done: ' + p.name); } else buzz(15); R.lproj(); }
function lDelT(i) { var p = lFind(lP); if (!p || !p.todos[i]) return; p.todos.splice(i, 1); save(); R.lproj(); }
function lMove(fid) { var p = lFind(lP), f = lFold(fid); if (!p) return; p.folder = f ? fid : ''; save(); toast(f ? 'Moved to ' + f.name : 'Moved to No folder'); }
function lDelP() { var p = lFind(lP); if (!p || !confirm('Delete project "' + p.name + '" and its ' + p.todos.length + ' todos? This can\'t be undone.')) return; var l = lg(); l.p = l.p.filter(function (x) { return x.id !== p.id; }); save(); goBack(); }
