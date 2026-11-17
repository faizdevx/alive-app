// node test.js — self-check of the pure logic
const L = require('./assets/logic.js'), assert = require('assert');
const g = { kcal: 2200, protein: 120, steps: 8000, sleep: 7, screen: 120 };

const m = L.normMeal(L.parseAI('Sure!\n```json\n{"name":"Dal rice","items":[{"food":"dal","kcal":200,"p":12,"c":30,"f":4},{"food":"rice","kcal":250,"p":5,"c":55,"f":1},],}\n```\nEnjoy'));
assert.equal(m.kcal, 450); assert.equal(m.p, 17); assert.equal(m.items.length, 2);
assert.throws(() => L.parseAI('no json here'));
const w = L.normWorkout(L.parseAI('{"title":"Chest","duration_min":55,"kcal":320,"muscles":["chest","triceps"]}'));
assert.equal(w.min, 55); assert.deepEqual(w.muscles, ['chest', 'triceps']);


assert.equal(L.sleepHours('23:30', '06:50'), 7.3);
assert.equal(L.steps({ steps: { phone: 5000, manual: 7000 } }), 7000); // manual overrides
assert.equal(L.steps({ steps: { phone: 5000, manual: '' } }), 5000);

const good = { date: '2026-11-07', habitsSaved: true, meals: [{ kcal: 2200, p: 130 }], workouts: [{ kcal: 300 }], steps: { phone: 9000 }, sleep: { hours: 7.5, quality: 4 }, workDone: true, mental: [{ state: 'Flow', stress: 2, energy: 4 }] };
const bad = { date: '2026-11-07', habits: { smoke: 3, porn: true }, screen: { min: 400, pickups: 120 } };
const gx = L.dayXP(good, g).xp, bx = L.dayXP(bad, g).xp;
assert.ok(gx > 60 && bx === 0, gx + ' ' + bx); // slips never cost XP
assert.equal(L.dayXP(bad, g).items.filter(i => i.slip).length, 2);
// XP rules v2: caps, max 102/day
const maxDay = { habitsSaved: true, meals: [1, 2, 3, 4, 5].map(() => ({ kcal: 440, p: 30 })), workouts: [{}, {}, {}], steps: { phone: 9000 }, sleep: { hours: 8, quality: 5 }, workDone: true, urges: 9, mental: [{ state: 'Flow' }], screen: { min: 60, pickups: 10 } };
assert.equal(L.dayXP(maxDay, g).xp, 102); assert.equal(L.DAY_MAX, 102);
assert.equal(L.dayXP({ steps: { phone: 4000 } }, g).xp, 3); assert.equal(L.dayXP({ steps: { phone: 8000 } }, g).xp, 10); // 3 + 7, not 13
assert.equal(L.dayXP({ urges: 5 }, g).xp, 9);
assert.equal(L.dayXP({ habits: {} }, g).items.find(i => /Clean/.test(i.label)).done, false); // habits not saved = unknown, not clean
// levels: total to reach L = 10(L-1)(L+8)
[[0, 1], [99, 1], [100, 2], [219, 2], [220, 3], [519, 4], [520, 5], [1619, 9], [1620, 10], [5320, 20], [-50, 1], [NaN, 1]].forEach(([x, lv]) => assert.equal(L.level(x).lv, lv, x));
assert.equal(L.level(605).from, 520); assert.equal(L.level(605).to, 700); assert.equal(L.level(99999).title, 'Legend');
// migration keeps the old level; today on uses v2
const old = { profile: { goals: g }, days: {} };
for (let i = 1; i <= 20; i++) old.days['2026-10-' + String(i).padStart(2, '0')] = JSON.parse(JSON.stringify(good)); // ~245 old XP/day
const oldTot = Object.values(old.days).reduce((s, d) => s + L.dayXPv1(d, g), 0), oldLv = Math.floor(Math.sqrt(oldTot / 50)) + 1;
L.migrateXP(old, '2026-11-08');
assert.equal(L.level(L.totalXP(old, g)).lv, oldLv, oldTot + ' -> ' + old.xp.legacy);
old.days['2026-10-05'].meals.push({ kcal: 1 }); assert.equal(L.totalXP(old, g), old.xp.legacy); // frozen past days don't move XP
old.days['2026-11-08'] = { workDone: true }; assert.equal(L.totalXP(old, g), old.xp.legacy + 8);
assert.deepEqual(L.migrateXP({ profile: { goals: g }, days: {} }, '2026-11-08').xp, { v: 2, legacy: 0, start: '' }); // fresh install: all days count
assert.equal(L.sanitize({ profile: {}, days: {}, xp: { legacy: 'x<', start: 'nope' } }).xp, undefined); // bad imported balance gets rebuilt
assert.ok(L.dopamine(bad, g).cheap > L.dopamine(good, g).cheap);
// no data -> no number (nothing faked)
assert.equal(L.recovery({}, null, g), null);
assert.equal(L.mentalScore({}, g), null);
assert.equal(L.healthAge(25, [good, good], g), null); // < 3 days
assert.equal(L.healthAge(25, [{}, {}, {}], g).factors.some(f => /Steps|Sleep|Cigarettes/.test(f[0])), false); // unlogged metrics ignored
const badSleep = Object.assign({}, bad, { sleep: { hours: 5, quality: 2 }, mental: [{ state: 'Overwhelmed', stress: 5, energy: 1 }], habitsSaved: true });
assert.ok(L.recovery(good, null, g) > L.recovery(badSleep, null, g));
assert.ok(L.mentalScore(good, g) > L.mentalScore(badSleep, g));
assert.ok(L.healthAge(25, [good, good, good], g).age < L.healthAge(25, [badSleep, badSleep, badSleep], g).age);
const data = { days: { '2026-11-04': { habitsSaved: true }, '2026-11-05': { habitsSaved: true, habits: { smoke: 1 } }, '2026-11-06': { habitsSaved: true }, '2026-11-07': { habitsSaved: true } } };
assert.equal(L.cleanStreak(data, 'smoke', '2026-11-07'), 2);
assert.equal(L.cleanStreak({ days: { '2026-11-06': {}, '2026-11-07': {} } }, 'smoke', '2026-11-07'), 0); // unlogged days aren't "clean"
assert.equal(L.cleanStreak({ days: { '2026-11-06': { habitsSaved: true } } }, 'smoke', '2026-11-07'), 1); // today not saved yet: count from yesterday
// own prompt in clipboard must not count as an answer
assert.throws(() => L.parseAI('You are... ' + L.PROMPT_MARK + ', no other text:\n{"name":"short meal name","kcal":0}'), /prompt/);
// opening the app alone is not a logged day
assert.equal(L.logged({ date: 'x', steps: { phone: 0 }, screen: { min: 5 } }), false);
assert.equal(L.logged({ date: 'x', sleep: { hours: 7 } }), true);
assert.equal(L.logged({ date: 'x', steps: { manual: 0 } }), true);
// pickups unknown (-1) -> no quest, no negative dopamine
assert.ok(!L.dayXP({ screen: { min: 10, pickups: -1 } }, g).items.some(i => /Pickups|unlocks|screen-ons/.test(i.label)));
assert.equal(L.dopamine({ screen: { min: 0, pickups: -1 } }, g).cheap, 0);
// backup sanitize
const evil = L.sanitize({ profile: { name: 'A"><img src=x onerror=alert(1)>', goals: { kcal: '" autofocus onfocus="x', steps: 9000 } },
  days: { '2026-11-07': { meals: [{ name: "Mom's dal", kcal: '<b>9</b>' }], sleep: { bed: '"onfocus=x' } }, '<script>': {} } });
assert.ok(!/[<>"]/.test(JSON.stringify(evil).replace(/\\"/g, '').replace(/"(?:[^"\\]|\\.)*"/g, s => s.slice(1, -1).includes('"') ? 'BAD' : 'ok')));
assert.equal(evil.profile.goals.kcal, 2200); assert.equal(evil.profile.goals.steps, 9000);
assert.deepEqual(Object.keys(evil.days), ['2026-11-07']);
assert.equal(evil.days['2026-11-07'].meals[0].name, "Mom's dal"); // apostrophes kept (output is escaped anyway)
assert.ok(!evil.profile.name.includes('<') && !evil.days['2026-11-07'].sleep.bed.includes('"'));
assert.throws(() => L.sanitize({ foo: 1 }));
// cigarettes vs life (Shaw et al, BMJ 2000): 11 min each; paper's own sums must come out
assert.equal(L.lifeLost(1), 11); assert.equal(L.lifeLost(-3), 0);
assert.equal(L.fmtMin(L.lifeLost(20)), '3h 40m'); // pack of 20
assert.equal(L.fmtMin(L.lifeLost(200)), '1d 13h'); // carton ≈ 1.5 days
assert.equal(L.fmtMin(22), '22 min');
assert.equal(L.cigYears(5772 / 365, 17), 6.5); // average smoker 17→71 loses 6.5 years
assert.equal(L.cigYears(10, 80), 0); assert.equal(L.cigYears(0, 24), 0);
assert.equal(L.cigTotal({ days: { a: { habits: { smoke: 3 } }, b: {}, c: { habits: { smoke: 2 } } } }), 5);
const smk3 = { habitsSaved: true, habits: { smoke: 3 } }, ha3 = L.healthAge(24, [smk3, smk3, smk3], g);
const cf = ha3.factors.find(f => /Cigarettes/.test(f[0]));
assert.equal(cf[1], L.cigYears(3, 24)); assert.equal(cf[1], 1.1); // 3/day × 365 × 47 yrs × 11 min ≈ 1.08 years
assert.equal(L.healthAge(24, [{ habitsSaved: true }, { habitsSaved: true }, { habitsSaved: true }], g).factors.some(f => /Cigarettes/.test(f[0])), false); // smoke-free: no penalty line
// ---------- GATE Journey (assets/gate.js) ----------
const J = require('./assets/gate.js');
assert.equal(J.gcTests().length, 88); // 55 core + 10 aptitude + 3 rapid fire + 20 mocks
assert.equal(J.P.da.length, 7); assert.equal(J.P.cs.length, 10);
assert.equal(J.T['dsa:python-programming-code-tracing'].prio, 10); assert.equal(J.T['la:svd'].prio, null); // no invented ratings
const gt = J.ensure({}), T0 = '2026-11-17';
assert.deepEqual([gt.target.da, gt.target.cs, gt.apt.target], [69, 77, 20]);
assert.equal(J.ensure({ mocks: 'x', topics: [1], apt: { days: 5 } }).mocks.da.length, 0); // damaged import repaired
// aptitude: today pending (not missed), yesterday missed resets streak only
gt.start = '2026-11-14';
gt.apt.days = { '2026-11-14': { n: 20, ok: 15 }, '2026-11-15': { n: 22, ok: 20 }, '2026-11-16': { n: 5, ok: 4 } };
let ap = J.apt(gt, T0);
assert.equal(ap.state, 'Pending'); assert.equal(ap.yMissed, true); assert.equal(ap.streak, 0); assert.deepEqual(ap.missed, ['2026-11-16']);
assert.equal(ap.total, 47); assert.equal(ap.best, 2); // solved work survives the reset
gt.apt.days[T0] = { n: 20, ok: 18 }; ap = J.apt(gt, T0); assert.equal(ap.state, 'Completed'); assert.equal(ap.streak, 1);
// unique coverage: repeats and anonymous spam can't exceed the bank
const eig = J.cp('da.la.3'); assert.equal(eig.bank, 7);
gt.cps['da.la.3'] = { n: 500, ok: 500 }; let cs = J.cpStat(gt, eig); assert.equal(cs.att, 7); assert.equal(cs.cov, 1);
gt.cps['da.la.3'] = { q: { a: 'ok', b: 'bad', c: 'fixed' }, n: 2, ok: 1 }; cs = J.cpStat(gt, eig);
assert.deepEqual([cs.att, cs.ok, cs.open, cs.fixed], [5, 2, 1, 1]);
// mastery: lectures alone stop at Learning
const tid = 'la:eigenvalues-eigenvectors'; cs.id = 'da.la.3';
gt.topics[tid] = { learn: 2 }; assert.equal(J.topicStatus(gt, tid, { att: 0, cov: 0, acc: null }, T0).name, 'PYQ Pending');
gt.topics[tid] = { learn: 1 }; assert.equal(J.topicStatus(gt, tid, { att: 7, cov: 1, acc: 1 }, T0).name, 'Learning');
gt.topics[tid] = { learn: 2, test: 80, rev: '2026-11-10' }; assert.equal(J.topicStatus(gt, tid, { att: 7, cov: 1, acc: .9 }, T0).name, 'Mastered');
// mocks: <3 = no estimate, latest-5 median, summit needs 5 at target
assert.equal(J.mockStats([{ score: 70 }, { score: 72 }], 69).est, null);
const ms = J.mockStats([40, 50, 60, 70, 71, 72, 80].map((s, i) => ({ score: s, date: '2026-12-0' + (i + 1) })), 69);
assert.equal(ms.est, 71); assert.equal(ms.summit, true); assert.equal(ms.gap, -2);
assert.equal(J.mockStats([70, 71, 72].map(s => ({ score: s })), 69).summit, false);
// DA and CS stay separate; the paper analysis runs on an empty record
gt.mocks.da = [{ score: 50, date: '2026-11-01' }, { score: 55, date: '2026-11-08' }, { score: 60, date: '2026-11-15' }];
const ada = J.analyze(gt, 'da', T0), acs = J.analyze(gt, 'cs', T0);
assert.equal(ada.mock.est, 55); assert.equal(acs.mock.n, 0); assert.equal(acs.mock.conf, 'INSUFFICIENT DATA');
assert.ok(ada.campaign > acs.campaign);
// solving questions moves the climb but never the predicted marks
const before = J.analyze(gt, 'da', T0); gt.cps['da.ps.0'] = { n: 5, ok: 5 }; const after = J.analyze(gt, 'da', T0);
assert.ok(after.campaign > before.campaign); assert.equal(after.mock.est, before.mock.est);
assert.ok(J.quests(gt, { da: ada, cs: acs }, J.apt(gt, T0), T0).every(q => q.why));
// backup round-trip keeps the Journey
assert.equal(L.sanitize({ profile: {}, days: {}, gate: gt }).gate.mocks.da.length, 3);
// v2.9 roadmap: old v2.8 data loads, chapters clear only when every DA topic reaches PYQ, CS never blocks
const gr = J.ensure({ topics: { 'la:svd': { learn: 2 } }, cps: {}, mocks: { da: [], cs: [] } });
assert.deepEqual(gr.topics['la:svd'], { learn: 2 }); assert.ok(gr.road.step && Array.isArray(gr.road.skip));
let RD = J.road(gr, T0); assert.equal(RD.cur, 0); assert.equal(RD.ch[1].open, false);
assert.equal(J.steps(gr, 'la:svd').k, 1);
// the climber moves with concepts first, then GATE Grind, then PYQ
const p0 = RD.ch[0].prog; RD.ch[0].da.forEach(l => l.topics.forEach(t => { gr.road.step[t] = 1; }));
let p1 = J.road(gr, T0).ch[0].prog; assert.ok(p1 > p0 && Math.abs(p1 - 1 / 3) < 1e-9, p1); assert.ok(!J.road(gr, T0).ch[0].cleared);
RD.ch[0].da.forEach(l => l.topics.forEach(t => { gr.road.step[t] = 2; })); assert.ok(Math.abs(J.road(gr, T0).ch[0].prog - 2 / 3) < 1e-9);
RD.ch[0].da.forEach(l => l.topics.forEach(t => { gr.road.step[t] = 3; }));
RD = J.road(gr, T0); assert.ok(RD.ch[0].cleared); assert.ok(RD.ch[0].csDone < RD.ch[0].csTotal); assert.equal(RD.cur, 1); // CS lane untouched, still moved on
assert.ok(!RD.ch[1].cleared); RD.ch[1].da[0].topics.forEach(t => { gr.road.note[t] = 'ok'; }); assert.ok(J.road(gr, T0).ch[1].cleared);
assert.equal(J.road(gr, T0).cur, 2); gr.road.skip.push(2); RD = J.road(gr, T0); assert.equal(RD.cur, 3); assert.ok(RD.ch[2].skipped);
assert.ok(RD.ch[6].da[0].topics.length > 0); // the skipped chapter's topics wait in Syllabus Wrap
assert.equal(RD.backlog.length, RD.ch[2].total); assert.ok(RD.backlog.every(b => b.ch === 2)); // skipped chapter = backlog
gr.road.step[RD.backlog[0].t] = 3; assert.equal(J.road(gr, T0).backlog.length, RD.ch[2].total - 1); // finishing later removes it
delete gr.road.step[RD.backlog[0].t];
// step 4 (mistakes) needs PYQ done and no open mistake on the topic
gr.mistakes.push({ id: 'm1', paper: 'da', cp: 'da.la.4', topic: 'la:svd', at: T0 }); assert.equal(J.steps(gr, 'la:svd').s[3], false);
gr.mistakes[0].fixedAt = T0; assert.equal(J.steps(gr, 'la:svd').s[3], true);
// Reality needs 100% unique coverage of the bank; anonymous repeats can't fake it
const lu = J.cp('da.la.4'); gr.cps['da.la.4'] = { n: 0 }; assert.ok(J.realTopics(gr).indexOf('la:svd') < 0);
gr.cps['da.la.4'] = { n: 50, ok: 40 }; assert.equal(J.cpStat(gr, lu).att, lu.bank); assert.ok(J.realTopics(gr).indexOf('la:svd') >= 0);
// v2.12: the next step follows the map; Grind also completes when the checkpoint bank is fully logged
const gn = J.ensure({}); let RN = J.road(gn, T0), nx = J.roadNext(gn, RN, 1)[0];
assert.equal(nx.ch, 0); assert.equal(nx.step, 0); assert.ok(RN.ch[0].da[0].topics.indexOf(nx.id) >= 0);
const qn = J.quests(gn, { da: J.analyze(gn, 'da', T0), cs: J.analyze(gn, 'cs', T0) }, J.apt(gn, T0), T0, RN);
assert.ok(qn.some(q => q.kind === 'road' && q.ch === 0)); assert.ok(!qn.some(q => q.kind === 'topic'));
assert.equal(J.steps(gn, 'la:svd').s[1], false); gn.cps['da.la.4'] = { n: 50, ok: 40 }; assert.equal(J.steps(gn, 'la:svd').s[1], true); assert.equal(J.steps(gn, 'la:svd').k, 2);
// Hardness: first score sets it, then 0.6 old + 0.4 new; rises and falls are both shown, Hardening XP only for rises
const gh = J.ensure({}); gh.tests['gc.0.1'] = { done: true, score: 50, max: 100, at: '2026-11-01' }; gh.tests['gc.0.2'] = { done: true, score: 100, max: 100, at: '2026-11-02' };
let la = J.hard(gh, 'da').filter(h => h.id === 'la')[0]; assert.equal(la.h, 70); assert.equal(la.trend, 1); assert.equal(la.up, 1);
gh.mocks.da.push({ score: 40, date: '2026-11-03', parts: { la: [0, 10] } }); la = J.hard(gh, 'da').filter(h => h.id === 'la')[0];
assert.equal(la.h, 42); assert.equal(la.trend, -1); assert.equal(la.up, 1);
assert.equal(J.hard(gh, 'cs').every(h => h.h == null), true); // DA scores never leak into CS
assert.ok(J.xp(gr, T0) > J.xp(J.ensure({ topics: { 'la:svd': { learn: 2 } } }), T0));
// Accenture Offer Tower: 14 floors, unique task ids, climb follows ticks, archive never blocks
const AC = require('./assets/acc.js');
assert.equal(AC.FLOORS.length, 14);
const aIds = AC.FLOORS.concat([AC.ARCH]).flatMap(f => f.tasks.map(t => t.id)); assert.equal(new Set(aIds).size, aIds.length);
assert.ok(AC.FLOORS.every(f => f.tasks.every(t => AC.CAT[t.cat])));
const ac = AC.ensure(null); let as = AC.stat(ac); assert.deepEqual([as.cur, as.pos, as.xp, as.roof], [0, 0, 0, false]);
AC.FLOORS[0].tasks.slice(0, 4).forEach(t => { ac.done[t.id] = T0; }); as = AC.stat(ac); assert.equal(as.cur, 0); assert.equal(as.pos, 4 / AC.FLOORS[0].tasks.length);
AC.FLOORS[0].tasks.forEach(t => { ac.done[t.id] = T0; }); as = AC.stat(ac); assert.equal(as.cur, 1); assert.ok(as.floors[0].cleared);
assert.equal(as.xp, 5 * AC.FLOORS[0].tasks.length + 30);
AC.ARCH.tasks.forEach(t => { ac.done[t.id] = T0; }); assert.equal(AC.stat(ac).cur, 1); // archive is optional
AC.FLOORS.forEach(f => f.tasks.forEach(t => { ac.done[t.id] = T0; })); as = AC.stat(ac); assert.ok(as.roof); assert.equal(as.pos, 14); assert.ok(as.wings.every(w => w.cleared));
assert.equal(AC.clampMock('code', 9), 3); assert.equal(AC.clampMock('mcq', -2), 0);
assert.ok(L.sanitize({ profile: {}, days: {}, acc: ac }).acc.done['f1.0']);
console.log('ok — all logic checks passed');
