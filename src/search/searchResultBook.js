export const createReaderBookFromSearchResult = result => {
  const sourceBook = Array.isArray(result?.sources) && result.sources.length
    ? result.sources[0]
    : (result || {});

  return {
    ...sourceBook,
    name: result?.name || sourceBook?.name || "",
    author: result?.author || sourceBook?.author || "",
    intro: result?.intro || sourceBook?.intro || "",
    latestChapterTitle: result?.latestChapter || sourceBook?.latestChapterTitle || "",
    coverUrl: result?.coverUrl || sourceBook?.coverUrl || "",
    tags: result?.tags || sourceBook?.tags || [],
    sourceCount: result?.sourceCount || 1,
    sources: result?.sources || (sourceBook ? [sourceBook] : [])
  };
};
