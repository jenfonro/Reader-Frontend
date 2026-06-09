import { normalizeBaseUrl, toText } from "./legadoCommon.js";
import { evaluateLegadoScript } from "./legadoScript.js";

const htmlAccessors = new Set(["text", "html", "all", "textNodes", "ownText"]);
const regexMatchMarker = "__readerLegadoRegexMatch";

const isObject = value => value && typeof value === "object";
const isElement = value => typeof Element !== "undefined" && value instanceof Element;
const isDocument = value => typeof Document !== "undefined" && value instanceof Document;
const isDomNode = value => isObject(value) && typeof value.nodeType === "number";
const isRegexMatch = value => isObject(value) && value[regexMatchMarker] === true;

const createRegexMatch = match => ({
  [regexMatchMarker]: true,
  value: match[0] || "",
  groups: Array.from(match).slice(1),
  index: Number.isFinite(match.index) ? match.index : -1
});

const getRegexGroupValue = (value, group) => {
  if (!isRegexMatch(value)) return "";
  const index = Number(group);
  if (!Number.isInteger(index) || index < 0) return "";
  return index === 0 ? toText(value.value) : toText(value.groups[index - 1]);
};

const expandRegexGroupReferences = (rule, content) => {
  if (!isRegexMatch(content)) return rule;
  return toText(rule).replace(/\$(\d+)/g, (match, group) => getRegexGroupValue(content, group));
};

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

const domNodeToText = value => {
  if (!isDomNode(value)) return toText(value).trim();
  if (value.nodeType === 2) return toText(value.value).trim();
  return toText(value.textContent ?? value.nodeValue).trim();
};

const ruleValueToText = value => {
  if (isRegexMatch(value)) return toText(value.value).trim();
  if (isDomNode(value)) return domNodeToText(value);
  return toText(value).trim();
};

const normalizeXPathIndex = index => {
  const offset = Math.abs(Number(index)) - 1;
  return offset > 0 ? `[last()-${offset}]` : "[last()]";
};

const normalizeXPathRule = rule => toText(rule)
  .trim()
  .replace(/^@?xpath:/i, "")
  .replace(/\[(-\d+)\]/g, (match, index) => normalizeXPathIndex(index))
  .trim();

const isXPathRule = rule => {
  const text = toText(rule).trim();
  if (/^@?xpath:/i.test(text)) return true;
  const xpath = normalizeXPathRule(text);
  return xpath.startsWith("//")
    || xpath.startsWith(".//")
    || /^\/(?:html|body)(?:\/|$)/i.test(xpath)
    || /^\.\/(?:[A-Za-z*]|@|text\(\))/.test(xpath);
};

const readXPathValues = (content, rule) => {
  const xpath = normalizeXPathRule(rule);
  if (!xpath || typeof XPathResult === "undefined") return [];

  const root = parseHtml(content);
  const ownerDocument = isDocument(root) ? root : root.ownerDocument;
  if (!ownerDocument || typeof ownerDocument.evaluate !== "function") return [];

  try {
    const result = ownerDocument.evaluate(xpath, root, null, XPathResult.ANY_TYPE, null);
    switch (result.resultType) {
      case XPathResult.STRING_TYPE:
        return compact([result.stringValue]);
      case XPathResult.NUMBER_TYPE:
        return Number.isFinite(result.numberValue) ? [String(result.numberValue)] : [];
      case XPathResult.BOOLEAN_TYPE:
        return [String(result.booleanValue)];
      case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
      case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
        return compact(Array.from({ length: result.snapshotLength }, (_, index) => result.snapshotItem(index)));
      default: {
        const values = [];
        let node = result.iterateNext();
        while (node) {
          values.push(node);
          node = result.iterateNext();
        }
        return compact(values);
      }
    }
  } catch (error) {
    return [];
  }
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

const splitTopLevel = (rule, operator) => {
  const parts = [];
  let start = 0;
  let templateDepth = 0;

  for (let index = 0; index < rule.length; index += 1) {
    if (rule.startsWith("{{", index)) {
      templateDepth += 1;
      index += 1;
      continue;
    }
    if (templateDepth && rule.startsWith("}}", index)) {
      templateDepth -= 1;
      index += 1;
      continue;
    }
    if (!templateDepth && rule.startsWith(operator, index)) {
      parts.push(rule.slice(start, index));
      index += operator.length - 1;
      start = index + 1;
    }
  }

  if (!parts.length) return null;
  parts.push(rule.slice(start));
  return parts;
};

const splitByOperators = rule => {
  const orParts = splitTopLevel(rule, "||");
  if (orParts) return { parts: orParts, operator: "||" };
  const andParts = splitTopLevel(rule, "&&");
  if (andParts) return { parts: andParts, operator: "&&" };
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
    if (accessor === "text") return ruleValueToText(item);
    if (accessor === "ownText") {
      if (!isElement(item)) return ruleValueToText(item);
      return Array.from(item.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .filter(Boolean)
        .join("\n");
    }
    if (accessor === "textNodes") {
      if (!isElement(item)) return ruleValueToText(item);
      return Array.from(item.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .filter(Boolean)
        .join("\n");
    }
    if (accessor === "html") return isElement(item) ? item.innerHTML.trim() : ruleValueToText(item);
    if (accessor === "all") return isElement(item) ? item.outerHTML.trim() : ruleValueToText(item);
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

  return compact(items);
};

const replaceAsync = async (value, pattern, replacer) => {
  const matches = Array.from(toText(value).matchAll(pattern));
  if (!matches.length) return toText(value);

  const replacements = await Promise.all(matches.map(match => replacer(...match)));
  let result = "";
  let cursor = 0;
  matches.forEach((match, index) => {
    result += toText(value).slice(cursor, match.index);
    result += toText(replacements[index]);
    cursor = match.index + match[0].length;
  });
  return result + toText(value).slice(cursor);
};

const expandTemplateRule = async (rule, content, context) =>
  replaceAsync(rule, /\{\{([\s\S]*?)\}\}/g, async (_, expression) => {
    const script = expression.trim();
    if (script.startsWith("$.")) return getString(script, content, context);
    return toText(await evaluateLegadoScript(script, createRuleContext(content, context), ""));
  });

const createRuleContext = (content, context = {}) => ({
  ...context,
  content,
  getString: (rule, nextContent = content) => getString(rule, nextContent, context),
  getElements: (rule, nextContent = content) => getElements(rule, nextContent, context)
});

const readRegexMatches = (rule, content) => {
  const regexRule = toText(rule).trim();
  if (!regexRule) return [];

  const { parts, operator } = splitByOperators(regexRule);
  if (operator === "&&") {
    let items = [content];
    for (const part of parts) {
      items = items.flatMap(item => readRegexMatches(part, ruleValueToText(item)));
      if (!items.length) return [];
    }
    return items;
  }

  if (operator === "||") {
    for (const part of parts) {
      const values = readRegexMatches(part, content);
      if (values.length) return values;
    }
    return [];
  }

  try {
    return Array.from(toText(content).matchAll(new RegExp(regexRule, "g"))).map(createRegexMatch);
  } catch (error) {
    return [];
  }
};

const readSingleRuleValues = async (rule, content, context = {}, options = {}) => {
  const sourceRule = toText(rule).trim();
  if (!sourceRule) return [];
  const hasTemplateRule = sourceRule.includes("{{");
  const ruleText = (await expandTemplateRule(sourceRule, content, context)).trim();
  const expandedRuleText = /^\$\d+$/.test(ruleText) ? ruleText : expandRegexGroupReferences(ruleText, content);

  if (/^\$\d+$/.test(expandedRuleText)) return compact([getRegexGroupValue(content, expandedRuleText.slice(1))]);
  if (expandedRuleText.startsWith(":")) return readRegexMatches(expandedRuleText.slice(1), content);
  if (isXPathRule(expandedRuleText)) return readXPathValues(content, expandedRuleText);
  if (expandedRuleText.startsWith("$") && parseJson(content) !== null) return readJsonPath(content, expandedRuleText);
  if (options.literalTemplate && hasTemplateRule) return compact([expandedRuleText]);
  if (/^https?:\/\//i.test(expandedRuleText) || expandedRuleText.startsWith("/")) return compact([expandedRuleText]);
  return readHtmlRuleValues(content, expandedRuleText);
};

const readRuleValues = async (rule, content, context = {}, options = {}) => {
  const sourceRule = toText(rule).trim();
  if (!sourceRule) return [];
  if (sourceRule.startsWith(":")) return readRegexMatches(sourceRule.slice(1), content);

  const { parts, operator } = splitByOperators(sourceRule);
  if (operator === "&&") {
    const values = [];
    for (const part of parts) {
      values.push(...await readSingleRuleValues(part, content, context, options));
    }
    return values;
  }
  if (operator === "||") {
    for (const part of parts) {
      const values = await readSingleRuleValues(part, content, context, options);
      if (values.length) return values;
    }
    return [];
  }
  return readSingleRuleValues(sourceRule, content, context, options);
};

const scriptNeedsArrayResult = script => /\bresult\s*(?:\[|\.length|\.map\b|\.forEach\b)/.test(script)
  || /for\s*\([^)]*\bresult\b/.test(script);

const createScriptInitialResult = async (rule, content, context, options, script) => {
  const values = (await readRuleValues(rule, content, context, options)).map(ruleValueToText);
  return scriptNeedsArrayResult(script) ? values : values.join("\n");
};

export const getElements = async (rule, content, context = {}) => {
  const sourceRule = toText(rule).trim();
  if (!sourceRule) return [];
  if (/^<js>[\s\S]*<\/js>$/i.test(sourceRule)) {
    const script = sourceRule.replace(/^<js>/i, "").replace(/<\/js>$/i, "");
    const value = await evaluateLegadoScript(script, createRuleContext(content, context), content);
    return Array.isArray(value) ? value : compact([value]);
  }
  return readRuleValues(sourceRule, content, context);
};

export const getString = async (rule, content, context = {}, options = {}) => {
  const rawRule = toText(rule).trim();
  if (!rawRule) return "";
  const jsIndex = rawRule.search(/@js:|<js>/i);
  if (jsIndex >= 0) {
    const beforeJs = rawRule.slice(0, jsIndex).trim();
    const jsRule = rawRule.slice(jsIndex).trim();
    const script = expandRegexGroupReferences(
      jsRule.startsWith("@js:")
        ? jsRule.slice(4)
        : jsRule.replace(/^<js>/i, "").replace(/<\/js>$/i, ""),
      content
    );
    const initialResult = beforeJs
      ? await createScriptInitialResult(beforeJs, content, context, options, script)
      : ruleValueToText(content);
    return toText(await evaluateLegadoScript(script, createRuleContext(content, context), initialResult));
  }

  const replaced = applyReplacement("", rawRule);
  const values = await readRuleValues(replaced.rule, content, context, { ...options, literalTemplate: true });
  let value = compact(values).map(ruleValueToText).join("\n");
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

export const analyzeSearchBooks = async ({
  body,
  source,
  requestUrl,
  keyword,
  page = 1,
  variables,
  ajax,
  removeCookie,
  startBrowserAwait
}) => {
  const rule = parseRuleObject(source.ruleSearch);
  const context = {
    source,
    key: keyword,
    page,
    variables: variables || new Map(),
    baseUrl: requestUrl || normalizeBaseUrl(source.bookSourceUrl),
    ajax,
    removeCookie,
    startBrowserAwait,
    book: {
      origin: normalizeBaseUrl(source.bookSourceUrl),
      originName: source.bookSourceName || ""
    }
  };
  const items = await getElements(rule.bookList || "", body, context);
  const targets = items.length ? items : [body];
  const books = [];

  for (const [index, item] of targets.entries()) {
    const itemContext = { ...context, itemIndex: index };
    const name = formatBookName(await getString(rule.name, item, itemContext));
    if (!name) continue;
    const bookUrl = await getString(rule.bookUrl, item, itemContext, { isUrl: true }) || requestUrl;
    const coverUrl = await getString(rule.coverUrl, item, itemContext, { isUrl: true });
    books.push({
      key: `${source.bookSourceUrl || source.bookSourceName || "source"}:${bookUrl}:${name}`,
      name,
      author: formatAuthor(await getString(rule.author, item, itemContext)),
      kind: await getString(rule.kind, item, itemContext),
      wordCount: await getString(rule.wordCount, item, itemContext),
      latestChapterTitle: await getString(rule.lastChapter, item, itemContext),
      intro: htmlToText(await getString(rule.intro, item, itemContext)),
      coverUrl,
      bookUrl,
      origin: normalizeBaseUrl(source.bookSourceUrl),
      originName: source.bookSourceName || "",
      originOrder: Number(source.customOrder || 0),
      type: Number(source.bookSourceType || 0),
      sourceWeight: Number(source.weight || 0)
    });
  }

  return books;
};

