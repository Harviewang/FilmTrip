export const FILM_TYPE_DEFINITIONS = [
  {
    value: 'color-negative',
    label: '彩色负片',
    shortCode: 'CN',
    aliases: ['彩色负片', '彩负', 'color-negative', 'color negative', 'colour negative', 'cn']
  },
  {
    value: 'color-positive',
    label: '彩色正片',
    shortCode: 'CP',
    aliases: ['彩色正片', '彩正', '反转片', 'slide', 'color-positive', 'color positive', 'colour positive', 'color slide', 'cp', 'sl']
  },
  {
    value: 'black-white-negative',
    label: '黑白负片',
    shortCode: 'BW',
    aliases: ['黑白负片', '黑白', '黑白胶片', 'bw', 'black-and-white-negative', 'black white negative', 'black-and-white negative']
  },
  {
    value: 'black-white-positive',
    label: '黑白正片',
    shortCode: 'BP',
    aliases: ['黑白正片', '黑白反转', 'black-and-white-positive', 'black white positive', 'bw positive', 'bp']
  }
];

export const FILM_TYPE_MAP = FILM_TYPE_DEFINITIONS.reduce((acc, item) => {
  acc[item.value] = item;
  item.aliases.forEach((alias) => {
    acc[alias.toLowerCase()] = item;
  });
  return acc;
}, {});

export const resolveFilmTypeEntry = (value) => {
  if (!value) return null;
  if (FILM_TYPE_MAP[value]) return FILM_TYPE_MAP[value];
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return FILM_TYPE_MAP[normalized] || null;
  }
  return null;
};

export const getFilmTypeLabel = (value) => {
  const entry = resolveFilmTypeEntry(value);
  return entry ? entry.label : value;
};

export const getFilmTypeShortCode = (value) => {
  const entry = resolveFilmTypeEntry(value);
  return entry ? entry.shortCode : '';
};
