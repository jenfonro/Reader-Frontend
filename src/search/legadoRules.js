import { normalizeBaseUrl, toText } from "./legadoCommon.js";
import { evaluateLegadoScript } from "./legadoScript.js";

const htmlAccessors = new Set(["text", "html", "all", "textNodes", "ownText"]);

const isObject = value => value && typeof value === "object";
const isElement = value => typeof Element !== "undefined" && value instanceof Element;
const isDocument = value => typeof Document !== "undefined" && value instanceof Document;

export const parseRuleObject = value => {
  if (!value) return {};
  if (isObject(value) && !Array.isArray(value)) return value;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return isObject(parsed) && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
};

const parseJson = value => {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text || (text[0] !== "{" && text[0] !== "[")) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
};

const parseHtml = value => {
  if (isElement(value) || isDocument(value)) return value;
  return new DOMParser().parseFromString(toText(value), "text/html");
};

const decodeHtmlEntities = value =>
  toText(value).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const normalizedEntity = entity.toLowerCase();
    const namedEntities = {
      amp: "&",
      lt: "<",
      gt: ">",
      quot: '"',
      apos: "'",
      nbsp: " "
    };
    if (Object.prototype.hasOwnProperty.call(namedEntities, normalizedEntity)) {
      return namedEntities[normalizedEntity];
    }
    if (normalizedEntity.startsWith("#x")) {
      const codePoint = Number.parseInt(normalizedEntity.slice(2), 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    if (normalizedEntity.startsWith("#")) {
      const codePoint = Number.parseInt(normalizedEntity.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return match;
  });

const stripHtmlToText = value => decodeHtmlEntities(
  toText(value)
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|div|section|article|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
).replace(/\n{3,}/g, "\n\n").trim();

const compact = values => values.filter(value => value !== null && value !== undefined && value !== "");

const splitByOperators = rule => {
  if (rule.includes("||")) return { parts: rule.split("||"), operator: "||" };
  if (rule.includes("&&")) return { parts: rule.split("&&"), operator: "&&" };
  return { parts: [rule], operator: "" };
};

const applyReplacement = (value, rule) => {
  const parts = rule.split("##");
  if (parts.length === 1) return { rule: parts[0], value };
  const pattern = parts[1] || "";
  const replacement = parts.length > 2 ? parts[2] : "";
  if (!pattern) return { rule: parts[0], value };
  try {
    return { rule: parts[0], value: toText(value).replace(new RegExp(pattern, "g"), replacement) };
  } catch (error) {
    return { rule: parts[0], value: toText(value).replace(pattern, replacement) };
  }
};

const getRecursiveValues = (value, key) => {
  const result = [];
  const visit = item => {
    if (!isObject(item)) return;
    if (Object.prototype.hasOwnProperty.call(item, key)) result.push(item[key]);
    if (Array.isArray(item)) {
      item.forEach(visit);
      return;
    }
    Object.values(item).forEach(visit);
  };
  visit(value);
  return result;
};

const readJsonPath = (value, rule) => {
  const root = parseJson(value) ?? value;
  if (!rule.startsWith("$")) return [];
  let items = [root];
  const tokens = rule.match(/\.\.[A-Za-z_$][\w$]*|\.[A-Za-z_$][\w$]*|\[\*\]|\[-?\d+\]/g) || [];

  for (const token of tokens) {
    if (token === "[*]") {
      items = items.flatMap(item => {
        if (Array.isArray(item)) return item;
        if (isObject(item)) return Object.values(item);
        return [];
      });
      continue;
    }

    if (token.startsWith("[")) {
      const index = Number(token.slice(1, -1));
      items = items.flatMap(item => {
        if (!Array.isArray(item)) return [];
        const normalizedIndex = index < 0 ? item.length + index : index;
        return normalizedIndex >= 0 && normalizedIndex < item.length ? [item[normalizedIndex]] : [];
      });
      continue;
    }

    if (token.startsWith("..")) {
      const key = token.slice(2);
      items = items.flatMap(item => getRecursiveValues(item, key));
      continue;
    }

    const key = token.slice(1);
    items = items.flatMap(item => {
      if (Array.isArray(item)) return item.map(child => child && child[key]).filter(value => value !== undefined);
      if (isObject(item) && item[key] !== undefined) return [item[key]];
      return [];
    });
  }

  return compact(items.flatMap(item => (Array.isArray(item) ? item : [item])));
};

const normalizeSelector = segment => {
  const trimmed = segment.trim();
  const classMatch = /^class\.([^.!\[\s]+)(?:([.!])(-?\d+))?$/.exec(trimmed);
  if (classMatch) return { selector: `.${classMatch[1]}`, index: classMatch[3], exclude: classMatch[2] === "!" };
  const tagMatch = /^tag\.([^.!\[\s]+)(?:([.!])(-?\d+))?$/.exec(trimmed);
  if (tagMatch) return { selector: tagMatch[1], index: tagMatch[3], exclude: tagMatch[2] === "!" };
  const idMatch = /^id\.([^.!\[\s]+)(?:([.!])(-?\d+))?$/.exec(trimmed);
  if (idMatch) return { selector: `#${idMatch[1]}`, index: idMatch[3], exclude: idMatch[2] === "!" };
  const simpleIndexMatch = /^([A-Za-z][\w-]*)(?:\.(-?\d+))$/.exec(trimmed);
  if (simpleIndexMatch) return { selector: simpleIndexMatch[1], index: simpleIndexMatch[2], exclude: false };
  const cssIndexMatch = /^(.+\s+[A-Za-z][\w-]*)([.!])(-?\d+)$/.exec(trimmed);
  if (cssIndexMatch) return { selector: cssIndexMatch[1], index: cssIndexMatch[3], exclude: cssIndexMatch[2] === "!" };
  return { selector: trimmed, index: null, exclude: false };
};

const selectFromElements = (items, segment) => {
  const { selector, index, exclude } = normalizeSelector(segment);
  const selected = [];
  for (const item of items) {
    const root = isElement(item) || isDocument(item) ? item : parseHtml(item);
    try {
      selected.push(...root.querySelectorAll(selector));
    } catch (error) {
      return [];
    }
  }
  if (index === null || index === undefined) return selected;
  const numericIndex = Number(index);
  const normalizedIndex = numericIndex < 0 ? selected.length + numericIndex : numericIndex;
  if (normalizedIndex < 0 || normalizedIndex >= selected.length) return exclude ? selected : [];
  if (exclude) return selected.filter((_, itemIndex) => itemIndex !== normalizedIndex);
  return [selected[normalizedIndex]];
};

const getAccessorValues = (items, accessor) =>
  compact(items.map(item => {
    if (accessor === "text") return isElement(item) ? item.textContent.trim() : toText(item).trim();
    if (accessor === "ownText") {
      if (!isElement(item)) return toText(item).trim();
      return Array.from(item.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .filter(Boolean)
        .join("\n");
    }
    if (accessor === "textNodes") {
      if (!isElement(item)) return toText(item).trim();
      return Array.from(item.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .filter(Boolean)
        .join("\n");
    }
    if (accessor === "html") return isElement(item) ? item.innerHTML.trim() : toText(item);
    if (accessor === "all") return isElement(item) ? item.outerHTML.trim() : toText(item);
    if (isElement(item)) return item.getAttribute(accessor) || "";
    if (isObject(item)) return item[accessor] || "";
    return "";
  }));

const readHtmlRuleValues = (content, rule) => {
  const segments = rule.replace(/^@+/, "").split("@").map(item => item.trim()).filter(Boolean);
  if (!segments.length) return [];
  let items = [parseHtml(content)];

  for (const segment of segments) {
    const isSimpleAttribute = items.length
      && isElement(items[0])
      && !segment.includes(".")
      && !segment.includes(" ")
      && !segment.includes("[")
      && !segment.startsWith("#");
    const isAccessor = htmlAccessors.has(segment) || isSimpleAttribute;
    if (isAccessor) {
      items = getAccessorValues(items, segment);
    } else {
      items = selectFromElements(items, segment);
    }
    if (!items.length) return [];
  }

  return compact(items.map(item => (isElement(item) ? item.textContent.trim() : item)));
};

const expandTemplateRule = (rule, content, context) =>
  rule.replace(/\{\{([\s\S]*?)\}\}/g, (_, expression) => {
    const script = expression.trim();
    if (script.startsWith("$.")) return getString(script, content, context);
    return toText(evaluateLegadoScript(script, createRuleContext(content, context), ""));
  });

const createRuleContext = (content, context = {}) => ({
  ...context,
  content,
  getString: rule => getString(rule, content, context),
  getElements: rule => getElements(rule, content, context)
});

export const getElements = (rule, content, context = {}) => {
  const sourceRule = toText(rule).trim();
  if (!sourceRule) return [];
  if (/^<js>[\s\S]*<\/js>$/i.test(sourceRule)) {
    const script = sourceRule.replace(/^<js>/i, "").replace(/<\/js>$/i, "");
    const value = evaluateLegadoScript(script, createRuleContext(content, context), content);
    return Array.isArray(value) ? value : compact([value]);
  }
  if (sourceRule.startsWith(":")) {
    try {
      return Array.from(toText(content).matchAll(new RegExp(sourceRule.slice(1), "g"))).map(match => match[0]);
    } catch (error) {
      return [];
    }
  }

  const { parts, operator } = splitByOperators(sourceRule);
  const results = [];
  for (const part of parts) {
    const text = expandTemplateRule(part.trim(), content, context).trim();
    const values = text.startsWith("$") ? readJsonPath(content, text) : readHtmlRuleValues(content, text);
    if (values.length) {
      results.push(...values);
      if (operator === "||") break;
    }
  }
  return results;
};

export const getString = (rule, content, context = {}, options = {}) => {
  const rawRule = toText(rule).trim();
  if (!rawRule) return "";
  const jsIndex = rawRule.search(/@js:|<js>/i);
  if (jsIndex >= 0) {
    const beforeJs = rawRule.slice(0, jsIndex).trim();
    const jsRule = rawRule.slice(jsIndex).trim();
    const initialResult = beforeJs ? getString(beforeJs, content, context, options) : toText(content);
    const script = jsRule.startsWith("@js:")
      ? jsRule.slice(4)
      : jsRule.replace(/^<js>/i, "").replace(/<\/js>$/i, "");
    return toText(evaluateLegadoScript(script, createRuleContext(content, context), initialResult));
  }

  const replaced = applyReplacement("", rawRule);
  const hasTemplateRule = replaced.rule.includes("{{");
  const ruleText = expandTemplateRule(replaced.rule, content, context).trim();
  let values;
  if (ruleText.startsWith("$") && parseJson(content) !== null) {
    values = readJsonPath(content, ruleText);
  } else if (hasTemplateRule) {
    values = [ruleText];
  } else if (/^https?:\/\//i.test(ruleText) || ruleText.startsWith("/")) {
    values = [ruleText];
  } else {
    values = readHtmlRuleValues(content, ruleText);
  }

  let value = compact(values).map(toText).join("\n");
  value = applyReplacement(value, rawRule).value;
  if (options.isUrl && value) {
    try {
      return new URL(value, context.baseUrl || context.source?.bookSourceUrl || window.location.href).toString();
    } catch (error) {
      return value;
    }
  }
  return value;
};

export const formatBookName = value => toText(value).replace(/[《》]/g, "").trim();
export const formatAuthor = value => toText(value).replace(/^作者[:：\s]*/, "").trim();
export const htmlToText = value => {
  const text = toText(value);
  if (!text) return "";
  if (typeof DOMParser === "undefined") return stripHtmlToText(text);
  return parseHtml(text).body.textContent.trim();
};

export const analyzeSearchBooks = ({ body, source, requestUrl, keyword, page = 1, variables }) => {
  const rule = parseRuleObject(source.ruleSearch);
  const context = {
    source,
    key: keyword,
    page,
    variables: variables || new Map(),
    baseUrl: requestUrl || normalizeBaseUrl(source.bookSourceUrl),
    book: {
      origin: normalizeBaseUrl(source.bookSourceUrl),
      originName: source.bookSourceName || ""
    }
  };
  const items = getElements(rule.bookList || "", body, context);
  const targets = items.length ? items : [body];

  return targets.map((item, index) => {
    const itemContext = { ...context, itemIndex: index };
    const name = formatBookName(getString(rule.name, item, itemContext));
    if (!name) return null;
    const bookUrl = getString(rule.bookUrl, item, itemContext, { isUrl: true }) || requestUrl;
    const coverUrl = getString(rule.coverUrl, item, itemContext, { isUrl: true });
    return {
      key: `${source.bookSourceUrl || source.bookSourceName || "source"}:${bookUrl}:${name}`,
      name,
      author: formatAuthor(getString(rule.author, item, itemContext)),
      kind: getString(rule.kind, item, itemContext),
      wordCount: getString(rule.wordCount, item, itemContext),
      latestChapterTitle: getString(rule.lastChapter, item, itemContext),
      intro: htmlToText(getString(rule.intro, item, itemContext)),
      coverUrl,
      bookUrl,
      origin: normalizeBaseUrl(source.bookSourceUrl),
      originName: source.bookSourceName || "",
      originOrder: Number(source.customOrder || 0),
      type: Number(source.bookSourceType || 0),
      sourceWeight: Number(source.weight || 0)
    };
  }).filter(Boolean);
};

