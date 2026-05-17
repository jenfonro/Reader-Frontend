import { toText } from "./legadoCommon.js";

const UNKNOWN_AUTHOR_PATTERN = /^(未知|佚名|无|匿名|null|undefined)$/i;

const normalizeText = value =>
  toText(value)
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000·•《》<>〈〉「」『』【】\[\]（）()_\-—–:：,，.。!！?？]+/g, "");

export const normalizeBookIdentityName = value =>
  normalizeText(value).replace(/(?:最新章节|全文阅读|免费阅读|无弹窗|章节目录)$/g, "");

export const normalizeBookIdentityAuthor = value => {
  const author = normalizeText(toText(value).replace(/^作者[:：\s]*/, "").replace(/[著作]$/g, ""));
  return UNKNOWN_AUTHOR_PATTERN.test(author) ? "" : author;
};

export const getBookIdentityName = book =>
  normalizeBookIdentityName(book?.name || book?.title || book?.bookName || "");

export const getBookIdentityAuthor = book =>
  normalizeBookIdentityAuthor(book?.author || "");

export const hasSameBookName = (book, targetBook) => {
  const bookName = getBookIdentityName(book);
  const targetName = getBookIdentityName(targetBook);
  return Boolean(bookName && targetName && bookName === targetName);
};

export const hasSameBookAuthor = (book, targetBook) => {
  const bookAuthor = getBookIdentityAuthor(book);
  const targetAuthor = getBookIdentityAuthor(targetBook);
  return Boolean(bookAuthor && targetAuthor && bookAuthor === targetAuthor);
};

export const isSameBookIdentity = (book, targetBook) =>
  hasSameBookName(book, targetBook) && hasSameBookAuthor(book, targetBook);

export const needsAuthorIdentityEnrichment = (book, targetBook) =>
  hasSameBookName(book, targetBook) &&
  Boolean(getBookIdentityAuthor(targetBook)) &&
  !getBookIdentityAuthor(book);
