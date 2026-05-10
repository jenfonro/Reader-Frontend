<template>
  <div
    class="settings-wrapper"
    :style="popupTheme"
    :class="{ night: isNight, day: !isNight }"
  >
    <div class="settings-title">
      设置
      <div class="title-btn" @click="resetConfig">重置为默认配置</div>
    </div>
    <div class="setting-list">
      <ul>
        <li>
          <span class="setting-item-title">特殊模式</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(type, index) in pageTypes"
              :key="index"
              :class="{ selected: config.pageType == type }"
              @click="setPageType(type)"
              >{{ type === "Kindle" ? "简洁" : "正常" }}</span
            >
            <span class="small-tip"
              >❗️开启简洁模式会关闭动画以及首页的部分功能</span
            >
          </div>
        </li>
        <el-divider></el-divider>
        <li>
          <span class="setting-item-title">配置方案</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(customConfig, index) in customConfigList"
              :key="index"
              :class="{
                selected:
                  config.customConfig === customConfig.name
              }"
              @click="setCustomConfig(customConfig)"
            >
              <span>{{ customConfig.name }}</span>
              <i
                class="el-icon-close delete-custom-config-icon"
                v-if="
                  index > 1 &&
                    config.customConfig !== customConfig.name
                "
                @click.stop="deleteCustomConfig(index, customConfig.name)"
              ></i>
            </span>
            <span
              class="span-item"
              :key="'addNewCustomConfig'"
              @click="addNewCustomConfig"
              >新增方案</span
            >
            <span
              class="span-item"
              :key="'autoTheme'"
              ref="themes"
              @click="setAutoTheme"
              :class="{ selected: config.autoTheme }"
              >自动切换</span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">方案类型</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(configDefaultType, index) in configDefaultTypeList"
              :key="index"
              :class="{
                selected:
                  currentCustomConfig.configDefaultType === configDefaultType
              }"
              @click="setConfigDefaultType(configDefaultType)"
              >{{ configDefaultType }}</span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">阅读主题</span>
          <div class="selection-zone">
            <span
              class="theme-item"
              v-for="(themeColor, index) in themeColors"
              :key="index"
              :style="themeColor"
              ref="themes"
              @click="setConfig('theme', index)"
              :class="{ selected: config.theme === index }"
              ><em v-if="index != 6" class="iconfont">&#58980;</em
              ><em v-else class="moon-icon">{{ moonIcon }}</em></span
            >
            <span
              class="span-item"
              :key="'custom'"
              ref="themes"
              @click="setConfig('theme', 'custom')"
              :class="{ selected: config.theme === 'custom' }"
              >自定义</span
            >
          </div>
        </li>
        <li v-if="config.theme === 'custom'">
          <span class="setting-item-title">自定义</span>
          <div class="custom-theme">
            <div class="custom-theme-title">
              <span class="custom-theme-title">主题模式</span>
              <span
                class="span-item"
                v-for="(type, index) in themeTypes"
                :key="index"
                :class="{ selected: config.themeType == type }"
                @click="setConfig('themeType', type)"
                >{{ type === "day" ? "白天" : "黑夜" }}</span
              >
            </div>
            <span class="custom-theme-title"
              >页面背景颜色
              <el-color-picker v-model="config.bodyColor"></el-color-picker>
            </span>
            <span class="custom-theme-title"
              >浮窗背景颜色
              <el-color-picker v-model="config.popupColor"></el-color-picker
            ></span>
            <span class="custom-theme-title"
              >阅读背景颜色
              <el-color-picker v-model="config.contentColor"></el-color-picker
            ></span>
            <span class="custom-theme-title"
              >阅读背景图片
              <img
                class="content-bg-preview"
                v-for="(item, index) in builtinBG"
                :key="index"
                :class="{
                  selected: config.contentBGImg == item.src
                }"
                :src="item.src"
                alt=""
                @click="setBGImg(item.src)"
              />
              <div
                class="content-bg-preview"
                v-for="item in config.customBGImgList || []"
                :key="item"
                :class="{
                  selected: config.contentBGImg == item
                }"
              >
                <img
                  :src="getCustomBGImgURL(item)"
                  alt=""
                  @click="setBGImg(item)"
                />
                <i
                  class="el-icon-close delete-bg-icon"
                  @click.stop="deleteCustomBGImg(item)"
                ></i>
              </div>

              <span class="upload-bg-btn" @click="uploadBGFile">上传</span>
              <input
                ref="bgFileRef"
                type="file"
                @change="onBGFileChange"
                style="display:none"
              />
            </span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">正文字体</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(font, index) in fonts"
              :key="index"
              :class="{ selected: config.font == index }"
              @click="setConfig('font', index)"
              >{{ font }}
              <i
                :class="{
                  'el-icon-upload': true,
                  'upload-font-icon': true,
                  active:
                    config.customFontsMap &&
                    config.customFontsMap[customFonts[index]]
                }"
                @click.stop="uploadFontFile(customFonts[index], font)"
              ></i>
            </span>
            <input
              ref="fontFileRef"
              type="file"
              @change="onFontFileChange"
              style="display:none"
            />
          </div>
        </li>
        <li>
          <span class="setting-item-title">简繁转换</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(chineseFont, index) in chineseFonts"
              :key="index"
              :class="{ selected: config.chineseFont == chineseFont }"
              @click="setConfig('chineseFont', chineseFont)"
              >{{ chineseFont }}</span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">字体大小</span>
          <div class="resize">
            <span class="less" @click="decConfig('fontSize')"
              ><em class="iconfont">&#58966;</em></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.fontSize"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="more" @click="incConfig('fontSize')"
              ><em class="iconfont">&#58976;</em></span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">字体粗细</span>
          <div class="resize">
            <span class="less" @click="decConfig('fontWeight')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.fontWeight"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('fontWeight')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">段落行高</span>
          <div class="resize">
            <span class="less" @click="decConfig('lineHeight')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.lineHeight"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('lineHeight')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">段落间距</span>
          <div class="resize">
            <span class="less" @click="decConfig('paragraphSpace')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.paragraphSpace"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('paragraphSpace')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title font-color-title">字体颜色</span>
          <el-color-picker v-model="config.fontColor"></el-color-picker>
        </li>
        <li>
          <span class="setting-item-title">页面模式</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(mode, index) in pageModes"
              :key="index"
              :class="{ selected: config.pageMode == mode }"
              @click="setPageMode(mode)"
              >{{ mode }}</span
            >
          </div>
        </li>
        <li v-if="!miniInterface">
          <span class="setting-item-title">页面宽度</span>
          <div class="resize">
            <span class="less" @click="decConfig('readWidth')"
              ><em class="iconfont">&#58965;</em></span
            ><b></b> <span class="lang">{{ config.readWidth }}</span
            ><b></b>
            <span class="more" @click="incConfig('readWidth')"
              ><em class="iconfont">&#58975;</em></span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">翻页方式</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(method, index) in readMethods"
              :key="index"
              :class="{ selected: config.readMethod == method }"
              @click="setReadMethod(method)"
              v-show="
                (!miniInterface && method !== '左右滑动') ||
                  miniInterface
              "
              >{{ method }}</span
            >
            <span class="small-tip"
              >❗️上下滚动2会自动隐藏看过的章节，但是可能会抖动</span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">动画时长</span>
          <div class="resize">
            <span class="less" @click="decConfig('animateMSTime')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.animateMSTime"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('animateMSTime')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">自动翻页</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(method, index) in autoReadingMethods"
              :key="index"
              :class="{ selected: config.autoReadingMethod === method }"
              @click="setConfig('autoReadingMethod', method)"
              >{{ method }}</span
            >
          </div>
        </li>
        <li v-if="config.autoReadingMethod === '像素滚动'">
          <span class="setting-item-title">滚动像素</span>
          <div class="resize">
            <span class="less" @click="decConfig('autoReadingPixel')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang">
              <el-input
                class="setting-input"
                v-model="config.autoReadingPixel"
                size="mini"
              ></el-input> </span
            ><b></b>
            <span class="less" @click="incConfig('autoReadingPixel')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">翻页速度</span>
          <div class="resize">
            <span class="less" @click="decConfig('autoReadingLineTime')"
              ><i class="el-icon-minus"></i></span
            ><b></b>
            <span class="lang"
              ><el-input
                class="setting-input"
                v-model="config.autoReadingLineTime"
                size="mini"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('autoReadingLineTime')"
              ><i class="el-icon-plus"></i
            ></span>
          </div>
        </li>
        <li>
          <span class="setting-item-title">全屏点击</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(method, index) in clickMethods"
              :key="index"
              :class="{ selected: config.clickMethod == method }"
              @click="setConfig('clickMethod', method)"
              >{{ method }}</span
            >
          </div>
        </li>
        <li>
          <span class="setting-item-title">选择文字</span>
          <div class="selection-zone">
            <span
              class="span-item"
              v-for="(action, index) in selectionActions"
              :key="index"
              :class="{ selected: config.selectionAction == action }"
              @click="setConfig('selectionAction', action)"
              >{{ action }}</span
            >
          </div>
        </li>
        <el-divider></el-divider>
        <li class="operation-zone">
          <span class="span-btn" @click="showClickZone">显示翻页区域</span>
          <span class="span-btn" @click="showRuleEditor">过滤规则管理</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {
  getMiniInterface,
  previewConfig,
  previewCustomConfigs,
  previewTheme
} from "../previewData";

export default {
  name: "ReadSettings",
  props: ["visible"],
  data() {
    return {
      themeColors: [
        { background: "rgba(250, 245, 235, 0.8)" },
        { background: "rgba(245, 234, 204, 0.8)" },
        { background: "rgba(230, 242, 230, 0.8)" },
        { background: "rgba(228, 241, 245, 0.8)" },
        { background: "rgba(245, 228, 228, 0.8)" },
        { background: "rgba(224, 224, 224, 0.8)" },
        { background: "rgba(0, 0, 0, 0.5)" },
        { background: "rgba(255, 255, 255, 0.8)" }
      ],
      builtinBG: [
        { src: "bg/山水画.jpg" },
        { src: "bg/山水墨影.jpg" },
        { src: "bg/羊皮纸1.jpg" },
        { src: "bg/护眼漫绿.jpg" },
        { src: "bg/羊皮纸2.jpg" },
        { src: "bg/新羊皮纸.jpg" },
        { src: "bg/羊皮纸3.jpg" },
        { src: "bg/明媚倾城.jpg" },
        { src: "bg/羊皮纸4.jpg" },
        { src: "bg/深宫魅影.jpg" },
        { src: "bg/午后沙滩.jpg" },
        { src: "bg/清新时光.jpg" },
        { src: "bg/宁静夜色.jpg" },
        { src: "bg/边彩画布.jpg" }
      ],
      fonts: ["系统", "黑体", "楷体", "宋体", "仿宋"],
      readMethods: ["上下滑动", "左右滑动", "上下滚动", "上下滚动2"],
      clickMethods: ["下一页", "自动", "不翻页"],
      selectionActions: ["操作弹窗", "忽略"],
      pageModes: ["自适应", "手机模式"],
      pageTypes: ["正常", "Kindle"],
      themeTypes: ["day", "night"],
      configDefaultTypeList: ["白天默认", "黑夜默认"],
      autoReadingMethods: ["像素滚动", "段落滚动"],
      chineseFonts: ["简体", "繁体"],
      customFonts: [],
      customFontName: "",
      customConfigList: previewCustomConfigs.map(item => ({ ...item })),
      config: { ...previewConfig },
      isNight: false,
      miniInterface: getMiniInterface(),
      configRules: {
        fontSize: { min: 8, delta: 1 },
        fontWeight: { min: 100, max: 900, delta: 100 },
        animateMSTime: { min: 0, max: 500, delta: 50 },
        autoReadingPixel: { min: 1, delta: 5 },
        autoReadingLineTime: { min: 10, delta: 50 },
        lineHeight: { min: 1, max: 5, delta: 0.2 },
        paragraphSpace: { min: 0, max: 5, delta: 0.2 },
        readWidth: {
          min: Math.min(Math.floor(window.innerWidth / 160), 4) * 160,
          max: Math.floor(window.innerWidth / 160) * 160,
          delta: 160
        }
      }
    };
  },
  computed: {
    moonIcon() {
      return this.config.themeType === "night" ? "" : "";
    },
    popupTheme() {
      return {
        background: previewTheme.popup
      };
    },
    currentCustomConfig() {
      return (
        this.customConfigList.find(
          item => item.name === this.config.customConfig
        ) || this.customConfigList[0]
      );
    }
  },
  mounted() {
    window.addEventListener("resize", this.syncInterface);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.syncInterface);
  },
  methods: {
    syncInterface() {
      this.miniInterface = getMiniInterface();
    },
    setPageType(type) {
      this.setConfig("pageType", type);
    },
    setPageMode(pageMode) {
      this.setConfig("pageMode", pageMode);
      this.$emit("pageModeChange");
    },
    setReadMethod(readMethod) {
      this.setConfig("readMethod", readMethod);
      this.$emit("readMethodChange");
    },
    setConfig(name, value) {
      this.config = {
        ...this.config,
        [name]: value
      };
    },
    setAutoTheme() {
      this.setConfig("autoTheme", !this.config.autoTheme);
    },
    incConfig(name) {
      const rule = this.configRules[name];
      const value = +this.config[name];
      const nextValue =
        "max" in rule ? Math.min(rule.max, value + rule.delta) : value + rule.delta;
      this.setConfig(name, nextValue);
    },
    decConfig(name) {
      const rule = this.configRules[name];
      const value = +this.config[name];
      const nextValue =
        "min" in rule ? Math.max(rule.min, value - rule.delta) : value - rule.delta;
      this.setConfig(name, nextValue);
    },
    setBGImg(item) {
      this.setConfig("contentBGImg", typeof item === "string" ? item : item.src);
    },
    uploadBGFile() {
      this.$refs.bgFileRef && this.$refs.bgFileRef.click();
    },
    getCustomBGImgURL(src) {
      return src;
    },
    deleteCustomBGImg(src) {
      this.config = {
        ...this.config,
        customBGImgList: (this.config.customBGImgList || []).filter(
          item => item !== src
        )
      };
    },
    uploadFontFile(customFontName) {
      this.customFontName = customFontName || "";
      this.$refs.fontFileRef && this.$refs.fontFileRef.click();
    },
    onBGFileChange(event) {
      event.target.value = null;
      this.$message.success("上传背景预览");
    },
    onFontFileChange(event) {
      event.target.value = null;
      this.$message.success("上传字体预览");
    },
    resetConfig() {
      this.config = { ...previewConfig };
    },
    showClickZone() {
      this.$emit("close");
      this.$emit("showClickZone");
    },
    showRuleEditor() {
      this.$message.success("过滤规则管理预览");
    },
    addNewCustomConfig() {
      this.$message.success("添加配置方案预览");
    },
    setCustomConfig(customConfig) {
      this.config = {
        ...this.config,
        ...customConfig,
        customConfig: customConfig.name
      };
    },
    deleteCustomConfig() {
      this.$message.success("删除配置方案预览");
    },
    setConfigDefaultType(configDefaultType) {
      this.currentCustomConfig.configDefaultType = configDefaultType;
    }
  }
};
</script>

<style lang="stylus" scoped>
>>>.iconfont {
  font-family: iconfont;
  font-style: normal;
}

>>>.moon-icon {
  font-family: iconfont;
  font-style: normal;
}

.settings-wrapper {
  user-select: none;
  margin: -16px;
  margin-bottom: -13px;
  text-align: left;
  padding: 24px;
  padding-top: calc(24px + constant(safe-area-inset-top));
  padding-top: calc(24px + env(safe-area-inset-top));

  .settings-title {
    font-size: 18px;
    line-height: 22px;
    margin-bottom: 28px;
    font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
    font-weight: 400;

    .title-btn {
      float: right;
      font-size: 14px;
      color: #ed4259;
      cursor: pointer;
    }
  }

  .setting-list {
    max-height: 45vh;
    overflow-y: auto;
    ul {
      list-style: none outside none;
      margin: 0;
      padding: 0;

      li:not(:first-child) {
        margin-top: 20px;
      }

      li {
        list-style: none outside none;

        .setting-item-title {
          display: inline-block;
          width: 56px;
          margin-right: 16px;
          vertical-align: top;
          line-height: 36px;
          color: #666;
        }
        .font-color-title {
          line-height: 40px;
        }
        .selection-zone {
          display: inline-block;
          width: calc(100% - 72px);
          word-wrap: break-word;

          span {
            margin-bottom: 5px;
          }
        }

        .span-item {
          width: 78px;
          height: 34px;
          cursor: pointer;
          margin-right: 16px;
          border-radius: 2px;
          text-align: center;
          vertical-align: middle;
          display: inline-block;
          font: 14px / 34px PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', 'Microsoft YaHei', sans-serif;
          position: relative;

          .delete-custom-config-icon {
            display: inline-block;
            cursor: pointer;
            position: absolute;
            top: -10px;
            right: -10px;
            font-size: 20px;
            color: #ed4259;
            z-index: 10;
          }

          .upload-font-icon {
            display: inline-block;
            cursor: pointer;
            position: absolute;
            top: -10px;
            right: -10px;
            font-size: 20px;
            z-index: 10;
            color: #606266;

            &.active {
              color: #ed4259;
            }
          }
        }

        .span-item.selected  {
          border: 1px solid #ed4259;
          color: #ed4259;
        }

        .custom-theme {
          width: calc(100% - 72px);
          display: inline-block;

          .custom-theme-title {
            display: inline-block;
            margin-right: 28px;
            margin-bottom: 5px;
          }

          .content-bg-preview {
            width: 36px;
            height: 36px;
            display: inline-block;
            vertical-align: middle;
            margin-left: 10px;
            margin-bottom: 8px;
            position: relative;
            box-sizing: border-box;

            img {
              width: 100%;
              height: 100%;
              display: inline-block;
              vertical-align: middle;
            }

            .delete-bg-icon {
              position: absolute;
              top: -6px;
              right: -6px;
              font-size: 18px;
              color: #ed4259;
            }
          }
          .selected {
            color: #ed4259;
            border: 1px solid #ed4259;
          }
          .upload-bg-btn {
            display: inline-block;
            margin-left: 10px;
            color: #ed4259;
            cursor: pointer;
          }
        }

        .theme-item {
          line-height: 32px;
          width: 34px;
          height: 34px;
          margin-right: 16px;
          border-radius: 100%;
          display: inline-block;
          cursor: pointer;
          text-align: center;
          vertical-align: middle;

          .iconfont {
            display: none;
          }
        }

        .selected {
          color: #ed4259;

          .iconfont {
            display: inline;
          }
        }
      }

      li {

        .resize {
          display: inline-block;
          height: 34px;
          vertical-align: middle;
          border-radius: 2px;

          span {
            min-width: 72px;
            height: 34px;
            line-height: 34px;
            display: inline-block;
            cursor: pointer;
            text-align: center;
            vertical-align: middle;

            em {
              font-style: normal;
            }
          }

          .lang {
            color: #a6a6a6;
            font-weight: 400;
            font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
          }

          b {
            display: inline-block;
            height: 20px;
            vertical-align: middle;
          }
        }
      }

      .operation-zone {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        .span-btn {
          cursor: pointer;
          color: #ed4259;
        }
      }
    }
  }
  .setting-list::-webkit-scrollbar {
    width: 0 !important;
  }
  .el-color-picker {
    vertical-align: middle;
  }
}

.night {
  >>>.theme-item {
    border: 1px solid #666;
  }

  >>>.selected {
    border: 1px solid #666;
  }

  >>>.moon-icon {
    color: #ed4259;
  }

  .span-item {
    border: 1px solid #666;
    background: rgba(45, 45, 45, 0.5);
  }

  >>>.resize {
    border: 1px solid #666;
    background: rgba(45, 45, 45, 0.5);

    b {
      border-right: 1px solid #666;
    }
  }
}

.day {
  >>>.theme-item {
    border: 1px solid #e5e5e5;
  }

  >>>.selected {
    border: 1px solid #ed4259;
  }

  >>>.moon-icon {
    display: inline;
    color: rgba(255, 255, 255, 0.2);
  }

  .span-item {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  >>>.resize {
    border: 1px solid #e5e5e5;
    background: rgba(255, 255, 255, 0.5);

    b {
      border-right: 1px solid #e5e5e5;
    }
  }
}

@media (hover: hover) {
  .span-item:hover {
    border: 1px solid #ed4259;
    color: #ed4259;
  }
  li {
    .less:hover, .more:hover {
      color: #ed4259;
    }
  }
}
</style><style lang="stylus">
.setting-input {
  .el-input__inner {
    background: transparent;
    border: none !important;
    text-align: center;
    width: 72px;
    font-size: 14px;
    color: #a6a6a6;
  }
}
</style>
