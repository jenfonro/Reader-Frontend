import { sourceEditorTabs, sourceTypeOptions } from "./bookSourceEditorConfig.js";

const sourceTypeValues = sourceTypeOptions.map(option => option.value);
const sourceTypeIndexes = Object.fromEntries(sourceTypeValues.map((value, index) => [value, index]));

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const clonePlainObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return { ...value };
  }
};

const toEditorText = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch (error) {
    return "";
  }
};

const parseRuleObject = (value) => {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value !== "string") return {};
  const trimmed = value.trim();
  if (!trimmed || trimmed[0] !== "{") return {};
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
};

const firstRuleValue = (rule, keys) => {
  const names = Array.isArray(keys) ? keys : [keys];
  for (const key of names) {
    if (rule && rule[key] !== undefined && rule[key] !== null) return toEditorText(rule[key]);
  }
  return "";
};

const assignRuleFields = (form, rule, mapping) => {
  Object.entries(mapping).forEach(([formKey, ruleKeys]) => {
    form[formKey] = firstRuleValue(rule, ruleKeys);
  });
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const createDefaultSourceMeta = () => ({
  isNew: true,
  sourceBase: {},
  customOrder: 0,
  lastUpdateTime: 0,
  respondTime: 180000,
  weight: 0,
  exploreScreen: "",
  ruleReview: "",
  ruleSearch: {},
  ruleExplore: {},
  ruleBookInfo: {},
  ruleToc: {},
  ruleContent: {}
});

const toNullableText = (value) => {
  if (value === null || value === undefined) return null;
  const text = typeof value === "string" ? value : String(value);
  return text === "" ? null : text;
};

const toNullableTrimmedText = (value) => {
  const text = toNullableText(value);
  if (text === null) return null;
  const trimmed = text.trim();
  return trimmed === "" ? null : trimmed;
};

const buildRule = (form, baseRule, mapping) => {
  const rule = baseRule && typeof baseRule === "object" && !Array.isArray(baseRule)
    ? { ...baseRule }
    : {};
  Object.entries(mapping).forEach(([formKey, ruleKey]) => {
    const text = form[formKey] === null || form[formKey] === undefined
      ? ""
      : String(form[formKey]);
    if (text === "") {
      if (hasOwn(rule, ruleKey)) {
        rule[ruleKey] = rule[ruleKey] === null ? null : "";
      } else {
        delete rule[ruleKey];
      }
      return;
    }
    rule[ruleKey] = text;
  });
  return rule;
};

const parseRuleValue = (value) => {
  const text = toNullableText(value);
  if (text === null) return null;
  const parsed = parseRuleObject(text);
  return Object.keys(parsed).length ? parsed : text;
};

const searchRuleMapping = {
  checkKeyWord: "checkKeyWord",
  bookList: "bookList",
  name: "name",
  author: "author",
  kind: "kind",
  wordCount: "wordCount",
  lastChapter: "lastChapter",
  intro: "intro",
  coverUrl: "coverUrl",
  bookUrl: "bookUrl"
};

const exploreRuleMapping = {
  exploreBookList: "bookList",
  exploreName: "name",
  exploreAuthor: "author",
  exploreKind: "kind",
  exploreWordCount: "wordCount",
  exploreLastChapter: "lastChapter",
  exploreIntro: "intro",
  exploreCoverUrl: "coverUrl",
  exploreBookUrl: "bookUrl"
};

const bookInfoRuleMapping = {
  bookInfoInit: "init",
  detailName: "name",
  detailAuthor: "author",
  detailKind: "kind",
  detailWordCount: "wordCount",
  detailLastChapter: "lastChapter",
  detailIntro: "intro",
  detailCoverUrl: "coverUrl",
  tocUrl: "tocUrl",
  canReName: "canReName",
  downloadUrls: "downloadUrls"
};

const tocRuleMapping = {
  preUpdateJs: "preUpdateJs",
  chapterList: "chapterList",
  chapterName: "chapterName",
  chapterUrl: "chapterUrl",
  formatJs: "formatJs",
  isVolume: "isVolume",
  chapterInfo: "updateTime",
  isVip: "isVip",
  isPay: "isPay",
  nextTocUrl: "nextTocUrl"
};

const contentRuleMapping = {
  content: "content",
  chapterTitle: "title",
  nextContentUrl: "nextContentUrl",
  webJs: "webJs",
  sourceRegex: "sourceRegex",
  replaceRegex: "replaceRegex",
  imageStyle: "imageStyle",
  imageDecode: "imageDecode",
  payAction: "payAction"
};

const applyBookSourceToForm = (form, source = {}) => {
  const sourceType = Number(source.bookSourceType);
  form.sourceType = sourceTypeValues[sourceType] || sourceTypeValues[0];
  form.enabled = source.enabled !== false;
  form.enabledExplore = source.enabledExplore !== false;
  form.enabledCookieJar = source.enabledCookieJar === true;
  form._sourceMeta = {
    isNew: false,
    sourceBase: clonePlainObject(source),
    customOrder: toNumber(source.customOrder, 0),
    lastUpdateTime: toNumber(source.lastUpdateTime, 0),
    respondTime: toNumber(source.respondTime, 180000),
    weight: toNumber(source.weight, 0),
    exploreScreen: toEditorText(source.exploreScreen),
    ruleReview: toEditorText(source.ruleReview),
    ruleSearch: parseRuleObject(source.ruleSearch),
    ruleExplore: parseRuleObject(source.ruleExplore),
    ruleBookInfo: parseRuleObject(source.ruleBookInfo),
    ruleToc: parseRuleObject(source.ruleToc),
    ruleContent: parseRuleObject(source.ruleContent)
  };

  form.sourceUrl = toEditorText(source.bookSourceUrl);
  form.sourceName = toEditorText(source.bookSourceName);
  form.sourceGroup = toEditorText(source.bookSourceGroup);
  form.sourceComment = toEditorText(source.bookSourceComment);
  form.loginUrl = toEditorText(source.loginUrl);
  form.loginUi = toEditorText(source.loginUi);
  form.loginCheckJs = toEditorText(source.loginCheckJs);
  form.coverDecodeJs = toEditorText(source.coverDecodeJs);
  form.bookUrlPattern = toEditorText(source.bookUrlPattern);
  form.header = toEditorText(source.header);
  form.variableComment = toEditorText(source.variableComment);
  form.concurrentRate = toEditorText(source.concurrentRate);
  form.jsLib = toEditorText(source.jsLib);
  form.searchUrl = toEditorText(source.searchUrl);
  form.exploreUrl = toEditorText(source.exploreUrl);

  assignRuleFields(form, form._sourceMeta.ruleSearch, searchRuleMapping);

  assignRuleFields(form, form._sourceMeta.ruleExplore, exploreRuleMapping);

  assignRuleFields(form, form._sourceMeta.ruleBookInfo, bookInfoRuleMapping);

  assignRuleFields(form, form._sourceMeta.ruleToc, {
    ...tocRuleMapping,
    chapterInfo: ["updateTime", "chapterInfo"]
  });

  assignRuleFields(form, form._sourceMeta.ruleContent, contentRuleMapping);
};

export const createSourceEditorForm = (sourceName = "", source = null) => {
  const trimmedSourceName = sourceName.trim();
  const form = {
    sourceType: "text",
    enabled: true,
    enabledExplore: true,
    enabledCookieJar: true,
    _sourceMeta: createDefaultSourceMeta()
  };

  sourceEditorTabs.forEach((tab) => {
    tab.fields.forEach((field) => {
      form[field.key] = "";
    });
  });

  if (source && typeof source === "object") {
    applyBookSourceToForm(form, source);
  } else if (trimmedSourceName) {
    form.sourceName = trimmedSourceName;
  }
  return form;
};

const setRequiredTextField = (payload, key, value) => {
  payload[key] = toNullableTrimmedText(value) || "";
};

const setOptionalTextField = (payload, key, value) => {
  const text = value === null || value === undefined ? "" : String(value);
  if (text === "") {
    if (hasOwn(payload, key)) {
      payload[key] = payload[key] === null ? null : "";
    } else {
      delete payload[key];
    }
    return;
  }
  payload[key] = text;
};

const setNewSourceDefaults = payload => {
  if (!hasOwn(payload, "customOrder")) payload.customOrder = 0;
  if (!hasOwn(payload, "lastUpdateTime")) payload.lastUpdateTime = 0;
  if (!hasOwn(payload, "respondTime")) payload.respondTime = 180000;
  if (!hasOwn(payload, "weight")) payload.weight = 0;
};

export const buildBookSourcePayload = (form = {}) => {
  const meta = form._sourceMeta || createDefaultSourceMeta();
  const payload = clonePlainObject(meta.sourceBase);

  setRequiredTextField(payload, "bookSourceUrl", form.sourceUrl);
  setRequiredTextField(payload, "bookSourceName", form.sourceName);
  setOptionalTextField(payload, "bookSourceGroup", form.sourceGroup);
  payload.bookSourceType = sourceTypeIndexes[form.sourceType] ?? 0;
  setOptionalTextField(payload, "bookUrlPattern", form.bookUrlPattern);
  payload.enabled = form.enabled !== false;
  payload.enabledExplore = form.enabledExplore !== false;
  setOptionalTextField(payload, "jsLib", form.jsLib);
  payload.enabledCookieJar = form.enabledCookieJar === true;
  setOptionalTextField(payload, "concurrentRate", form.concurrentRate);
  setOptionalTextField(payload, "header", form.header);
  setOptionalTextField(payload, "loginUrl", form.loginUrl);
  setOptionalTextField(payload, "loginUi", form.loginUi);
  setOptionalTextField(payload, "loginCheckJs", form.loginCheckJs);
  setOptionalTextField(payload, "coverDecodeJs", form.coverDecodeJs);
  setOptionalTextField(payload, "bookSourceComment", form.sourceComment);
  setOptionalTextField(payload, "variableComment", form.variableComment);
  setOptionalTextField(payload, "exploreUrl", form.exploreUrl);
  setOptionalTextField(payload, "searchUrl", form.searchUrl);

  if (meta.isNew) setNewSourceDefaults(payload);

  payload.ruleSearch = buildRule(form, meta.ruleSearch, searchRuleMapping);
  payload.ruleExplore = buildRule(form, meta.ruleExplore, exploreRuleMapping);
  payload.ruleBookInfo = buildRule(form, meta.ruleBookInfo, bookInfoRuleMapping);
  payload.ruleToc = buildRule(form, meta.ruleToc, tocRuleMapping);
  payload.ruleContent = buildRule(form, meta.ruleContent, contentRuleMapping);

  if (meta.isNew && parseRuleValue(meta.ruleReview) !== null) {
    payload.ruleReview = parseRuleValue(meta.ruleReview);
  }

  return payload;
};
