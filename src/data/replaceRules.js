const STORAGE_KEY = "reader.replaceRules.v1";
const GROUP_SPLIT_PATTERN = /[，,;；\n]/;
const DEFAULT_RULE_ORDER = -2147483648;

const toText = value => (value === null || value === undefined ? "" : String(value));
const toNullableText = value => {
  const text = toText(value);
  return text ? text : null;
};
const toBoolean = (value, fallback) => (typeof value === "boolean" ? value : fallback);
const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const createRuleId = () => Date.now();

export const getReplaceRuleKey = (rule = {}) => `id:${toText(rule.id)}`;

export const splitReplaceRuleGroups = value =>
  toText(value)
    .split(GROUP_SPLIT_PATTERN)
    .map(item => item.trim())
    .filter(Boolean);

export const createDefaultReplaceRule = () => ({
  id: createRuleId(),
  name: "",
  group: null,
  pattern: "",
  replacement: "",
  scope: null,
  scopeTitle: false,
  scopeContent: true,
  excludeScope: null,
  isEnabled: true,
  isRegex: true,
  timeoutMillisecond: 3000,
  order: DEFAULT_RULE_ORDER
});

export const normalizeReplaceRule = (rule = {}, index = 0) => {
  const base = createDefaultReplaceRule();
  const id = toNumber(rule.id, 0) || createRuleId() + index;
  const timeoutMillisecond = toNumber(rule.timeoutMillisecond, base.timeoutMillisecond);
  const order = toNumber(rule.order ?? rule.sortOrder, DEFAULT_RULE_ORDER);

  return {
    ...base,
    ...rule,
    id,
    name: toText(rule.name),
    group: toNullableText(rule.group),
    pattern: toText(rule.pattern),
    replacement: toText(rule.replacement),
    scope: toNullableText(rule.scope),
    scopeTitle: toBoolean(rule.scopeTitle, base.scopeTitle),
    scopeContent: toBoolean(rule.scopeContent, base.scopeContent),
    excludeScope: toNullableText(rule.excludeScope),
    isEnabled: toBoolean(rule.isEnabled, base.isEnabled),
    isRegex: toBoolean(rule.isRegex, base.isRegex),
    timeoutMillisecond: timeoutMillisecond > 0 ? timeoutMillisecond : base.timeoutMillisecond,
    order
  };
};

export const readReplaceRules = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeReplaceRule).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
};

export const writeReplaceRules = rules => {
  const normalizedRules = Array.isArray(rules)
    ? rules.map(normalizeReplaceRule).filter(Boolean)
    : [];

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedRules));
  }

  return normalizedRules;
};

export const normalizeReplaceRuleForList = (rule = {}, index = 0) => {
  const normalizedRule = normalizeReplaceRule(rule, index);
  const group = toText(normalizedRule.group).trim();
  const name = toText(normalizedRule.name).trim() || normalizedRule.pattern || `未命名替换 ${index + 1}`;

  return {
    key: getReplaceRuleKey(normalizedRule),
    id: normalizedRule.id,
    name,
    group,
    displayName: group ? `${name} (${group})` : name,
    pattern: normalizedRule.pattern,
    replacement: normalizedRule.replacement,
    scope: toText(normalizedRule.scope),
    scopeTitle: normalizedRule.scopeTitle,
    scopeContent: normalizedRule.scopeContent,
    isEnabled: normalizedRule.isEnabled,
    isRegex: normalizedRule.isRegex,
    order: normalizedRule.order,
    raw: normalizedRule
  };
};

export const readReplaceRuleList = () =>
  readReplaceRules()
    .map(normalizeReplaceRuleForList)
    .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name, "zh-Hans-CN"));

export const findReplaceRuleByKey = key => {
  const rules = readReplaceRules();
  return rules.find(rule => getReplaceRuleKey(rule) === key) || null;
};

export const filterReplaceRules = (rules, keyword, groupFilter = "") => {
  const query = toText(keyword).trim().toLowerCase();
  const normalizedGroupFilter = toText(groupFilter).trim();

  return rules.filter(rule => {
    if (normalizedGroupFilter === "__NO_GROUP__" && rule.group) return false;
    if (normalizedGroupFilter && normalizedGroupFilter !== "__NO_GROUP__") {
      const groups = splitReplaceRuleGroups(rule.group);
      if (!groups.includes(normalizedGroupFilter)) return false;
    }
    if (!query) return true;
    return [rule.name, rule.group, rule.pattern, rule.replacement, rule.scope]
      .some(value => toText(value).toLowerCase().includes(query));
  });
};

export const setReplaceRuleEnabled = (key, enabled) => {
  const rules = readReplaceRules();
  const index = rules.findIndex(rule => getReplaceRuleKey(rule) === key);
  if (index < 0) return null;

  rules[index] = {
    ...rules[index],
    isEnabled: Boolean(enabled)
  };
  writeReplaceRules(rules);
  return normalizeReplaceRuleForList(rules[index], index);
};

export const deleteReplaceRulesByKeys = keys => {
  const selectedKeys = new Set(keys);
  const rules = readReplaceRules();
  const nextRules = rules.filter(rule => !selectedKeys.has(getReplaceRuleKey(rule)));
  writeReplaceRules(nextRules);
  return rules.length - nextRules.length;
};


export const deleteReplaceRuleByKey = key => deleteReplaceRulesByKeys([key]);

export const moveReplaceRuleToTop = key => {
  const rules = readReplaceRules();
  const index = rules.findIndex(rule => getReplaceRuleKey(rule) === key);
  if (index < 0) return null;

  const minOrder = rules.reduce((min, rule) => Math.min(min, toNumber(rule.order, 0)), 0);
  rules[index] = {
    ...rules[index],
    order: minOrder - 1
  };
  writeReplaceRules(rules);
  return normalizeReplaceRuleForList(rules[index], index);
};

export const moveReplaceRuleToBottom = key => {
  const rules = readReplaceRules();
  const index = rules.findIndex(rule => getReplaceRuleKey(rule) === key);
  if (index < 0) return null;

  const maxOrder = rules.reduce((max, rule) => Math.max(max, toNumber(rule.order, 0)), 0);
  rules[index] = {
    ...rules[index],
    order: maxOrder + 1
  };
  writeReplaceRules(rules);
  return normalizeReplaceRuleForList(rules[index], index);
};

export const saveReplaceRule = (rule, previousKey = "") => {
  const normalizedRule = normalizeReplaceRule(rule);
  if (!normalizedRule.pattern.trim()) throw new Error("请填写替换规则");
  if (!normalizedRule.name.trim()) normalizedRule.name = normalizedRule.pattern.trim();

  const rules = readReplaceRules();
  const nextKey = getReplaceRuleKey(normalizedRule);
  const currentIndex = rules.findIndex(item => {
    const itemKey = getReplaceRuleKey(item);
    return itemKey === previousKey || itemKey === nextKey;
  });

  let created = false;
  let savedRule = normalizedRule;

  if (currentIndex >= 0) {
    savedRule = {
      ...rules[currentIndex],
      ...normalizedRule
    };
    rules[currentIndex] = savedRule;
  } else {
    rules.push(savedRule);
    created = true;
  }

  writeReplaceRules(rules);
  return { created, rule: savedRule, key: getReplaceRuleKey(savedRule) };
};
