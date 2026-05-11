import { evaluateLegadoScript } from "./legadoScript.js";
import { normalizeBaseUrl, toText } from "./legadoCommon.js";
import {
  formatAuthor,
  formatBookName,
  getElements,
  getString,
  htmlToText,
  parseRuleObject
} from "./legadoRules.js";


const createRuleContext = (content, context = {}) => ({
  ...context,
  content,
  getString: rule => getString(rule, content, context),
  getElements: rule => getElements(rule, content, context)
});

const splitLeadingRuleFlag = rule => {
  let text = toText(rule).trim();
  let reverse = false;
  if (text.startsWith("-")) {
    reverse = true;
    text = text.slice(1).trim();
  }
  if (text.startsWith("+")) {
    text = text.slice(1).trim();
  }
  return { rule: text, reverse };
};

const toBoolean = value => {
  if (typeof value === "boolean") return value;
  const text = toText(value).trim().toLowerCase();
  return text === "true" || text === "1" || text === "yes";
};

const stringsFromValue = value => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(stringsFromValue).filter(Boolean);
  return toText(value)
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);
};

const getRuleValue = (rule, content, context, options = {}) => {
  const ruleText = toText(rule).trim();
  if (!ruleText) return "";
  if (/^<js>[\s\S]*<\/js>$/i.test(ruleText)) {
    const script = ruleText.replace(/^<js>/i, "").replace(/<\/js>$/i, "");
    return evaluateLegadoScript(script, createRuleContext(content, context), content);
  }
  if (ruleText.startsWith("@js:")) {
    return evaluateLegadoScript(ruleText.slice(4), createRuleContext(content, context), content);
  }
  return getString(ruleText, content, context, options);
};

const getRuleValues = (rule, content, context, options = {}) => {
  const ruleText = toText(rule).trim();
  if (!ruleText) return [];
  const values = getElements(ruleText, content, context);
  if (values.length) return stringsFromValue(values);
  return stringsFromValue(getRuleValue(ruleText, content, context, options));
};

const createBookRuleContext = ({ source, requestUrl, keyword = "", page = 1, variables, book = {}, chapter = {} }) => ({
  source,
  key: keyword,
  page,
  variables: variables || new Map(),
  baseUrl: requestUrl || book.tocUrl || book.bookUrl || normalizeBaseUrl(source.bookSourceUrl),
  book: {
    origin: normalizeBaseUrl(source.bookSourceUrl),
    originName: source.bookSourceName || "",
    ...book
  },
  chapter
});

const toAbsoluteUrl = (value, baseUrl) => {
  const text = toText(value).trim();
  if (!text) return "";
  try {
    return new URL(text, baseUrl || window.location.href).toString();
  } catch (error) {
    return text;
  }
};

const sameUrl = (left, right) =>
  toText(left).trim().replace(/\/+$/, "") === toText(right).trim().replace(/\/+$/, "");

const mergeBookTags = (...values) => values
  .flatMap(value => (Array.isArray(value) ? value : toText(value).split(/[,，\s]+/)))
  .map(value => toText(value).trim())
  .filter(Boolean)
  .filter((value, index, array) => array.indexOf(value) === index);

const decodeHtmlEntities = value => {
  const text = toText(value);
  if (!text || typeof document === "undefined") return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

const reverseItems = items => [...items].reverse();

const dedupeChapters = chapters => {
  const seen = new Set();
  return chapters.filter(chapter => {
    const key = chapter.url || chapter.chapterUrl || chapter.title || chapter.name;
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const analyzeBookInfo = ({ body, source, book = {}, requestUrl, variables }) => {
  const rules = parseRuleObject(source.ruleBookInfo);
  const bookUrl = toAbsoluteUrl(book.bookUrl || requestUrl, requestUrl || normalizeBaseUrl(source.bookSourceUrl));
  const context = createBookRuleContext({ source, requestUrl: requestUrl || bookUrl, variables, book });
  let pageValue = body;
  const initRule = toText(rules.init).trim();
  if (initRule) {
    const initializedItems = getElements(initRule, body, context);
    if (initializedItems.length === 1) {
      pageValue = initializedItems[0];
    } else if (initializedItems.length > 1) {
      pageValue = initializedItems;
    } else {
      const initialized = getRuleValue(initRule, body, context);
      if (initialized !== "") pageValue = initialized;
    }
  }

  const parsed = {
    name: formatBookName(getRuleValue(rules.name, pageValue, context)),
    author: formatAuthor(getRuleValue(rules.author, pageValue, context)),
    kind: getRuleValue(rules.kind, pageValue, context),
    wordCount: getRuleValue(rules.wordCount, pageValue, context),
    latestChapterTitle: getRuleValue(rules.lastChapter, pageValue, context),
    intro: htmlToText(getRuleValue(rules.intro, pageValue, context)),
    coverUrl: getRuleValue(rules.coverUrl, pageValue, context, { isUrl: true }),
    tocUrl: getRuleValue(rules.tocUrl, pageValue, context, { isUrl: true }),
    downloadUrls: getRuleValue(rules.downloadUrls, pageValue, context)
  };
  const allowRename = Boolean(toText(rules.canReName).trim());
  const coverUrl = toAbsoluteUrl(parsed.coverUrl, bookUrl);
  const tocUrl = toAbsoluteUrl(parsed.tocUrl || book.tocUrl || bookUrl, bookUrl);
  const nextBook = {
    ...book,
    name: parsed.name && (allowRename || !book.name) ? parsed.name : book.name,
    author: parsed.author && (allowRename || !book.author) ? parsed.author : book.author,
    intro: parsed.intro || book.intro || "",
    kind: parsed.kind || book.kind || "",
    wordCount: parsed.wordCount || book.wordCount || "",
    latestChapterTitle: parsed.latestChapterTitle || book.latestChapterTitle || book.latestChapter || "",
    lastChapter: parsed.latestChapterTitle || book.lastChapter || book.latestChapter || "",
    coverUrl: coverUrl || book.coverUrl || "",
    imageUrl: coverUrl || book.imageUrl || book.coverUrl || "",
    bookUrl,
    tocUrl,
    downloadUrls: parsed.downloadUrls || book.downloadUrls || "",
    origin: normalizeBaseUrl(source.bookSourceUrl),
    originName: source.bookSourceName || book.originName || "",
    sourceName: source.bookSourceName || book.sourceName || "",
    sourceGroup: source.bookSourceGroup || book.sourceGroup || "",
    sourceKey: source.__sourceKey || book.sourceKey || "",
    tags: mergeBookTags(book.tags, parsed.kind || book.kind)
  };

  if (sameUrl(tocUrl, bookUrl)) {
    nextBook.tocHtml = body;
  }
  nextBook.infoHtml = body;
  return nextBook;
};

export const analyzeBookCatalogPage = ({ body, source, book = {}, requestUrl, variables }) => {
  const rules = parseRuleObject(source.ruleToc);
  const { rule: chapterListRule, reverse } = splitLeadingRuleFlag(rules.chapterList || "");
  const context = createBookRuleContext({ source, requestUrl, variables, book });
  const items = chapterListRule ? getElements(chapterListRule, body, context) : [];
  const chapters = items.map((item, index) => {
    const itemContext = { ...context, itemIndex: index };
    const isVolume = toBoolean(getRuleValue(rules.isVolume, item, itemContext));
    const isVip = toBoolean(getRuleValue(rules.isVip, item, itemContext));
    const title = getRuleValue(rules.chapterName, item, itemContext).trim();
    const updateTime = getRuleValue(rules.updateTime || rules.chapterInfo, item, itemContext).trim();
    let chapterUrl = getRuleValue(rules.chapterUrl, item, itemContext, { isUrl: true }).trim();
    if (!chapterUrl) {
      chapterUrl = isVolume ? `${title}${index}` : requestUrl;
    } else if (!isVolume || !chapterUrl.startsWith(title)) {
      chapterUrl = toAbsoluteUrl(chapterUrl, requestUrl || book.tocUrl || book.bookUrl);
    }
    const chapterTitle = isVip && title && !title.startsWith("🔒") ? `🔒${title}` : title;
    return {
      index,
      name: chapterTitle,
      title: chapterTitle,
      chapterUrl,
      url: chapterUrl,
      isVolume,
      isVip,
      updateTime,
      time: updateTime
    };
  }).filter(chapter => chapter.title);

  const nextTocUrls = getRuleValues(rules.nextTocUrl, body, context, { isUrl: true })
    .map(value => toAbsoluteUrl(value, requestUrl || book.tocUrl || book.bookUrl))
    .filter(value => value && !sameUrl(value, requestUrl));

  return { chapters, nextTocUrls, reverse };
};

export const finalizeBookCatalog = (chapters, reverse = false) => {
  const normalizedChapters = dedupeChapters(reverse ? reverseItems(chapters) : chapters);
  return normalizedChapters.map((chapter, index) => ({
    ...chapter,
    index
  }));
};

export const analyzeChapterContentPage = ({ body, source, book = {}, chapter = {}, requestUrl, variables }) => {
  const rules = parseRuleObject(source.ruleContent);
  const context = createBookRuleContext({ source, requestUrl, variables, book, chapter });
  const title = getRuleValue(rules.title, body, context).trim();
  const content = toText(rules.content).trim()
    ? getRuleValue(rules.content, body, context)
    : requestUrl;
  const nextContentUrls = getRuleValues(rules.nextContentUrl, body, context, { isUrl: true })
    .map(value => toAbsoluteUrl(value, requestUrl || chapter.url || chapter.chapterUrl || book.tocUrl || book.bookUrl))
    .filter(value => value && !sameUrl(value, requestUrl));

  return {
    title,
    content: toText(content).trim(),
    nextContentUrls,
    imageStyle: toText(rules.imageStyle).trim()
  };
};

export const finalizeChapterContent = ({ content, source, book = {}, chapter = {}, requestUrl, variables }) => {
  const rules = parseRuleObject(source.ruleContent);
  let nextContent = toText(content);
  const replaceRule = toText(rules.replaceRegex).trim();
  if (replaceRule) {
    const context = createBookRuleContext({ source, requestUrl, variables, book, chapter });
    const replaced = getRuleValue(replaceRule, nextContent, context);
    if (toText(replaced).trim()) nextContent = toText(replaced);
  }
  return decodeHtmlEntities(nextContent);
};
