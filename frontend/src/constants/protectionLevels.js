const DEFAULT_LEVEL_KEY = 'restricted';

export const PROTECTION_LEVEL_DEFINITIONS = {
  sensitive: {
    label: '敏感内容',
    description: '该照片含有敏感内容，暂不公开展示。'
  },
  personal: {
    label: '个人隐私',
    description: '该照片涉及个人隐私信息，暂不公开展示。'
  },
  portrait: {
    label: '他人肖像',
    description: '该照片包含他人肖像，暂不公开展示。'
  },
  restricted: {
    label: '不宜公开',
    description: '该照片暂未开放查看，暂不公开展示。'
  }
};

const PROTECTION_LEVEL_ALIASES = {
  sensitive: ['sensitive', 'sensitive-content', 'sensitive-data', 'explicit'],
  personal: ['personal', 'privacy', 'private', 'personal-data', 'person'],
  portrait: ['portrait', 'face', 'portrait-rights', '肖像', 'portrait-sensitive'],
  restricted: ['restricted', 'internal', 'admin-only', 'confidential', 'limited', 'other', 'misc', 'unknown', 'general', 'default', '']
};

export const normalizeProtectionLevel = (value) => {
  if (!value) return null;
  const key = value.toString().trim().toLowerCase();

  if (PROTECTION_LEVEL_DEFINITIONS[key]) {
    return key;
  }

  for (const [canonical, aliases] of Object.entries(PROTECTION_LEVEL_ALIASES)) {
    if (aliases.includes(key)) {
      return canonical;
    }
  }

  return null;
};

export const resolveProtectionLevelInfo = (value) => {
  const resolvedKey = normalizeProtectionLevel(value) || DEFAULT_LEVEL_KEY;
  const definition = PROTECTION_LEVEL_DEFINITIONS[resolvedKey] || PROTECTION_LEVEL_DEFINITIONS[DEFAULT_LEVEL_KEY];
  return {
    key: resolvedKey,
    label: definition.label,
    description: definition.description
  };
};

export const isPhotoProtected = (photo) => {
  if (!photo) return false;

  if (photo.effective_protection !== undefined && photo.effective_protection !== null) {
    return Boolean(photo.effective_protection);
  }
  if (photo.is_protected !== undefined && photo.is_protected !== null) {
    return Boolean(photo.is_protected);
  }
  if (photo._raw?.effective_protection !== undefined && photo._raw?.effective_protection !== null) {
    return Boolean(photo._raw.effective_protection);
  }
  if (photo._raw?.is_protected !== undefined && photo._raw?.is_protected !== null) {
    return Boolean(photo._raw.is_protected);
  }

  return false;
};
