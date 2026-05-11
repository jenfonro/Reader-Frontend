export const toBookSourceText = value => (typeof value === "string" ? value : "");

export const normalizeBookSourceObject = source =>
  source && typeof source === "object" && !Array.isArray(source) ? source : null;

export const cloneBookSource = source => JSON.parse(JSON.stringify(source));
