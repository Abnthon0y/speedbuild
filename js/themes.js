// Генератор тем: стиль × объект (по размеру) × необязательное условие.
// Комбинаций десятки тысяч, а сид даёт одну и ту же тему по ссылке.

export const FAMILIES = [
  { id: 'medieval', ru: 'Средневековье' },
  { id: 'fantasy', ru: 'Фэнтези' },
  { id: 'east', ru: 'Восток' },
  { id: 'ancient', ru: 'Древний мир' },
  { id: 'europe', ru: 'Европа' },
  { id: 'modern', ru: 'Современность' },
  { id: 'wild', ru: 'Дикие места' },
];

// m — форма мужского рода (остальные выводятся), phrase — стиль ставится после объекта.
const STYLES = [
  { m: 'средневековый', en: 'medieval', fam: 'medieval' },
  { m: 'готический', en: 'gothic', fam: 'medieval' },
  { m: 'романский', en: 'romanesque', fam: 'medieval' },
  { m: 'фахверковый', en: 'half-timbered', fam: 'medieval' },
  { phrase: 'в стиле викингов', en: 'viking', fam: 'medieval' },
  { phrase: 'в тюдоровском стиле', en: 'tudor', fam: 'medieval' },
  { m: 'рыцарский', en: 'medieval knight', fam: 'medieval' },

  { m: 'эльфийский', en: 'elven', fam: 'fantasy' },
  { phrase: 'в стиле гномов', en: 'dwarven', fam: 'fantasy' },
  { m: 'сказочный', en: 'fairytale', fam: 'fantasy' },
  { m: 'волшебный', en: 'wizard', fam: 'fantasy' },
  { phrase: 'в стиле стимпанк', en: 'steampunk', fam: 'fantasy' },
  { m: 'грибной', en: 'mushroom', fam: 'fantasy' },
  { m: 'хоббитский', en: 'hobbit', fam: 'fantasy' },
  { m: 'мрачный', en: 'dark fantasy', fam: 'fantasy' },
  { m: 'небесный', en: 'sky', fam: 'fantasy' },

  { m: 'японский', en: 'japanese', fam: 'east' },
  { m: 'китайский', en: 'chinese', fam: 'east' },
  { m: 'корейский', en: 'korean', fam: 'east' },
  { m: 'тайский', en: 'thai', fam: 'east' },
  { m: 'индийский', en: 'indian', fam: 'east' },
  { m: 'мавританский', en: 'moorish', fam: 'east' },
  { m: 'персидский', en: 'persian', fam: 'east' },
  { m: 'османский', en: 'ottoman', fam: 'east' },

  { m: 'древнегреческий', en: 'ancient greek', fam: 'ancient' },
  { m: 'древнеримский', en: 'roman', fam: 'ancient' },
  { m: 'египетский', en: 'egyptian', fam: 'ancient' },
  { m: 'ацтекский', en: 'aztec', fam: 'ancient' },
  { phrase: 'в стиле майя', en: 'mayan', fam: 'ancient' },
  { m: 'древний', en: 'ancient', fam: 'ancient' },

  { m: 'скандинавский', en: 'scandinavian', fam: 'europe' },
  { m: 'русский деревянный', en: 'russian wooden', fam: 'europe' },
  { m: 'баварский', en: 'bavarian', fam: 'europe' },
  { m: 'средиземноморский', en: 'mediterranean', fam: 'europe' },
  { m: 'голландский', en: 'dutch', fam: 'europe' },
  { m: 'викторианский', en: 'victorian', fam: 'europe' },
  { m: 'барочный', en: 'baroque', fam: 'europe' },
  { phrase: 'в стиле ар-нуво', en: 'art nouveau', fam: 'europe' },
  { m: 'альпийский', en: 'alpine', fam: 'europe' },
  { m: 'деревенский', en: 'rustic', fam: 'europe' },

  { phrase: 'в стиле ар-деко', en: 'art deco', fam: 'modern' },
  { m: 'модернистский', en: 'modernist', fam: 'modern' },
  { phrase: 'в стиле брутализм', en: 'brutalist', fam: 'modern' },
  { m: 'футуристический', en: 'futuristic', fam: 'modern' },
  { m: 'минималистичный', en: 'minimalist', fam: 'modern' },
  { phrase: 'в стиле киберпанк', en: 'cyberpunk', fam: 'modern' },
  { m: 'индустриальный', en: 'industrial', fam: 'modern' },
  { m: 'советский', en: 'soviet', fam: 'modern' },

  { m: 'пустынный', en: 'desert adobe', fam: 'wild' },
  { m: 'тропический', en: 'tropical', fam: 'wild' },
  { m: 'подводный', en: 'underwater', fam: 'wild' },
  { m: 'пиратский', en: 'pirate', fam: 'wild' },
  { m: 'постапокалиптический', en: 'post apocalyptic', fam: 'wild' },
  { m: 'лесной', en: 'forest', fam: 'wild' },
  { m: 'северный', en: 'nordic winter', fam: 'wild' },
];

// g: m / f / n / p. not — семейства стилей, с которыми объект звучит нелепо.
export const OBJECTS = {
  small: [
    { ru: 'колодец', g: 'm', en: 'well' },
    { ru: 'фонтан', g: 'm', en: 'fountain' },
    { ru: 'уличный фонарь', g: 'm', en: 'street lamp' },
    { ru: 'рыночный прилавок', g: 'm', en: 'market stall' },
    { ru: 'беседка', g: 'f', en: 'gazebo' },
    { ru: 'киоск', g: 'm', en: 'kiosk' },
    { ru: 'повозка', g: 'f', en: 'cart' },
    { ru: 'лодка', g: 'f', en: 'boat' },
    { ru: 'алтарь', g: 'm', en: 'altar' },
    { ru: 'статуя', g: 'f', en: 'statue' },
    { ru: 'ворота', g: 'p', en: 'gate' },
    { ru: 'домик', g: 'm', en: 'small cottage' },
    { ru: 'святилище', g: 'n', en: 'shrine' },
    { ru: 'арка', g: 'f', en: 'archway' },
    { ru: 'мостик', g: 'm', en: 'footbridge' },
    { ru: 'теплица', g: 'f', en: 'greenhouse' },
    { ru: 'палатка', g: 'f', en: 'tent' },
    { ru: 'дерево', g: 'n', en: 'tree', not: ['modern'] },
    { ru: 'кузница', g: 'f', en: 'blacksmith forge' },
    { ru: 'причал', g: 'm', en: 'pier' },
    { ru: 'остановка', g: 'f', en: 'bus stop', not: ['ancient', 'medieval'] },
    { ru: 'сторожка', g: 'f', en: 'guard hut' },
    { ru: 'улей', g: 'm', en: 'beehive', not: ['modern'] },
    { ru: 'каменный мост', g: 'm', en: 'stone bridge', not: ['modern'] },
  ],
  medium: [
    { ru: 'дом', g: 'm', en: 'house' },
    { ru: 'таверна', g: 'f', en: 'tavern' },
    { ru: 'часовня', g: 'f', en: 'chapel' },
    { ru: 'пекарня', g: 'f', en: 'bakery' },
    { ru: 'башня', g: 'f', en: 'tower' },
    { ru: 'маяк', g: 'm', en: 'lighthouse' },
    { ru: 'мост', g: 'm', en: 'bridge' },
    { ru: 'мельница', g: 'f', en: 'windmill' },
    { ru: 'конюшня', g: 'f', en: 'stable' },
    { ru: 'библиотека', g: 'f', en: 'library' },
    { ru: 'особняк', g: 'm', en: 'mansion' },
    { ru: 'чайный домик', g: 'm', en: 'tea house' },
    { ru: 'лавка', g: 'f', en: 'shop' },
    { ru: 'кафе', g: 'n', en: 'cafe' },
    { ru: 'храм', g: 'm', en: 'temple' },
    { ru: 'корабль', g: 'm', en: 'ship' },
    { ru: 'дирижабль', g: 'm', en: 'airship', not: ['ancient'] },
    { ru: 'сторожевая башня', g: 'f', en: 'watchtower' },
    { ru: 'ферма', g: 'f', en: 'farmhouse' },
    { ru: 'обсерватория', g: 'f', en: 'observatory' },
    { ru: 'гостиница', g: 'f', en: 'inn' },
    { ru: 'вилла', g: 'f', en: 'villa' },
    { ru: 'баня', g: 'f', en: 'bathhouse' },
    { ru: 'водяная мельница', g: 'f', en: 'watermill' },
    { ru: 'школа', g: 'f', en: 'school' },
  ],
  large: [
    { ru: 'замок', g: 'm', en: 'castle' },
    { ru: 'собор', g: 'm', en: 'cathedral' },
    { ru: 'дворец', g: 'm', en: 'palace' },
    { ru: 'монастырь', g: 'm', en: 'monastery' },
    { ru: 'крепость', g: 'f', en: 'fortress' },
    { ru: 'порт', g: 'm', en: 'harbor' },
    { ru: 'вокзал', g: 'm', en: 'train station', not: ['ancient'] },
    { ru: 'небоскрёб', g: 'm', en: 'skyscraper', not: ['ancient', 'medieval'] },
    { ru: 'арена', g: 'f', en: 'arena' },
    { ru: 'университет', g: 'm', en: 'university' },
    { ru: 'пирамида', g: 'f', en: 'pyramid' },
    { ru: 'деревня', g: 'f', en: 'village' },
    { ru: 'городская площадь', g: 'f', en: 'town square' },
    { ru: 'крепостная стена', g: 'f', en: 'city wall' },
    { ru: 'плотина', g: 'f', en: 'dam' },
    { ru: 'оранжерея', g: 'f', en: 'conservatory' },
    { ru: 'театр', g: 'm', en: 'theater' },
    { ru: 'рынок', g: 'm', en: 'market' },
    { ru: 'ратуша', g: 'f', en: 'town hall' },
    { ru: 'флагманский корабль', g: 'm', en: 'galleon' },
    { ru: 'улица', g: 'f', en: 'street' },
    { ru: 'акведук', g: 'm', en: 'aqueduct' },
    { ru: 'зиккурат', g: 'm', en: 'ziggurat' },
  ],
};

const MODS = [
  { ru: 'в руинах', en: 'ruins' },
  { ru: 'под снегом', en: 'snow' },
  { ru: 'на краю скалы', en: 'cliff' },
  { ru: 'у водопада', en: 'waterfall' },
  { ru: 'в осеннем лесу', en: 'autumn' },
  { ru: 'в джунглях', en: 'jungle' },
  { ru: 'на воде', en: 'on water' },
  { ru: 'в тумане', en: 'fog' },
  { ru: 'ночью, с фонарями', en: 'night lights' },
  { ru: 'на сваях', en: 'stilts' },
  { ru: 'на летающем острове', en: 'floating island' },
  { ru: 'в пещере', en: 'cave' },
  { ru: 'на берегу моря', en: 'seaside' },
  { ru: 'в горах', en: 'mountain' },
  { ru: 'посреди пустыни', en: 'desert' },
  { ru: 'с садом', en: 'garden' },
  { ru: 'весной, в цвету', en: 'blossom' },
  { ru: 'у реки', en: 'river' },
  { ru: 'в сумерках', en: 'dusk' },
  { ru: 'заросший плющом', en: 'overgrown ivy', agree: true },
];

export const SIZES = {
  small: { ru: 'Маленькая', hint: 'до 15×15 блоков', minutes: 10 },
  medium: { ru: 'Средняя', hint: 'около 30×30 блоков', minutes: 20 },
  large: { ru: 'Крупная', hint: 'от 60×60 блоков', minutes: 45 },
};

// Прилагательное мужского рода в нужный род: готический → готическая / готическое / готические.
function inflect(m, g) {
  if (g === 'm') return m;
  return m.split(' ').map((w) => {
    const stem = w.slice(0, -2);
    const end = w.slice(-2);
    if (end === 'ий' && /н$/.test(stem) && !/ск$|цк$/.test(stem)) {
      return stem + { f: 'яя', n: 'ее', p: 'ие' }[g];
    }
    if (end === 'ий' || end === 'ой') {
      const back = /[гкхжшчщ]$/.test(stem);
      return stem + { f: 'ая', n: 'ое', p: back ? 'ие' : 'ые' }[g];
    }
    if (end === 'ый') return stem + { f: 'ая', n: 'ое', p: 'ые' }[g];
    return w;
  }).join(' ');
}

function modText(mod, g) {
  if (!mod.agree) return mod.ru;
  // «заросший плющом» → заросшая / заросшее / заросшие
  const [w, ...rest] = mod.ru.split(' ');
  const stem = w.slice(0, -2);
  const form = { m: w, f: stem + 'ая', n: stem + 'ее', p: stem + 'ие' }[g];
  return [form, ...rest].join(' ');
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);

const pick = (r, list) => list[Math.floor(r() * list.length)];

export function generateTheme(seed, size, family = null) {
  const r = rng(seed);
  const styles = family ? STYLES.filter((s) => s.fam === family) : STYLES;
  const style = pick(r, styles);
  const objects = OBJECTS[size].filter((o) => !(o.not || []).includes(style.fam));
  const obj = pick(r, objects);
  const mod = r() < 0.45 ? pick(r, MODS) : null;
  return buildTheme({ style, obj, mod, seed, size });
}

function buildTheme({ style, obj, mod, seed, size }) {
  const parts = style.phrase ? [obj.ru, style.phrase] : [inflect(style.m, obj.g), obj.ru];
  if (mod) parts.push(modText(mod, obj.g));
  return {
    seed,
    size,
    title: cap(parts.join(' ')),
    style: style.phrase ? style.phrase.replace(/^в (стиле )?/, '') : style.m,
    object: obj.ru,
    mod: mod ? mod.ru : null,
    family: style.fam,
    q: { style: style.en, object: obj.en, mod: mod ? mod.en : null },
  };
}

// Бесконечный список: каждый следующий сид выводится из предыдущего.
export function themeList(startSeed, count, size, family) {
  const out = [];
  const r = rng(startSeed);
  const seen = new Set();
  let guard = 0;
  while (out.length < count && guard++ < count * 10) {
    const t = generateTheme(Math.floor(r() * 2 ** 31), size, family);
    if (seen.has(t.title)) continue;
    seen.add(t.title);
    out.push(t);
  }
  return out;
}

// Своя тема: русские слова сопоставляются со словарём, чтобы искать по-английски.
export function customTheme(text, size) {
  const words = text.toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я-]+/).filter(Boolean);
  const stemOf = (w) => w.replace(/ё/g, 'е').slice(0, Math.max(4, Math.min(6, w.length - 2)));
  const hit = (ru) => {
    const st = ru.toLowerCase().split(' ').map(stemOf);
    return st.every((s) => words.some((w) => w.startsWith(s)));
  };
  const allObjects = [...OBJECTS.small, ...OBJECTS.medium, ...OBJECTS.large]
    .sort((a, b) => b.ru.length - a.ru.length);
  const style = STYLES.find((s) => hit(s.m || s.phrase.replace(/^в (стиле )?/, '')));
  const obj = allObjects.find((o) => hit(o.ru));
  const mod = MODS.find((m) => hit(m.ru.split(',')[0]));
  const latin = /[a-z]/i.test(text) && !/[а-я]/i.test(text);
  return {
    seed: null,
    size,
    custom: true,
    title: cap(text.trim()),
    style: style ? (style.m || style.phrase) : null,
    object: obj ? obj.ru : null,
    mod: mod ? mod.ru : null,
    family: style ? style.fam : null,
    q: latin
      ? { raw: text.trim() }
      : { style: style ? style.en : '', object: obj ? obj.en : 'building', mod: mod ? mod.en : null, raw: style || obj ? null : text.trim() },
  };
}

// Слова, по которым картинка считается «про этот объект»: ищутся в подписи, тегах и категориях.
// Объекты, которых здесь нет, узнаются по последнему слову английского названия.
const OBJECT_WORDS = {
  'street lamp': ['street lamp', 'lamppost', 'lamp post', 'streetlight', 'street light', 'lantern'],
  'market stall': ['market stall', 'stall', 'booth', 'stand'],
  gazebo: ['gazebo', 'pavilion', 'pergola'],
  kiosk: ['kiosk', 'booth', 'newsstand'],
  cart: ['cart', 'wagon', 'carriage'],
  boat: ['boat', 'rowboat', 'canoe', 'sampan', 'dinghy'],
  statue: ['statue', 'sculpture', 'monument'],
  gate: ['gate', 'gateway', 'torii', 'portal'],
  'small cottage': ['cottage', 'hut', 'cabin', 'starter house', 'small house'],
  shrine: ['shrine', 'altar', 'sanctuary'],
  archway: ['arch', 'archway'],
  footbridge: ['footbridge', 'bridge'],
  greenhouse: ['greenhouse', 'glasshouse', 'conservatory'],
  tent: ['tent', 'yurt', 'camp'],
  tree: ['tree', 'oak', 'sakura', 'willow'],
  'blacksmith forge': ['blacksmith', 'forge', 'smithy'],
  pier: ['pier', 'dock', 'jetty', 'wharf'],
  'bus stop': ['bus stop', 'tram stop', 'shelter'],
  'guard hut': ['guard', 'outpost', 'sentry', 'hut'],
  beehive: ['beehive', 'apiary', 'bee'],
  'stone bridge': ['bridge'],
  house: ['house', 'home', 'cottage', 'villa'],
  tavern: ['tavern', 'inn', 'pub'],
  chapel: ['chapel', 'church'],
  bakery: ['bakery', 'bakehouse'],
  tower: ['tower'],
  lighthouse: ['lighthouse'],
  bridge: ['bridge'],
  windmill: ['windmill', 'mill'],
  stable: ['stable', 'stables', 'barn'],
  library: ['library'],
  mansion: ['mansion', 'manor', 'estate'],
  'tea house': ['tea house', 'teahouse', 'tea room'],
  shop: ['shop', 'store', 'storefront'],
  cafe: ['cafe', 'café', 'coffee'],
  temple: ['temple', 'pagoda', 'shrine'],
  ship: ['ship', 'galleon', 'sailboat', 'vessel'],
  airship: ['airship', 'zeppelin', 'blimp'],
  watchtower: ['watchtower', 'watch tower', 'tower'],
  farmhouse: ['farmhouse', 'farm', 'barn'],
  observatory: ['observatory', 'telescope'],
  inn: ['inn', 'tavern', 'hotel'],
  villa: ['villa'],
  bathhouse: ['bathhouse', 'bath house', 'onsen', 'baths', 'hammam'],
  watermill: ['watermill', 'water mill', 'water wheel', 'waterwheel'],
  school: ['school', 'schoolhouse'],
  castle: ['castle', 'citadel', 'keep'],
  cathedral: ['cathedral', 'basilica'],
  palace: ['palace'],
  monastery: ['monastery', 'abbey', 'priory'],
  fortress: ['fortress', 'fort', 'citadel', 'stronghold'],
  harbor: ['harbor', 'harbour', 'port', 'docks'],
  'train station': ['train station', 'railway station', 'station'],
  skyscraper: ['skyscraper', 'tower', 'high-rise'],
  arena: ['arena', 'colosseum', 'coliseum', 'amphitheatre', 'amphitheater', 'stadium'],
  university: ['university', 'college', 'campus'],
  pyramid: ['pyramid'],
  village: ['village', 'town', 'hamlet'],
  'town square': ['square', 'plaza', 'piazza', 'town center'],
  'city wall': ['city wall', 'walls', 'wall', 'rampart'],
  dam: ['dam'],
  conservatory: ['conservatory', 'greenhouse', 'glasshouse', 'orangery'],
  theater: ['theater', 'theatre', 'opera'],
  market: ['market', 'bazaar', 'marketplace'],
  'town hall': ['town hall', 'city hall', 'guildhall'],
  galleon: ['galleon', 'ship', 'frigate'],
  street: ['street', 'alley', 'lane'],
  aqueduct: ['aqueduct'],
  ziggurat: ['ziggurat'],
};

const STYLE_WORDS = {
  japanese: ['japanese', 'japan'],
  chinese: ['chinese', 'china'],
  korean: ['korean', 'korea', 'hanok'],
  thai: ['thai', 'thailand'],
  indian: ['indian', 'india', 'mughal'],
  'ancient greek': ['greek', 'greece'],
  roman: ['roman', 'rome'],
  egyptian: ['egyptian', 'egypt'],
  'russian wooden': ['russian', 'russia', 'wooden'],
  'dark fantasy': ['dark', 'fantasy', 'gothic'],
  'desert adobe': ['desert', 'adobe'],
  'post apocalyptic': ['apocalyptic', 'abandoned', 'ruined'],
  'nordic winter': ['nordic', 'winter', 'snow'],
  'medieval knight': ['medieval', 'knight'],
  'art nouveau': ['art nouveau'],
  'art deco': ['art deco'],
  'half-timbered': ['half-timbered', 'half timbered', 'timber'],
};

const wordsOf = (s) => (s || '').toLowerCase().split(/\s+/).filter((w) => w.length > 2);

export function themeWords(q) {
  if (q.raw) {
    const w = wordsOf(q.raw).filter((x) => x.length > 3);
    return { object: w, style: [], mod: [] };
  }
  const object = q.object && q.object !== 'building'
    ? OBJECT_WORDS[q.object] || [q.object.split(' ').pop()]
    : [];
  const style = q.style ? STYLE_WORDS[q.style] || wordsOf(q.style) : [];
  const mod = q.mod ? wordsOf(q.mod) : [];
  return { object, style, mod };
}
