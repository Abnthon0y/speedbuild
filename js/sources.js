// Поиск референсов. Все источники работают прямо из браузера, без сервера.
// Без ключей: Reddit (Minecraft-постройки), Wikimedia Commons (только «Quality images»), Openverse.
// С ключами (необязательно, вводятся на странице «Источники»): Unsplash и Pexels — самые «пинтерестные» фото.

import { themeWords } from './themes.js';

const KEYS_STORE = 'sb.keys';
const CACHE_PREFIX = 'sb.q.';

export function getKeys() {
  try { return JSON.parse(localStorage.getItem(KEYS_STORE)) || {}; } catch { return {}; }
}
export function setKeys(keys) {
  try { localStorage.setItem(KEYS_STORE, JSON.stringify(keys)); } catch {}
}

async function getJson(url, opts = {}, ms = 15000) {
  const key = CACHE_PREFIX + url;
  try {
    const hit = sessionStorage.getItem(key);
    if (hit) return JSON.parse(hit);
  } catch {}
  const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(`${res.status}`);
  const data = await res.json();
  try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
  return data;
}

const goodShape = (w, h) => w >= 700 && h >= 450 && w / h < 2.4 && h / w < 2.2;
const stripTags = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// ---------- Minecraft ----------

const MC_SUBS = {
  small: 'DetailCraft+Minecraftbuilds+minecraft',
  medium: 'Minecraftbuilds+minecraft+DetailCraft',
  large: 'Minecraftbuilds+minecraft',
};

async function reddit(query, size) {
  const url = `https://www.reddit.com/r/${MC_SUBS[size]}/search.json?q=${encodeURIComponent(query)}` +
    '&restrict_sr=1&sort=relevance&t=all&limit=100&type=link&raw_json=1';
  const j = await getJson(url);
  const out = [];
  for (const { data: d } of j.data.children) {
    if (d.over_18 || d.spoiler) continue;
    const base = {
      source: 'reddit', title: d.title, author: `u/${d.author}`, where: `r/${d.subreddit}`,
      page: `https://www.reddit.com${d.permalink}`, license: null, minecraft: true,
      text: `${d.title} ${d.link_flair_text || ''}`,
    };
    if (d.is_gallery && d.media_metadata) {
      const first = (d.gallery_data?.items || []).map((i) => d.media_metadata[i.media_id]).find((m) => m && m.s);
      if (first) {
        const mid = pickRes(first.p.map((p) => ({ url: p.u, width: p.x, height: p.y })), 640);
        if (goodShape(first.s.x, first.s.y)) out.push({ ...base, thumb: mid.url, full: first.s.u || first.s.gif, width: first.s.x, height: first.s.y });
      }
      continue;
    }
    const img = d.preview?.images?.[0];
    if (!img || d.post_hint !== 'image') continue;
    if (!goodShape(img.source.width, img.source.height)) continue;
    const mid = pickRes(img.resolutions, 640) || img.source;
    out.push({ ...base, thumb: mid.url, full: img.source.url, width: img.source.width, height: img.source.height });
  }
  return out;
}

function pickRes(list, want) {
  if (!list || !list.length) return null;
  return list.find((r) => r.width >= want) || list[list.length - 1];
}

// ---------- Реальный мир ----------

async function wikimedia(query, quality = true) {
  const search = `${query} filetype:bitmap${quality ? ' incategory:Quality_images' : ''}`;
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', formatversion: '2', origin: '*',
    generator: 'search', gsrsearch: search, gsrnamespace: '6', gsrlimit: '50',
    prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '960',
    iiextmetadatafilter: 'Artist|LicenseShortName|ObjectName|ImageDescription|Categories',
  });
  const j = await getJson(url);
  const pages = (j.query?.pages || []).sort((a, b) => (a.index || 0) - (b.index || 0));
  return pages.map((p) => {
    const ii = p.imageinfo?.[0];
    if (!ii || !goodShape(ii.width, ii.height)) return null;
    if (/\b(map|plan|diagram|logo|coat of arms|drawing|svg|interior|detail)\b/i.test(p.title)) return null;
    const m = ii.extmetadata || {};
    const name = p.title.replace(/^File:|\.\w+$/g, '');
    return {
      source: 'wikimedia', title: stripTags(m.ObjectName?.value) || name,
      author: stripTags(m.Artist?.value) || 'Wikimedia Commons', where: 'Wikimedia Commons', page: ii.descriptionurl,
      license: m.LicenseShortName?.value || null, thumb: ii.thumburl, full: ii.thumburl, width: ii.width, height: ii.height,
      text: [name, stripTags(m.ObjectName?.value), stripTags(m.ImageDescription?.value), (m.Categories?.value || '').replace(/\|/g, ' ')].join(' '),
    };
  }).filter(Boolean);
}

async function openverse(query) {
  const url = 'https://api.openverse.org/v1/images/?' + new URLSearchParams({
    q: query, page_size: '50', mature: 'false', category: 'photograph,digitized_artwork', size: 'large,medium',
  });
  const j = await getJson(url);
  return (j.results || []).filter((r) => r.width && r.height ? goodShape(r.width, r.height) : true).map((r) => ({
    source: 'openverse', title: r.title || query, author: r.creator || r.source, where: r.provider || 'Openverse',
    page: r.foreign_landing_url, license: `${(r.license || '').toUpperCase()} ${r.license_version || ''}`.trim(),
    thumb: r.thumbnail || r.url, full: r.url, width: r.width || 4, height: r.height || 3,
    text: `${r.title || ''} ${(r.tags || []).map((t) => t.name).join(' ')}`,
  }));
}

async function unsplash(query, key) {
  const url = 'https://api.unsplash.com/search/photos?' + new URLSearchParams({ query, per_page: '30', content_filter: 'high', client_id: key });
  const j = await getJson(url);
  return (j.results || []).map((r) => ({
    source: 'unsplash', title: r.alt_description || r.description || query, author: r.user?.name, where: 'Unsplash',
    page: r.links?.html, license: 'Unsplash', thumb: r.urls.small, full: r.urls.regular, width: r.width, height: r.height,
    text: `${r.alt_description || ''} ${r.description || ''} ${(r.tags || []).map((t) => t.title).join(' ')} ${r.slug || ''}`.replace(/-/g, ' '),
  }));
}

async function pexels(query, key) {
  const url = 'https://api.pexels.com/v1/search?' + new URLSearchParams({ query, per_page: '40' });
  const j = await getJson(url, { headers: { Authorization: key } });
  return (j.photos || []).map((r) => ({
    source: 'pexels', title: r.alt || query, author: r.photographer, where: 'Pexels',
    page: r.url, license: 'Pexels', thumb: r.src.medium, full: r.src.large2x, width: r.width, height: r.height,
    // у Pexels в адресе страницы лежит описание: /photo/gothic-church-in-the-fog-123/
    text: `${r.alt || ''} ${(r.url || '').split('/photo/')[1] || ''}`.replace(/[-/]/g, ' '),
  }));
}

// ---------- Проверка на тему ----------

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRe = (w) => new RegExp(`(^|[^a-zа-яё])${escRe(w.toLowerCase())}(e?s)?($|[^a-zа-яё])`, 'i');

// Картинка без объекта темы в подписи или тегах на доску не попадает.
// Совпавший стиль и условие поднимают её выше; точный запрос весит больше общего.
function scorer(words) {
  const res = {
    object: words.object.map(wordRe),
    style: words.style.map(wordRe),
    mod: words.mod.map(wordRe),
  };
  const any = (list, text) => list.some((re) => re.test(text));
  return (it, rank) => {
    const text = ` ${it.text || it.title || ''} `.toLowerCase().replace(/[_]/g, ' ');
    const obj = res.object.length ? any(res.object, text) : null;
    const sty = res.style.length ? any(res.style, text) : null;
    if (obj === false) return -1;
    if (obj === null && sty === false) return -1;
    return 10 + (sty ? 6 : 0) + (any(res.mod, text) ? 2 : 0) + rank;
  };
}

// ---------- Сборка запросов ----------

// От точного к общему. rank — бонус за точность запроса.
function irlQueries(q, words) {
  if (q.raw) return [{ query: q.raw, rank: 2 }];
  const list = [];
  if (q.mod && q.style) list.push({ query: `${q.style} ${q.object} ${q.mod}`, rank: 3 });
  if (q.style) list.push({ query: `${q.style} ${q.object}`, rank: 2 });
  if (q.style && words.object[1]) list.push({ query: `${q.style} ${words.object[1]}`, rank: 1 });
  list.push({ query: `${q.object} architecture`, rank: 0 });
  return list;
}

function mcQueries(q, words) {
  if (q.raw) return [{ query: q.raw, rank: 2 }];
  const list = [];
  if (q.style) list.push({ query: `${q.style} ${q.object}`, rank: 2 });
  list.push({ query: q.object, rank: 0 });
  if (words.object[1]) list.push({ query: words.object[1], rank: 0 });
  return list;
}

async function gather(steps, want, score, keep, status) {
  const out = [];
  const seen = new Set();
  let strong = 0;
  for (const step of steps) {
    if (strong >= want) break;
    try {
      const items = await step.run();
      let fit = 0;
      for (const it of items) {
        if (!it.thumb || seen.has(it.thumb) || seen.has(it.page) || !keep(it)) continue;
        const s = score(it, step.rank);
        if (s < 0) continue;
        seen.add(it.thumb); seen.add(it.page);
        it.query = step.query;
        it.score = s;
        out.push(it);
        fit++;
        if (s >= 16) strong++;
      }
      status(step.name, 'ok', `${fit} по теме из ${items.length}`);
    } catch (e) {
      status(step.name, 'error', String(e.message || e));
    }
  }
  // Лучшие по совпадению впереди; внутри одинаковой оценки — немного случайности.
  return out
    .map((it) => ({ it, r: Math.random() }))
    .sort((a, b) => b.it.score - a.it.score || a.r - b.r)
    .map((x) => x.it);
}

const isMc = (it) => it.minecraft || /minecraft/i.test(it.text || '');

export async function findReferences(theme, { source, count, status = () => {} }) {
  const keys = getKeys();
  const want = Math.max(count * 2, 12);
  const q = theme.q;
  const size = theme.size;
  const words = themeWords(q);
  const score = scorer(words);

  const irlSteps = [];
  const irl = irlQueries(q, words);
  for (const { query, rank } of irl) {
    if (keys.unsplash) irlSteps.push({ name: 'Unsplash', query, rank, run: () => unsplash(query, keys.unsplash) });
    if (keys.pexels) irlSteps.push({ name: 'Pexels', query, rank, run: () => pexels(query, keys.pexels) });
    irlSteps.push({ name: 'Wikimedia', query, rank, run: () => wikimedia(query, true) });
    irlSteps.push({ name: 'Openverse', query, rank, run: () => openverse(query) });
  }
  for (const { query, rank } of irl.slice(0, 2)) {
    irlSteps.push({ name: 'Wikimedia', query, rank: rank - 1, run: () => wikimedia(query, false) });
  }

  const mcSteps = [];
  for (const { query, rank } of mcQueries(q, words)) {
    mcSteps.push({ name: 'Reddit', query, rank, run: () => reddit(query, size) });
    mcSteps.push({ name: 'Openverse', query: `minecraft ${query}`, rank, run: () => openverse(`minecraft ${query}`) });
    if (keys.unsplash) mcSteps.push({ name: 'Unsplash', query: `minecraft ${query}`, rank, run: () => unsplash(`minecraft ${query}`, keys.unsplash) });
  }

  const realOnly = (it) => !isMc(it);
  if (source === 'irl') return gather(irlSteps, want, score, realOnly, status);
  if (source === 'mc') return gather(mcSteps, want, score, isMc, status);
  const [a, b] = await Promise.all([
    gather(mcSteps, want / 2, score, isMc, status),
    gather(irlSteps, want / 2, score, realOnly, status),
  ]);
  return interleave(a, b);
}

function interleave(a, b) {
  const out = [];
  const seen = new Set();
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    for (const it of [a[i], b[i]]) {
      if (it && !seen.has(it.thumb)) { seen.add(it.thumb); out.push(it); }
    }
  }
  return out;
}

export function pinterestUrl(theme, source) {
  const q = theme.q;
  const base = q.raw || [q.style, q.object, q.mod].filter(Boolean).join(' ');
  const text = source === 'mc' ? `minecraft ${base} build` : source === 'irl' ? `${base} architecture` : `${base} build`;
  return `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(text)}`;
}

// Тестовые картинки для проверки интерфейса без сети: ?demo в адресе.
export function demoReferences(count) {
  const ids = [1040, 1029, 1031, 1048, 1067, 1076, 1078, 164, 188, 221, 238, 274, 289, 299, 314, 325, 336, 342];
  const shapes = [[1600, 1000], [1000, 1400], [1400, 1000], [1200, 1200], [1000, 1500], [1600, 900]];
  return ids.map((id, i) => {
    const [w, h] = shapes[i % shapes.length];
    return { source: 'demo', title: `Пример ${i + 1}`, author: 'Picsum', where: 'picsum.photos', page: `https://picsum.photos/id/${id}/info`, license: null,
      thumb: `https://picsum.photos/id/${id}/${w / 2}/${h / 2}`, full: `https://picsum.photos/id/${id}/${w}/${h}`, width: w, height: h, query: 'demo' };
  }).slice(0, Math.max(count * 3, 12));
}
