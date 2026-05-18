import body0 from "./assets/imgs/themes/body_0.png";
import content0 from "./assets/imgs/themes/content_0.png";
import popup0 from "./assets/imgs/themes/popup_0.png";
import body1 from "./assets/imgs/themes/body_1.png";
import content1 from "./assets/imgs/themes/content_1.png";
import popup1 from "./assets/imgs/themes/popup_1.png";
import body2 from "./assets/imgs/themes/body_2.png";
import content2 from "./assets/imgs/themes/content_2.png";
import popup2 from "./assets/imgs/themes/popup_2.png";
import body3 from "./assets/imgs/themes/body_3.png";
import content3 from "./assets/imgs/themes/content_3.png";
import popup3 from "./assets/imgs/themes/popup_3.png";
import body5 from "./assets/imgs/themes/body_5.png";
import content5 from "./assets/imgs/themes/content_5.png";
import popup5 from "./assets/imgs/themes/popup_5.png";
import body6 from "./assets/imgs/themes/body_6.png";
import content6 from "./assets/imgs/themes/content_6.png";

const createImageTheme = (body, content, popup) => ({
  body: `url(${body}) repeat`,
  content: `url(${content}) repeat`,
  popup: `url(${popup}) repeat`,
  popupPure: `url(${popup}) repeat`
});

const readerThemeMap = new Map([
  [
    0,
    {
      value: 0,
      name: "当前主题",
      preview: "rgba(245, 234, 204, 0.8)",
      themeType: "day",
      fontColor: "#262626",
      theme: createImageTheme(body0, content0, popup0)
    }
  ],
  [
    1,
    {
      value: 1,
      name: "米白",
      preview: "rgba(250, 245, 235, 0.8)",
      themeType: "day",
      fontColor: "#262626",
      theme: createImageTheme(body1, content1, popup1)
    }
  ],
  [
    2,
    {
      value: 2,
      name: "浅绿",
      preview: "rgba(230, 242, 230, 0.8)",
      themeType: "day",
      fontColor: "#263326",
      theme: createImageTheme(body2, content2, popup2)
    }
  ],
  [
    3,
    {
      value: 3,
      name: "浅蓝",
      preview: "rgba(228, 241, 245, 0.8)",
      themeType: "day",
      fontColor: "#263238",
      theme: createImageTheme(body3, content3, popup3)
    }
  ],
  [
    4,
    {
      value: 4,
      name: "浅粉",
      preview: "rgba(245, 228, 228, 0.8)",
      themeType: "day",
      fontColor: "#322626",
      theme: {
        body: "#ebcece repeat",
        content: "#f5e4e4 repeat",
        popup: "#faeceb repeat",
        popupPure: "#faeceb repeat"
      }
    }
  ],
  [
    5,
    {
      value: 5,
      name: "浅灰",
      preview: "rgba(224, 224, 224, 0.8)",
      themeType: "day",
      fontColor: "#262626",
      theme: createImageTheme(body5, content5, popup5)
    }
  ],
  [
    6,
    {
      value: 6,
      name: "夜间",
      preview: "rgba(0, 0, 0, 0.5)",
      themeType: "night",
      fontColor: "#666666",
      theme: {
        body: `url(${body6}) repeat`,
        content: `url(${content6}) repeat`,
        popup: "#121212",
        popupPure: "#121212"
      }
    }
  ],
  [
    7,
    {
      value: 7,
      name: "纯白",
      preview: "rgba(255, 255, 255, 0.8)",
      themeType: "day",
      fontColor: "#262626",
      theme: {
        body: "#f7f7f7 repeat",
        content: "#fff repeat",
        popup: "#f7f7f7 repeat",
        popupPure: "#f7f7f7 repeat"
      }
    }
  ]
]);

export const readerThemeOptions = [
  readerThemeMap.get(1),
  readerThemeMap.get(0),
  readerThemeMap.get(2),
  readerThemeMap.get(3),
  readerThemeMap.get(4),
  readerThemeMap.get(5),
  readerThemeMap.get(6),
  readerThemeMap.get(7)
];

export const getReaderThemeOption = theme =>
  readerThemeMap.get(theme) || readerThemeMap.get(0);

export const getReaderTheme = theme => getReaderThemeOption(theme).theme;

