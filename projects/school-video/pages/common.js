const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

  const COURSES = [
    ['math', 'Math'], ['physics', 'Physics'], ['chemistry', 'Chemistry'],
    ['biology', 'Biology'], ['geography', 'Geography'],
    ['history', 'History'], ['languages', 'Languages']
  ];

  function courseLabel(key) {
    const found = COURSES.find(c => c[0] === key);
    return found ? found[1] : '';
  }

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

  function norm(t) {
    return String(t || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
  }

  function matches(v, q) {
    if (!q) return true;
    const hay = norm(v.title + ' ' + (v.lang === 'ru' ? 'русский' : v.lang === 'en' ? 'english' : ''));
    return hay.includes(q);
  }

  function apiUrl(path) {
    const parts = location.pathname.split('/proxy/');
    if (parts.length < 2) return '';
    return parts[0] + '/proxy/' + parts[1].split('/')[0] + path;
  }
