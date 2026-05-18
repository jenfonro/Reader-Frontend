export const HOME_TAB_HOME = "home";
export const HOME_TAB_BOOKSHELF = "bookshelf";
export const HOME_TAB_HISTORY = "history";
export const HOME_TAB_SETTINGS = "settings";

export const normalizeBookshelfTab = tab =>
  tab === HOME_TAB_HISTORY ? HOME_TAB_HISTORY : HOME_TAB_BOOKSHELF;

export const isBookshelfTab = tab =>
  tab === HOME_TAB_BOOKSHELF || tab === HOME_TAB_HISTORY;
