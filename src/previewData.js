import body0 from "./assets/imgs/themes/body_0.png";
import content0 from "./assets/imgs/themes/content_0.png";
import popup0 from "./assets/imgs/themes/popup_0.png";

export const previewTheme = {
  body: `url(${body0}) repeat`,
  content: `url(${content0}) repeat`,
  popup: `url(${popup0}) repeat`,
  popupPure: `url(${popup0}) repeat`
};

export const previewConfig = {
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
  pageType: "正常",
  selectionAction: "操作弹窗",
  autoTheme: true,
  contentBGImg: "",
  customBGImgList: [],
  customFontsMap: {}
};

export const previewCatalog = [
  { title: "第一章 预览章节", url: "preview://chapter/1", index: 0 },
  { title: "第二章 预览章节", url: "preview://chapter/2", index: 1 },
  { title: "第三章 预览章节", url: "preview://chapter/3", index: 2 }
];

export const previewBook = {
  name: "进入阅读页",
  author: "预览作者",
  bookUrl: "preview://book",
  type: 0,
  tags: ["预览", "玄幻", "连载中"],
  catalog: previewCatalog,
  index: 0,
  origin: "preview",
  originName: "预览书源",
  latestChapterTitle: "第三章 预览章节",
  intro: "这是阅读器内部打开的简介内容预览。后续接入真实详情数据后，会直接使用书籍名称、作者、标签、最新章节与简介文本进行展示。"
};

export const previewShelfBooks = [
  {
    ...previewBook,
    durChapterIndex: 0,
    durChapterTitle: previewCatalog[0].title,
    durChapterTime: Date.now(),
    totalChapterNum: previewCatalog.length
  }
];

export const previewBookSourceGroups = [
  { name: "全部分组", value: "", count: 1 },
  { name: "预览分组", value: "预览分组", count: 1 }
];

export const previewBookSources = [
  {
    ...previewBook,
    originName: "预览书源",
    latestChapterTitle: "第三章 预览章节",
    time: 32
  }
];

export const previewCustomConfigs = [{ ...previewConfig }];

