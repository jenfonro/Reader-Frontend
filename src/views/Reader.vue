<template>
  <div
    class="chapter-wrapper"
    :style="bodyTheme"
    :class="{
      night: isNight,
      day: !isNight,
      'mini-interface': miniInterface
    }"
    ref="chapterWrapperRef"
  >
    <div class="tool-bar" :style="leftBarTheme">
      <div class="tools">
        <el-popover
          placement="right"
          :width="popperWidth"
          trigger="click"
          :visible-arrow="false"
          v-model="popBookShelfVisible"
          popper-class="popper-component"
        >
          <BookShelf
            ref="popBookShelf"
            class="popup"
            :visible="popBookShelfVisible"
            @changeBook="changeBook"
            @toShelf="toShelf"
          />
          <div class="tool-icon" slot="reference">
            <div class="iconfont">
              &#58892;
            </div>
            <div class="icon-text">书架</div>
          </div>
        </el-popover>
        <el-popover
          placement="right"
          :width="popperWidth"
          trigger="click"
          :visible-arrow="false"
          v-model="popBookSourceVisible"
          popper-class="popper-component"
        >
          <BookSource
            ref="popBookSource"
            class="popup"
            :visible="popBookSourceVisible"
            @changeBookSource="changeBookSource()"
            @close="popBookSourceVisible = false"
          />

          <div class="tool-icon" slot="reference">
            <div class="tool-el-icon">
              <i class="el-icon-menu"></i>
            </div>
            <div class="icon-text">书源</div>
          </div>
        </el-popover>
        <el-popover
          placement="right"
          :width="popperWidth"
          trigger="click"
          :visible-arrow="false"
          v-model="popCataVisible"
          popper-class="popper-component"
        >
          <PopCata
            @getContent="getContent"
            ref="popCata"
            class="popup"
            @refresh="refreshCatalog"
            :visible="popCataVisible"
            @close="popCataVisible = false"
          />

          <div class="tool-icon" slot="reference">
            <div class="iconfont">
              &#58905;
            </div>
            <div class="icon-text">目录</div>
          </div>
        </el-popover>
        <el-popover
          placement="right"
          :width="popperWidth"
          trigger="click"
          :visible-arrow="false"
          v-model="readSettingsVisible"
          popper-class="popper-component"
        >
          <ReadSettings
            class="popup"
            :visible="readSettingsVisible"
            @close="readSettingsVisible = false"
            @showClickZone="showClickZone = true"
            @readMethodChange="beforeReadMethodChange"
          />

          <div class="tool-icon" slot="reference">
            <div class="iconfont">
              &#58971;
            </div>
            <div class="icon-text">设置</div>
          </div>
        </el-popover>
        <div
          class="tool-icon"
          :style="miniInterface ? { order: -1 } : {}"
        >
          <div class="iconfont">
            &#58920;
          </div>
          <div class="icon-text">首页</div>
        </div>
        <div
          class="tool-icon"
          v-if="!miniInterface"
        >
          <div class="iconfont">
            &#58914;
          </div>
          <div class="icon-text">顶部</div>
        </div>
        <div
          class="tool-icon"
          v-if="!miniInterface"
        >
          <div class="iconfont">
            &#58915;
          </div>
          <div class="icon-text">底部</div>
        </div>
      </div>
    </div>
    <div class="read-bar" :style="rightBarTheme">
      <div class="float-btn-zone">
        <div class="float-left-btn-zone">
          <div
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
          >
            <i class="el-icon-collection-tag"></i>
          </div>
          <div
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
          >
            <i class="el-icon-search"></i>
          </div>
          <div
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
          >
            <i class="el-icon-info"></i>
          </div>
          <div
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
            v-if="miniInterface"
          >
            <i class="el-icon-top"></i>
          </div>
          <div
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
            v-if="miniInterface"
          >
            <i class="el-icon-bottom"></i>
          </div>
        </div>
        <div class="float-right-btn-zone">
          <div
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
          >
            <i class="el-icon-refresh-right"></i>
          </div>
          <div
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
            v-if="!isEpub && !isCarToon && !isAudio"
          >
            <i class="el-icon-view"></i>
          </div>
          <div
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
            v-if="speechAvalable && !isEpub && !isCarToon && !isAudio"
          >
            <i class="el-icon-headset"></i>
          </div>
          <div
            class="float-btn"
            :style="popupAbsoluteBtnStyle"
          >
            <i class="el-icon-moon" v-if="!isNight"></i>
            <i class="el-icon-sunny" v-else></i>
          </div>
        </div>
      </div>
      <div class="progress" v-if="miniInterface && !isAudio">
        <div class="progress-bar">
          <el-slider
            v-model="currentPage"
            :min="1"
            :max="totalPages"
            :show-tooltip="false"
            @change="showPage"
            @input="progressValue = $event"
          ></el-slider>
        </div>
        <span class="progress-tip">{{ formatProgressTip() }}</span>
      </div>
      <div class="cache-content-zone" v-if="showCacheContentZone">
        <div>
          缓存章节
        </div>
        <div
          class="cache-content-btn"
          v-show="!isCachingContent"
        >
          后面50章
        </div>
        <div
          class="cache-content-btn"
          v-show="!isCachingContent"
        >
          后面100章
        </div>
        <div
          class="cache-content-btn"
          v-show="!isCachingContent"
        >
          后面全部
        </div>
        <div class="caching-tip" v-show="isCachingContent">
          {{ cachingContentTip }}
        </div>
        <div
          class="caching-cancel-btn"
          v-show="isCachingContent"
        >
          <i class="el-icon-close"></i>
        </div>
      </div>
      <div class="tools">
        <div class="tool-icon progress-text">
          <span v-if="miniInterface">阅读进度: </span>
          {{ readingProgress }}
        </div>
        <div
          class="tool-icon"
          :style="miniInterface ? { order: -1 } : {}"
        >
          <div class="iconfont">
            &#58920;
          </div>
          <span v-if="miniInterface">上一章</span>
        </div>
        <div class="tool-icon">
          <span v-if="miniInterface">下一章</span>
          <div class="iconfont">
            &#58913;
          </div>
        </div>
      </div>
    </div>
    <div class="read-bar" :style="readBarTheme">
      <div class="reader-bar-inner">
        <div class="operate-bar">
          <div class="close-btn">
            <i class="el-icon-close"></i>
          </div>
          <div class="center">
            <span class="ctrl-btn">上一段</span>
            <span class="play-pause-btn">
              <i
                class="el-icon-video-pause"
                :style="popupAbsoluteBtnStyle"
                v-if="speechSpeaking"
              ></i>
              <i
                class="el-icon-video-play"
                :style="popupAbsoluteBtnStyle"
                v-else
              ></i>
            </span>
            <span class="ctrl-btn">下一段</span>
          </div>
          <div
            class="collapse-btn"
          >
            <i class="el-icon-bottom" v-if="showSpeechConfig"></i>
            <i class="el-icon-top" v-else></i>
          </div>
        </div>
        <div class="setting-item" v-if="showSpeechConfig">
          <div class="setting-title">语音库</div>
          <div class="setting-value">
            <div class="voice-list">
              <el-radio-group
                v-model="voiceName"
                size="small"
                class="radio-group"
              >
                <el-radio-button
                  class="radio-button"
                  :label="voice.name"
                  :key="index"
                  v-for="(voice, index) in voiceList"
                ></el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </div>
        <div class="setting-item" v-if="showSpeechConfig">
          <div class="setting-title">语音设置</div>
          <div class="setting-value">
            <div class="progress">
              <span class="progress-tip">语速</span>
              <div class="progress-bar">
                <el-slider
                  v-model="speechRate"
                  :min="0.5"
                  :max="2"
                  :step="0.1"
                  :show-tooltip="false"
                ></el-slider>
              </div>
              <span class="setting-btn">重置</span>
            </div>
            <div class="progress">
              <span class="progress-tip">语调</span>
              <div class="progress-bar">
                <el-slider
                  v-model="speechPitch"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  :show-tooltip="false"
                ></el-slider>
              </div>
              <span class="setting-btn"
                >重置</span
              >
            </div>
            <div class="progress">
              <span class="progress-tip">定时</span>
              <div class="progress-bar">
                <el-slider
                  v-model="speechMinutes"
                  :min="0"
                  :max="180"
                  :step="1"
                  :show-tooltip="false"
                ></el-slider>
              </div>
              <span class="setting-btn">{{ speechMinutes }}分钟</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="chapter"
      ref="content"
      :class="chapterClass"
      :style="chapterTheme"
    >
      <div
        class="click-zone"
        v-if="showClickZone"
        :style="!isSlideRead ? { position: 'fixed' } : {}"
      >
        <div :style="showPrevPageStyle"><span>点击前一页</span></div>
        <div :style="showMenuZoneStyle"><span>点击显示菜单</span></div>
        <div :style="showNextPageStyle"><span>点击后一页</span></div>
        <div class="close-btn" @click="showClickZone = false">关闭</div>
      </div>
      <div class="top-bar" ref="top">
        {{ miniInterface ? title : "" }}
      </div>
      <div
        class="content"
        @click="handlerClick"
      >
        <div class="content-inner" v-if="show">
          <Content
            class="book-content"
            :title="title"
            :content="content"
            :showContent="show"
            :error="error"
            :style="contentStyle"
            :showChapterList="showChapterList"
            :isScrollRead="isScrollRead"
            ref="bookContentRef"
          />
        </div>
      </div>
      <div class="bottom-bar" ref="bottom">
        <span v-if="isSlideRead">{{
          `第${currentPage}/${totalPages}页 ${readingProgress}`
        }}</span>
        <span v-if="isSlideRead">{{ timeStr }}</span>
        <span
          class="bottom-btn"
          v-if="show && !isSlideRead && !error && !isScrollRead"
          >加载下一章</span
        >
      </div>
    </div>
  </div>
</template>

<script>
import PopCata from "../components/PopCatalog.vue";
import ReadSettings from "../components/ReadSettings.vue";
import BookSource from "../components/BookSource.vue";
import BookShelf from "../components/BookShelf.vue";
import Content from "../components/Content.vue";
import {
  getMiniInterface,
  getWindowSize,
  previewBook,
  previewCatalog,
  previewConfig,
  previewShelfBooks,
  previewTheme
} from "../previewData";

export default {
  name: "Reader",
  components: {
    PopCata,
    BookSource,
    BookShelf,
    Content,
    ReadSettings
  },
  data() {
    return {
      title: "第一章 预览章节",
      content:
        "这是阅读器界面预览内容。\n当前阶段只用于验证 reader-server 原版阅读页菜单、按钮和弹出层是否完整复刻。\n后续接入真实章节后会替换为真实内容。",
      error: false,
      popCataVisible: false,
      readSettingsVisible: false,
      popBookSourceVisible: false,
      popBookShelfVisible: false,
      showToolBar: true,
      show: true,
      contentStyle: {},
      currentPage: 1,
      totalPages: 1,
      showClickZone: false,
      timeStr: "",
      progressValue: 1,
      speechAvalable:
        typeof window !== "undefined" &&
        window.speechSynthesis &&
        window.speechSynthesis.getVoices,
      showReadBar: false,
      voiceList: [],
      voiceName: "",
      speechRate: 1,
      speechPitch: 1,
      speechSpeaking: false,
      showSpeechConfig: true,
      showCacheContentZone: false,
      isCachingContent: false,
      cachingContentTip: "",
      autoReading: false,
      showChapterList: [],
      speechMinutes: 0,
      miniInterface: getMiniInterface(),
      windowSize: getWindowSize(),
      config: { ...previewConfig },
      readingBook: { ...previewBook },
      catalog: previewCatalog,
      shelfBooks: previewShelfBooks,
      currentThemeConfig: previewTheme
    };
  },
  computed: {
    chapterIndex() {
      return (this.readingBook.index || 0) | 0;
    },
    isNight() {
      return this.config.themeType === "night";
    },
    bodyTheme() {
      return {
        background: this.currentThemeConfig.body
      };
    },
    isSlideRead() {
      return this.autoReading ||
        this.showReadBar ||
        this.isEpub ||
        this.isCarToon ||
        this.isAudio
        ? false
        : this.miniInterface && this.config.readMethod === "左右滑动";
    },
    isScrollRead() {
      return (
        !this.isEpub &&
        !this.isAudio &&
        !this.isSlideRead &&
        (this.config.readMethod === "上下滚动" ||
          this.config.readMethod === "上下滚动2")
      );
    },
    chapterClass() {
      return this.isSlideRead
        ? "slide-reader"
        : this.isEpub
        ? "epub"
        : this.isCarToon
        ? "cartoon"
        : this.isAudio
        ? "audio"
        : "";
    },
    chapterTheme() {
      const readingStyle = this.showReadBar
        ? { paddingBottom: (this.showSpeechConfig ? 280 : 80) + "px" }
        : {};
      return {
        ...readingStyle,
        background: this.currentThemeConfig.content,
        width: this.readWidth
      };
    },
    leftBarTheme() {
      return {
        background: this.currentThemeConfig.popup,
        marginLeft: this.miniInterface ? 0 : -(this.readWidthConfig / 2 + 68) + "px",
        display: this.miniInterface && !this.showToolBar ? "none" : "block"
      };
    },
    rightBarTheme() {
      return {
        background: this.currentThemeConfig.popupPure,
        marginRight: this.miniInterface ? 0 : -(this.readWidthConfig / 2 + 52) + "px",
        display: this.miniInterface && !this.showToolBar ? "none" : "block"
      };
    },
    readBarTheme() {
      return {
        background: this.currentThemeConfig.popupPure,
        marginRight: this.miniInterface ? 0 : -(this.readWidthConfig / 2) + "px",
        zIndex: 200,
        display: this.speechAvalable && this.showReadBar ? "block" : "none",
        width: this.miniInterface ? "100vw" : "500px"
      };
    },
    readWidth() {
      if (!this.miniInterface) {
        return this.readWidthConfig - 130 + "px";
      }
      return this.windowSize.width + "px";
    },
    readWidthConfig() {
      let width = this.config.readWidth;
      while (width > this.windowSize.width - 140) {
        width -= 20;
      }
      return width;
    },
    popperWidth() {
      if (!this.miniInterface) {
        return this.readWidthConfig - 33;
      }
      return this.windowSize.width - 33;
    },
    readingProgress() {
      if (this.catalog && this.catalog.length) {
        return parseInt(((this.chapterIndex + 1) * 100) / this.catalog.length) + "%";
      }
      return "";
    },
    showPrevPageStyle() {
      if (this.isSlideRead) {
        return {
          left: 0,
          top: 0,
          bottom: 0,
          right: this.windowSize.width / 2 + "px",
          background: "#43987324",
          paddingRight: this.windowSize.width * 0.2 + "px"
        };
      }
      return {
        left: 0,
        top: 0,
        right: 0,
        bottom: this.windowSize.height / 2 + "px",
        background: "#43987324"
      };
    },
    showMenuZoneStyle() {
      return {
        top: this.windowSize.height * 0.3 + "px",
        bottom: this.windowSize.height * 0.3 + "px",
        left: this.windowSize.width * 0.3 + "px",
        right: this.windowSize.width * 0.3 + "px",
        background: "#636060",
        zIndex: 10
      };
    },
    showNextPageStyle() {
      if (this.isSlideRead) {
        return {
          right: 0,
          top: 0,
          bottom: 0,
          left: this.windowSize.width / 2 + "px",
          background: "#6b1a7324",
          paddingLeft: this.windowSize.width * 0.2 + "px"
        };
      }
      return {
        left: 0,
        bottom: 0,
        right: 0,
        top: this.windowSize.height / 2 + "px",
        background: "#6b1a7324"
      };
    },
    popupAbsoluteBtnStyle() {
      return {
        background: this.currentThemeConfig.popupPure
      };
    },
    isCarToon() {
      return false;
    },
    isAudio() {
      return false;
    },
    isEpub() {
      return false;
    }
  },
  mounted() {
    this.formatTime();
    window.addEventListener("resize", this.syncInterface);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.syncInterface);
  },
  methods: {
    syncInterface() {
      this.miniInterface = getMiniInterface();
      this.windowSize = getWindowSize();
    },
    changeBook() {
      this.popBookShelfVisible = false;
    },
    toShelf() {
      this.$router.push("/");
    },
    changeBookSource() {
      this.popBookSourceVisible = false;
    },
    getContent() {
      this.popCataVisible = false;
    },
    refreshCatalog() {
      this.$message.success("目录刷新预览");
    },
    beforeReadMethodChange() {},
    showPage(value) {
      this.currentPage = value || this.progressValue;
    },
    handlerClick(event) {
      this.eventHandler(event);
    },
    eventHandler(point) {
      if (
        this.popBookSourceVisible ||
        this.popBookShelfVisible ||
        this.popCataVisible ||
        this.readSettingsVisible
      ) {
        return;
      }
      const midX = this.windowSize.width / 2;
      const midY = this.windowSize.height / 2;
      if (
        Math.abs(point.clientY - midY) <= this.windowSize.height * 0.2 &&
        Math.abs(point.clientX - midX) <= this.windowSize.width * 0.2
      ) {
        if (!this.showReadBar) {
          this.showToolBar = !this.showToolBar;
        }
      }
    },
    formatProgressTip(value) {
      return `第 ${value || this.progressValue}/${this.totalPages} 页`;
    },
    formatTime() {
      const now = new Date();
      const pad = value => (value >= 10 ? "" + value : "0" + value);
      this.timeStr = pad(now.getHours()) + ":" + pad(now.getMinutes());
    }
  }
};
</script>

<style lang="stylus" scoped>
>>>.popper-component {
  margin-left: 10px;
}

.chapter-wrapper {
  padding: 0;
  flex-direction: column;
  align-items: center;

  >>>.no-point {
    pointer-events: none;
  }

  .tool-bar {
    position: fixed;
    top: 0;
    padding-top: 0;
    padding-top: constant(safe-area-inset-top) !important;
    padding-top: env(safe-area-inset-top) !important;
    left: 50%;
    z-index: 2001;

    .tools {
      display: flex;
      flex-direction: column;

      .tool-icon {
        font-size: 18px;
        width: 58px;
        height: 48px;
        text-align: center;
        padding-top: 12px;
        cursor: pointer;
        outline: none;

        .iconfont {
          font-family: iconfont;
          width: 16px;
          font-size: 16px;
          margin: 0 auto;
          height: 22px;
          line-height: 22px;
          vertical-align: middle;
        }

        .tool-el-icon {
          font-size: 18px;
          line-height: 22px;
          height: 22px;

          i {
            line-height: 22px;
          }
        }

        .icon-text {
          font-size: 12px;
        }
      }
    }
  }

  .read-bar {
    position: fixed;
    bottom: 0;
    right: 50%;
    z-index: 100;

    .progress {
      padding: 10px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .progress-bar {
        flex: 1;
        padding: 0 10px;
      }

      .progress-tip {
        font-size: 14px;
        margin-left: 5px;
      }
    }

    .cache-content-zone {
      padding: 10px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      position: absolute;
      right: 55px;
      width: 300px;
      background: inherit;

      .cache-content-btn {
        cursor: pointer;
      }
    }

    .float-left-btn-zone {
      position: absolute;
      bottom: 155px;
      left: 4px;
      right: auto;
      display: flex;
      flex-direction: column;

      .float-btn {
        line-height: 32px;
        width: 36px;
        height: 36px;
        border-radius: 100%;
        display: block;
        cursor: pointer;
        text-align: center;
        vertical-align: middle;
        pointer-events: all;
        margin-top: 20px;

        .el-icon-top, .el-icon-bottom, .el-icon-info, .el-icon-search, .el-icon-collection-tag {
          line-height: 36px;
        }
      }
    }

    .float-right-btn-zone {
      position: absolute;
      bottom: 155px;
      left: 4px;
      right: auto;
      display: flex;
      flex-direction: column;

      .float-btn {
        line-height: 32px;
        width: 36px;
        height: 36px;
        border-radius: 100%;
        display: block;
        cursor: pointer;
        text-align: center;
        vertical-align: middle;
        pointer-events: all;
        margin-top: 20px;

        .el-icon-refresh-right, .el-icon-headset, .el-icon-view {
          line-height: 36px;
        }
        .el-icon-moon {
          color: #121212;
          line-height: 34px;
        }
        .el-icon-sunny {
          color: #666;
          line-height: 34px;
        }
      }
    }

    .tools {
      display: flex;
      flex-direction: column;

      .tool-icon {
        font-size: 18px;
        width: 42px;
        height: 31px;
        padding-top: 12px;
        text-align: center;
        align-items: center;
        cursor: pointer;
        outline: none;
        margin-top: -1px;

        &.progress-text {
          font-size: 16px;
        }

        .iconfont {
          font-family: iconfont;
          width: 16px;
          height: 16px;
          font-size: 16px;
          margin: 0 auto 6px;
        }
      }
    }

    .reader-bar-inner {
      display: flex;
      flex-direction: column;
      padding-bottom: 10px;
      padding-bottom: calc(10px + constant(safe-area-inset-top));
      padding-bottom: calc(10px + env(safe-area-inset-top));
      padding-left: 5px;
      padding-right: 5px;

      .operate-bar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 10px 10px 0 10px;
        align-items: center;

        .close-btn, .collapse-btn {
          font-size: 22px;
          height: 35px;
          cursor: pointer;
        }

        .center {
          span {
            display: inline-block;
            cursor: pointer;
          }
          .play-pause-btn {
            font-size: 50px;
            margin-top: -40px;
            i {
              border-radius: 100%;
            }
          }
          .ctrl-btn {
            margin: 0px 15px;
          }
        }
      }

      .setting-item {
        display: flex;
        flex-direction: column;
        padding: 5px 10px;

        .setting-title {
          font-size: 14px;
        }

        .setting-btn {
          font-size: 14px;
          cursor: pointer;
          display: inline-block;
          margin-left: 5px;
        }

        .voice-list {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          padding: 5px 10px;

          .radio-group {
            white-space: nowrap;

            .radio-button {
              margin-right: 10px;

              .el-radio-button__inner {
                border-radius: 4px 4px 4px 4px;
              }
            }
          }
        }

        .progress {
          padding: 5px 10px;

          .progress-tip {
            margin-left: 0;
            margin-right: 5px;
          }
        }
      }
    }
  }

  .chapter-bar {
    .el-breadcrumb {
      .item {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .chapter {
    font-family: 'Microsoft YaHei', PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', sans-serif;
    text-align: left;
    padding: 0 65px;
    min-height: 100vh;
    min-height: calc(var(--vh, 1vh) * 100);
    width: 670px;
    margin: 0 auto;
    background-size: cover;
    position: relative;

    >>>.el-icon-loading {
      font-size: 36px;
      color: #B5B5B5;
    }

    >>>.el-loading-text {
      font-weight: 500;
      color: #B5B5B5;
    }

    .click-zone {
      position: absolute;
      z-index: 120;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: #333;
      opacity: 0.8;
      color: #fff;
      font-size: 14px;
      pointer-events: none;

      div {
        position: absolute;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn {
        left: 0;
        right: 0;
        bottom: 20px;
        height: 45px;
        line-height: 45px;
        z-index: 10;
        padding: 0;
        cursor: pointer;
        pointer-events: all;
      }
    }

    .content {
      font-size: 18px;
      line-height: 1.8;
      overflow: hidden;
      font-family: 'Microsoft YaHei', PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', sans-serif;

      .content-inner {
        min-height: calc(var(--vh, 1vh) * 80);
        padding-bottom: 25px;
        box-sizing: border-box;
      }
    }

    .bottom-bar, .top-bar {
      box-sizing: border-box;
    }
    .top-bar {
      height: 44px;
      padding: 10px;
    }
    .bottom-bar {
      width: 100%;
      text-align: center;
      padding-bottom: 30px;
      .bottom-btn {
        font-size: 14px;
        cursor: pointer;
        display: inline-block;
        margin: 0 auto;
        padding: 10px 40px;
        width: 80%;
        box-sizing: border-box;
      }
    }
  }

  .chapter.audio {
    .top-bar, .bottom-bar {
      display: none;
    }
    .content-inner {
      height: calc(var(--vh, 1vh) * 100);
      margin-top: 0 !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      display: flex;
      align-items: center;
    }
  }
}

.day {
  >>>.popup {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  }

  >>>.tool-icon {
    border: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: -1px;
    color: #000;

    .icon-text {
      color: rgba(0, 0, 0, 0.4);
    }
  }

  >>>.progress-tip {
    color: rgba(0, 0, 0, 0.4);
  }

  >>>.cache-content-zone {
    color: rgba(0, 0, 0, 0.4);
  }

  >>>.float-left-btn-zone {
    color: #121212;
  }

  >>>.float-right-btn-zone {
    color: #121212;
  }

  >>>.reader-bar-inner {
    color: #121212;

    .setting-title {
      color: rgba(0, 0, 0, 0.8);
    }

    .setting-value {
      color: rgba(0, 0, 0, 0.4);
    }
  }

  >>>.chapter {
    border: 1px solid #d8d8d8;
    color: #262626;
  }

  .bottom-bar, .top-bar {
    color: rgba(0, 0, 0, 0.4);
  }

  >>>.el-slider__runway {
    background-color: #fff;
  }

  >>>.play-pause-btn {
    color: #409EFF;
  }
}

.night {
  >>>.popup {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.48), 0 0 6px rgba(0, 0, 0, 0.16);
  }

  >>>.tool-icon {
    border: 1px solid #444;
    margin-top: -1px;
    color: #666;

    .icon-text {
      color: #666;
    }
  }

  >>>.progress-tip {
    color: #666;
  }

  >>>.cache-content-zone {
    color: #666;
  }

  >>>.float-left-btn-zone {
    color: #666;
  }

  >>>.float-right-btn-zone {
    color: #666;
  }

  >>>.reader-bar-inner {
    color: #666;
  }

  >>>.chapter {
    border: 1px solid #444;
    color: #666;
  }

  >>>.popper__arrow {
    background: #666;
  }

  .bottom-bar, .top-bar {
    color: #666;
  }

  >>>.el-slider__runway {
    background-color: #282828;
  }
  >>>.el-slider__bar {
    background-color: #185798;
  }
  >>>.el-slider__button {
    border: 2px solid #185798;
    background-color: #282828;
  }
  >>>.play-pause-btn {
    color: #185798;
  }
}

.chapter-wrapper {
  .read-bar {
    .float-btn-zone {
      position: absolute;
      bottom: 135px;
      left: 4px;

      .float-left-btn-zone {
        position: relative;
        left: auto;
        bottom: auto;
      }

      .float-right-btn-zone {
        position: relative;
        left: auto;
        bottom: auto;
        margin-bottom: 20px;
      }
    }

  }
}

.chapter-wrapper.mini-interface {
  padding: 0;
  position: relative;
  height: 100%;

  .tool-bar {
    left: 0;
    width: 100vw;
    margin-left: 0 !important;

    .tools {
      flex-direction: row;
      justify-content: space-around;
      .tool-icon {
        border: none;
      }
    }
  }

  .read-bar {
    right: 0;
    width: 100vw;
    margin-right: 0 !important;

    .cache-content-zone {
      position: relative;
      width: auto;
      right: 0;
      background: inherit;
    }

    .float-btn-zone {
      position: static;
      bottom: 0;
      left: 0;
    }

    .float-left-btn-zone {
      position: absolute;
      right: auto;
      left: 20px;
      bottom: 135px;
    }

    .float-right-btn-zone {
      position: absolute;
      left: auto;
      right: 20px;
      bottom: 135px;
    }

    .tools {
      flex-direction: row;
      justify-content: space-around;
      padding: 0 15px;
      height: 45px;
      .tool-icon {
        border: none;
        width: auto;
        padding: 0;
        height: 45px;
        line-height: 45px;
        .iconfont {
          display: inline-block;
        }
        span {
          vertical-align: middle;
        }
      }
    }
  }

  .chapter {
    width: 100vw !important;
    padding: 0 16px;
    box-sizing: border-box;
    border: none;
    text-align: justify;
    position: relative;

    .top-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      z-index: 50;
      background: inherit;
      height: 30px;
      height: calc(30px + constant(safe-area-inset-top));
      height: calc(30px + env(safe-area-inset-top));
      padding: 6px 16px;
      padding-top: calc(6px + constant(safe-area-inset-top));
      padding-top: calc(6px + env(safe-area-inset-top));
      font-size: 12px;
    }

    .content-inner {
      margin-top: 30px;
      margin-top: calc(30px + constant(safe-area-inset-top));
      margin-top: calc(30px + env(safe-area-inset-top));
      padding-top: 15px;
      padding-bottom: 15px;
    }
  }

  .chapter.cartoon {
    padding: 0;

    .content-inner {
      padding-top: 1px;
    }
  }

  .chapter.slide-reader {
    padding: 0;
    height: 100%;

    .bottom-bar {
      height: 24px;
      position: absolute;
      bottom: 0;
      padding: 0 16px;
      padding-bottom: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }

    .top-bar {
      position: relative;
    }

    .content {
      position: absolute;
      overflow: visible;
      top: 30px;
      top: calc(30px + constant(safe-area-inset-top));
      top: calc(30px + env(safe-area-inset-top));
      bottom: 24px;
    }

    .content-inner {
      margin: 0 16px;
      overflow: hidden;
      text-align: justify;
      padding: 0;
      height: 100%;
    }

    .book-content {
      height: 100%;
      -webkit-columns: calc(100vw - 32px) 1;
      -webkit-column-gap: 32px;
      columns: calc(100vw - 16px) 1;
      column-gap: 16px;
    }
  }
}
.chapter-wrapper.mini-interface::-webkit-scrollbar {
  width: 0 !important;
}
</style><style lang="stylus">
.voice-list {
  .el-radio-button__inner {
    border-radius: 4px !important;
    border-left: 1px solid #DCDFE6;
    box-shadow: none;
  }
}
.night-theme {
  .voice-list {
    .el-radio-button {
      box-shadow: none !important;
    }
    .el-radio-button__inner {
      background-color: #bbb;
      border-color: #bbb;
    }
    .el-radio-button__inner:hover {
      color: #185798;
    }
    .el-radio-button__orig-radio:checked+.el-radio-button__inner {
      background-color: #185798;
      border-color: #185798;
      color: #fff;
      box-shadow: none;
    }
  }
}
.kindle-page {
  .day {
    .tool-icon {
      border: 1px solid #fefefefe;

      .icon-text {
        color: #444;
      }
    }

    .progress-tip {
      color: #444;
    }

    .cache-content-zone {
      color: #444;
    }

    .reader-bar-inner {

      .setting-title {
        color: rgba(0, 0, 0, 0.8);
      }

      .setting-value {
        color: #444;
      }
    }

    .bottom-bar, .top-bar {
      color: #444;
    }
  }
}
</style>
