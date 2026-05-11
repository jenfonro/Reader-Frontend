export const bookSourceSortItems = [
  { label: "手动排序", value: "manual" },
  { label: "智能排序", value: "smart" },
  { label: "名称排序", value: "name" },
  { label: "地址排序", value: "url" },
  { label: "更新时间排序", value: "updatedAt" },
  { label: "响应时间排序", value: "responseTime" },
  { label: "是否启用", value: "enabled" }
];

export const bookSourceMoreActions = [
  { label: "新建书源", icon: "＋", action: "create" },
  { label: "本地导入", iconName: "import", action: "local-import" },
  { label: "网络导入", iconName: "import", action: "network-import" }
];

export const splitBookSourceGroups = value =>
  (typeof value === "string" ? value : "")
    .split(/[，,;；\n]/)
    .map(item => item.trim())
    .filter(Boolean);

export const sortBookSources = (sources, sortMode, reverseSort) => {
  const nextSources = [...sources];
  switch (sortMode) {
    case "smart":
      nextSources.sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name, "zh-Hans-CN"));
      break;
    case "name":
      nextSources.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
      break;
    case "url":
      nextSources.sort((a, b) => a.url.localeCompare(b.url));
      break;
    case "updatedAt":
      nextSources.sort((a, b) => b.updatedAt - a.updatedAt || a.name.localeCompare(b.name, "zh-Hans-CN"));
      break;
    case "responseTime":
      nextSources.sort((a, b) => a.responseTime - b.responseTime || a.name.localeCompare(b.name, "zh-Hans-CN"));
      break;
    case "enabled":
      nextSources.sort((a, b) => Number(b.enabled) - Number(a.enabled) || a.name.localeCompare(b.name, "zh-Hans-CN"));
      break;
    default:
      break;
  }
  if (reverseSort) nextSources.reverse();
  return nextSources;
};

export const filterBookSources = (sources, keyword) => {
  const value = keyword.trim().toLowerCase();
  if (!value) return sources;
  return sources.filter(source =>
    [source.name, source.url, source.group].some(text => text.toLowerCase().includes(value))
  );
};
