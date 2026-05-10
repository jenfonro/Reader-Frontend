<template>
  <div id="app">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <BookInfo v-model="showBookInfoDialog" />
    <SearchBookContent
      v-model="showSearchBookContentDialog"
      :book="searchBook"
    />
    <Bookmark v-model="showBookmarkDialog" :book="bookmarkInBook" />
    <BookmarkForm
      v-model="showBookmarkForm"
      :bookmark="bookmark"
      :isAdd="isAddBookmark"
    />
  </div>
</template>

<script>
import { isMiniInterface } from "./plugins/helper";
import eventBus from "./plugins/eventBus";
import BookInfo from "./components/BookInfo.vue";
import SearchBookContent from "./components/SearchBookContent.vue";
import Bookmark from "./components/Bookmark.vue";
import BookmarkForm from "./components/BookmarkForm.vue";

export default {
  components: {
    BookInfo,
    SearchBookContent,
    Bookmark,
    BookmarkForm
  },
  data() {
    return {
      showBookInfoDialog: false,
      showSearchBookContentDialog: false,
      searchBook: {},
      showBookmarkDialog: false,
      bookmarkInBook: {},
      showBookmarkForm: false,
      bookmark: {},
      isAddBookmark: true
    };
  },
  beforeCreate() {
    const syncInterface = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
      this.$store.commit("setMiniInterface", isMiniInterface());
      this.$store.commit("setWindowSize", {
        width: window.innerWidth,
        height: window.innerHeight
      });
      this.$store.commit("setTouchable", "ontouchstart" in document);
    };

    syncInterface();
    window.onresize = syncInterface;
  },
  created() {
    eventBus.$on("showBookInfoDialog", book => {
      this.$store.commit("setShowBookInfo", book || {});
      this.showBookInfoDialog = true;
    });
    eventBus.$on("showSearchBookContentDialog", book => {
      this.searchBook = book || {};
      this.showSearchBookContentDialog = true;
    });
    eventBus.$on("showBookmarkDialog", book => {
      this.bookmarkInBook = book || {};
      this.showBookmarkDialog = true;
    });
    eventBus.$on("showBookmarkForm", (bookmark, isAdd) => {
      this.bookmark = bookmark || {};
      this.isAddBookmark = isAdd;
      this.showBookmarkForm = true;
    });
  },
  methods: {
    isInShelf() {
      return true;
    },
    loadBookShelf() {},
    loadBookmarks() {}
  }
};
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
</style>

<style lang="stylus">
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
    color: #409EFF;
  }
  .code-editor {
    .token.operator,
    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string {
      /* This background color was intended by the author of this theme. */
      background: inherit;
    }
  }

  .el-table {
    background-color: transparent;
  }
  .el-table__expanded-cell {
    background-color: transparent;
  }
  .el-table th, .el-table tr{
    background-color: #222 !important;
  }
  .el-table td {
    border-bottom: 1px solid #555;
  }
  .el-table th.is-leaf {
    border-bottom: 1px solid #555;
  }
  .el-table td.el-table__cell, .el-table th.el-table__cell.is-leaf {
    border-bottom: 1px solid #555;
  }
  .el-dropdown-menu {
    background-color: #444 !important;
    border-color: #444;
  }
  .el-dropdown-menu__item:focus, .el-dropdown-menu__item:not(.is-disabled):hover {
    background-color: #666 !important;
    border-color: #666;
  }
  .el-dropdown-menu__item {
    color: #bbb;
  }
  .el-table--border::after {
    background-color: transparent;
  }
  .el-table--group::after {
    background-color: transparent;
  }
  .el-table::before {
    background-color: transparent;
  }
  .el-table {
    color: #888;
    background-color: transparent;
  }
  .el-table--enable-row-hover .el-table__body tr:hover>td {
    background-color: #333;
  }
  .el-table__fixed-right::before, .el-table__fixed::before {
    background-color: #333;
  }
  .el-table__body tr.hover-row.current-row>td,
  .el-table__body tr.hover-row.el-table__row--striped.current-row>td,
  .el-table__body tr.hover-row.el-table__row--striped>td,
  .el-table__body tr.hover-row>td {
    background-color: #444;
  }
  .el-table__body tr.hover-row.current-row>td.el-table__cell,
  .el-table__body tr.hover-row.el-table__row--striped.current-row>td.el-table__cell,
  .el-table__body tr.hover-row.el-table__row--striped>td.el-table__cell,
  .el-table__body tr.hover-row>td.el-table__cell {
    background-color: #444;
    color: #ccc;
  }
  .el-table--enable-row-hover .el-table__body tr:hover>td.el-table__cell {
    background-color: #444;
    color: #ccc;
  }
  .el-table__body-wrapper::-webkit-scrollbar {
    background-color: #333 !important;
  }

  .el-dialog__wrapper::-webkit-scrollbar {
    background-color: #333 !important;
  }

  .check-tip {
    color: #bbb;
  }
}
.el-popover:focus, .el-popover:focus:active, .el-popover__reference:focus:hover, .el-popover__reference:focus:not(.focusing) {
  outline: none;
}
.el-message-box {
  max-width: 85vw;
}
.el-dialog__header {
  position: relative;
}
.el-dialog.is-fullscreen {
  padding-top: 0;
  padding-top: constant(safe-area-inset-top) !important;
  padding-top: env(safe-area-inset-top) !important;
}
.popper-component.el-popover {
  border: none;
  box-shadow: none;
}
.kindle-page {
  -webkit-tap-highlight-color: rbga(255, 255, 255, 0);
  -webkit-user-select: none;
}
.check-tip {
  display: inline-block;
  float: left;
  line-height: 40px;
  margin-left: 10px;
  font-size: 14px;
}
.float-left {
  float: left;
}
.float-right {
  float: right;
}
.custom-dialog-title {
  .span-btn {
    display: inline-block;
    cursor: pointer;
    font-size: 15px;
    margin-right: 10px;
  }
}
</style>
