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
  const chaptersEl = document.getElementById('chapters');
  const chapstrip = document.getElementById('chapstrip');
  const chapprog = document.getElementById('chapprog');
  const chaplist = document.getElementById('chaplist');
  const testBtn = document.getElementById('testBtn');
  const tracksEl = document.getElementById('tracks');
  const trackrow = document.getElementById('trackrow');
  const trackbar = document.getElementById('trackbar');
  const trackbarText = document.getElementById('trackbarText');
  const trackClear = document.getElementById('trackClear');
  const upnextEl = document.getElementById('upnext');
  let all = [];
  let currentLang = '';
  let currentGrade = '';
  let currentCourse = '';
  let currentTrack = '';
  let tracks = [];
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

  let chapSegs = [];
  let chapChips = [];
  let chapActive = -1;

  function setActiveChap(i) {
    if (i === chapActive) return;
    chapActive = i;
    chapSegs.forEach((el, k) => el.classList.toggle('on', k === i));
    chapChips.forEach((el, k) => el.classList.toggle('on', k === i));
    const chip = chapChips[i];
    if (chip) chip.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }

  function showChapters(v) {
    chapSegs = [];
    chapChips = [];
    chapActive = -1;
    chapstrip.innerHTML = '';
    chapstrip.appendChild(chapprog);
    chaplist.innerHTML = '';
    const list = v.chapters || [];
    if (list.length < 2) {
      chaptersEl.hidden = true;
      return;
    }
    const total = Math.max(1, v.seconds || list[list.length - 1].t + 5);
    list.forEach((c, i) => {
      const next = i + 1 < list.length ? list[i + 1].t : total;
      const seg = document.createElement('button');
      seg.type = 'button';
      seg.style.flexGrow = String(Math.max(0.4, next - c.t));
      seg.title = hhmmss(c.t) + ' ' + c.title;
      seg.setAttribute('aria-label', 'Go to ' + hhmmss(c.t) + ' ' + c.title);
      seg.addEventListener('click', () => seekChapter(c.t));
      chapstrip.appendChild(seg);
      chapSegs.push(seg);

      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chap';
      const t = document.createElement('span');
      t.className = 't';
      t.textContent = hhmmss(c.t);
      const n = document.createElement('span');
      n.className = 'n';
      n.textContent = c.title;
      chip.append(t, n);
      chip.addEventListener('click', () => seekChapter(c.t));
      chaplist.appendChild(chip);
      chapChips.push(chip);
    });
    chaptersEl.hidden = false;
    setActiveChap(0);
  }

  function seekChapter(t) {
    const v = currentVideo;
    if (v && v.quiz && v.quiz.length) {
      const total = player.duration;
      const at = isFinite(total) && total >= 12 ? Math.max(6, total * 0.42) : Infinity;
      if (t >= at) midDone = true;
    }
    player.currentTime = t + 0.01;
    player.play().catch(() => {});
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
    const chap = currentVideo && currentVideo.chapters;
    if (chap && chap.length > 1) {
      let i = 0;
      for (let k = 1; k < chap.length; k++) if (player.currentTime + 0.05 >= chap[k].t) i = k;
      setActiveChap(i);
      const total = player.duration;
      if (isFinite(total) && total > 0) {
        chapprog.style.width = Math.min(100, (player.currentTime / total) * 100) + '%';
      }
    }
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

  function findNext(v) {
    const member = tracks.find(t => t.videos.includes(v));
    if (member) {
      const i = member.videos.indexOf(v);
      if (i >= 0 && i < member.videos.length - 1) {
        return {
          video: member.videos[i + 1],
          why: 'Lesson ' + (i + 2) + ' of ' + member.videos.length + ' in ' + member.title
        };
      }
    }
    const same = all.filter(x => x !== v && x.course === v.course && x.lang === v.lang)
      .sort((a, b) => (a.grade || 99) - (b.grade || 99));
    const up = same.find(x => (x.grade || 0) > (v.grade || 0));
    if (up) return { video: up, why: 'Next in ' + courseLabel(v.course) };
    if (same.length) return { video: same[0], why: 'More ' + courseLabel(v.course) };
    const other = all.find(x => x !== v && x.lang === v.lang && x.grade === v.grade);
    if (other) return { video: other, why: 'Related for grade ' + v.grade };
    return null;
  }

  function renderUpNext(v) {
    const n = findNext(v);
    if (!n) {
      upnextEl.hidden = true;
      upnextEl.innerHTML = '';
      return;
    }
    const x = n.video;
    upnextEl.hidden = false;
    upnextEl.innerHTML = '<div class="upnexthead"><h3>Up next</h3><span>' + esc(n.why) + '</span></div>' +
      '<button type="button" class="upnextcard">' +
        '<img loading="lazy" src="' + esc(x.poster) + '" alt="">' +
        '<span class="un"><b>' + esc(x.title) + '</b><span>' + esc(metaLine(x)) + '</span></span>' +
        '<span class="ugo">Play</span>' +
      '</button>';
    upnextEl.querySelector('.upnextcard').addEventListener('click', () => play(x));
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
    upnextEl.hidden = true;
    upnextEl.innerHTML = '';
    midDone = false;
    currentVideo = v;
    currentQuiz = v.quiz || null;
    showChapters(v);
    testBtn.hidden = !currentQuiz;
    upnextEl.hidden = true;
    upnextEl.innerHTML = '';
    now.classList.add('on');
    document.querySelectorAll('.card').forEach(c => c.setAttribute('aria-current', 'false'));
    if (card) card.setAttribute('aria-current', 'true');
    player.play().catch(() => {});
    now.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function norm(t) {
    return String(t || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
  }

  function matches(v, q) {
    if (!q) return true;
    const hay = norm(v.title + ' ' + (v.lang === 'ru' ? 'русский' : v.lang === 'kk' ? 'қазақша' : v.lang === 'en' ? 'english' : ''));
    return hay.includes(q);
  }

  function slugOf(v) {
    return String(v.file || '').split('/').pop().replace(/\.[^.]+$/, '');
  }

  function buildTracks() {
    trackrow.innerHTML = '';
    tracksEl.hidden = !tracks.length;
    tracks.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'trackcard';
      b.setAttribute('aria-pressed', String(currentTrack === t.id));
      const first = t.videos[0];
      b.innerHTML = '<img loading="lazy" src="' + esc(first.poster) + '" alt="">' +
        '<span class="tk"><span class="tmeta">' + t.videos.length + ' lessons · ' +
        esc(courseLabel(first.course)) + '</span><b>' + esc(t.title) + '</b>' +
        '<span class="tsub">' + esc(t.subtitle) + '</span></span>';
      b.addEventListener('click', () => applyTrack(currentTrack === t.id ? '' : t.id));
      trackrow.appendChild(b);
    });
    const t = tracks.find(x => x.id === currentTrack);
    trackbar.hidden = !t;
    if (t) trackbarText.innerHTML = 'Track: <b>' + esc(t.title) + '</b> — lessons 1 to ' + t.videos.length + ' in order';
  }

  function applyTrack(id) {
    currentTrack = id;
    const t = tracks.find(x => x.id === id);
    if (t) {
      currentLang = t.videos[0].lang || '';
      currentCourse = '';
      currentGrade = '';
      query = '';
      searchEl.value = '';
      clearSearch.hidden = true;
    }
    document.querySelectorAll('.chip[data-lang]').forEach(c => {
      const on = c.dataset.lang === currentLang;
      c.setAttribute('aria-pressed', String(on));
      if (on) langBtn.querySelector('.langlabel').textContent = c.textContent;
    });
    buildCourses();
    buildGrades();
    buildTracks();
    render();
  }

  trackClear.addEventListener('click', () => applyTrack(''));

  function render() {
    const base = all.filter(v => (!currentLang || v.lang === currentLang) &&
      (!currentCourse || v.course === currentCourse) &&
      (!currentGrade || v.grade === currentGrade) && matches(v, norm(query)));
    let list = base;
    let lessonOf = null;
    if (currentTrack) {
      const t = tracks.find(x => x.id === currentTrack);
      if (t) {
        lessonOf = new Map();
        t.videos.forEach((v, i) => { if (base.includes(v)) lessonOf.set(v, i + 1); });
        list = t.videos.filter(v => base.includes(v));
      }
    }
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
          (lessonOf ? '<span class="lesson">Lesson ' + lessonOf.get(v) + '</span>' : '') +
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
    const track = tracks.find(x => x.id === currentTrack);
    countEl.textContent = list.length + (list.length === 1 ? ' video' : ' videos') +
      (track ? ' in “' + track.title + '”' : '') +
      (currentCourse ? ' in ' + courseLabel(currentCourse) : '') +
      (currentGrade ? ' for grade ' + currentGrade : '') +
      (currentLang ? ' in ' + (currentLang === 'ru' ? 'Russian' : currentLang === 'kk' ? 'Kazakh' : 'English') : '') +
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

  const langBtn = document.getElementById('langBtn');
  const langList = document.getElementById('langList');
  function closeLang() {
    document.querySelector('.langmenu').classList.remove('open');
    langBtn.setAttribute('aria-expanded', 'false');
  }
  langBtn.addEventListener('click', () => {
    const open = document.querySelector('.langmenu').classList.toggle('open');
    langBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.langmenu')) closeLang();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLang();
  });

  document.querySelectorAll('.chip[data-lang]').forEach(chip => {
    chip.addEventListener('click', () => {
      currentLang = chip.dataset.lang;
      document.querySelectorAll('.chip[data-lang]').forEach(c =>
        c.setAttribute('aria-pressed', String(c === chip)));
      langBtn.querySelector('.langlabel').textContent = chip.textContent;
      closeLang();
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
    upnextEl.hidden = true;
    upnextEl.innerHTML = '';
    currentVideo = null;
    midDone = false;
    chaptersEl.hidden = true;
    chapprog.style.width = '0%';
    chapstrip.innerHTML = '';
    chapstrip.appendChild(chapprog);
    chaplist.innerHTML = '';
    chapSegs = [];
    chapChips = [];
    chapActive = -1;
    document.querySelectorAll('.card').forEach(c => c.setAttribute('aria-current', 'false'));
  });

  testBtn.addEventListener('click', showQuiz);
  player.addEventListener('ended', () => {
    renderUpNext(currentVideo);
    showQuiz();
  });

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
      fetch('tracks.json')
        .then(r => {
          if (!r.ok) throw new Error('tracks.json: HTTP ' + r.status);
          return r.json();
        })
        .then(d => {
          tracks = (d.tracks || []).map(t => ({
            id: t.id,
            title: t.title,
            subtitle: t.subtitle,
            videos: (t.slugs || []).map(s => all.find(v => slugOf(v) === s)).filter(Boolean)
          })).filter(t => t.videos.length >= 2);
          buildTracks();
        })
        .catch(err => { console.error('tracks:', err.message || err); });
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
