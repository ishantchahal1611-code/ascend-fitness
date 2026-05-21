const LEGACY_PREFIX = 'ascend_';

export function storageKey(key, userId) {
  return userId ? `${LEGACY_PREFIX}${userId}_${key}` : `${LEGACY_PREFIX}${key}`;
}

export function load(key, def, userId) {
  try {
    const v = localStorage.getItem(storageKey(key, userId));
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}

export function save(key, val, userId) {
  localStorage.setItem(storageKey(key, userId), JSON.stringify(val));
}

/** Read old non–user-scoped keys (pre-migration cache). */
export function loadLegacy(key, def) {
  try {
    const v = localStorage.getItem(`${LEGACY_PREFIX}${key}`);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}

export function clearAscendLocalCache(userId) {
  const prefixes = userId
    ? [`${LEGACY_PREFIX}${userId}_`, LEGACY_PREFIX]
    : [LEGACY_PREFIX];
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && prefixes.some((p) => k.startsWith(p))) {
      localStorage.removeItem(k);
    }
  }
}
