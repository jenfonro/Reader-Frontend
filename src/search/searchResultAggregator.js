const UNKNOWN_AUTHOR_PATTERN = /^(未知|佚名|无|匿名|null|undefined)$/i;

import { toText } from "./legadoCommon.js";

const normalizeText = value =>
  toText(value)
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000·•《》<>〈〉「」『』【】\[\]（）()_\-—–:：,，.。!！?？]+/g, "");

const normalizeBookName = value =>
  normalizeText(value)
    .replace(/(?:最新章节|全文阅读|免费阅读|无弹窗|章节目录)$/g, "");

const normalizeAuthor = value => {
  const author = normalizeText(toText(value).replace(/^作者[:：\s]*/, "").replace(/[著作]$/g, ""));
  return UNKNOWN_AUTHOR_PATTERN.test(author) ? "" : author;
};

const normalizeBookUrl = value => {
  const url = toText(value).trim();
  if (!url) return "";
  try {
    const parsedUrl = new URL(url, typeof window === "undefined" ? "http://localhost" : window.location.href);
    parsedUrl.hash = "";
    return parsedUrl.toString().replace(/\/$/, "");
  } catch (error) {
    return url.replace(/#.*$/, "").replace(/\/$/, "");
  }
};

const buildTags = book =>
  [book.kind, book.wordCount, book.originName]
    .map(value => toText(value).trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 5);

const getOriginKey = book => {
  const origin = toText(book.sourceKey || book.origin || book.bookSourceUrl || book.originName).trim();
  const bookUrl = normalizeBookUrl(book.bookUrl);
  return `${origin}|${bookUrl}`;
};

const getRelevance = (book, keyword) => {
  const searchKey = normalizeBookName(keyword);
  const name = normalizeBookName(book.name);
  const author = normalizeAuthor(book.author);
  if (!searchKey) return { bucket: 2, score: 0 };
  if (name === searchKey) return { bucket: 0, score: 1000 };
  if (author === searchKey) return { bucket: 0, score: 920 };
  if (name.startsWith(searchKey)) return { bucket: 1, score: 820 };
  if (name.includes(searchKey)) return { bucket: 1, score: 760 };
  if (author.startsWith(searchKey)) return { bucket: 1, score: 560 };
  if (author.includes(searchKey)) return { bucket: 1, score: 500 };
  return { bucket: 2, score: 0 };
};

const createResultKey = (book, sequence) => {
  if (!book.normalizedName) return book.key || `search-result-${sequence}`;
  if (book.normalizedAuthor) return `${book.normalizedName}:${book.normalizedAuthor}`;
  const bookUrl = normalizeBookUrl(book.bookUrl);
  return `${book.normalizedName}:unknown:${bookUrl || sequence}`;
};

const hasSameBookUrl = (left, right) => {
  const leftUrl = normalizeBookUrl(left.bookUrl);
  const rightUrl = normalizeBookUrl(right.bookUrl);
  if (!leftUrl || !rightUrl || leftUrl !== rightUrl) return false;
  const leftOrigin = toText(left.origin).trim();
  const rightOrigin = toText(right.origin).trim();
  return !leftOrigin || !rightOrigin || leftOrigin === rightOrigin;
};

const isSameBook = (left, right) => {
  if (hasSameBookUrl(left, right)) return true;
  if (!left.normalizedName || left.normalizedName !== right.normalizedName) return false;
  if (left.normalizedAuthor && right.normalizedAuthor) {
    return left.normalizedAuthor === right.normalizedAuthor;
  }
  return true;
};

const chooseText = (currentValue, nextValue) => currentValue || nextValue || "";

const chooseLongerText = (currentValue, nextValue) => {
  const currentText = toText(currentValue).trim();
  const nextText = toText(nextValue).trim();
  return nextText.length > currentText.length ? nextText : currentText;
};

const mergeUnique = (left, right, keyBuilder = value => value) => {
  const values = [];
  const keys = new Set();
  [...left, ...right].forEach(value => {
    const key = keyBuilder(value);
    if (!key || keys.has(key)) return;
    keys.add(key);
    values.push(value);
  });
  return values;
};

const normalizeSearchBook = (book, keyword, sequence) => {
  const tags = buildTags(book);
  const normalizedName = normalizeBookName(book.name);
  const normalizedAuthor = normalizeAuthor(book.author);
  const relevance = getRelevance(book, keyword);
  const coverUrl = toText(book.coverUrl).trim();
  const normalizedBook = {
    key: "",
    name: toText(book.name).trim(),
    author: toText(book.author).trim(),
    intro: toText(book.intro).trim(),
    latestChapter: toText(book.latestChapterTitle).trim(),
    tags,
    highlightTag: book.originName || tags[0] || "",
    sourceCount: 1,
    sources: [book],
    origins: [toText(book.sourceKey || book.origin || book.originName).trim()].filter(Boolean),
    coverUrl,
    hasCover: Boolean(coverUrl),
    bookUrl: toText(book.bookUrl).trim(),
    origin: toText(book.origin).trim(),
    originOrder: Number(book.originOrder || 0),
    sourceWeight: Number(book.sourceWeight || 0),
    bucket: relevance.bucket,
    score: relevance.score,
    sequence,
    normalizedName,
    normalizedAuthor
  };
  normalizedBook.key = createResultKey(normalizedBook, sequence);
  return normalizedBook;
};

const mergeSearchResult = (current, next) => {
  const currentOriginCount = current.origins.length;
  current.sources = mergeUnique(current.sources, next.sources, getOriginKey);
  current.origins = mergeUnique(current.origins, next.origins);
  current.sourceCount = current.origins.length || current.sources.length || 1;

  if (!current.author && next.author) current.author = next.author;
  current.intro = chooseLongerText(current.intro, next.intro);
  current.latestChapter = chooseText(current.latestChapter, next.latestChapter);
  if (!current.coverUrl && next.coverUrl) {
    current.coverUrl = next.coverUrl;
    current.hasCover = true;
  }
  current.tags = mergeUnique(current.tags, next.tags).slice(0, 5);
  current.highlightTag = chooseText(current.highlightTag, next.highlightTag);
  current.bucket = Math.min(current.bucket, next.bucket);
  current.score = Math.max(current.score, next.score);
  current.sourceWeight = Math.max(current.sourceWeight, next.sourceWeight);
  current.originOrder = Math.max(current.originOrder, next.originOrder);

  if (currentOriginCount === 0 && current.origins.length > 0) {
    current.sequence = Math.min(current.sequence, next.sequence);
  }
};

const findMatchingResult = (groups, book) => {
  const directMatch = groups.get(book.key);
  if (directMatch) return directMatch;

  const matches = [...groups.values()].filter(item => isSameBook(item, book));
  return matches.length === 1 ? matches[0] : null;
};

const sortSearchResults = values =>
  values.sort((left, right) =>
    left.bucket - right.bucket ||
    right.sourceCount - left.sourceCount ||
    right.score - left.score ||
    right.sourceWeight - left.sourceWeight ||
    right.originOrder - left.originOrder ||
    left.sequence - right.sequence
  );

export const createSearchResultAggregator = keyword => {
  const groups = new Map();
  let sequence = 0;

  const addBooks = books => {
    (Array.isArray(books) ? books : []).forEach(book => {
      const normalizedBook = normalizeSearchBook(book, keyword, sequence++);
      if (!normalizedBook.name || !normalizedBook.normalizedName) return;

      const current = findMatchingResult(groups, normalizedBook);
      if (current) {
        mergeSearchResult(current, normalizedBook);
        return;
      }
      groups.set(normalizedBook.key, normalizedBook);
    });
    return sortSearchResults([...groups.values()]);
  };

  const clear = () => {
    groups.clear();
    sequence = 0;
  };

  return {
    addBooks,
    clear,
    getResults: () => sortSearchResults([...groups.values()])
  };
};
