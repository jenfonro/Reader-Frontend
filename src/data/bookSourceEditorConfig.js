export const sourceTypeOptions = [
  { label: "文本", value: "text" },
  { label: "音频", value: "audio" },
  { label: "图片", value: "image" },
  { label: "文件", value: "file" }
];

export const sourceEditorTabs = [
  {
    key: "basic",
    label: "基本",
    fields: [
      { key: "sourceUrl", label: "源 URL" },
      { key: "sourceName", label: "源名称" },
      { key: "sourceGroup", label: "源分组" },
      {
        key: "sourceComment",
        label: "源注释",
        rows: 4,
      },
      { key: "loginUrl", label: "登录 URL" },
      { key: "loginUi", label: "登录 UI" },
      { key: "loginCheckJs", label: "登录检查 JS" },
      { key: "coverDecodeJs", label: "封面解密" },
      { key: "bookUrlPattern", label: "书籍 URL 正则" },
      {
        key: "header",
        label: "请求头",
        rows: 3,
      },
      { key: "variableComment", label: "变量说明", rows: 3 },
      { key: "concurrentRate", label: "并发率" },
      { key: "jsLib", label: "jsLib", rows: 3 }
    ]
  },
  {
    key: "search",
    label: "搜索",
    fields: [
      {
        key: "searchUrl",
        ruleKey: "url",
        label: "搜索地址",
        rows: 4,
      },
      { key: "checkKeyWord", label: "校验关键字" },
      {
        key: "bookList",
        label: "书籍列表规则",
        rows: 8,
      },
      { key: "name", label: "书名规则" },
      { key: "author", label: "作者规则" },
      { key: "kind", label: "分类规则" },
      { key: "wordCount", label: "字数规则" },
      { key: "lastChapter", label: "最新章节规则" },
      { key: "intro", label: "简介规则" },
      { key: "coverUrl", label: "封面规则" },
      {
        key: "bookUrl",
        label: "详情页 URL 规则",
      }
    ]
  },
  {
    key: "explore",
    label: "发现",
    fields: [
      {
        key: "exploreUrl",
        ruleKey: "url",
        label: "发现地址规则",
        rows: 12,
      },
      { key: "exploreBookList", ruleKey: "bookList", label: "书籍列表规则" },
      { key: "exploreName", ruleKey: "name", label: "书名规则" },
      { key: "exploreAuthor", ruleKey: "author", label: "作者规则" },
      { key: "exploreKind", ruleKey: "kind", label: "分类规则" },
      { key: "exploreWordCount", ruleKey: "wordCount", label: "字数规则" },
      { key: "exploreLastChapter", ruleKey: "lastChapter", label: "最新章节规则" },
      { key: "exploreIntro", ruleKey: "intro", label: "简介规则" },
      { key: "exploreCoverUrl", ruleKey: "coverUrl", label: "封面规则" },
      {
        key: "exploreBookUrl",
        ruleKey: "bookUrl",
        label: "详情页 URL 规则",
      }
    ]
  },
  {
    key: "detail",
    label: "详情",
    fields: [
      { key: "bookInfoInit", label: "预处理规则", rows: 3 },
      { key: "detailName", ruleKey: "name", label: "书名规则" },
      { key: "detailAuthor", ruleKey: "author", label: "作者规则" },
      {
        key: "detailKind",
        ruleKey: "kind",
        label: "分类规则",
        rows: 3,
      },
      { key: "detailWordCount", ruleKey: "wordCount", label: "字数规则" },
      { key: "detailLastChapter", ruleKey: "lastChapter", label: "最新章节规则" },
      { key: "detailIntro", ruleKey: "intro", label: "简介规则" },
      { key: "detailCoverUrl", ruleKey: "coverUrl", label: "封面规则" },
      { key: "tocUrl", label: "目录 URL 规则" },
      { key: "canReName", label: "允许修改书名作者" },
      { key: "downloadUrls", label: "下载 URL 规则" }
    ]
  },
  {
    key: "toc",
    label: "目录",
    fields: [
      { key: "preUpdateJs", label: "更新之前 JS", rows: 3 },
      { key: "chapterList", label: "目录列表规则" },
      { key: "chapterName", label: "章节名称规则" },
      {
        key: "chapterUrl",
        label: "章节 URL 规则",
        rows: 4,
      },
      { key: "formatJs", label: "格式化规则", rows: 3 },
      { key: "isVolume", label: "Volume 标识" },
      { key: "chapterInfo", ruleKey: "updateTime", label: "更新时间规则" },
      { key: "isVip", label: "VIP 标识" },
      { key: "isPay", label: "购买标识" },
      { key: "nextTocUrl", label: "目录下一页规则" }
    ]
  },
  {
    key: "content",
    label: "正文",
    fields: [
      { key: "content", label: "正文规则" },
      { key: "chapterTitle", ruleKey: "title", label: "章节名称规则" },
      { key: "nextContentUrl", label: "正文下一页 URL 规则" },
      { key: "webJs", label: "WebView JS", rows: 3 },
      { key: "sourceRegex", label: "资源正则", rows: 3 },
      { key: "replaceRegex", label: "替换规则", rows: 3 },
      { key: "imageStyle", label: "图片样式", rows: 3 },
      { key: "imageDecode", label: "图片解密", rows: 3 },
      { key: "payAction", label: "购买操作", rows: 3 }
    ]
  }
];

const sourceFieldDisplayLabels = {
  sourceUrl: "源 URL（sourceUrl）",
  sourceName: "源名称（sourceName）",
  sourceGroup: "源分组（sourceGroup）",
  sourceComment: "源注释（sourceComment）",
  loginUrl: "登录 URL(loginUrl)",
  loginUi: "登录 UI（loginUi）",
  loginCheckJs: "登录检查 JS（loginCheckJs）",
  coverDecodeJs: "封面解密（coverDecodeJs）",
  bookUrlPattern: "书籍 URL 正则（bookUrlPattern）",
  header: "请求头（header）",
  variableComment: "变量说明(variableComment)",
  concurrentRate: "并发率（concurrentRate）",
  jsLib: "jsLib",
  searchUrl: "搜索地址（url）",
  checkKeyWord: "校验关键字（checkKeyWord）",
  bookList: "书籍列表规则（bookList）",
  name: "书名规则（name）",
  author: "作者规则（author）",
  kind: "分类规则（kind）",
  wordCount: "字数规则（wordCount）",
  lastChapter: "最新章节规则（lastChapter）",
  intro: "简介规则（intro）",
  coverUrl: "封面规则（coverUrl）",
  bookUrl: "详情页 URL 规则（bookUrl）",
  exploreUrl: "发现地址规则（url）",
  exploreBookList: "书籍列表规则（bookList）",
  exploreName: "书名规则（name）",
  exploreAuthor: "作者规则（author）",
  exploreKind: "分类规则（kind）",
  exploreWordCount: "字数规则（wordCount）",
  exploreLastChapter: "最新章节规则（lastChapter）",
  exploreIntro: "简介规则（intro）",
  exploreCoverUrl: "封面规则（coverUrl）",
  exploreBookUrl: "详情页 URL 规则（bookUrl）",
  bookInfoInit: "预处理规则（bookInfoInit）",
  detailName: "书名规则（name）",
  detailAuthor: "作者规则（author）",
  detailKind: "分类规则（kind）",
  detailWordCount: "字数规则（wordCount）",
  detailLastChapter: "最新章节规则（lastChapter）",
  detailIntro: "简介规则（intro）",
  detailCoverUrl: "封面规则（coverUrl）",
  tocUrl: "目录 URL 规则（tocUrl）",
  canReName: "允许修改书名作者（canReName）",
  downloadUrls: "下载URL规则(downloadUrls)",
  preUpdateJs: "更新之前 JS（preUpdateJs）",
  chapterList: "目录列表规则（chapterList）",
  chapterName: "章节名称规则（ChapterName）",
  chapterUrl: "章节 URL 规则（chapterUrl）",
  formatJs: "格式化规则(formatJs)",
  isVolume: "Volume 标识（isVolume）",
  chapterInfo: "更新时间（ChapterInfo）",
  isVip: "VIP 标识（isVip）",
  isPay: "购买标识（isPay）",
  nextTocUrl: "目录下一页规则（nextTocUrl）",
  content: "正文规则（content）",
  chapterTitle: "章节名称规则（ChapterName）",
  nextContentUrl: "正文下一页 URL 规则（nextContentUrl）",
  webJs: "WebView JS（webJs）",
  sourceRegex: "资源正则（sourceRegex）",
  replaceRegex: "替换规则（replaceRegex）",
  imageStyle: "图片样式（imageStyle）",
  imageDecode: "图片解密（imageDecode）",
  payAction: "购买操作（payAction）"
};

sourceEditorTabs.forEach((tab) => {
  tab.fields.forEach((field) => {
    field.displayLabel = sourceFieldDisplayLabels[field.key] || field.label;
  });
});
