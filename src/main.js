import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "./App.vue";
import router from "./router";
import "./assets/fonts/iconfont.css";
import noCover from "./assets/imgs/noCover.jpeg";
import noImage from "./assets/imgs/noImage.png";

Vue.config.productionTip = false;
Vue.use(ElementUI);

Vue.directive("lazy", {
  bind(el, binding) {
    const value = binding.value;
    el.src = typeof value === "object" ? value.src || value.error : value;
  },
  update(el, binding) {
    const value = binding.value;
    el.src = typeof value === "object" ? value.src || value.error : value;
  }
});
Vue.directive("lazy-container", {});

Vue.prototype.getCover = function getCover(coverUrl, normal) {
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

Vue.prototype.getImage = function getImage(imageUrl, normal) {
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

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
