// Pictures: your Avatar studio image if you made one, else the edition's bundled photo, else built-in pixel art.
// The built-in art is drawn here on a small canvas (160x90 scenes, 32x32 sprite) and shown pixelated, so it ships no files.
(function (root) {
  var CH = [ // a generic character, 10 x 16
    '...HHHH...', '..HHHHHH..', '..HSSSSH..', '..SESSES..', '..SSSSSS..', '...SSSS...', '....SS....', '..TTTTTT..',
    '.TTTTTTTT.', '.STTTTTTS.', '.STTTTTTS.', '..TTTTTT..', '..PP..PP..', '..PP..PP..', '..PP..PP..', '..BB..BB..'];
  var PAL = { H: '#2b1d14', S: '#e0a878', E: '#121411', T: '#5fa83a', P: '#2d3a5a', B: '#121411' };
  function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function hero(x, k, X, Y) { CH.forEach(function (r, j) { for (var i = 0; i < r.length; i++) if (r[i] !== '.') { x.fillStyle = PAL[r[i]]; x.fillRect(X + i * k, Y + j * k, k, k); } }); }
  function R(x, a, b, w, h, c) { x.fillStyle = c; x.fillRect(a, b, w, h); }
  function tri(x, cx, top, h, c) { for (var i = 0; i < h; i++) R(x, cx - i, top + i, 2 * i + 1, 1, c); } // pixel mountain
  function dots(x, n, c, seed, hMax) { for (var i = 0; i < n; i++) { seed = seed * 16807 % 2147483647; var a = seed % 160; seed = seed * 16807 % 2147483647; R(x, a, seed % (hMax || 60), 1, 1, c); } }
  var SC = {
    study: ['#141a2e', '#2a2418', function (x) { R(x, 96, 50, 50, 4, '#6b4a2b'); R(x, 104, 38, 22, 12, '#3b4552'); R(x, 106, 40, 18, 8, '#7fe0f0'); R(x, 132, 30, 2, 20, '#555'); R(x, 128, 28, 10, 4, '#f2c14e'); dots(x, 25, '#dfe8ff', 7, 30); }],
    camp: ['#1b2335', '#2a2418', function (x) { tri(x, 40, 20, 50, '#4b5563'); tri(x, 40, 20, 8, '#e8eddc'); tri(x, 120, 10, 60, '#3d4656'); tri(x, 120, 10, 9, '#e8eddc'); tri(x, 110, 52, 18, '#d07a2a'); R(x, 70, 66, 8, 4, '#e2604d'); R(x, 72, 62, 4, 4, '#f2c14e'); }],
    boss: ['#3d1818', '#2a1010', function (x) { R(x, 96, 14, 50, 56, '#4a2a5e'); R(x, 104, 28, 10, 8, '#ff5f5f'); R(x, 126, 28, 10, 8, '#ff5f5f'); R(x, 108, 50, 26, 4, '#e8eddc'); R(x, 100, 70, 8, 6, '#4a2a5e'); R(x, 132, 70, 8, 6, '#4a2a5e'); }],
    win: ['#1e3a21', '#2a2418', function (x) { dots(x, 60, '#f2c14e', 3); dots(x, 40, '#ff5fa8', 9); dots(x, 40, '#7fe0f0', 13); R(x, 110, 34, 22, 16, '#f2c14e'); R(x, 117, 50, 8, 10, '#f2c14e'); R(x, 112, 60, 18, 4, '#b07a3a'); }],
    summit: ['#f0a050', '#e8eddc', function (x) { R(x, 0, 0, 160, 30, '#5a4a8a'); R(x, 0, 30, 160, 20, '#e2804d'); R(x, 70, 40, 20, 20, '#ffd76a'); tri(x, 80, 30, 40, '#5d6878'); tri(x, 80, 30, 12, '#ffffff'); R(x, 100, 10, 2, 22, '#d9d2b8'); R(x, 102, 10, 12, 8, '#e2604d'); }],
    recover: ['#1e2a2a', '#2a2418', function (x) { tri(x, 115, 36, 34, '#2f6b5a'); R(x, 108, 56, 14, 14, '#1a2a24'); R(x, 70, 58, 12, 12, '#8a96a8'); R(x, 74, 62, 4, 4, '#1e2a2a'); }],
    timeout: ['#2a2418', '#3a2d1c', function (x) { R(x, 100, 12, 46, 46, '#e8eddc'); R(x, 104, 16, 38, 38, '#121411'); R(x, 122, 20, 2, 16, '#f2c14e'); R(x, 122, 34, 14, 2, '#e2604d'); }],
    burnout: ['#1b1f2a', '#22201a', function (x) { R(x, 96, 10, 54, 40, '#2a3352'); for (var i = 0; i < 18; i++) R(x, 98 + (i * 7) % 50, 12 + (i * 11) % 34, 1, 5, '#7f9fd9'); R(x, 60, 58, 40, 4, '#6b4a2b'); R(x, 84, 50, 6, 8, '#9bd35a'); }],
    comeback: ['#e2804d', '#2a2418', function (x) { R(x, 0, 0, 160, 25, '#5a4a8a'); R(x, 60, 30, 40, 26, '#ffd76a'); dots(x, 30, '#ffffff', 21, 60); }],
    diag: ['#101a2a', '#16202a', function (x) { R(x, 100, 16, 44, 34, '#7fe0f0'); R(x, 104, 20, 36, 26, '#ff8fc8'); R(x, 120, 20, 2, 26, '#7fe0f0'); R(x, 96, 54, 52, 2, '#7fe0f0'); }],
    analytics: ['#142028', '#16202a', function (x) { R(x, 92, 10, 60, 44, '#0a0c0a'); [12, 20, 16, 28, 36].forEach(function (h, i) { R(x, 98 + i * 11, 50 - h, 7, h, '#9bd35a'); }); R(x, 96, 18, 52, 2, '#f2c14e'); }],
    gate: ['#283147', '#2a2418', function (x) { tri(x, 80, 4, 70, '#4b5563'); R(x, 62, 34, 36, 40, '#6b6f78'); R(x, 70, 42, 20, 32, '#121411'); R(x, 60, 30, 40, 6, '#8a8f98'); }],
    acc: ['#0b1020', '#1a140e', function (x) { dots(x, 30, '#dfe8ff', 5, 40); R(x, 100, 6, 40, 70, '#2b3346'); for (var r = 0; r < 8; r++) for (var c = 0; c < 4; c++) R(x, 104 + c * 9, 10 + r * 8, 5, 4, (r + c) % 3 ? '#ffd76a' : '#121a2c'); }],
    dev: ['#141a20', '#2a2418', function (x) { R(x, 84, 20, 32, 24, '#0a0c0a'); R(x, 120, 20, 32, 24, '#0a0c0a'); for (var i = 0; i < 5; i++) { R(x, 88, 24 + i * 4, 10 + (i * 7) % 18, 2, '#9bd35a'); R(x, 124, 24 + i * 4, 8 + (i * 5) % 20, 2, '#7fe0f0'); } R(x, 80, 50, 76, 4, '#6b4a2b'); }],
    dev2: ['#2a2a2a', '#2a2418', function (x) { R(x, 80, 8, 70, 48, '#e8eddc'); [['#f2c14e', 86, 14], ['#ff8fc8', 104, 14], ['#7fe0f0', 122, 14], ['#9bd35a', 86, 34], ['#f2c14e', 110, 34]].forEach(function (s) { R(x, s[1], s[2], 14, 12, s[0]); }); }],
    smoke: ['#7fb0e0', '#2f6b2a', function (x) { R(x, 96, 40, 20, 4, '#e8eddc'); R(x, 124, 46, 20, 4, '#e8eddc'); R(x, 140, 46, 4, 4, '#e2804d'); dots(x, 10, '#ffffff', 31, 30); }]
  };
  var cache = {};
  function scene(n) {
    var s = SC[n] || SC.study, c = cv(160, 90), x = c.getContext('2d');
    R(x, 0, 0, 160, 90, s[0]); R(x, 0, 72, 160, 18, s[1]); s[2](x); hero(x, 3, 30, 24);
    return c.toDataURL();
  }
  function sprite() { var c = cv(32, 32), x = c.getContext('2d'); hero(x, 2, 6, 0); return c.toDataURL(); }
  function portrait() { var c = cv(64, 64), x = c.getContext('2d'); R(x, 0, 0, 64, 64, '#1e3a21'); hero(x, 6, 2, 0); return c.toDataURL(); }
  root.ART = {
    SLOTS: ['portrait', 'hero'].concat(Object.keys(SC)),
    builtin: function (n) { return cache[n] || (cache[n] = n === 'hero' ? sprite() : n === 'portrait' ? portrait() : scene(n)); }
  };
})(this);

// User images (Avatar studio) win, then the edition's bundled photos, then the built-in art.
var IMG = {};
function jImg(n) {
  if (IMG[n]) return IMG[n];
  if (n === 'portrait' && IMG.base) return IMG.base; // the base avatar stands in until a portrait is made
  if (window.EDITION && EDITION.photos) return n === 'portrait' ? 'avatar.png' : n === 'hero' ? 'j_hero.png' : 'j_' + n + '.jpg';
  return ART.builtin(n);
}
