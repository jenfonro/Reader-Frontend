<template>
  <div id="app">
    <component
      :is="currentView"
      @enter-reader="showReader"
      @close-reader="showHome"
    />
    <StartupOverlay
      v-if="startupVisible"
      :status="startupStatus"
      :progress="startupProgress"
      :leaving="startupLeaving"
    />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from "vue";
import StartupOverlay from "./components/StartupOverlay.vue";
import { runStartupCache } from "./startup/startupCache";

defineOptions({
  name: "App"
});

const getReaderState = () => Boolean(window.history.state?.readerOpen);

const showReaderPage = ref(typeof window !== "undefined" ? getReaderState() : false);
const IndexView = defineAsyncComponent(() => import("./views/Index.vue"));
const ReaderView = defineAsyncComponent(() => import("./views/Reader.vue"));
const startupVisible = ref(true);
const startupLeaving = ref(false);
const startupStatus = ref("正在检测新版本...");
const startupProgress = ref(0);

const currentView = computed(() =>
  showReaderPage.value ? ReaderView : IndexView
);

const showReader = () => {
  if (showReaderPage.value) {
    return;
  }

  showReaderPage.value = true;

  window.history.pushState({ readerOpen: true }, "", window.location.href);
};

const showHome = () => {
  if (!showReaderPage.value) {
    return;
  }

  if (window.history.state?.readerOpen) {
    window.history.back();
    return;
  }

  showReaderPage.value = false;
};

const handlePopState = event => {
  showReaderPage.value = Boolean(event.state?.readerOpen);
};

const finishStartup = () => {
  startupLeaving.value = true;
  window.setTimeout(() => {
    startupVisible.value = false;
  }, 560);
};

const startApplication = async () => {
  await runStartupCache({
    onStatus: status => {
      startupStatus.value = status;
    },
    onProgress: progress => {
      startupProgress.value = progress;
    }
  });
  finishStartup();
};

onMounted(() => {
  if (window.history.state === null) {
    window.history.replaceState(
      { readerOpen: showReaderPage.value },
      "",
      window.location.href
    );
  }

  window.addEventListener("popstate", handlePopState);
  startApplication();
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", handlePopState);
});
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  height: 100%;
  position: relative;
}

@font-face {
  font-family: "reader-st";
  src: local("Songti SC"), local("Noto Serif CJK SC"),
    local("Source Han Serif SC"), local("Source Han Serif CN"), local("STSong"),
    local("宋体"), local("明体"), local("明朝"), local("Songti"),
    local("Songti TC"), /*iOS6+iBooks3*/ local("Song S"), local("Song T"),
    local("STBShusong"), local("TBMincho"), local("HYMyeongJo"),
    /*Kindle Paperwihite*/ local("DK-SONGTI");
}

@font-face {
  font-family: "reader-fs";
  src: local("STFangsong"), local("FangSong"), local("FangSong_GB2312"),
    local("amasis30"), local("仿宋"), local("仿宋_GB2312"), local("Yuanti"),
    local("Yuanti SC"), local("Yuanti TC"),
    /*iOS6+iBooks3*/ local("DK-FANGSONG");
}

@font-face {
  font-family: "reader-kt";
  src: local("Kaiti SC"), local("STKaiti"), local("Caecilia"), local("楷体"),
    local("楷体_GB2312"), local("Kaiti"), local("Kaiti SC"), local("Kaiti TC"),
    /*iOS6+iBooks3*/ local("MKai PRC"), local("MKaiGB18030C-Medium"),
    local("MKaiGB18030C-Bold"), /*Kindle Paperwihite*/ local("DK-KAITI");
}

@font-face {
  font-family: "reader-ht";
  src: local("Noto Sans CJK SC"), local("Source Han Sans SC"),
    local("Source Han Sans CN"), local("Microsoft YaHei"), local("PingFang SC"),
    local("Hiragino Sans GB"), local("黑体"), local("微软雅黑"), local("Heiti"),
    local("Heiti SC"), local("Heiti TC"), /*iOS6+iBooks3*/ local("MYing Hei S"),
    local("MYing Hei T"), local("TBGothic"),
    /*Kindle Paperwihite*/ local("DK-HEITI");
}
*::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
}
*:focus {
  outline: none !important;
}
</style><style lang="stylus">
.popper-component {
  top: 0 !important;
}
.mini-interface {
  .popper-component {
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    box-sizing: border-box;
    margin: 0 !important;
    overflow-x: hidden;
  }
}
</style>
