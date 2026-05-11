import {
  cloneBookSource,
  normalizeBookSourceObject,
  toBookSourceText
} from "./bookSourceCore.js";

const STORAGE_KEY = "reader.bookSources.v1";

export const getSourceKey = (source = {}, index = 0) => {
  const url = toBookSourceText(source.bookSourceUrl).trim();
  const name = toBookSourceText(source.bookSourceName).trim();
  if (url) return `url:${url}`;
  if (name) return `name:${name}`;
  return `index:${index}`;
};

export const readBookSources = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeBookSourceObject).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
};

export const writeBookSources = sources => {
  const normalizedSources = Array.isArray(sources)
    ? sources.map(normalizeBookSourceObject).filter(Boolean)
    : [];

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSources));
  }

  return normalizedSources;
};

export const normalizeBookSourceForList = (source = {}, index = 0) => {
  const url = toBookSourceText(source.bookSourceUrl).trim();
  const name = toBookSourceText(source.bookSourceName).trim() || url || `未命名书源 ${index + 1}`;
  const group = toBookSourceText(source.bookSourceGroup).trim();
  const enabled = source.enabled !== false;
  const updatedAt = Number(source.lastUpdateTime || source.updatedAt || 0);
  const responseTime = Number(source.respondTime || 0);
  const weight = Number(source.weight || 0);

  return {
    key: getSourceKey(source, index),
    name,
    url,
    group,
    enabled,
    enabledExplore: source.enabledExplore !== false,
    customOrder: Number(source.customOrder || 0),
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0,
    responseTime: Number.isFinite(responseTime) ? responseTime : 0,
    weight: Number.isFinite(weight) ? weight : 0,
    status: enabled ? "ok" : "",
    raw: source
  };
};

export const readBookSourceList = () =>
  readBookSources().map((source, index) => normalizeBookSourceForList(source, index));

export const findBookSourceByKey = key => {
  const sources = readBookSources();
  return sources.find((source, index) => getSourceKey(source, index) === key) || null;
};

export const setBookSourceEnabled = (key, enabled) => {
  const sources = readBookSources();
  const index = sources.findIndex((source, sourceIndex) => getSourceKey(source, sourceIndex) === key);
  if (index < 0) return null;

  sources[index] = {
    ...sources[index],
    enabled: Boolean(enabled)
  };
  writeBookSources(sources);
  return normalizeBookSourceForList(sources[index], index);
};

export const deleteBookSourcesByKeys = keys => {
  const selectedKeys = new Set(keys);
  const sources = readBookSources();
  const nextSources = sources.filter(
    (source, index) => !selectedKeys.has(getSourceKey(source, index))
  );
  writeBookSources(nextSources);
  return sources.length - nextSources.length;
};

export const saveBookSource = (source, previousKey = "") => {
  const normalizedSource = normalizeBookSourceObject(source);
  if (!normalizedSource) throw new Error("书源数据无效");

  const sources = readBookSources();
  const nextSourceKey = getSourceKey(normalizedSource);
  const currentIndex = sources.findIndex((item, index) => {
    const itemKey = getSourceKey(item, index);
    return itemKey === previousKey || itemKey === nextSourceKey;
  });

  const sourceToSave = cloneBookSource(normalizedSource);
  let created = false;
  let savedSource = sourceToSave;

  if (currentIndex >= 0) {
    savedSource = {
      ...sources[currentIndex],
      ...sourceToSave
    };
    sources[currentIndex] = savedSource;
  } else {
    sources.push(sourceToSave);
    created = true;
  }

  writeBookSources(sources);
  return { created, source: savedSource, key: getSourceKey(savedSource) };
};
