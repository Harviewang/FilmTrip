const FILM_TYPE_DEFINITIONS = [
  {
    code: 'color-negative',
    label: '彩色负片',
    shortCode: 'CN',
    aliases: ['彩色负片', '彩负', 'color-negative', 'color negative', 'colour negative', 'cn']
  },
  {
    code: 'color-positive',
    label: '彩色正片',
    shortCode: 'CP',
    aliases: ['彩色正片', '彩正', '反转片', 'slide', 'color-positive', 'color positive', 'colour positive', 'color slide', 'cp', 'sl']
  },
  {
    code: 'black-white-negative',
    label: '黑白负片',
    shortCode: 'BW',
    aliases: ['黑白负片', '黑白', '黑白胶片', '黑白底片', 'black-and-white-negative', 'black white negative', 'bw', 'bn']
  },
  {
    code: 'black-white-positive',
    label: '黑白正片',
    shortCode: 'BP',
    aliases: ['黑白正片', '黑白反转', 'black-and-white-positive', 'black white positive', 'bw positive', 'bp']
  }
];

const FILM_TYPE_INDEX = FILM_TYPE_DEFINITIONS.reduce((acc, def) => {
  acc[def.code] = def;
  def.aliases.forEach((alias) => {
    acc[alias.trim().toLowerCase()] = def;
  });
  return acc;
}, {});

const normalizeFilmType = (rawType) => {
  if (rawType === undefined || rawType === null) return null;
  const value = rawType.toString().trim();
  if (!value) return null;
  const direct = FILM_TYPE_INDEX[value];
  if (direct) return direct;
  const normalized = value.toLowerCase();
  return FILM_TYPE_INDEX[normalized] || null;
};

const ensureFilmType = (rawType) => {
  const entry = normalizeFilmType(rawType);
  if (!entry) {
    const candidates = FILM_TYPE_DEFINITIONS.map((item) => `'${item.code}'(${item.label})`).join(', ');
    throw new Error(`INVALID_FILM_TYPE:${rawType}. 可选值: ${candidates}`);
  }
  return entry;
};

const getFilmTypeLabel = (code) => {
  if (code === undefined || code === null) return '';
  const entry = normalizeFilmType(code);
  return entry ? entry.label : code;
};

module.exports = {
  FILM_TYPE_DEFINITIONS,
  normalizeFilmType,
  ensureFilmType,
  getFilmTypeLabel
};
