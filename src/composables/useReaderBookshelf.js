import { computed, ref } from "vue";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
import {
  addShelfBook,
  getHistoryBook,
  isBookInShelf,
  removeShelfBook,
  subscribeBookshelf
} from "../data/bookshelf";

export const useReaderBookshelf = ({ bookIntroVisible, readingBook }) => {
  const bookshelfVersion = ref(0);

  const refreshBookshelfState = () => {
    bookshelfVersion.value += 1;
  };

  const isReadingBookInShelf = computed(() => {
    bookshelfVersion.value;
    return isBookInShelf(readingBook.value);
  });

  const bookshelfActionText = computed(() =>
    isReadingBookInShelf.value ? "移出书架" : "加入书架"
  );

  const closeIntroPanelAfterBookshelfAction = () => {
    if (bookIntroVisible.value) bookIntroVisible.value = false;
  };

  const toggleReadingBookshelf = () => {
    if (isReadingBookInShelf.value) {
      removeShelfBook(readingBook.value);
      refreshBookshelfState();
      closeIntroPanelAfterBookshelfAction();
      ElMessage.success("已移出书架");
      return;
    }

    const savedBooks = addShelfBook(readingBook.value);
    refreshBookshelfState();
    closeIntroPanelAfterBookshelfAction();
    if (savedBooks.length) ElMessage.success("已加入书架");
    else ElMessage.error("加入书架失败");
  };

  const getBookWithHistory = book => {
    const historyBook = getHistoryBook(book);
    return historyBook ? { ...book, ...historyBook } : book;
  };

  const cleanupReaderBookshelf = subscribeBookshelf(refreshBookshelfState);

  return {
    bookshelfActionText,
    cleanupReaderBookshelf,
    getBookWithHistory,
    isReadingBookInShelf,
    refreshBookshelfState,
    toggleReadingBookshelf
  };
};
