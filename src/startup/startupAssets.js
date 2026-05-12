export const normalizeStartupAssetPath = asset => {
  if (!asset || typeof asset !== "string") return "";
  if (asset.startsWith("http://") || asset.startsWith("https://")) return asset;
  return asset.startsWith("/") ? asset : `/${asset}`;
};

export const normalizeStartupAssetList = assets =>
  Array.isArray(assets) ? assets.map(normalizeStartupAssetPath).filter(Boolean) : [];
