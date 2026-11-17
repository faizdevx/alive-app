// Pure game/score logic. No DOM, so test.js can run it under node.
var L = (function () {
  var BAD = { // xp penalty per occurrence
    smoke: { label: 'Smoking', xp: -15, count: true },
    porn: { label: 'Pornography', xp: -25 },
    mast: { label: 'Masturbation', xp: -10 },
    gaming: { label: 'Excess gaming', xp: -10 },
    scroll: { label: 'Excessive scrolling', xp: -15 },
    late: { label: 'Late-night phone', xp: -10 }
  };
  var TITLES = ['Rookie', 'Starter', 'Regular', 'Steady', 'Locked In', 'Disciplined',
    'Relentless', 'Iron Will', 'Elite', 'Master', 'Legend'];

  function n(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ymd(d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); }
  function addDays(s, k) { var d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + k); return ymd(d); }

  // ChatGPT reply -> object. Tolerates ```json fences and chatter around the JSON.
  var PROMPT_MARK = 'Reply with ONLY this JSON';
  function parseAI(text) {
    text = String(text || '').replace(/[“”]/g, '"');
    var a = text.indexOf('{'), b = text.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error('No JSON found in pasted text');
    // Our own prompt (copied as a fallback) contains the blank template — never treat it as an answer.
    if (text.indexOf(PROMPT_MARK) >= 0) throw new Error('Clipboard still has the prompt, not ChatGPT\'s answer');
    return JSON.parse(text.slice(a, b + 1).replace(/,\s*([}\]])/g, '$1'));
  }
  function normMeal(o) {
    var items = (o.items || []).map(function (i) { return { food: String(i.food || i.name || ''), qty: String(i.qty || ''), kcal: n(i.kcal), p: n(i.p), c: n(i.c), f: n(i.f) }; });
    var sum = function (k) { return items.reduce(function (s, i) { return s + i[k]; }, 0); };
    return { name: String(o.name || 'Meal'), kcal: n(o.kcal) || sum('kcal'), p: n(o.p) || sum('p'), c: n(o.c) || sum('c'), f: n(o.f) || sum('f'), fiber: n(o.fiber), items: items, note: String(o.note || ''), confidence: String(o.confidence || '') };
  }
  function normWorkout(o) {
    return { title: String(o.title || 'Workout'), min: n(o.duration_min || o.min), kcal: n(o.kcal), intensity: String(o.intensity || ''),
      muscles: (o.muscles || []).map(String), exercises: (o.exercises || []).map(function (e) { return { name: String(e.name || ''), sets: n(e.sets), reps: String(e.reps || ''), weight: String(e.weight || '') }; }), note: String(o.note || ''), confidence: String(o.confidence || '') };
  }

  // Step-day maths lives in Java (StepDay.java, simulated by tools/StepSim.java).

  function sleepHours(bed, wake) {
    if (!bed || !wake) return 0;
    var p = function (t) { var x = t.split(':'); return n(x[0]) * 60 + n(x[1]); };
    var m = p(wake) - p(bed); if (m <= 0) m += 1440;
    return Math.round(m / 6) / 10;
  }

  function totals(day) {
    var t = { kcal: 0, p: 0, c: 0, f: 0 };
    (day.meals || []).forEach(function (m) { t.kcal += n(m.kcal); t.p += n(m.p); t.c += n(m.c); t.f += n(m.f); });
    return t;
  }
  function steps(day) { var s = day.steps || {}; return s.manual != null && s.manual !== '' ? n(s.manual) : n(s.phone); }
  function badCount(day) { var h = day.habits || {}, c = 0; for (var k in BAD) c += BAD[k].count ? n(h[k]) : (h[k] ? 1 : 0); return c; }
  function lastMental(day) { var m = day.mental || []; return m[m.length - 1]; }

  // XP rules v2. Returns {xp, items:[{label,xp,done,slip}]}; items double as the day's quest list.
  // XP is computed from saved records only, so re-saving, editing or reopening never pays twice. Every reward is capped; max 102/day.
  // Slips cost no XP (honest logging must never erase progress): they show in quests, kill the clean-day bonus, streaks and dopamine.
  var DAY_MAX = 102;
  function dayXP(day, g) {
    var it = [], t = totals(day), st = steps(day), s = day.sleep || {}, sl = s.hours || 0, h = day.habits || {}, sc = day.screen, ml = (day.meals || []).length, m = lastMental(day) || {};
    function q(label, xp, done) { it.push({ label: label, xp: xp, done: !!done }); }
    q('Log meals (max 4)', ml ? Math.min(ml, 4) * 2 : 8, ml > 0);
    q('Protein ' + g.protein + 'g', 8, t.p >= g.protein);
    q('Calories on target', 4, t.kcal > 0 && Math.abs(t.kcal - g.kcal) <= g.kcal * 0.1);
    var w = (day.workouts || []).length;
    q('Workout' + (w > 1 ? ' x2' : ''), w > 1 ? 20 : 15, w > 0);
    q('Steps ' + g.steps, st >= g.steps ? 10 : st >= g.steps / 2 ? 3 : 10, st >= g.steps / 2); // 50% = 3, 100% = 3 + 7
    q('Sleep ' + g.sleep + 'h', 10 + (n(s.quality) >= 4 ? 3 : 0), sl >= g.sleep - 0.5);
    q('Sticky-note work done', 8, day.workDone);
    q('Mental check-in' + (m.state === 'Flow' ? ' · Flow' : ''), 3 + (m.state === 'Flow' ? 2 : 0), lastMental(day));
    if (day.urges) q('Urges resisted x' + day.urges + (day.urges > 3 ? ' (max 3)' : ''), Math.min(n(day.urges), 3) * 3, true);
    if (sc) {
      q('Screen < ' + g.screen + 'm', 6, sc.min <= g.screen);
      if (sc.pickups >= 0) q((sc.pickKind || 'Pickups') + ' < 50', 3, sc.pickups < 50);
    }
    var bad = 0;
    for (var k in BAD) { var c = BAD[k].count ? n(h[k]) : (h[k] ? 1 : 0); if (c) { bad += c; it.push({ label: BAD[k].label + (c > 1 ? ' x' + c : ''), xp: 0, done: true, slip: true }); } }
    q('Clean day (habits saved, none ticked)', 8, !bad && day.habitsSaved);
    var xp = it.reduce(function (a, i) { return a + (i.done ? i.xp : 0); }, 0);
    return { xp: Math.min(xp, DAY_MAX), items: it };
  }

  // Level L needs 100 + 20(L-1) XP; total to reach L = 10(L-1)(L+8). Lv2 at 100, Lv5 at 520, Lv10 at 1620.
  function xpFor(lv) { return 10 * (lv - 1) * (lv + 8); }
  function level(total) {
    var xp = Math.max(0, Math.floor(n(total))), lv = 1 + Math.floor((Math.sqrt(8100 + 40 * xp) - 90) / 20);
    while (xpFor(lv + 1) <= xp) lv++; while (lv > 1 && xpFor(lv) > xp) lv--; // float guard at exact thresholds
    return { lv: lv, title: TITLES[Math.min(lv - 1, TITLES.length - 1)], from: xpFor(lv), to: xpFor(lv + 1) };
  }

  // v1 rules (up to 2.3.1), kept only to carry old progress over once.
  function dayXPv1(day, g) {
    var x = 0, t = totals(day), st = steps(day), s = day.sleep || {}, h = day.habits || {}, sc = day.screen, w = (day.workouts || []).length, ml = (day.meals || []).length, m = lastMental(day), bad = 0;
    x += Math.min(ml, 4) * 5 + (t.p >= g.protein ? 20 : 0) + (t.kcal > 0 && Math.abs(t.kcal - g.kcal) <= g.kcal * 0.1 ? 15 : 0) + (w ? 50 + (w - 1) * 20 : 0);
    x += st >= g.steps ? 30 : st >= g.steps / 2 ? 10 : 0;
    if ((s.hours || 0) >= g.sleep - 0.5) x += 30 + (n(s.quality) >= 4 ? 10 : 0);
    x += (day.workDone ? 40 : 0) + (m ? 10 + (m.state === 'Flow' ? 15 : 0) : 0) + n(day.urges) * 10;
    if (sc) { x += sc.min > g.screen * 2 ? -20 : sc.min <= g.screen ? 30 : 0; if (sc.pickups >= 0 && sc.pickups < 50) x += 10; }
    for (var k in BAD) { var c = BAD[k].count ? n(h[k]) : (h[k] ? 1 : 0); bad += c; x += BAD[k].xp * c; }
    return x + (!bad && day.habitsSaved ? 25 : 0);
  }
  // One-time switch to v2: keep the level (and progress inside it) you had under v1 as a starting balance.
  // Days before `start` are frozen into `legacy`; v2 rules count from `start` (today) on.
  function migrateXP(data, today) {
    var old = 0, any = false, g = data.profile.goals;
    for (var k in data.days) if (k < today) { old += dayXPv1(data.days[k], g); any = true; }
    old = Math.max(0, old);
    var olv = Math.floor(Math.sqrt(old / 50)) + 1, of = 50 * (olv - 1) * (olv - 1), ot = 50 * olv * olv;
    data.xp = { v: 2, legacy: any ? Math.floor(xpFor(olv) + (old - of) / (ot - of) * (xpFor(olv + 1) - xpFor(olv))) : 0, start: any ? today : '' };
    return data;
  }
  function totalXP(data, g) {
    var x = data.xp || { legacy: 0, start: '' }, s = n(x.legacy);
    for (var k in data.days) if (k >= x.start) s += dayXP(data.days[k], g).xp;
    return Math.max(0, s);
  }

  // "Cheap" vs "earned" dopamine for the day, 0..100 each.
  function dopamine(day, g) {
    var h = day.habits || {}, sc = day.screen || { min: 0, pickups: 0 };
    var cheap = clamp((sc.min / g.screen) * 35 + Math.max(n(sc.pickups), 0) / 4 + n(h.smoke) * 8 + (h.porn ? 25 : 0) + (h.mast ? 10 : 0) + (h.gaming ? 10 : 0) + (h.scroll ? 15 : 0) + (h.late ? 10 : 0), 0, 100);
    var earned = clamp((day.workDone ? 40 : 0) + ((day.workouts || []).length ? 25 : 0) + Math.min(steps(day) / g.steps, 1) * 15 + ((lastMental(day) || {}).state === 'Flow' ? 15 : 0) + n(day.urges) * 5, 0, 100);
    return { cheap: Math.round(cheap), earned: Math.round(earned) };
  }

  // Readiness from logged sleep only (+ stress, yesterday's workout, smoking when logged). null = no sleep logged.
  function recovery(day, prev, g) {
    var s = day.sleep || {}; if (!s.hours) return null;
    var v = clamp(s.hours / g.sleep, 0, 1) * 70 + n(s.quality) / 5 * 30 - n(s.awake) * 3;
    var m = lastMental(day); if (m) v = v * 0.8 + (100 - (n(m.stress) - 1) * 25) * 0.2;
    v -= clamp(((prev || {}).workouts || []).reduce(function (a, w) { return a + n(w.kcal); }, 0) / 20, 0, 15);
    v -= Math.min(n((day.habits || {}).smoke) + n(((prev || {}).habits || {}).smoke), 6) * 5;
    return Math.round(clamp(v, 0, 100));
  }

  // null until you do a check-in today.
  function mentalScore(day, g) {
    var m = lastMental(day); if (!m) return null;
    var d = dopamine(day, g), s = (day.sleep || {}).hours;
    var v = 50 + (s ? clamp((s - 6) * 8, -20, 15) : 0) + (d.earned - d.cheap) * 0.3;
    v += ({ Flow: 15, Recovering: 5, Distracted: -5, Bored: -5, Overwhelmed: -12 })[m.state] || 0;
    v -= (n(m.stress) - 3) * 4; v += (n(m.energy) - 3) * 3;
    return Math.round(clamp(v, 0, 100));
  }

  // A day counts as logged only if you entered something (automatic step/screen readings don't count).
  function logged(d) {
    return !!(d && ((d.meals || []).length || (d.workouts || []).length || d.sleep || d.habitsSaved || (d.mental || []).length || d.workDone || n(d.urges) ||
      ((d.steps || {}).manual != null && d.steps.manual !== '')));
  }
  // Backup restore: strip characters that could break out of HTML/attributes, force numeric goals, drop bad day keys.
  function sanitize(o) {
    var clean = function (v) {
      if (typeof v === 'string') return v.replace(/[<>"`]/g, '');
      if (typeof v === 'number') return isFinite(v) ? v : 0;
      if (Array.isArray(v)) return v.map(clean);
      if (v && typeof v === 'object') { var r = {}; for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k) && k !== '__proto__') r[clean(k)] = clean(v[k]); return r; }
      return typeof v === 'boolean' || v == null ? v : '';
    };
    var d = clean(o), days = {};
    if (!d || typeof d.days !== 'object' || typeof d.profile !== 'object') throw new Error('Not an ALIVE? backup');
    for (var k in d.days) if (/^\d{4}-\d{2}-\d{2}$/.test(k)) {
      var x = d.days[k] || {}; x.date = k;
      x.meals = (Array.isArray(x.meals) ? x.meals : []).map(function (m) { var r = normMeal(m || {}); r.t = String((m || {}).t || ''); return r; });
      x.workouts = (Array.isArray(x.workouts) ? x.workouts : []).map(function (w) { var r = normWorkout(w || {}); r.t = String((w || {}).t || ''); return r; });
      if (!Array.isArray(x.mental)) delete x.mental;
      days[k] = x;
    }
    d.days = days;
    // Imported XP balance is re-validated; a bad or missing one is rebuilt by migrateXP after import.
    if (!d.xp || !(n(d.xp.legacy) >= 0) || !/^(\d{4}-\d{2}-\d{2})?$/.test(String(d.xp.start))) delete d.xp;
    else d.xp = { v: 2, legacy: Math.floor(n(d.xp.legacy)), start: String(d.xp.start) };
    var g = d.profile.goals || {}; ['kcal', 'protein', 'carbs', 'fat', 'steps', 'sleep', 'screen'].forEach(function (x) { g[x] = n(g[x]) || ({ kcal: 2200, protein: 120, carbs: 250, fat: 65, steps: 8000, sleep: 7, screen: 120 })[x]; });
    d.profile.goals = g;
    return d;
  }
  // Shaw, Mitchell & Dorling, BMJ 2000;320:53 "One cigarette reduces your life by 11 minutes":
  // 6.5 years lost / 311,688 lifetime cigarettes (5772/yr from 17 to death at 71). Crude average, male data, but easy to grasp.
  var CIG_MIN = 11, CIG_END_AGE = 71;
  function lifeLost(cigs) { return Math.max(0, n(cigs)) * CIG_MIN; } // minutes
  function cigTotal(data) { var s = 0; for (var k in data.days) s += Math.max(0, n(((data.days[k] || {}).habits || {}).smoke)); return s; }
  // Years lost if you keep smoking `perDay` from `age` to 71, at 11 min each.
  function cigYears(perDay, age) { return Math.round(Math.max(0, n(perDay)) * 365 * Math.max(0, CIG_END_AGE - n(age)) * CIG_MIN / 525600 * 10) / 10; }
  function fmtMin(m) {
    m = Math.round(Math.max(0, n(m)));
    if (m < 60) return m + ' min';
    if (m < 1440) return Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
    var d = Math.floor(m / 1440), h = Math.round((m % 1440) / 60); if (h === 24) { d++; h = 0; }
    return d + 'd ' + h + 'h';
  }
  function hasSteps(d) { var s = d.steps || {}; return (s.manual != null && s.manual !== '') || s.phone != null; }
  function avgOf(days, has, f) { var xs = days.filter(has).map(f); return xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : null; }

  // Rule-of-thumb estimate, not medical. Uses only metrics you actually logged; returns each factor so nothing is hidden.
  function healthAge(age, days, g) {
    if (!age || days.length < 3) return null;
    var f = [], add = function (label, v) { if (v) f.push([label, v]); };
    var st = avgOf(days, hasSteps, steps), sl = avgOf(days, function (d) { return (d.sleep || {}).hours; }, function (d) { return d.sleep.hours; });
    var cig = avgOf(days, function (d) { return d.habitsSaved; }, function (d) { return n((d.habits || {}).smoke); }), scr = avgOf(days, function (d) { return d.screen; }, function (d) { return d.screen.min; });
    var wo = days.reduce(function (s, d) { return s + (d.workouts || []).length; }, 0) * 7 / days.length;
    if (st != null) add('Steps avg ' + Math.round(st), st < 4000 ? 3 : st < 8000 ? 1 : st < 10000 ? -1 : -2);
    if (sl != null) add('Sleep avg ' + sl.toFixed(1) + 'h', sl < 6 ? 3 : sl < 7 ? 1 : sl <= 9 ? -1 : 1);
    add('Workouts ' + wo.toFixed(1) + '/week', wo < 1 ? 2 : wo < 3 ? 0 : wo < 5 ? -2 : -3);
    // Smoking: years of life lost if this pace continued to 71, at 11 min per cigarette (BMJ 2000).
    if (cig != null) add('Cigarettes ' + cig.toFixed(1) + '/day: life lost if kept up to ' + CIG_END_AGE, cigYears(cig, age));
    if (scr != null) add('Screen avg ' + Math.round(scr) + 'm', scr > 300 ? 1 : 0);
    return { age: Math.round(f.reduce(function (a, x) { return a + x[1]; }, n(age)) * 10) / 10, factors: f, days: days.length };
  }

  // Consecutive logged-clean days. Days you didn't save habits break the streak (today is skipped until saved).
  function cleanStreak(data, key, today) {
    var c = 0, d = (data.days[today] || {}).habitsSaved ? today : addDays(today, -1);
    for (;;) { var x = data.days[d]; if (!x || !x.habitsSaved) break; var h = x.habits || {}; if (BAD[key].count ? n(h[key]) : h[key]) break; c++; d = addDays(d, -1); }
    return c;
  }

  return { BAD: BAD, parseAI: parseAI, normMeal: normMeal, normWorkout: normWorkout, sleepHours: sleepHours, totals: totals, steps: steps, hasSteps: hasSteps, logged: logged, sanitize: sanitize, PROMPT_MARK: PROMPT_MARK,
    CIG_MIN: CIG_MIN, lifeLost: lifeLost, cigTotal: cigTotal, cigYears: cigYears, fmtMin: fmtMin,
    badCount: badCount, dayXP: dayXP, DAY_MAX: DAY_MAX, level: level, xpFor: xpFor, dayXPv1: dayXPv1, migrateXP: migrateXP, totalXP: totalXP, dopamine: dopamine, recovery: recovery, mentalScore: mentalScore, healthAge: healthAge, cleanStreak: cleanStreak,
    ymd: ymd, addDays: addDays, clamp: clamp, n: n };
})();
if (typeof module !== 'undefined') module.exports = L;
