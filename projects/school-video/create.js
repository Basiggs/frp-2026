(function () {
  const API = location.pathname.split('/proxy/')[0] + '/proxy/19040/v1';
  const LANGS = { ru: 'Russian', en: 'English' };
  const form = document.getElementById('scriptForm');
  const topicEl = document.getElementById('topic');
  const writeBtn = document.getElementById('write');
  const outEl = document.getElementById('scriptOut');
  let scriptLang = 'ru';

  document.querySelectorAll('.langchip').forEach(b => {
    b.addEventListener('click', () => {
      scriptLang = b.dataset.lang;
      document.querySelectorAll('.langchip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      renderIdeas();
    });
  });

  const IDEAS = {
    1: [['Счёт до 10', 'Counting to 10'], ['Домашние животные', 'Farm animals'],
        ['Фигуры вокруг нас', 'Shapes around us'], ['Времена года', 'The four seasons'],
        ['Больше и меньше', 'More and less'], ['Части суток', 'Day and night']],
    2: [['Сложение до 20', 'Adding to 20'], ['Растения и животные', 'Plants and animals'],
        ['Умножение как сложение', 'Multiplication as adding'], ['Правила дорожного движения', 'Road safety'],
        ['Измеряем длину', 'Measuring length'], ['Чётные и нечётные числа', 'Even and odd numbers']],
    3: [['Таблица умножения', 'Times tables'], ['Тела и вещества', 'Solids, liquids and gases'],
        ['Меры длины', 'Units of length'], ['Органы чувств', 'The five senses'],
        ['Время: часы и минуты', 'Telling time'], ['Казахские народные сказки', 'Kazakh folk tales']],
    4: [['Деление с остатком', 'Division with a remainder'], ['Строение растения', 'Parts of a plant'],
        ['Углы', 'Angles'], ['Карта и глобус', 'Maps and the globe'],
        ['Большие числа', 'Big numbers'], ['Великий шёлковый путь', 'The Silk Road']],
    5: [['Обыкновенные дроби', 'Common fractions'], ['Клетка', 'The cell'],
        ['Десятичные дроби', 'Decimals'], ['Природные зоны Казахстана', 'Natural zones of Kazakhstan'],
        ['Среднее арифметическое', 'The mean'], ['Имя существительное', 'Nouns'], ['Модуль числа', 'Absolute value']],
    6: [['Отрицательные числа', 'Negative numbers'], ['Строение Земли', 'Inside the Earth'],
        ['НОД и НОК', 'GCD and LCM'], ['Царства живой природы', 'Kingdoms of life'],
        ['Масштаб', 'Scale'], ['Имя прилагательное', 'Adjectives'], ['Диаграммы', 'Charts']],
    7: [['Линейные уравнения', 'Linear equations'], ['Кровеносная система', 'The circulatory system'],
        ['Степени', 'Powers'], ['Атмосфера', 'The atmosphere'],
        ['Формулы сокращённого умножения', 'Algebraic identities'], ['Глагол', 'Verbs'],
        ['Координатная плоскость', 'The coordinate plane']],
    8: [['Квадратный корень', 'Square roots'], ['Периодическая таблица', 'The periodic table'],
        ['Неравенства', 'Inequalities'], ['Химические реакции', 'Chemical reactions'],
        ['Системы уравнений', 'Systems of equations'], ['Пищеварительная система', 'The digestive system'],
        ['Электрическая цепь', 'Electric circuits'], ['Климат', 'Climate']],
    9: [['Квадратичная функция', 'Quadratic function'], ['ДНК и наследственность', 'DNA and inheritance'],
        ['Векторы', 'Vectors'], ['Металлы и кислоты', 'Metals and acids'],
        ['Подобные треугольники', 'Similar triangles'], ['Государство и право', 'State and law'],
        ['Вероятность', 'Probability']],
    10: [['Тригонометрия: синус и косинус', 'Trigonometry: sine and cosine'],
         ['Клеточное дыхание', 'Cellular respiration'], ['Логарифмы', 'Logarithms'],
         ['Спрос и предложение', 'Supply and demand'], ['Производная', 'The derivative'],
         ['Всемирная история: XX век', 'World history: the 20th century'],
         ['Законы Ньютона и движение', 'Newton\u2019s laws and motion'], ['Молярная масса', 'Molar mass']],
    11: [['Интеграл', 'The integral'], ['Генетика: законы Менделя', 'Mendel\u2019s laws'],
         ['Показательная функция', 'The exponential function'], ['Электролиз', 'Electrolysis'],
         ['Магнитное поле', 'The magnetic field'], ['Базы данных', 'Databases'],
         ['Мировая экономика', 'The world economy'], ['Органическая химия: алканы', 'Organic chemistry: alkanes']],
    12: [['Пределы', 'Limits'], ['Эволюция', 'Evolution'],
         ['Комплексные числа', 'Complex numbers'], ['Белки и ферменты', 'Proteins and enzymes'],
         ['Комбинаторика', 'Combinatorics'], ['Астрофизика', 'Astrophysics'],
         ['Фотоэффект', 'The photoelectric effect'], ['Право и общество', 'Law and society'],
         ['Теория относительности', 'Special relativity'], ['Строение атома', 'The structure of the atom']]
  };

  const gradePick = document.getElementById('gradePick');
  GRADES.forEach(g => {
    const o = document.createElement('option');
    o.value = String(g);
    o.textContent = String(g);
    gradePick.appendChild(o);
  });


  let all = [];

  const ideasEl = document.getElementById('ideas');
  const ideaTitle = document.getElementById('ideaTitle');
  const ideaChips = document.getElementById('ideachips');

  function madeAlready(grade, text) {
    const t = norm(text);
    return all.some(v => v.grade === grade && norm(v.title).includes(t));
  }

  function renderIdeas() {
    const currentGrade = Number(gradePick.value) || '';
    if (!currentGrade) {
      ideasEl.hidden = true;
      ideaChips.innerHTML = '';
      return;
    }
    const ideas = (IDEAS[currentGrade] || []).filter(p => !madeAlready(currentGrade, p[0]) && !madeAlready(currentGrade, p[1]));
    ideaChips.innerHTML = '';
    ideasEl.hidden = !ideas.length;
    if (!ideas.length) return;
    ideaTitle.textContent = 'Topic ideas for grade ' + currentGrade + ' — math, science, languages, history. Click one to fill the topic in ' +
      (scriptLang === 'ru' ? 'Russian' : 'English');
    ideas.forEach(pair => {
      const text = scriptLang === 'ru' ? pair[0] : pair[1];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'idea';
      b.textContent = text;
      b.addEventListener('click', () => {
        topicEl.value = text;
        topicEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        topicEl.focus();
      });
      ideaChips.appendChild(b);
    });
  }


  gradePick.addEventListener('change', renderIdeas);

  function scriptPrompt(topic, lang) {
    return 'Topic: "' + topic + '"\nLanguage of the narration: ' + LANGS[lang] + '.\n' +
      'Write 4 to 6 scenes for a 1-minute explainer video for school students.\n' +
      'Answer with JSON only:\n' +
      '{"title": "short title", "scenes": [{"narration": "...", "math": "...", "picture": "..."}]}\n' +
      '- narration: one or two spoken sentences, 20 to 35 words (about 9 seconds), in ' + LANGS[lang] + '.\n' +
      '- math: the formula or the numbers to show on screen for this scene.\n' +
      '- picture: an English prompt for a photo or illustration of the scene; the picture must have NO text, ' +
      'NO letters, NO numbers and NO formulas in it.\n' +
      'The scenes build the idea step by step: the idea, an example with numbers, the formula, one thing for the student.';
  }

  async function writeScript(topic, lang) {
    const r = await fetch(API + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'DeepSeek-V4.1-Flash',
        max_tokens: 4000,
        messages: [
          { role: 'system', content: 'You write short school explainer videos. You answer with JSON only.' },
          { role: 'user', content: scriptPrompt(topic, lang) }
        ]
      })
    });
    if (!r.ok) throw new Error('The chat model said: ' + (await r.text()).slice(0, 400));
    const text = (await r.json()).choices[0].message.content || '';
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('The model did not send JSON:\n' + text.slice(0, 300));
    const data = JSON.parse(m[0]);
    if (!Array.isArray(data.scenes) || data.scenes.length < 4)
      throw new Error('The model sent ' + (data.scenes ? data.scenes.length : 0) + ' scenes, not 4 to 6. Press again.');
    return data;
  }

  function showError(msg) {
    outEl.hidden = false;
    outEl.innerHTML = '';
    const p = document.createElement('div');
    p.className = 'err';
    p.textContent = msg;
    outEl.appendChild(p);
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function sceneList(data) {
    const list = el('ol', 'scenelist');
    data.scenes.forEach((s, i) => {
      const li = el('li', 'scene');
      li.appendChild(el('span', 'num', String(i + 1).padStart(2, '0')));
      const box = el('div');
      box.appendChild(el('p', '', s.narration || ''));
      if (s.math) box.appendChild(el('span', 'math', s.math));
      li.appendChild(box);
      list.appendChild(li);
    });
    return list;
  }

  function loadImage(url) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error('A picture did not load'));
      img.src = url;
    });
  }

  async function pictureFor(prompt) {
    const r = await fetch(API + '/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt, size: '1280x720' })
    });
    if (!r.ok) throw new Error('Picture error: ' + (await r.text()).slice(0, 300));
    const d = await r.json();
    if (!d.data || !d.data[0] || !d.data[0].b64_json) throw new Error('The picture service sent no picture');
    return loadImage('data:image/jpeg;base64,' + d.data[0].b64_json);
  }

  async function voiceFor(text, lang) {
    const r = await fetch(API + '/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text, language: lang })
    });
    if (!r.ok) throw new Error('Voice error: ' + (await r.text()).slice(0, 300));
    const audio = new Audio(URL.createObjectURL(await r.blob()));
    await new Promise((res, rej) => {
      audio.onloadedmetadata = res;
      audio.onerror = () => rej(new Error('The voice file did not load'));
    });
    return audio;
  }

  function captionChunks(text) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    if (!words.length) return [''];
    const out = [];
    for (let i = 0; i < words.length; i += 4) out.push(words.slice(i, i + 4).join(' '));
    return out;
  }

  function apiUrl(path) {
    const parts = location.pathname.split('/proxy/');
    if (parts.length < 2) return '';
    return parts[0] + '/proxy/' + parts[1].split('/')[0] + path;
  }

  function saveUrl() {
    return apiUrl('/api/save');
  }

  async function saveVideo(blob, data, topic, lang, note) {
    const url = saveUrl();
    if (!url) throw new Error('Saving needs the class server: run python3 serve.py in the project and open the workspace link.');
    const grade = gradePick.value;
    if (!grade) throw new Error('Choose the grade in the box first, so other students find it in their grade.');
    note.className = 'status';
    note.textContent = 'Saving ' + Math.round(blob.size / 1048576 * 10) / 10 + ' MB to the lessons list…';
    const b64 = await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result).split(',')[1]);
      fr.onerror = () => rej(new Error('Could not read the recorded video'));
      fr.readAsDataURL(blob);
    });
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video: b64, title: data.title || topic, topic: topic, lang: lang, grade: Number(grade) })
    });
    const text = await r.text();
    let j = null;
    try { j = JSON.parse(text); } catch (e) { throw new Error('The server said: ' + text.slice(0, 300)); }
    if (!r.ok || !j || !j.ok) throw new Error(String((j && j.error) || text).slice(0, 300));
    note.textContent = 'Saved as ' + j.file + ' — it is in the lessons list now.';
  }

  const upForm = document.getElementById('upForm');
  const upFileEl = document.getElementById('upFile');
  const upTitleEl = document.getElementById('upTitle');
  const upLangEl = document.getElementById('upLang');
  const upGradeEl = document.getElementById('upGrade');
  const upBtn = document.getElementById('upBtn');
  const upNote = document.getElementById('upNote');

  GRADES.forEach(g => {
    const o = document.createElement('option');
    o.value = String(g);
    o.textContent = String(g);
    upGradeEl.appendChild(o);
  });

  function upSay(text, bad) {
    upNote.className = bad ? 'status err' : 'status';
    upNote.textContent = text;
  }

  upForm.addEventListener('submit', async ev => {
    ev.preventDefault();
    const file = upFileEl.files && upFileEl.files[0];
    if (!file) { upSay('Choose a video file first.', true); return; }
    if (!upGradeEl.value) { upSay('Choose the grade first, so other students find it in their grade.', true); return; }
    const title = (upTitleEl.value.trim() || file.name.replace(/\.[^.]+$/, '')).slice(0, 80);
    const base = apiUrl('/api/upload');
    if (!base) { upSay('Open this page from the workspace link, not from a file on the computer.', true); return; }
    const url = base + '?title=' + encodeURIComponent(title) +
      '&lang=' + encodeURIComponent(upLangEl.value) +
      '&grade=' + encodeURIComponent(upGradeEl.value) +
      '&name=' + encodeURIComponent(file.name);
    upBtn.disabled = true;
    upBtn.textContent = 'Uploading…';
    upSay('Uploading ' + Math.round(file.size / 1048576 * 10) / 10 + ' MB of “' + title + '”…');
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: file
      });
      const text = await r.text();
      let j = null;
      try { j = JSON.parse(text); } catch (e) {
        if (r.status === 501 || r.status === 404 || r.status === 405) {
          throw new Error('uploading needs the project server: in the project folder run python3 serve.py 8000 (not frp-serve).');
        }
        throw new Error('the server said: ' + text.slice(0, 200));
      }
      if (!r.ok || !j || !j.ok) throw new Error((j && j.error) || text.slice(0, 200));
      upSay('Uploaded as ' + j.file + ' — it is in the lessons list now.');
      upForm.reset();
    } catch (err) {
      upSay('Could not upload: ' + err.message, true);
    } finally {
      upBtn.disabled = false;
      upBtn.textContent = 'Upload';
    }
  });

  function pickMime() {
    if (!window.MediaRecorder) return '';
    const list = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    for (const m of list) if (MediaRecorder.isTypeSupported(m)) return m;
    return '';
  }

  function wrapText(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    words.forEach(w => {
      const next = line ? line + ' ' + w : w;
      if (ctx.measureText(next).width > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function drawScene(ctx, W, H, img, math, caption) {
    const ir = img.width / img.height, cr = W / H;
    let dw, dh, dx, dy;
    if (ir > cr) { dh = H; dw = H * ir; dx = (W - dw) / 2; dy = 0; }
    else { dw = W; dh = W / ir; dx = 0; dy = (H - dh) / 2; }
    ctx.drawImage(img, dx, dy, dw, dh);

    ctx.fillStyle = 'rgba(6,11,20,0.80)';
    ctx.fillRect(0, H - 132, W, 132);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 33px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = wrapText(ctx, caption, W - 120).slice(0, 2);
    lines.forEach((line, i) => {
      const y = lines.length === 1 ? H - 66 : H - 90 + i * 46;
      ctx.fillText(line, W / 2, y);
    });

    if (math) {
      ctx.font = '600 30px ui-monospace, Menlo, monospace';
      const tw = Math.min(ctx.measureText(math).width, W - 200);
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      const bx = (W - tw) / 2 - 22, by = 28, bh = 62;
      ctx.beginPath();
      if (ctx.roundRect) { ctx.roundRect(bx, by, tw + 44, bh, 14); ctx.fill(); }
      else ctx.fillRect(bx, by, tw + 44, bh);
      ctx.fillStyle = '#0b1526';
      ctx.textAlign = 'center';
      ctx.fillText(math, W / 2, by + bh / 2 + 1);
    }
  }

  async function recordVideo(data, pics, voices, onStatus) {
    const W = 1280, H = 720;
    const canvas = el('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const type = pickMime();
    if (!type) throw new Error('This browser cannot record video (MediaRecorder is missing). Use Chrome.');
    const ac = ensureAudio();
    if (ac.state === 'suspended') await ac.resume();
    const dest = ac.createMediaStreamDestination();
    const mixed = new MediaStream(
      canvas.captureStream(30).getVideoTracks().concat(dest.stream.getAudioTracks()));
    const rec = new MediaRecorder(mixed, { mimeType: type, videoBitsPerSecond: 2500000 });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const stopped = new Promise(res => { rec.onstop = res; });
    rec.start(1000);

    const total = voices.reduce((a, v) => a + (isFinite(v.duration) && v.duration > 0.5 ? v.duration : 6), 0);
    for (let i = 0; i < data.scenes.length; i++) {
      const audio = voices[i];
      const src = ac.createMediaElementSource(audio);
      src.connect(dest);
      src.connect(ac.destination);
      const dur = isFinite(audio.duration) && audio.duration > 0.5 ? audio.duration : 6;
      const caps = captionChunks(data.scenes[i].narration);
      const t0 = performance.now();
      let raf = 0;
      const frame = () => {
        const t = (performance.now() - t0) / 1000;
        const k = Math.min(caps.length - 1, Math.floor(t / (dur / caps.length)));
        drawScene(ctx, W, H, pics[i], data.scenes[i].math, caps[k]);
        raf = requestAnimationFrame(frame);
      };
      frame();
      onStatus('4/5 recording scene ' + (i + 1) + ' of ' + data.scenes.length +
        ' — keep this tab open and the sound on (about ' + Math.round(total) + ' s in all)…');
      await new Promise((res, rej) => {
        audio.onended = res;
        audio.onerror = () => rej(new Error('A voice file stopped playing'));
        audio.play().catch(rej);
      });
      cancelAnimationFrame(raf);
      src.disconnect();
    }
    rec.stop();
    await stopped;
    return new Blob(chunks, { type: 'video/webm' });
  }

  let audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  let busy = false;

  async function buildVideo(topic, lang) {
    busy = true;
    outEl.hidden = false;
    outEl.innerHTML = '';
    const head = el('div', 'outhead');
    head.appendChild(el('h3', '', topic)).id = 'scriptTitle';
    const meta = el('span', 'meta', '');
    head.appendChild(meta);
    const status = el('div', 'status', '');
    status.id = 'status';
    const body = el('div');
    outEl.append(head, status, body);
    const say = t => { status.textContent = t; };

    try {
      say('1/5 writing the script…');
      const data = await writeScript(topic, lang);
      const n = data.scenes.length;
      document.getElementById('scriptTitle').textContent = data.title || topic;
      meta.textContent = n + ' scenes · ' + LANGS[lang];
      body.appendChild(sceneList(data));

      const pics = [];
      for (let i = 0; i < n; i++) {
        say('2/5 picture ' + (i + 1) + ' of ' + n + '… (about 5 s each)');
        pics.push(await pictureFor(data.scenes[i].picture || data.scenes[i].narration));
      }

      const voices = [];
      for (let i = 0; i < n; i++) {
        say('3/5 voice ' + (i + 1) + ' of ' + n + '…');
        voices.push(await voiceFor(data.scenes[i].narration, lang));
      }

      const planned = voices.reduce((a, v) =>
        a + (isFinite(v.duration) && v.duration > 0.5 ? v.duration : 6), 0);
      say('4/5 starting the video…');
      const blob = await recordVideo(data, pics, voices, say);

      const name = (topic.toLowerCase().replace(/[^\w\u0400-\u04FF-]+/g, '-').replace(/^-|-$/g, '') || 'video') + '-' + lang + '.webm';
      const url = URL.createObjectURL(blob);
      say('5/5 done — ' + Math.round(blob.size / 1048576 * 10) / 10 + ' MB. Watch it here or download it.');
      const video = el('video', 'genvideo');
      video.controls = true;
      video.playsInline = true;
      video.src = url;
      const bar = el('div', 'genbar');
      const info = el('span', 'meta', '1280×720 · ' + hhmmss(planned) + ' · webm');
      info.id = 'geninfo';
      const dl = el('a', 'ghost', 'Download .webm');
      dl.href = url;
      dl.download = name;
      const again = el('button', 'ghost', 'Make another');
      again.type = 'button';
      again.addEventListener('click', () => { outEl.hidden = true; outEl.innerHTML = ''; topicEl.focus(); });
      const note = el('span', 'meta', '');
      note.id = 'savenote';
      const save = el('button', 'primary', 'Save to all lessons');
      save.type = 'button';
      save.id = 'savebtn';
      save.addEventListener('click', async () => {
        save.disabled = true;
        save.textContent = 'Saving…';
        try {
          await saveVideo(blob, data, topic, lang, note);
          save.textContent = 'Saved';
        } catch (err) {
          save.disabled = false;
          save.textContent = 'Save to all lessons';
          note.className = 'err';
          note.textContent = String(err.message || err);
        }
      });
      bar.append(info, dl, again, save);
      body.append(video, bar, note);
    } catch (err) {
      say('');
      const p = el('div', 'err', String(err.message || err));
      body.appendChild(p);
    } finally {
      busy = false;
      writeBtn.disabled = false;
      writeBtn.textContent = 'Make video';
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (busy) return;
    const topic = topicEl.value.trim();
    if (!topic) { topicEl.focus(); return; }
    ensureAudio();
    writeBtn.disabled = true;
    writeBtn.textContent = 'Making…';
    buildVideo(topic, scriptLang);
  });

  fetch('data.json')
    .then(r => r.ok ? r.json() : Promise.reject(new Error('data.json: HTTP ' + r.status)))
    .then(d => { all = d.videos || []; renderIdeas(); })
    .catch(err => { outEl.textContent = 'Could not load data.json: ' + err.message; });
})();
