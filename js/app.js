import { FAMILIES, SIZES, generateTheme, themeList, customTheme, newSeed } from './themes.js';
import { findReferences, pinterestUrl, demoReferences, getKeys, setKeys } from './sources.js';

const $ = (id) => document.getElementById(id);
const DEMO = new URLSearchParams(location.search).has('demo');

const TIMES = [0, 3, 5, 10, 15, 20, 30, 45, 60];
const SOURCE_NAMES = { mc: 'Minecraft', irl: 'реального мира', mix: 'Minecraft и реального мира' };
const SOURCE_SHORT = { mc: 'Minecraft', irl: 'Реальный мир', mix: 'Minecraft + реальный мир' };
const SOURCE_HELP = {
  mc: 'Постройки игроков с Reddit (r/Minecraftbuilds, r/DetailCraft). Точь-в-точь тему найти сложно, поэтому будет похожее.',
  irl: 'Фотографии настоящих зданий и вещей: Wikimedia Commons (отборные Quality images), Openverse, а с ключом — Unsplash и Pexels.',
  mix: 'Половина доски — постройки в Minecraft, половина — фото из реального мира, вперемешку.',
};

// ---------- storage ----------
const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
};

const settings = Object.assign(
  { mode: 'random', family: null, size: 'medium', minutes: 20, count: 6, source: 'mc', custom: '' },
  store.get('sb.settings', {}),
);
const saveSettings = () => store.set('sb.settings', settings);

let theme = generateTheme(newSeed(), settings.size, settings.family);
let listSeed = newSeed();
let listPages = 1;
let session = null;
const sourceStatus = {};

// ---------- words ----------
const plural = (n, one, few, many) => {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
};
const refsWord = (n) => `${n} ${plural(n, 'референс', 'референса', 'референсов')}`;
const minutesWord = (n) => `${n} ${plural(n, 'минута', 'минуты', 'минут')}`;
const clock = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 2, '0'), ss = String(sec).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};
const duration = (ms) => {
  const min = Math.round(ms / 60000);
  if (min < 1) return 'меньше минуты';
  if (min < 60) return `${min} мин`;
  return `${Math.floor(min / 60)} ч ${min % 60} мин`;
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.classList.add('on');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('on'), 2200);
}

// ---------- setup ----------
function currentTheme() {
  if (settings.mode === 'custom') {
    const text = settings.custom.trim();
    return text ? customTheme(text, settings.size) : null;
  }
  return theme;
}

function renderSummary() {
  const time = settings.minutes ? minutesWord(settings.minutes) : 'без времени';
  $('summary').textContent = `${SIZES[settings.size].ru} постройка · ${time} · ${refsWord(settings.count)} из ${SOURCE_NAMES[settings.source]}`;
}

function renderTheme() {
  $('themeTitle').textContent = theme.title;
  const facts = [theme.style, theme.object, theme.mod].filter(Boolean)
    .map((f) => `<span class="pill">${esc(f)}</span>`).join('');
  $('themeFacts').innerHTML = facts + `<span class="pill quiet">${esc(SIZES[theme.size].hint)}</span>`;
  $('themeSeed').textContent = `Тема №${theme.seed}`;
  altItems = themeList(theme.seed ^ 0x5bd1e995, 4, theme.size, settings.family);
  $('themeAlts').innerHTML = altItems.map((t) => {
    const fam = FAMILIES.find((f) => f.id === t.family);
    return `<button type="button" class="theme-row" data-seed="${t.seed}" aria-pressed="false"><span>${esc(t.title)}</span><span>${esc(fam ? fam.ru : '')}</span></button>`;
  }).join('');
}
let altItems = [];

function renderList() {
  const items = themeList(listSeed, listPages * 8, settings.size, settings.family);
  $('themeList').innerHTML = items.map((t) => {
    const fam = FAMILIES.find((f) => f.id === t.family);
    return `<button type="button" class="theme-row" data-seed="${t.seed}" aria-pressed="${t.seed === theme.seed}">
      <span>${esc(t.title)}</span><span>${esc(fam ? fam.ru : '')}</span></button>`;
  }).join('');
  listItems = items;
  if (!items.some((t) => t.seed === theme.seed) && items.length) {
    theme = items[0];
    renderTheme();
    $('themeList').firstElementChild.setAttribute('aria-pressed', 'true');
  }
}
let listItems = [];

function renderMode() {
  for (const b of $('themeMode').children) b.setAttribute('aria-pressed', String(b.dataset.v === settings.mode));
  $('mode-random').hidden = settings.mode !== 'random';
  $('mode-list').hidden = settings.mode !== 'list';
  $('mode-custom').hidden = settings.mode !== 'custom';
  $('familyBox').hidden = settings.mode === 'custom';
  if (settings.mode === 'list') renderList();
}

function renderFamilies() {
  const all = [{ id: null, ru: 'Любой' }, ...FAMILIES];
  $('families').innerHTML = all.map((f) =>
    `<button type="button" class="chip" data-fam="${f.id ?? ''}" aria-pressed="${settings.family === f.id}">${f.ru}</button>`).join('');
}

function renderParams() {
  $('sizes').innerHTML = Object.entries(SIZES).map(([id, s]) =>
    `<button type="button" class="option" data-size="${id}" aria-pressed="${settings.size === id}"><b>${s.ru}</b><span>${s.hint}</span></button>`).join('');
  $('times').innerHTML = TIMES.map((m) =>
    `<button type="button" class="chip" data-min="${m}" aria-pressed="${settings.minutes === m}">${m ? `${m} мин` : 'Без времени'}</button>`).join('');
  $('count').textContent = settings.count;
  $('countDown').disabled = settings.count <= 1;
  $('countUp').disabled = settings.count >= 12;
  for (const b of $('sourceMode').children) b.setAttribute('aria-pressed', String(b.dataset.v === settings.source));
  $('sourceHelp').textContent = SOURCE_HELP[settings.source];
  renderSummary();
}

function rerollTheme() {
  theme = generateTheme(newSeed(), settings.size, settings.family);
  renderTheme();
}

$('themeMode').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-v]');
  if (!b) return;
  settings.mode = b.dataset.v;
  saveSettings();
  renderMode();
  if (settings.mode === 'custom') $('customText').focus();
});
$('reroll').addEventListener('click', rerollTheme);
$('themeList').addEventListener('click', (e) => {
  const row = e.target.closest('.theme-row');
  if (!row) return;
  theme = listItems.find((t) => String(t.seed) === row.dataset.seed);
  renderTheme();
  for (const r of $('themeList').children) r.setAttribute('aria-pressed', String(r === row));
});
$('themeAlts').addEventListener('click', (e) => {
  const row = e.target.closest('.theme-row');
  if (!row) return;
  theme = altItems.find((t) => String(t.seed) === row.dataset.seed);
  renderTheme();
});
$('moreThemes').addEventListener('click', () => { listPages++; renderList(); });
$('families').addEventListener('click', (e) => {
  const b = e.target.closest('.chip');
  if (!b) return;
  settings.family = b.dataset.fam || null;
  saveSettings();
  renderFamilies();
  listSeed = newSeed(); listPages = 1;
  rerollTheme();
  if (settings.mode === 'list') renderList();
});
$('customText').value = settings.custom;
$('customText').addEventListener('input', (e) => { settings.custom = e.target.value; saveSettings(); });
$('customText').addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });

$('sizes').addEventListener('click', (e) => {
  const b = e.target.closest('.option');
  if (!b) return;
  // Время подстраивается под размер, если его не трогали вручную.
  if (settings.minutes === SIZES[settings.size].minutes) settings.minutes = SIZES[b.dataset.size].minutes;
  settings.size = b.dataset.size;
  saveSettings();
  renderParams();
  rerollTheme();
  listSeed = newSeed(); listPages = 1;
  if (settings.mode === 'list') renderList();
});
$('times').addEventListener('click', (e) => {
  const b = e.target.closest('.chip');
  if (!b) return;
  settings.minutes = Number(b.dataset.min);
  saveSettings(); renderParams();
});
$('countDown').addEventListener('click', () => { settings.count = Math.max(1, settings.count - 1); saveSettings(); renderParams(); });
$('countUp').addEventListener('click', () => { settings.count = Math.min(12, settings.count + 1); saveSettings(); renderParams(); });
$('sourceMode').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-v]');
  if (!b) return;
  settings.source = b.dataset.v;
  saveSettings(); renderParams();
});

function start() {
  const t = currentTheme();
  if (!t) { toast('Напиши тему или выбери случайную'); $('customText').focus(); return; }
  openSession(t, { minutes: settings.minutes, count: settings.count, source: settings.source });
}
$('start').addEventListener('click', start);
$('randomRound').addEventListener('click', () => {
  const sizes = Object.keys(SIZES);
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  const base = SIZES[size].minutes;
  const choices = TIMES.filter((m) => m && m >= base / 2 && m <= base * 1.5);
  const minutes = choices[Math.floor(Math.random() * choices.length)];
  openSession(generateTheme(newSeed(), size, null), { minutes, count: settings.count, source: settings.source });
});

// ---------- history ----------
const getHistory = () => store.get('sb.history', []);

function historyRow(h, head = false) {
  if (head) return '<div class="row row-head"><span class="t">Тема</span><span class="m">Размер</span><span class="m">Время</span><span class="r">Когда</span></div>';
  const when = new Date(h.at);
  const today = new Date().toDateString() === when.toDateString();
  const date = today ? when.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : when.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  const used = clock(h.usedMs);
  const plan = h.minutes ? ` из ${clock(h.minutes * 60000)}` : ', без лимита';
  return `<a class="row" href="${esc(h.link)}" title="Сыграть ещё раз">
    <span class="t">${esc(h.title)}</span>
    <span class="m">${esc(SIZES[h.size]?.ru || '')} · ${esc(h.source === 'mc' ? 'MC' : h.source === 'irl' ? 'IRL' : 'MC+IRL')}</span>
    <span class="m num">${used}${plan}</span>
    <span class="r num">${esc(date)}</span></a>`;
}

function renderRecent() {
  const h = getHistory();
  $('recent').innerHTML = h.length
    ? historyRow(null, true) + h.slice(0, 5).map((x) => historyRow(x)).join('')
    : '<p class="empty">Сыгранные раунды появятся здесь: тема, размер и за сколько успел.</p>';
  $('recentAll').hidden = h.length <= 5;
}

function renderHistory() {
  const h = getHistory();
  const total = h.reduce((s, x) => s + x.usedMs, 0);
  $('historySum').textContent = h.length ? `${h.length} ${plural(h.length, 'раунд', 'раунда', 'раундов')} · ${duration(total)} стройки` : 'Пока ни одного раунда';
  $('historyRows').innerHTML = h.length
    ? historyRow(null, true) + h.map((x) => historyRow(x)).join('')
    : '<p class="empty">Здесь будет список сыгранных тем. Начни первый раунд.</p>';
  $('clearHistory').hidden = !h.length;
}
$('clearHistory').addEventListener('click', () => {
  const n = getHistory().length;
  if (!confirm(`Удалить все ${n} ${plural(n, 'раунд', 'раунда', 'раундов')} из истории? Это нельзя отменить.`)) return;
  store.set('sb.history', []);
  renderHistory(); renderRecent();
});

// ---------- session ----------
function sessionLink(t, o) {
  const p = new URLSearchParams({ size: t.size, t: o.minutes, n: o.count, src: o.source });
  if (t.custom) p.set('custom', t.title); else p.set('seed', t.seed);
  return `#/session?${p}`;
}

function openSession(t, o) {
  ensureAudio();
  location.hash = sessionLink(t, o);
}

function sessionFromHash(query) {
  const p = new URLSearchParams(query);
  const size = SIZES[p.get('size')] ? p.get('size') : 'medium';
  const o = {
    minutes: Math.max(0, Math.min(600, Number(p.get('t')) || 0)),
    count: Math.max(1, Math.min(12, Number(p.get('n')) || 6)),
    source: ['mc', 'irl', 'mix'].includes(p.get('src')) ? p.get('src') : 'mc',
  };
  const t = p.get('custom') ? customTheme(p.get('custom').slice(0, 80), size) : generateTheme(Number(p.get('seed')) || newSeed(), size, null);
  return { t, o };
}

function beginSession(key, t, o) {
  stopTimer();
  session = {
    key, theme: t, ...o, pool: [], shown: [], next: 0,
    accMs: 0, since: performance.now(), running: true, over: false, link: location.hash,
  };
  $('sessionTitle').textContent = t.title;
  const sizeText = `${SIZES[t.size].ru} · ${SIZES[t.size].hint}`;
  $('sessionMeta').textContent = `${sizeText} · ${o.minutes ? minutesWord(o.minutes) : 'без времени'} · ${refsWord(o.count)} · ${SOURCE_SHORT[o.source]}`;
  $('pinterest').href = pinterestUrl(t, o.source);
  $('pause').textContent = 'Пауза';
  $('clock').classList.toggle('free', !o.minutes);
  $('clock').classList.remove('paused');
  $('xp').innerHTML = '<i></i>'.repeat(20);
  tick();
  timer = setInterval(tick, 250);
  wake(true);
  loadRefs();
}

let timer = null;
function stopTimer() { clearInterval(timer); timer = null; }
const elapsed = () => session.accMs + (session.running ? performance.now() - session.since : 0);

function tick() {
  if (!session) return;
  const used = elapsed();
  const fig = $('clockFigure');
  if (session.minutes) {
    const total = session.minutes * 60000;
    const left = Math.max(0, total - used);
    fig.textContent = clock(left);
    fig.classList.toggle('low', left <= 60000 && left > 0);
    $('clockSub').innerHTML = session.running ? `осталось из <b>${clock(total)}</b>` : `пауза · осталось из <b>${clock(total)}</b>`;
    const frac = left / total * 20;
    [...$('xp').children].forEach((seg, i) => {
      seg.className = i < Math.floor(frac) ? 'on' : i < frac ? 'part' : '';
      if (seg.className === 'part') seg.style.setProperty('--p', `${(frac - i) * 100}%`);
    });
    document.title = `${clock(left)} · ${session.theme.title}`;
    if (left === 0 && !session.over) endSession('time');
  } else {
    fig.textContent = clock(used);
    $('clockSub').innerHTML = session.running ? 'прошло, без ограничения' : 'пауза';
    document.title = `${clock(used)} · ${session.theme.title}`;
  }
}

function togglePause() {
  if (!session || session.over) return;
  if (session.running) { session.accMs = elapsed(); session.running = false; }
  else { session.since = performance.now(); session.running = true; }
  $('pause').textContent = session.running ? 'Пауза' : 'Продолжить';
  $('clock').classList.toggle('paused', !session.running);
  tick();
}

function endSession(reason) {
  if (!session || session.over) return;
  session.accMs = Math.min(elapsed(), session.minutes ? session.minutes * 60000 : Infinity);
  session.running = false; session.over = true;
  stopTimer(); tick(); wake(false);
  if (reason === 'time') chime();
  if (session.accMs > 20000) {
    const h = getHistory();
    h.unshift({ title: session.theme.title, size: session.theme.size, source: session.source, minutes: session.minutes, usedMs: session.accMs, at: Date.now(), link: session.link });
    store.set('sb.history', h.slice(0, 200));
  }
  $('doneTitle').textContent = reason === 'time' ? 'Время вышло' : 'Раунд окончен';
  $('doneTheme').textContent = session.theme.title;
  $('doneResult').textContent = session.minutes
    ? `${clock(session.accMs)} из ${clock(session.minutes * 60000)}`
    : `${clock(session.accMs)} на постройку`;
  $('done').showModal();
}

$('pause').addEventListener('click', togglePause);
$('finish').addEventListener('click', () => endSession('done'));
$('nextRound').addEventListener('click', () => {
  $('done').close();
  const s = session;
  const t = s.theme.custom ? generateTheme(newSeed(), s.theme.size, null) : generateTheme(newSeed(), s.theme.size, settings.family);
  openSession(t, { minutes: s.minutes, count: s.count, source: s.source });
});
$('againRound').addEventListener('click', () => {
  $('done').close();
  const s = session;
  beginSession(s.key, s.theme, { minutes: s.minutes, count: s.count, source: s.source });
});
$('toSetup').addEventListener('click', () => { $('done').close(); location.hash = '#/'; });
$('copyLink').addEventListener('click', async () => {
  const url = location.href.split('#')[0].replace(/\?demo\b[^#]*/, '') + (session ? session.link : '');
  try { await navigator.clipboard.writeText(url); toast('Ссылка скопирована: у друга будет та же тема'); }
  catch { prompt('Ссылка на раунд', url); }
});

// ---------- references ----------
function skeleton(n) {
  const heights = [62, 128, 80, 100, 140, 70];
  $('board').dataset.n = n;
  $('board').innerHTML = Array.from({ length: n }, (_, i) =>
    `<div class="tile skeleton"><div class="tile-img" style="aspect-ratio:100/${heights[i % heights.length]}"></div><div class="tile-cap"><span></span></div></div>`).join('');
}

async function loadRefs() {
  const s = session;
  skeleton(s.count);
  $('boardStatus').textContent = 'Ищем…';
  $('boardQuery').textContent = '';
  let pool = [];
  if (DEMO) pool = demoReferences(s.count);
  else {
    pool = await findReferences(s.theme, {
      source: s.source, count: s.count,
      status: (name, state, info) => { sourceStatus[name] = { state, info, at: Date.now() }; },
    });
  }
  if (session !== s) return;
  s.pool = pool;
  s.next = 0;
  if (!pool.length) {
    $('boardStatus').textContent = '';
    $('board').dataset.n = 1;
    $('board').innerHTML = `<div class="notice">
      <p>Не удалось найти референсы для «${esc(s.theme.title)}». Источники не ответили или по этой теме пусто.</p>
      <div class="actions"><button class="btn" type="button" id="retry">Повторить поиск</button>
      <a class="btn" href="${esc(pinterestUrl(s.theme, s.source))}" target="_blank" rel="noopener">Открыть на Pinterest</a></div></div>`;
    $('retry').addEventListener('click', loadRefs);
    return;
  }
  s.shown = [];
  for (let i = 0; i < Math.min(s.count, pool.length); i++) s.shown.push(s.next++);
  renderBoard();
}

function renderBoard() {
  const s = session;
  $('board').dataset.n = s.shown.length;
  $('board').innerHTML = s.shown.map((idx, pos) => tileHtml(s.pool[idx], pos)).join('');
  for (const img of $('board').querySelectorAll('img')) wireImg(img);
  const sources = [...new Set(s.shown.map((i) => s.pool[i].where.startsWith('r/') ? 'Reddit' : s.pool[i].where))];
  $('boardStatus').textContent = `${s.shown.length} из ${s.pool.length} найденных · ${sources.join(', ')}`;
  const queries = [...new Set(s.shown.map((i) => s.pool[i].query))];
  $('boardQuery').textContent = DEMO ? 'Демо-картинки без поиска' : `Искали: ${queries.slice(0, 3).join(' · ')}`;
}

function tileHtml(it, pos) {
  const credit = [it.author, it.where].filter(Boolean).join(' · ');
  return `<figure class="tile" data-pos="${pos}">
    <button class="tile-img" type="button" data-open="${pos}" style="aspect-ratio:${it.width}/${it.height}" aria-label="Открыть: ${esc(it.title)}">
      <img src="${esc(it.thumb)}" alt="${esc(it.title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
    </button>
    <figcaption class="tile-cap"><span title="${esc(it.title)}">${esc(credit)}</span><button class="text-btn" type="button" data-swap="${pos}">Заменить</button></figcaption>
  </figure>`;
}

function wireImg(img) {
  const done = () => img.classList.add('ready');
  if (img.complete && img.naturalWidth) done();
  img.addEventListener('load', done, { once: true });
  img.addEventListener('error', () => {
    const pos = Number(img.closest('.tile').dataset.pos);
    swap(pos, true);
  }, { once: true });
}

function swap(pos, silent = false) {
  const s = session;
  if (!s || !s.pool.length) return;
  const used = new Set(s.shown);
  let idx = -1;
  for (let k = 0; k < s.pool.length; k++) {
    const cand = (s.next + k) % s.pool.length;
    if (!used.has(cand)) { idx = cand; s.next = cand + 1; break; }
  }
  if (idx < 0) { if (!silent) toast('Других картинок по этой теме нет'); return; }
  s.shown[pos] = idx;
  const fig = $('board').querySelector(`.tile[data-pos="${pos}"]`);
  const tmp = document.createElement('div');
  tmp.innerHTML = tileHtml(s.pool[idx], pos);
  const fresh = tmp.firstElementChild;
  fig.replaceWith(fresh);
  wireImg(fresh.querySelector('img'));
}

function newBoard() {
  const s = session;
  if (!s || !s.pool.length) { if (s) loadRefs(); return; }
  if (s.pool.length <= s.shown.length) { toast('Это все картинки по теме'); return; }
  const old = new Set(s.shown);
  const out = [];
  for (let k = 0; out.length < s.shown.length && k < s.pool.length; k++) {
    const cand = (s.next + k) % s.pool.length;
    if (!old.has(cand) && !out.includes(cand)) out.push(cand);
  }
  s.next = (out[out.length - 1] + 1) % s.pool.length;
  s.shown = out;
  renderBoard();
}

$('newRefs').addEventListener('click', newBoard);
$('board').addEventListener('click', (e) => {
  const sw = e.target.closest('[data-swap]');
  if (sw) { swap(Number(sw.dataset.swap)); return; }
  const op = e.target.closest('[data-open]');
  if (op) openLightbox(Number(op.dataset.open));
});

// ---------- lightbox ----------
let lbPos = 0;
function openLightbox(pos) {
  lbPos = pos;
  showLb();
  if (!$('lightbox').open) $('lightbox').showModal();
}
function showLb() {
  const it = session.pool[session.shown[lbPos]];
  const img = $('lbImg');
  img.src = it.thumb;
  img.alt = it.title;
  if (it.full && it.full !== it.thumb) {
    const big = new Image();
    big.referrerPolicy = 'no-referrer';
    big.onload = () => { if (img.alt === it.title) img.src = it.full; };
    big.src = it.full;
  }
  $('lbCap').innerHTML = `<b>${esc(it.title)}</b><br>${esc([it.author, it.where, it.license].filter(Boolean).join(' · '))} · ${lbPos + 1} из ${session.shown.length}`;
  $('lbSource').href = it.page;
}
const lbStep = (d) => { lbPos = (lbPos + d + session.shown.length) % session.shown.length; showLb(); };
$('lbPrev').addEventListener('click', () => lbStep(-1));
$('lbNext').addEventListener('click', () => lbStep(1));
$('lbClose').addEventListener('click', () => $('lightbox').close());
$('lightbox').addEventListener('click', (e) => { if (e.target.classList.contains('lightbox-stage') || e.target.classList.contains('lightbox-in')) $('lightbox').close(); });

// ---------- sound, wake lock ----------
let audio = null;
function ensureAudio() {
  try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch {}
}
function chime() {
  if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
  if (!audio) return;
  [0, 0.18, 0.36].forEach((at, i) => {
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = 'square';
    o.frequency.value = [523, 659, 784][i];
    g.gain.setValueAtTime(0.0001, audio.currentTime + at);
    g.gain.exponentialRampToValueAtTime(0.08, audio.currentTime + at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + at + 0.16);
    o.connect(g).connect(audio.destination);
    o.start(audio.currentTime + at); o.stop(audio.currentTime + at + 0.18);
  });
}
let lock = null;
async function wake(on) {
  try {
    if (on && 'wakeLock' in navigator) lock = await navigator.wakeLock.request('screen');
    else if (lock) { await lock.release(); lock = null; }
  } catch {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && session?.running) wake(true); });

// ---------- sources view ----------
function renderSources() {
  const free = [
    ['Reddit', 'Minecraft-постройки игроков: r/Minecraftbuilds, r/DetailCraft, r/Minecraft. Лучшие посты за всё время.'],
    ['Wikimedia', 'Wikimedia Commons, сначала только отборные фото из категории Quality images.'],
    ['Openverse', 'Открытые фото Flickr и музеев. Ищет и реальные здания, и скриншоты Minecraft.'],
  ];
  $('srcFree').innerHTML = free.map(([name, text]) => `<div class="src"><b>${name}</b>${stateHtml(name)}<p>${text}</p></div>`).join('');
  const keys = getKeys();
  $('keyUnsplash').value = keys.unsplash || '';
  $('keyPexels').value = keys.pexels || '';
  for (const name of ['Unsplash', 'Pexels']) {
    const el = $(`st-${name}`);
    const has = keys[name.toLowerCase()];
    const st = sourceStatus[name];
    el.className = `state ${!has ? 'idle' : st?.state === 'error' ? 'err' : st ? 'ok' : 'idle'}`;
    el.textContent = !has ? 'не подключён' : st ? (st.state === 'error' ? `ошибка ${st.info}` : 'работает') : 'ключ сохранён';
  }
}
function stateHtml(name) {
  const st = sourceStatus[name];
  if (!st) return '<span class="state idle">ещё не запрашивали</span>';
  if (st.state === 'error') return `<span class="state err">не ответил (${esc(st.info)})</span>`;
  return `<span class="state ok">работает · ${st.info} в последнем ответе</span>`;
}
$('saveKeys').addEventListener('click', () => {
  setKeys({ unsplash: $('keyUnsplash').value.trim(), pexels: $('keyPexels').value.trim() });
  try { for (const k of Object.keys(sessionStorage)) if (k.startsWith('sb.q.')) sessionStorage.removeItem(k); } catch {}
  $('savedStamp').textContent = 'Сохранено';
  setTimeout(() => { $('savedStamp').textContent = ''; }, 2000);
  renderSources();
});

// ---------- keyboard ----------
document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  const view = currentView;
  if ($('lightbox').open) {
    if (e.key === 'ArrowRight') lbStep(1);
    if (e.key === 'ArrowLeft') lbStep(-1);
    return;
  }
  if (view === 'session' && !$('done').open) {
    if (e.code === 'Space' && !e.target.closest('button, a')) { e.preventDefault(); togglePause(); }
    if (e.key === 'n' || e.key === 'т') newBoard();
  }
  if (view === 'setup' && (e.key === 'r' || e.key === 'к') && settings.mode === 'random') rerollTheme();
});

// ---------- routing ----------
let currentView = 'setup';
function route() {
  const [path, query = ''] = location.hash.replace(/^#/, '').split('?');
  const view = { '/session': 'session', '/history': 'history', '/sources': 'sources' }[path] || 'setup';
  if (view !== 'session' && session && !session.over) {
    // Ушли с доски посреди раунда — останавливаем таймер.
    session.accMs = elapsed(); session.running = false; stopTimer(); wake(false);
    session = null;
  }
  currentView = view;
  for (const v of ['setup', 'session', 'history', 'sources']) $(`view-${v}`).hidden = v !== view;
  for (const a of document.querySelectorAll('.nav a')) {
    if (a.dataset.route === view || (view === 'session' && a.dataset.route === 'setup')) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  $('kbdHint').textContent = view === 'session' ? 'Пробел — пауза · N — новые референсы' : view === 'setup' ? 'R — другая тема' : '';
  if (view === 'session') {
    const key = location.hash;
    if (!session || session.key !== key) {
      const { t, o } = sessionFromHash(query);
      beginSession(key, t, o);
    }
  } else {
    document.title = 'Speedbuild — тренировка быстрой стройки';
  }
  if (view === 'setup') renderRecent();
  if (view === 'history') renderHistory();
  if (view === 'sources') renderSources();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
window.addEventListener('scroll', () => $('bar').classList.toggle('scrolled', scrollY > 4), { passive: true });

renderFamilies();
renderParams();
renderTheme();
renderMode();
route();
