import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import "./assets/fonts/iconfont.css";
import noCover from "./assets/imgs/noCover.jpeg";
import noImage from "./assets/imgs/noImage.png";

const app = createApp(App);

app.use(ElementPlus);

app.directive("lazy", {
  mounted(el, binding) {
    const value = binding.value;
    el.src = typeof value === "object" ? value.src || value.error : value;
  },
  updated(el, binding) {
    const value = binding.value;
    el.src = typeof value === "object" ? value.src || value.error : value;
  }
});

app.directive("lazy-container", {});

app.config.globalProperties.getCover = function getCover(coverUrl, normal) {
  if (coverUrl) {
    return normal
      ? coverUrl
      : {
          src: coverUrl,
          error: noCover
        };
  }
  return noCover;
};

app.config.globalProperties.getImage = function getImage(imageUrl, normal) {
  if (imageUrl) {
    return normal
      ? imageUrl
      : {
          src: imageUrl,
          error: noImage
        };
  }
  return noImage;
};

app.use(router);
app.mount("#app");
