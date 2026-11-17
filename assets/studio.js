// ---------- Avatar studio: selfie -> base pixel avatar -> every other picture made from that avatar ----------
// Pictures go to ChatGPT only when you tap. They come back through Android's share sheet (AvatarImg.java fits them to the slot).
var ST_TAIL = ' Style: 16-bit pixel art, crisp hard-edged pixels, no anti-aliasing, limited 32-colour palette, dark muted background close to #121411, no text, no logos, no watermark. Keep the exact same character as the reference image: face shape, hairstyle, glasses, skin tone and outfit colours.';
var ST = {
  base: ['Base avatar', 'Turn the person in this photo into a pixel-art game character. Chest-up portrait, facing forward, friendly confident expression. Keep their real face shape, hairstyle, facial hair, glasses and skin tone. Simple t-shirt in their own clothing colour. Square image.'],
  portrait: ['Home portrait', 'Same character, chest-up, slight 3/4 turn, arms crossed, small smile. Square image.'],
  hero: ['Map climber', 'Same character, full body, standing, 3/4 view, small game sprite on a plain flat white background, no ground or shadow. Square image.'],
  study: ['Study', 'Same character at a desk at night, laptop and notebook open, desk lamp, focused. 16:9 landscape.'],
  camp: ['Base camp', 'Same character sitting by a small campfire beside a tent at the foot of a mountain, planning with a map. 16:9 landscape.'],
  boss: ['Boss fight', 'Same character facing a giant shadowy exam-paper monster in an arena, determined stance. 16:9 landscape.'],
  win: ['Victory', 'Same character celebrating with a fist raised, confetti and a glowing trophy. 16:9 landscape.'],
  summit: ['Summit', 'Same character planting a flag on a snowy mountain peak at sunrise. 16:9 landscape.'],
  recover: ['Recovery', 'Same character at a field tent fixing a broken gear with tools, calm and patient. 16:9 landscape.'],
  timeout: ['Time pressure', 'Same character checking a big clock, slightly rushed, papers in hand. 16:9 landscape.'],
  burnout: ['Burnout', 'Same character slumped at a desk, tired, rain on the window, a small sprout growing in a cup. 16:9 landscape.'],
  comeback: ['Comeback', 'Same character standing back up and dusting off, sunrise behind, a spark of energy. 16:9 landscape.'],
  diag: ['Diagnosis', 'Same character studying a glowing holographic brain diagram. 16:9 landscape.'],
  analytics: ['Analytics', 'Same character in front of big screens of charts and graphs, pointing at a rising line. 16:9 landscape.'],
  gate: ['GATE journey', 'Same character at the base of a huge stone gate set into a mountain, the path leading up. 16:9 landscape.'],
  acc: ['Placement tower', 'Same character in smart casual clothes in front of a tall glass office tower at night, ID badge. 16:9 landscape.'],
  dev: ['Lab: coding', 'Same character coding at a desk with two monitors full of code, headphones around the neck. 16:9 landscape.'],
  dev2: ['Lab: planning', 'Same character at a whiteboard sketching an app design with sticky notes. 16:9 landscape.'],
  smoke: ['Quit smoking', 'Same character snapping a cigarette in half, determined, clear air around them. 16:9 landscape.']
};
function stOn() { return !!A.avAsk; }
function avLoad() {
  try { IMG = stOn() ? JSON.parse(A.avList()) || {} : {}; } catch (e) { IMG = {}; }
  document.documentElement.style.setProperty('--av', 'url("' + jImg('portrait') + '")');
}
function onAvImg(slot) {
  avLoad(); if (slot === 'base') A.clearPhoto(); // the selfie is not kept once the avatar exists
  buzz([20, 40, 20]); toast((ST[slot] || [slot])[0] + ' saved');
  if (stack[stack.length - 1] === 'studio') R.studio();
}
function stAsk(slot) { var e = A.avAsk(slot, ST[slot][1] + ST_TAIL); if (e) toast(e); }
function stReset(slot) { if (!confirm('Go back to the built-in picture for "' + ST[slot][0] + '"?')) return; A.avDelete(slot); avLoad(); R.studio(); }
R.studio = function () {
  var h = hdr('AVATAR STUDIO');
  if (!stOn()) return v('studio', h + '<div class="muted">The Avatar studio needs the app on your phone.</div>');
  var base = IMG.base, photo = A.hasPhoto();
  h += '<div class="panel"><div class="muted">Your photo becomes a pixel avatar, then every picture in the app is made from that avatar so it always looks like you. A picture goes to ChatGPT only when you tap. The photo is deleted as soon as your avatar is in.</div>' +
    '<div class="say" style="margin-top:8px">In ChatGPT: send, wait for the picture, tap it, tap <b>Share</b>, choose <b>ALIVE?</b>.</div></div>';
  h += '<div class="panel"><h3>1 · Base avatar</h3><div class="row" style="gap:10px;align-items:center">' +
    (base ? '<img class="jth" src="' + base + '" alt="">' : '<div class="jth muted" style="display:flex;align-items:center;justify-content:center">?</div>') +
    '<div class="muted" style="flex:1">' + (base ? 'Done. Redo it any time: the other pictures keep theirs until you remake them.' : photo ? 'Photo ready. Send it to ChatGPT.' : 'Take a selfie or pick a clear photo of your face.') + '</div></div>' +
    '<div class="row"><button onclick="A.pickPhoto(true)">Take selfie</button><button onclick="A.pickPhoto(false)">Pick photo</button></div>' +
    (photo ? '<button class="pri" onclick="stAsk(\'base\')">Send to ChatGPT</button>' : '') + '</div>';
  h += '<div class="panel"><h3>2 · Your pictures</h3><div class="muted" style="margin-bottom:8px">' + (base ? 'Tap a picture to make your version. ' : 'Make the base avatar first. ') + Object.keys(IMG).filter(function (k) { return k !== 'base'; }).length + ' / ' + ART.SLOTS.length + ' made.</div>' +
    '<div class="g2">' + ART.SLOTS.map(function (s) {
      return '<div style="position:relative"><img src="' + jImg(s) + '" alt="" style="width:100%;aspect-ratio:' + (s === 'hero' || s === 'portrait' ? '1' : '16/9') + ';object-fit:cover;image-rendering:pixelated;border:2px solid ' + (IMG[s] ? 'var(--acc)' : 'var(--line)') + (base ? ';cursor:pointer" onclick="stAsk(\'' + s + '\')"' : '"') + '>' +
        '<div class="row sp" style="font-size:12px"><span>' + ST[s][0] + '</span>' + (IMG[s] ? '<a class="muted" onclick="stReset(\'' + s + '\')">reset</a>' : '<span class="muted">built-in</span>') + '</div></div>';
    }).join('') + '</div></div>';
  v('studio', h);
};
avLoad(); if (stack[stack.length - 1] === 'home' && R.home) R.home();
