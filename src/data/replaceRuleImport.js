import {
  getReplaceRuleKey,
  normalizeReplaceRule,
  readReplaceRules,
  writeReplaceRules
} from "./replaceRules";

const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
const toText = value => (value === null || value === undefined ? "" : String(value));
const toBoolean = (value, fallback) => (typeof value === "boolean" ? value : fallback);

const isValidReplaceRule = rule => {
  if (!toText(rule.pattern).trim()) return false;
  if (!rule.isRegex) return true;
  try {
    new RegExp(rule.pattern);
  } catch (error) {
    return false;
  }
  return !rule.pattern.endsWith("|") || rule.pattern.endsWith("\\|");
};

const normalizeImportedRule = (rule, index = 0) => {
  if (!isObject(rule)) return null;
  const legadoRule = {
    id: rule.id,
    name: rule.name ?? rule.replaceSummary ?? "",
    group: rule.group ?? null,
    pattern: rule.pattern ?? rule.regex ?? "",
    replacement: rule.replacement ?? "",
    scope: rule.scope ?? rule.useTo ?? null,
    scopeTitle: rule.scopeTitle,
    scopeContent: rule.scopeContent,
    excludeScope: rule.excludeScope ?? null,
    isEnabled: rule.isEnabled ?? rule.enable,
    isRegex: rule.isRegex,
    timeoutMillisecond: rule.timeoutMillisecond,
    order: rule.order ?? rule.sortOrder ?? rule.serialNumber
  };

  const normalizedRule = normalizeReplaceRule(legadoRule, index);
  if (rule.pattern === undefined && rule.regex !== undefined) {
    normalizedRule.isRegex = toBoolean(rule.isRegex, false);
    normalizedRule.isEnabled = toBoolean(rule.enable, false);
  }
  if (!normalizedRule.name.trim()) normalizedRule.name = normalizedRule.pattern.trim();
  return isValidReplaceRule(normalizedRule) ? normalizedRule : null;
};

export const parseReplaceRuleText = text => {
  const content = toText(text).replace(/^\uFEFF/, "").trim();
  if (!content) throw new Error("替换规则内容为空");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error("替换规则格式不对");
  }

  const rawRules = Array.isArray(parsed) ? parsed : [parsed];
  const rules = rawRules
    .map(normalizeImportedRule)
    .filter(Boolean);

  if (!rules.length) throw new Error("未解析到有效替换规则");
  return rules;
};

export const readReplaceRuleFile = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(parseReplaceRuleText(reader.result));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("读取替换规则文件失败"));
    reader.readAsText(file, "utf-8");
  });

export const createReplaceRuleImportPreview = rules => {
  const existingRules = readReplaceRules();
  const existingRuleMap = new Map(existingRules.map(rule => [getReplaceRuleKey(rule), rule]));

  return rules.map((rule, index) => {
    const ruleKey = getReplaceRuleKey(rule);
    const existingRule = existingRuleMap.get(ruleKey) || null;
    const name = rule.name.trim() || rule.pattern || `未命名替换 ${index + 1}`;
    const changed = existingRule
      ? rule.pattern !== existingRule.pattern
        || rule.replacement !== existingRule.replacement
        || rule.isRegex !== existingRule.isRegex
        || rule.scope !== existingRule.scope
      : false;

    return {
      key: `${ruleKey}:import:${index}`,
      ruleKey,
      name,
      group: toText(rule.group),
      pattern: rule.pattern,
      exists: Boolean(existingRule),
      status: existingRule ? (changed ? "更新" : "已有") : "新增",
      raw: { ...rule }
    };
  });
};

export const importReplaceRules = rules => {
  const currentRules = readReplaceRules();
  const nextRules = [...currentRules];
  let created = 0;
  let updated = 0;

  rules.forEach((rule, index) => {
    const normalizedRule = normalizeImportedRule(rule, index);
    if (!normalizedRule) return;

    const ruleKey = getReplaceRuleKey(normalizedRule);
    const existingIndex = nextRules.findIndex(item => getReplaceRuleKey(item) === ruleKey);
    if (existingIndex >= 0) {
      nextRules[existingIndex] = { ...normalizedRule };
      updated += 1;
      return;
    }

    nextRules.push({ ...normalizedRule });
    created += 1;
  });

  writeReplaceRules(nextRules);
  return { created, updated };
};
