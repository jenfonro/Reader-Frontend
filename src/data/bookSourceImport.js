import {
  cloneBookSource,
  normalizeBookSourceObject,
  toBookSourceText
} from "./bookSourceCore.js";
import { getSourceKey, readBookSources, writeBookSources } from "./bookSourceStorage.js";

export const createImportPreview = sources => {
  const existingSources = readBookSources();
  const existingKeys = new Set(existingSources.map(getSourceKey));

  return sources.map((source, index) => {
    const sourceKey = getSourceKey(source, index);
    const url = toBookSourceText(source.bookSourceUrl).trim();
    const name = toBookSourceText(source.bookSourceName).trim() || url || `未命名书源 ${index + 1}`;
    const group = toBookSourceText(source.bookSourceGroup).trim();

    return {
      key: `${sourceKey}:import:${index}`,
      sourceKey,
      name,
      url,
      group,
      enabled: source.enabled !== false,
      exists: existingKeys.has(sourceKey),
      raw: cloneBookSource(source)
    };
  });
};

export const importBookSources = sources => {
  const currentSources = readBookSources();
  const nextSources = [...currentSources];
  let created = 0;
  let updated = 0;

  sources.forEach(source => {
    const normalizedSource = normalizeBookSourceObject(source);
    if (!normalizedSource) return;

    const sourceKey = getSourceKey(normalizedSource);
    const existingIndex = nextSources.findIndex(
      (item, index) => getSourceKey(item, index) === sourceKey
    );

    if (existingIndex >= 0) {
      nextSources[existingIndex] = cloneBookSource(normalizedSource);
      updated += 1;
    } else {
      nextSources.push(cloneBookSource(normalizedSource));
      created += 1;
    }
  });

  writeBookSources(nextSources);
  return { created, updated };
};
