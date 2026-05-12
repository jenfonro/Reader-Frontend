export const getReaderBookTitle = book => book?.name || book?.title || "未知书籍";

export const getReaderBookAuthor = book => book?.author || "未知作者";

export const getReaderBookIntro = book => book?.intro || "暂无简介";

export const getReaderBookLatestChapter = book =>
  book?.latestChapterTitle || book?.latestChapter || book?.lastChapter || "";

export const getReaderBookTags = book => {
  if (Array.isArray(book?.tags)) return book.tags.filter(Boolean);
  const type = book?.kind || book?.category || book?.typeName;
  return type ? [type] : [];
};

export const getReaderBookCoverText = book => getReaderBookTitle(book).slice(0, 4);
