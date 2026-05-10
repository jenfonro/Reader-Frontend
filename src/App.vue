<template>
  <div id="app">
    <component
      :is="currentView"
      @enter-reader="showReader"
      @close-reader="showHome"
    />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from "vue";

defineOptions({
  name: "App"
});

const getReaderState = () => Boolean(window.history.state?.readerOpen);

const showReaderPage = ref(typeof window !== "undefined" ? getReaderState() : false);
const IndexView = defineAsyncComponent(() => import("./views/Index.vue"));
const ReaderView = defineAsyncComponent(() => import("./views/Reader.vue"));

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

onMounted(() => {
  if (window.history.state == null) {
    window.history.replaceState(
      { readerOpen: showReaderPage.value },
      "",
      window.location.href
    );
  }

  window.addEventListener("popstate", handlePopState);
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
  /* height: calc(100% + var(--status-bar-height, 0px)); */
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
.el-dialog .el-dialog__header {
  padding: 20px 40px 10px 20px;
}
.el-dialog__header .el-dialog__headerbtn {
  margin: 0;
  font-size: 22px;
  line-height: 24px;
}
</style><style lang="stylus">
.popper-component {
  top: 0 !important;
}
.code-editor {
  max-height: calc(var(--vh, 1vh) * 80 - 54px - 60px - 66px);
  overflow-y: auto;
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
  .code-editor {
    max-height: calc(var(--vh, 1vh) * 100 - 54px - 40px - 66px);
  }
}
.night-theme {
  background-color: #222;

  .el-message-box {
    background: #212121;
    border: 1px solid #212121;
    .el-message-box__title {
      color: #888;
    }
    .el-message-box__content {
      color: #777;
    }
  }
  .el-button--default {
    background: #888;
    color: #ddd;
    border: 1px solid #888;
  }
  .el-button:focus, .el-button:hover {
      color: #eee;
      border-color: #bbb;
      background-color: #bbb;
  }
  .el-button--text:focus, .el-button--text:hover {
      color: #66b1ff;
      border-color: transparent;
      background-color: transparent;
  }
  .el-button.is-disabled, .el-button.is-disabled:focus, .el-button.is-disabled:hover {
      color: #666;
  }
  .el-button--primary {
    background: #185798;
    border: 1px solid #185798;
  }
  .el-button--primary:focus, .el-button--primary:hover {
      background: #2b67bb;
      border-color: #2b67bb;
      color: #FFF;
  }
  .el-input-number__increase, .el-input-number__decrease {
      background-color: #909399;
      border-color: #909399;
      color: #fff;
  }
  .el-checkbox__inner {
    background: #bbb;
  }
  .el-input__inner {
    background-color: #444;
    border: 1px solid #444 !important;
    color: #ddd;
  }
  .el-textarea__inner {
    background-color: #444;
    border: 1px solid #444 !important;
    color: #ddd;
  }
  .el-tabs__item {
    color: #ddd;
  }
  .el-tabs__nav-next, .el-tabs__nav-prev {
    color: #aaa;
  }
  .el-tabs__nav-wrap::after {
    background-color: #444;
  }
  .el-select-dropdown {
    background-color: #333;
    border: 1px solid #333 !important;
  }
  .el-select-dropdown__item {
    color: #ddd;
  }
  .el-select-dropdown__item.hover, .el-select-dropdown__item:hover {
    background-color: #444;
  }
  .el-select .el-tag.el-tag--info {
    background-color: #777;
    border-color: #777;
    color: #ddd;
  }
  .el-select-dropdown.is-multiple .el-select-dropdown__item.selected.hover,
  .el-select-dropdown.is-multiple .el-select-dropdown__item.hover {
    background-color: #555;
  }
  .el-select-dropdown.is-multiple .el-select-dropdown__item.selected {
    background-color: #444;
  }
  .el-popper[x-placement^="bottom"] .popper__arrow, .el-popper[x-placement^="bottom"] .popper__arrow::after {
    border-bottom-color: #333 !important;
  }
  .el-popper[x-placement^="top"] .popper__arrow, .el-popper[x-placement^="top"] .popper__arrow::after {
    border-top-color: #333 !important;
  }
  .el-dialog {
    background-color: #222;
  }
  .el-dialog__title {
    color: #bbb;
  }
  .el-pagination .btn-next, .el-pagination .btn-prev {
    background: center center no-repeat #444;
    color: #ddd;
  }
  .el-pager li {
    background: #444;
    color: #ddd;
  }
  .el-pager li.btn-quicknext, .el-pager li.btn-quickprev {
    color: #ddd;
  }
  .el-pager li.active {
    color: #fff;
  }
  .el-pager li:hover {
    color: #888;
  }
  .el-select .el-input .el-input__inner, .el-select .el-input.is-focus .el-input__inner {
    color: #ddd;
  }
  .el-switch__core {
    background: #555;
  }
  .el-switch.is-checked .el-switch__core {
    border-color: #409EFF;
    background-color: #409EFF;
  }
  .el-radio-button__inner {
    background-color: #444;
    color: #ddd;
    border-color: #444;
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    background-color: #888;
    border-color: #888;
    color: #ddd;
    box-shadow: -1px 0 0 0 #888;
  }
  .el-radio-button:last-child .el-radio-button__inner {
    border-left: 1px solid #666;
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner:last-child {
    border-left-color: #888;
  }
}
</style>
