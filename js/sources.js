// Поиск референсов. Все источники работают прямо из браузера, без сервера.
// Без ключей: Reddit (Minecraft-постройки), Wikimedia Commons (только «Quality images»), Openverse.
// С ключами (необязательно, вводятся на странице «Источники»): Unsplash и Pexels — самые «пинтерестные» фото.

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
    '&restrict_sr=1&sort=top&t=all&limit=60&type=link&raw_json=1';
  const j = await getJson(url);
  const out = [];
  for (const { data: d } of j.data.children) {
    if (d.over_18 || d.spoiler) continue;
    const base = { source: 'reddit', title: d.title, author: `u/${d.author}`, where: `r/${d.subreddit}`, page: `https://www.reddit.com${d.permalink}`, license: null, score: d.score };
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
    generator: 'search', gsrsearch: search, gsrnamespace: '6', gsrlimit: '40',
    prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '960',
    iiextmetadatafilter: 'Artist|LicenseShortName|ObjectName',
  });
  const j = await getJson(url);
  const pages = (j.query?.pages || []).sort((a, b) => (a.index || 0) - (b.index || 0));
  return pages.map((p) => {
    const ii = p.imageinfo?.[0];
    if (!ii || !goodShape(ii.width, ii.height)) return null;
    if (/\b(map|plan|diagram|logo|coat of arms|drawing|svg)\b/i.test(p.title)) return null;
    const m = ii.extmetadata || {};
    return {
      source: 'wikimedia', title: stripTags(m.ObjectName?.value) || p.title.replace(/^File:|\.\w+$/g, ''),
      author: stripTags(m.Artist?.value) || 'Wikimedia Commons', where: 'Wikimedia Commons', page: ii.descriptionurl,
      license: m.LicenseShortName?.value || null, thumb: ii.thumburl, full: ii.thumburl, width: ii.width, height: ii.height,
    };
  }).filter(Boolean);
}

async function openverse(query) {
  const url = 'https://api.openverse.org/v1/images/?' + new URLSearchParams({
    q: query, page_size: '40', mature: 'false', category: 'photograph,digitized_artwork', size: 'large,medium',
  });
  const j = await getJson(url);
  return (j.results || []).filter((r) => r.width && r.height ? goodShape(r.width, r.height) : true).map((r) => ({
    source: 'openverse', title: r.title || query, author: r.creator || r.source, where: r.provider || 'Openverse',
    page: r.foreign_landing_url, license: `${(r.license || '').toUpperCase()} ${r.license_version || ''}`.trim(),
    thumb: r.thumbnail || r.url, full: r.url, width: r.width || 4, height: r.height || 3,
  }));
}

async function unsplash(query, key) {
  const url = 'https://api.unsplash.com/search/photos?' + new URLSearchParams({ query, per_page: '30', content_filter: 'high', client_id: key });
  const j = await getJson(url);
  return (j.results || []).map((r) => ({
    source: 'unsplash', title: r.alt_description || query, author: r.user?.name, where: 'Unsplash',
    page: r.links?.html, license: 'Unsplash', thumb: r.urls.small, full: r.urls.regular, width: r.width, height: r.height,
  }));
}

async function pexels(query, key) {
  const url = 'https://api.pexels.com/v1/search?' + new URLSearchParams({ query, per_page: '40' });
  const j = await getJson(url, { headers: { Authorization: key } });
  return (j.photos || []).map((r) => ({
    source: 'pexels', title: r.alt || query, author: r.photographer, where: 'Pexels',
    page: r.url, license: 'Pexels', thumb: r.src.medium, full: r.src.large2x, width: r.width, height: r.height,
  }));
}

// ---------- Сборка запросов ----------

// От самого точного к самому общему: так референсы похожи друг на друга, но доска не пустеет.
function irlQueries(q) {
  if (q.raw) return [q.raw];
  const list = [];
  if (q.mod) list.push(`${q.style} ${q.object} ${q.mod}`);
  if (q.style) list.push(`${q.style} ${q.object}`);
  list.push(`${q.object} ${q.style ? q.style.split(' ')[0] : 'architecture'}`.trim());
  list.push(q.object);
  return [...new Set(list)];
}

function mcQueries(q) {
  if (q.raw) return [q.raw];
  const list = [];
  if (q.style) list.push(`${q.style} ${q.object}`);
  list.push(q.object);
  return [...new Set(list)];
}

// Каждый шаг возвращает массив; ошибка одного источника не роняет остальные.
async function gather(steps, want, status) {
  const out = [];
  const seen = new Set();
  for (const step of steps) {
    if (out.length >= want) break;
    try {
      const items = await step.run();
      status(step.name, 'ok', items.length);
      for (const it of items) {
        if (!it.thumb || seen.has(it.thumb) || seen.has(it.page)) continue;
        seen.add(it.thumb); seen.add(it.page);
        it.query = step.query;
        out.push(it);
      }
    } catch (e) {
      status(step.name, 'error', String(e.message || e));
    }
  }
  return out;
}

export async function findReferences(theme, { source, count, status = () => {} }) {
  const keys = getKeys();
  const want = Math.max(count * 3, 18);
  const q = theme.q;
  const size = theme.size;

  const irlSteps = [];
  for (const query of irlQueries(q)) {
    if (keys.unsplash) irlSteps.push({ name: 'Unsplash', query, run: () => unsplash(query, keys.unsplash) });
    if (keys.pexels) irlSteps.push({ name: 'Pexels', query, run: () => pexels(query, keys.pexels) });
    irlSteps.push({ name: 'Wikimedia', query, run: () => wikimedia(query, true) });
    irlSteps.push({ name: 'Openverse', query, run: () => openverse(query) });
  }
  irlSteps.push({ name: 'Wikimedia', query: irlQueries(q)[0], run: () => wikimedia(irlQueries(q)[0], false) });

  const mcSteps = [];
  for (const query of mcQueries(q)) {
    mcSteps.push({ name: 'Reddit', query, run: () => reddit(query, size) });
    mcSteps.push({ name: 'Openverse', query: `minecraft ${query}`, run: () => openverse(`minecraft ${query}`) });
    if (keys.unsplash) mcSteps.push({ name: 'Unsplash', query: `minecraft ${query}`, run: () => unsplash(`minecraft ${query}`, keys.unsplash) });
  }

  if (source === 'irl') return mix([await gather(irlSteps, want, status)]);
  if (source === 'mc') return mix([await gather(mcSteps, want, status)]);
  const [a, b] = await Promise.all([gather(mcSteps, want / 2, status), gather(irlSteps, want / 2, status)]);
  return mix([a, b]);
}

// Немного случайности внутри лучших результатов, чтобы «Новые референсы» давали другое.
function mix(lists) {
  const shuffled = lists.map((l) => {
    const top = l.slice(0, 24);
    for (let i = top.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [top[i], top[j]] = [top[j], top[i]];
    }
    return [...top, ...l.slice(24)];
  });
  if (shuffled.length === 1) return shuffled[0];
  const out = [];
  const seen = new Set();
  const max = Math.max(...shuffled.map((l) => l.length));
  for (let i = 0; i < max; i++) {
    for (const l of shuffled) {
      if (l[i] && !seen.has(l[i].thumb)) { seen.add(l[i].thumb); out.push(l[i]); }
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
