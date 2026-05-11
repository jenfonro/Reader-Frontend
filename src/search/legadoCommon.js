export const toText = value => (value === null || value === undefined ? "" : String(value));

export const normalizeBaseUrl = value => toText(value).split("##")[0].trim();
