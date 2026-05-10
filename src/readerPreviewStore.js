import Vue from "vue";
import body0 from "./assets/imgs/themes/body_0.png";
import content0 from "./assets/imgs/themes/content_0.png";
import popup0 from "./assets/imgs/themes/popup_0.png";

const config = {
  configDefaultType: "白天默认",
  name: "内置白天",
  customConfig: "内置白天",
  theme: 0,
  font: 0,
  chineseFont: "简体",
  fontSize: 18,
  fontWeight: 400,
  fontColor: "#262626",
  bodyColor: "#eadfca",
  contentColor: "#fff",
  popupColor: "#ede7da",
  themeType: "day",
  readMethod: "上下滑动",
  clickMethod: "自动",
  animateMSTime: 300,
  readWidth: 800,
  lineHeight: 1.8,
  paragraphSpace: 0.2,
  autoReadingMethod: "像素滚动",
  autoReadingPixel: 1,
  autoReadingLineTime: 1000,
  pageMode: "自适应",
  selectionAction: "操作弹窗",
  autoTheme: true
};

const currentThemeConfig = {
  body: `url(${body0}) repeat`,
  content: `url(${content0}) repeat`,
  popup: `url(${popup0}) repeat`,
  popupPure: `url(${popup0}) repeat`
};

const catalog = [
  { title: "第一章 预览章节", url: "preview://chapter/1", index: 0 },
  { title: "第二章 预览章节", url: "preview://chapter/2", index: 1 },
  { title: "第三章 预览章节", url: "preview://chapter/3", index: 2 }
];

const readingBook = {
  name: "进入阅读页",
  author: "预览作者",
  bookUrl: "preview://book",
  type: 0,
  catalog,
  index: 0,
  origin: "preview",
  originName: "预览书源",
  latestChapterTitle: "第三章 预览章节",
  intro: "预览阅读器界面使用的占位书籍。"
};

const state = Vue.observable({
  miniInterface: typeof window === "undefined" ? false : window.innerWidth <= 750,
  windowSize: {
    width: typeof window === "undefined" ? 1024 : window.innerWidth,
    height: typeof window === "undefined" ? 768 : window.innerHeight
  },
  config,
  customConfigList: [{ ...config }],
  speechVoiceConfig: {
    voiceName: "",
    speechRate: 1,
    speechPitch: 1
  },
  readingBook,
  shelfBooks: [
    {
      ...readingBook,
      durChapterIndex: 0,
      durChapterTitle: catalog[0].title,
      durChapterTime: Date.now(),
      totalChapterNum: catalog.length
    }
  ],
  bookSourceGroupList: [
    { name: "全部分组", value: "", count: 1 },
    { name: "预览分组", value: "预览分组", count: 1 }
  ],
  bookSourceList: [
    {
      bookSourceGroup: "预览分组",
      bookSourceName: "预览书源",
      bookSourceType: 0,
      bookSourceUrl: "preview",
      exploreUrl: ""
    }
  ],
  bookGroupList: [
    { groupId: -4, groupName: "未分组", order: -7, show: true }
  ],
  bookmarks: [],
  showBookInfo: { ...readingBook },
  txtTocRules: [],
  userInfo: { username: "default" },
  token: "",
  searchConfig: {
    searchType: "multi",
    bookSourceGroup: "",
    bookSourceUrl: "",
    concurrentCount: 24
  },
  loginAuth: null,
  filterRules: [],
  showContent: true,
  autoPlay: false,
  touchable: typeof document === "undefined" ? false : "ontouchstart" in document
});

const getters = {
  readingBook,
  shelfBooks: state.shelfBooks,
  bookSourceGroupList: state.bookSourceGroupList,
  config,
  isNight: false,
  isSystemNight: false,
  isSlideRead: false,
  currentThemeConfig,
  currentChapter: null,
  apiRoot: "",
  currentFontFamily: {},
  currentCustomFontFamily: null,
  api: "",
  dialogWidth:
    typeof window === "undefined"
      ? "750px"
      : Math.min(Math.max(window.innerWidth * 0.7, 750), 1000) + "px",
  dialogSmallWidth: typeof window === "undefined" || window.innerWidth > 750 ? "500px" : "85%",
  dialogTop:
    typeof window === "undefined"
      ? "10vh"
      : (window.innerHeight - Math.min(0.7 * window.innerHeight - 184, 400) - 184) / 2 + "px",
  dialogContentHeight:
    typeof window === "undefined"
      ? 400
      : window.innerWidth <= 750
      ? window.innerHeight - 184
      : Math.min(0.7 * window.innerHeight - 184, 400),
  isNormalPage: true,
  currentUserName: "default"
};

Object.defineProperties(getters, {
  readingBook: {
    get: () => readingBook
  },
  shelfBooks: {
    get: () => state.shelfBooks
  },
  bookSourceGroupList: {
    get: () => state.bookSourceGroupList
  },
  config: {
    get: () => state.config
  },
  isNight: {
    get: () => state.config.themeType === "night"
  },
  isSystemNight: {
    get: () => state.config.theme === 6
  },
  isSlideRead: {
    get: () => state.miniInterface && state.config.readMethod === "左右滑动"
  },
  currentChapter: {
    get: () =>
      readingBook && readingBook.catalog
        ? readingBook.catalog[readingBook.index] || {}
        : {}
  },
  collapseMenu: {
    get: () => state.miniInterface
  },
  dialogWidth: {
    get: () =>
      state.miniInterface
        ? "85%"
        : Math.min(Math.max(state.windowSize.width * 0.7, 750), 1000) + "px"
  },
  dialogSmallWidth: {
    get: () => (state.miniInterface ? "85%" : "500px")
  },
  dialogTop: {
    get: () =>
      (state.windowSize.height - getters.dialogContentHeight - 70 - 54 - 60) /
        2 +
      "px"
  },
  dialogContentHeight: {
    get: () =>
      state.miniInterface
        ? state.windowSize.height - 54 - 60 - 70
        : Math.min(0.7 * state.windowSize.height - 70 - 54 - 60, 400)
  },
  popupWidth: {
    get: () => (state.miniInterface ? state.windowSize.width : "600")
  },
  currentUserName: {
    get: () => (state.userInfo || {}).username || "default"
  },
  isNormalPage: {
    get: () => true
  }
});

const mutations = {
  setSpeechVoiceConfig(payload) {
    state.speechVoiceConfig = payload;
  },
  setConfig(payload) {
    Object.assign(state.config, payload);
    Object.assign(getters.config, payload);
  },
  setMiniInterface(payload) {
    state.miniInterface = payload;
  },
  setWindowSize(payload) {
    state.windowSize = payload;
  },
  setTouchable(payload) {
    state.touchable = payload;
  },
  setCustomConfigList(payload) {
    state.customConfigList = payload;
  },
  setShelfBooks(payload) {
    state.shelfBooks = payload;
    getters.shelfBooks = payload;
  },
  updateShelfBook(payload) {
    const index = state.shelfBooks.findIndex(book => book.bookUrl === payload.bookUrl);
    if (index >= 0) {
      state.shelfBooks.splice(index, 1, payload);
    }
  },
  setReadingBook(payload) {
    Object.assign(readingBook, payload);
  },
  setAutoPlay(payload) {
    state.autoPlay = payload;
  },
  setPreviewImageIndex() {},
  setPreviewImgList() {},
  setShowBookInfo(payload) {
    state.showBookInfo = payload;
  },
  setBookmarks(payload) {
    state.bookmarks = payload;
  }
};

const store = {
  state,
  getters,
  commit(type, payload) {
    if (mutations[type]) {
      mutations[type](payload);
    }
  },
  dispatch() {}
};

export default store;
