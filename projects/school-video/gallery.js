(function () {
  const grid = document.getElementById('grid');
  const now = document.getElementById('now');
  const player = document.getElementById('player');
  const midqEl = document.getElementById('midq');
  const nowTitle = document.getElementById('nowTitle');
  const nowMeta = document.getElementById('nowMeta');
  const download = document.getElementById('download');
  const countEl = document.getElementById('count');
  const emptyEl = document.getElementById('empty');
  const foot = document.getElementById('foot');
  const searchEl = document.getElementById('search');
  const clearSearch = document.getElementById('clearSearch');
  const quizEl = document.getElementById('quiz');
  const testBtn = document.getElementById('testBtn');
  let all = [];
  let currentLang = '';
  let currentGrade = '';
  let currentCourse = '';
  let currentQuiz = null;
  let currentVideo = null;
  let midDone = false;
  let picks = [];
  let query = '';

  function hhmmss(sec) {
    const s = Math.round(sec);
    const m = Math.floor(s / 60);
    return m + ':' + String(s % 60).padStart(2, '0');
  }

  function esc(t) {
    return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function metaLine(v) {
    const parts = [];
    if (v.course) parts.push(courseLabel(v.course));
    if (v.lang) parts.push(v.lang.toUpperCase());
    parts.push(hhmmss(v.seconds));
    if (v.scenes) parts.push(v.scenes + ' scenes');
    if (v.width) parts.push(v.height + 'p');
    return parts.join(' · ');
  }

  function clearQuiz() {
    quizEl.hidden = true;
    quizEl.innerHTML = '';
    currentQuiz = null;
    testBtn.hidden = true;
  }

  function closeMidq() {
    midqEl.hidden = true;
    midqEl.innerHTML = '';
    player.play().catch(() => {});
  }

  function openMidq(item) {
    midqEl.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'ask';
    const h = document.createElement('h3');
    h.append('Quick question');
    const tag = document.createElement('span');
    tag.textContent = 'video paused — answer, then continue';
    h.appendChild(tag);
    const p = document.createElement('p');
    p.textContent = item.q;
    const opts = document.createElement('div');
    opts.className = 'opts';
    const row = document.createElement('div');
    row.className = 'row';
    const fb = document.createElement('div');
    fb.className = 'fb';
    fb.setAttribute('aria-live', 'polite');
    const go = document.createElement('button');
    go.type = 'button';
    go.className = 'primary';
    go.textContent = 'Continue watching';
    let answered = false;
    (item.options || []).forEach((text, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.textContent = text;
      b.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        opts.querySelectorAll('.opt').forEach((x, xi) => {
          if (xi === item.answer) x.classList.add('ok');
          else if (xi === i) x.classList.add('bad');
        });
        const right = i === item.answer;
        fb.className = 'fb ' + (right ? 'ok' : 'bad');
        fb.textContent = (right ? 'Right! ' : 'Not quite. ') + (item.why || '');
        go.focus();
      });
      opts.appendChild(b);
    });
    row.append(fb, go);
    card.append(h, p, opts, row);
    midqEl.appendChild(card);
    midqEl.hidden = false;
    player.pause();
    go.addEventListener('click', closeMidq);
  }

  player.addEventListener('timeupdate', () => {
    if (midDone || !midqEl.hidden) return;
    const v = currentVideo;
    if (!v || !v.quiz || !v.quiz.length) return;
    const total = player.duration;
    if (!isFinite(total) || total < 12) return;
    const at = Math.max(6, total * 0.42);
    if (player.currentTime >= at) {
      midDone = true;
      openMidq(v.quiz[0]);
    }
  });

  function showQuiz() {
    if (!currentQuiz || !currentQuiz.length) return;
    picks = currentQuiz.map(() => -1);
    quizEl.hidden = false;
    quizEl.innerHTML = '';

    const h = document.createElement('h3');
    h.append('Mini test');
    const sub = document.createElement('span');
    sub.textContent = currentQuiz.length + ' questions about the video';
    h.appendChild(sub);
    quizEl.appendChild(h);

    currentQuiz.forEach((item, qi) => {
      const q = document.createElement('div');
      q.className = 'q';
      const p = document.createElement('p');
      p.className = 'qtext';
      p.textContent = (qi + 1) + '. ' + item.q;
      const opts = document.createElement('div');
      opts.className = 'opts';
      item.options.forEach((text, oi) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt';
        b.textContent = text;
        b.addEventListener('click', () => {
          if (q.dataset.done) return;
          picks[qi] = oi;
          opts.querySelectorAll('.opt').forEach(x => x.classList.toggle('sel', x === b));
        });
        opts.appendChild(b);
      });
      q.append(p, opts);
      quizEl.appendChild(q);
    });

    const footBox = document.createElement('div');
    footBox.className = 'quizfoot';
    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'primary';
    check.id = 'checkQuiz';
    check.textContent = 'Check answers';
    const score = document.createElement('span');
    score.className = 'score';
    score.id = 'quizScore';
    const again = document.createElement('button');
    again.type = 'button';
    again.className = 'again';
    again.textContent = 'Try again';
    again.addEventListener('click', showQuiz);
    footBox.append(check, score, again);
    quizEl.appendChild(footBox);

    check.addEventListener('click', () => {
      let right = 0;
      quizEl.querySelectorAll('.q').forEach((q, qi) => {
        const item = currentQuiz[qi];
        q.dataset.done = '1';
        q.querySelectorAll('.opt').forEach((b, oi) => {
          b.classList.remove('sel');
          if (oi === item.answer) b.classList.add('ok');
          else if (oi === picks[qi]) b.classList.add('bad');
        });
        if (item.why) {
          const why = document.createElement('div');
          why.className = 'why';
          why.textContent = item.why;
          q.appendChild(why);
        }
        if (picks[qi] === item.answer) right++;
      });
      score.textContent = right + ' of ' + currentQuiz.length + ' right';
      check.disabled = true;
      check.textContent = 'Checked';
    });

    quizEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function play(v, card) {
    player.src = v.file;
    player.poster = v.poster;
    nowTitle.textContent = v.title;
    nowMeta.textContent = metaLine(v);
    download.href = v.file;
    download.setAttribute('download', v.file.split('/').pop());
    clearQuiz();
    midqEl.hidden = true;
    midqEl.innerHTML = '';
    midDone = false;
    currentVideo = v;
    currentQuiz = v.quiz || null;
    testBtn.hidden = !currentQuiz;
    now.classList.add('on');
    document.querySelectorAll('.card').forEach(c => c.setAttribute('aria-current', 'false'));
    card.setAttribute('aria-current', 'true');
    player.play().catch(() => {});
    now.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function norm(t) {
    return String(t || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
  }

  function matches(v, q) {
    if (!q) return true;
    const hay = norm(v.title + ' ' + (v.lang === 'ru' ? 'русский' : v.lang === 'en' ? 'english' : ''));
    return hay.includes(q);
  }

  function render() {
    const list = all.filter(v => (!currentLang || v.lang === currentLang) &&
      (!currentCourse || v.course === currentCourse) &&
      (!currentGrade || v.grade === currentGrade) && matches(v, norm(query)));
    grid.innerHTML = '';
    list.forEach(v => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'card';
      card.setAttribute('aria-current', 'false');
      card.innerHTML =
        '<div class="thumb">' +
          '<img loading="lazy" src="' + esc(v.poster) + '" alt="">' +
          (v.lang ? '<span class="lang">' + esc(v.lang) + '</span>' : '') +
          '<span class="dur">' + hhmmss(v.seconds) + '</span>' +
          '<span class="play"><span></span></span>' +
        '</div>' +
        '<div class="body"><h3>' + esc(v.title) + '</h3><p>' + esc(metaLine(v)) + '</p></div>';
      card.addEventListener('click', () => play(v, card));
      grid.appendChild(card);
    });
    emptyEl.hidden = list.length > 0;
    if (!list.length && query) {
      emptyEl.innerHTML = 'No video for “' + esc(query) + '” yet. <a href="create.html">Make it on the Create page</a>.';
    } else if (!list.length && currentGrade) {
      emptyEl.innerHTML = 'No video for grade ' + currentGrade + ' yet. ' +
        'Pick a topic idea on the <a href="create.html">Create page</a>.';
    } else if (!list.length) {
      emptyEl.innerHTML = 'No videos in this language yet.';
    }
    countEl.textContent = list.length + (list.length === 1 ? ' video' : ' videos') +
      (currentCourse ? ' in ' + courseLabel(currentCourse) : '') +
      (currentGrade ? ' for grade ' + currentGrade : '') +
      (currentLang ? ' in ' + (currentLang === 'ru' ? 'Russian' : 'English') : '') +
      (query ? ' for “' + query + '”' : '');
  }

  searchEl.addEventListener('input', () => {
    query = searchEl.value.trim();
    clearSearch.hidden = !query;
    render();
  });

  clearSearch.addEventListener('click', () => {
    searchEl.value = '';
    query = '';
    clearSearch.hidden = true;
    render();
    searchEl.focus();
  });

  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== searchEl &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      searchEl.focus();
    }
  });

  document.querySelectorAll('.chip[data-lang]').forEach(chip => {
    chip.addEventListener('click', () => {
      currentLang = chip.dataset.lang;
      document.querySelectorAll('.chip[data-lang]').forEach(c =>
        c.setAttribute('aria-pressed', String(c === chip)));
      render();
    });
  });

  document.getElementById('close').addEventListener('click', () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    now.classList.remove('on');
    clearQuiz();
    midqEl.hidden = true;
    midqEl.innerHTML = '';
    currentVideo = null;
    midDone = false;
    document.querySelectorAll('.card').forEach(c => c.setAttribute('aria-current', 'false'));
  });

  testBtn.addEventListener('click', showQuiz);
  player.addEventListener('ended', showQuiz);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && now.classList.contains('on')) document.getElementById('close').click();
  });


  const filterbar = document.getElementById('filterbar');
  const filterMark = document.createElement('div');
  filterbar.parentNode.insertBefore(filterMark, filterbar);
  filterMark.style.cssText = 'height:1px;margin-top:-1px';
  new IntersectionObserver(([e]) => {
    filterbar.classList.toggle('stuck', !e.isIntersecting);
  }, { rootMargin: '-1px 0px 0px 0px' }).observe(filterMark);

  const gradesEl = document.getElementById('grades');
  const gradeHint = document.getElementById('gradeHint');

  const coursesEl = document.getElementById('courses');

  function buildCourses() {
    coursesEl.innerHTML = '';
    [''].concat(COURSES.map(c => c[0])).forEach(key => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = key === '' ? 'All subjects' : courseLabel(key);
      b.setAttribute('aria-pressed', String(currentCourse === key));
      if (key !== '' && !all.some(v => v.course === key)) b.classList.add('noVideos');
      b.addEventListener('click', () => {
        currentCourse = key;
        coursesEl.querySelectorAll('.chip').forEach(x =>
          x.setAttribute('aria-pressed', String(x === b)));
        render();
      });
      coursesEl.appendChild(b);
    });
  }

  function buildGrades() {
    gradesEl.innerHTML = '';
    [''].concat(GRADES).forEach(g => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = g === '' ? 'All grades' : String(g);
      b.setAttribute('aria-label', g === '' ? 'All grades' : 'Grade ' + g);
      b.setAttribute('aria-pressed', String(String(currentGrade) === String(g)));
      if (g !== '' && !all.some(v => v.grade === g)) b.classList.add('noVideos');
      b.addEventListener('click', () => {
        currentGrade = g === '' ? '' : Number(g);
        gradesEl.querySelectorAll('.chip').forEach(c =>
          c.setAttribute('aria-pressed', String(c === b)));
        render();
      });
      gradesEl.appendChild(b);
    });
  }

  fetch('data.json')
    .then(r => {
      if (!r.ok) throw new Error('data.json: HTTP ' + r.status);
      return r.json();
    })
    .then(d => {
      all = d.videos || [];
      buildGrades();
      buildCourses();
      render();
      if (all.length) {
        const newest = new Date(all[0].modified * 1000);
        foot.textContent = 'Latest video: ' + newest.toLocaleDateString() +
          ' · made with the class chat, image and voice models';
      }
    })
    .catch(err => {
      countEl.textContent = 'Could not load the list';
      emptyEl.hidden = false;
      emptyEl.textContent = String(err.message || err) + ' — run python3 make_gallery.py and reload.';
    });
})();
