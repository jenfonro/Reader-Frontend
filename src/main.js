import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "./App.vue";
import router from "./router";
import "./assets/fonts/iconfont.css";
import readerPreviewStore from "./readerPreviewStore";
import noCover from "./assets/imgs/noCover.jpeg";
import noImage from "./assets/imgs/noImage.png";

Vue.config.productionTip = false;
Vue.prototype.$store = readerPreviewStore;
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
Vue.mixin({
  computed: {
    api() {
      return this.$store.getters.api;
    },
    isWebApp() {
      return window.navigator.standalone;
    },
    isPWA() {
      return ["fullscreen", "standalone", "minimal-ui"].some(displayMode =>
        window.matchMedia("(display-mode: " + displayMode + ")").matches
      );
    },
    isNightTheme() {
      return this.$store.getters.isNight;
    },
    currentUserName() {
      return this.$store.getters.currentUserName;
    }
  },
  methods: {
    getImagePath(url) {
      if (
        url &&
        (url.startsWith("http://") ||
          url.startsWith("https://") ||
          url.startsWith("//"))
      ) {
        return this.api ? this.api + "/cover?path=" + url : url;
      }
      if (!url) return false;
      return (this.$store.getters.apiRoot || "") + url;
    },
    getCover(coverUrl, normal) {
      coverUrl = this.getImagePath(coverUrl);
      if (coverUrl) {
        return normal
          ? coverUrl
          : {
              src: coverUrl,
              error: noCover
            };
      }
      return noCover;
    },
    getImage(imageUrl, normal) {
      imageUrl = this.getImagePath(imageUrl);
      if (imageUrl) {
        return normal
          ? imageUrl
          : {
              src: imageUrl,
              error: noCover
            };
      }
      return noImage;
    }
  }
});

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
