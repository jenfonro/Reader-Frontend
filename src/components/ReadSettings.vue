<template>
  <div
    class="reading-settings"
    :class="{ night: isNight, day: !isNight }"
  >
    <div class="reading-settings__body">
      <ul>
        <li class="reading-settings__color-row">
          <span class="setting-field__label">颜色</span>
          <div class="setting-color-row">
            <div class="setting-theme-scroll">
              <span
                class="theme-choice"
                v-for="(themeColor, index) in themeColors"
                :key="index"
                :style="themeColor"
                @click="setConfig('theme', index)"
                :class="{ selected: config.theme === index }"
                ><em v-if="index !== 6" class="iconfont">&#58980;</em
                ><em v-else class="moon-icon">{{ moonIcon }}</em></span
              >
            </div>
            <span
              class="setting-choice setting-choice--fixed"
              :key="'custom'"
              @click="setConfig('theme', 'custom')"
              :class="{ selected: config.theme === 'custom' }"
              >自定义</span
            >
          </div>
        </li>
        <li v-if="config.theme === 'custom'">
          <span class="setting-field__label">自定义</span>
          <div class="custom-theme-editor">
            <div class="custom-theme-editor__field">
              <span class="custom-theme-editor__field">主题模式</span>
              <span
                class="setting-choice"
                v-for="(type, index) in themeTypes"
                :key="index"
                :class="{ selected: config.themeType === type }"
                @click="setConfig('themeType', type)"
                >{{ type === "day" ? "白天" : "黑夜" }}</span
              >
            </div>
            <span class="custom-theme-editor__field"
              >页面背景颜色
              <el-color-picker v-model="config.bodyColor"></el-color-picker>
            </span>
            <span class="custom-theme-editor__field"
              >浮窗背景颜色
              <el-color-picker v-model="config.popupColor"></el-color-picker
            ></span>
            <span class="custom-theme-editor__field"
              >阅读背景颜色
              <el-color-picker v-model="config.contentColor"></el-color-picker
            ></span>
            <span class="custom-theme-editor__field"
              >阅读背景图片
              <img
                class="theme-background-option"
                v-for="(item, index) in builtinBG"
                :key="index"
                :class="{
                  selected: config.contentBGImg === item.src
                }"
                :src="item.src"
                alt=""
                @click="setBGImg(item.src)"
              />
              <div
                class="theme-background-option"
                v-for="item in config.customBGImgList || []"
                :key="item"
                :class="{
                  selected: config.contentBGImg === item
                }"
              >
                <img
                  :src="getCustomBGImgURL(item)"
                  alt=""
                  @click="setBGImg(item)"
                />
                <el-icon
                  class="theme-background-delete"
                  @click.stop="deleteCustomBGImg(item)"
                >
                  <Close />
                </el-icon>
              </div>

              <span class="theme-background-upload" @click="uploadBGFile">上传</span>
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
          <span class="setting-field__label">字体</span>
          <div class="setting-stepper">
            <span class="less" @click="decConfig('fontSize')"
              ><em class="iconfont">&#58966;</em></span
            ><b></b>
            <span class="setting-stepper__value">
              <el-input
                class="setting-input"
                v-model="config.fontSize"
                size="small"
              ></el-input></span
            ><b></b>
            <span class="more" @click="incConfig('fontSize')"
              ><em class="iconfont">&#58976;</em></span
            >
          </div>
        </li>
        <li>
          <span class="setting-field__label">简繁转换</span>
          <div class="setting-choice-list">
            <span
              class="setting-choice"
              v-for="(chineseFont, index) in chineseFonts"
              :key="index"
              :class="{ selected: config.chineseFont === chineseFont }"
              @click="setConfig('chineseFont', chineseFont)"
              >{{ chineseFont }}</span
            >
          </div>
        </li>
        <li>
          <span class="setting-field__label">段落行高</span>
          <div class="setting-stepper">
            <span class="less" @click="decConfig('lineHeight')"
              ><el-icon><Minus /></el-icon></span
            ><b></b>
            <span class="setting-stepper__value">
              <el-input
                class="setting-input"
                v-model="config.lineHeight"
                size="small"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('lineHeight')"
              ><el-icon><Plus /></el-icon></span>
          </div>
        </li>
        <li>
          <span class="setting-field__label">段落间距</span>
          <div class="setting-stepper">
            <span class="less" @click="decConfig('paragraphSpace')"
              ><el-icon><Minus /></el-icon></span
            ><b></b>
            <span class="setting-stepper__value">
              <el-input
                class="setting-input"
                v-model="config.paragraphSpace"
                size="small"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('paragraphSpace')"
              ><el-icon><Plus /></el-icon></span>
          </div>
        </li>
        <li>
          <span class="setting-field__label setting-field__label--color">字体颜色</span>
          <el-color-picker v-model="config.fontColor"></el-color-picker>
        </li>
        <li>
          <span class="setting-field__label">页面模式</span>
          <div class="setting-choice-list">
            <span
              class="setting-choice"
              v-for="(mode, index) in pageModes"
              :key="index"
              :class="{ selected: config.pageMode === mode }"
              @click="setPageMode(mode)"
              >{{ mode }}</span
            >
          </div>
        </li>
        <li v-if="!miniInterface">
          <span class="setting-field__label">页面宽度</span>
          <div class="setting-stepper">
            <span class="less" @click="decConfig('readWidth')"
              ><em class="iconfont">&#58965;</em></span
            ><b></b> <span class="setting-stepper__value">{{ config.readWidth }}</span
            ><b></b>
            <span class="more" @click="incConfig('readWidth')"
              ><em class="iconfont">&#58975;</em></span
            >
          </div>
        </li>
        <li>
          <span class="setting-field__label">翻页模式</span>
          <div class="setting-choice-list">
            <span
              class="setting-choice"
              v-for="(method, index) in readMethods"
              :key="index"
              :class="{ selected: config.readMethod === method }"
              @click="setReadMethod(method)"
              >{{ method }}</span
            >
          </div>
        </li>
        <li>
          <span class="setting-field__label">动画时长</span>
          <div class="setting-stepper">
            <span class="less" @click="decConfig('animateMSTime')"
              ><el-icon><Minus /></el-icon></span
            ><b></b>
            <span class="setting-stepper__value">
              <el-input
                class="setting-input"
                v-model="config.animateMSTime"
                size="small"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('animateMSTime')"
              ><el-icon><Plus /></el-icon></span>
          </div>
        </li>
        <li>
          <span class="setting-field__label">自动翻页</span>
          <div class="setting-choice-list">
            <span
              class="setting-choice"
              v-for="(method, index) in autoReadingMethods"
              :key="index"
              :class="{ selected: config.autoReadingMethod === method }"
              @click="setConfig('autoReadingMethod', method)"
              >{{ method }}</span
            >
          </div>
        </li>
        <li v-if="config.autoReadingMethod === '像素滚动'">
          <span class="setting-field__label">滚动像素</span>
          <div class="setting-stepper">
            <span class="less" @click="decConfig('autoReadingPixel')"
              ><el-icon><Minus /></el-icon></span
            ><b></b>
            <span class="setting-stepper__value">
              <el-input
                class="setting-input"
                v-model="config.autoReadingPixel"
                size="small"
              ></el-input> </span
            ><b></b>
            <span class="less" @click="incConfig('autoReadingPixel')"
              ><el-icon><Plus /></el-icon></span>
          </div>
        </li>
        <li>
          <span class="setting-field__label">翻页速度</span>
          <div class="setting-stepper">
            <span class="less" @click="decConfig('autoReadingLineTime')"
              ><el-icon><Minus /></el-icon></span
            ><b></b>
            <span class="setting-stepper__value"
              ><el-input
                class="setting-input"
                v-model="config.autoReadingLineTime"
                size="small"
              ></el-input></span
            ><b></b>
            <span class="less" @click="incConfig('autoReadingLineTime')"
              ><el-icon><Plus /></el-icon></span>
          </div>
        </li>
        <li>
          <span class="setting-field__label">选择文字</span>
          <div class="setting-choice-list">
            <span
              class="setting-choice"
              v-for="(action, index) in selectionActions"
              :key="index"
              :class="{ selected: config.selectionAction === action }"
              @click="setConfig('selectionAction', action)"
              >{{ action }}</span
            >
          </div>
        </li>
        <el-divider></el-divider>
        <li class="reading-settings__operations">
          <span class="reading-settings__operation" @click="showReaderClickMap">显示翻页区域</span>
          <span class="reading-settings__operation" @click="showRuleEditor">过滤规则管理</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
import { ElColorPicker } from "element-plus/es/components/color-picker/index.mjs";
import { ElDivider } from "element-plus/es/components/divider/index.mjs";
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import { ElInput } from "element-plus/es/components/input/index.mjs";
import "element-plus/es/components/color-picker/style/css.mjs";
import "element-plus/es/components/divider/style/css.mjs";
import "element-plus/es/components/icon/style/css.mjs";
import "element-plus/es/components/input/style/css.mjs";
import "element-plus/es/components/message/style/css.mjs";
import { Close, Minus, Plus } from "@element-plus/icons-vue";
import { getMiniInterface } from "../utils/interface";
import { previewConfig } from "../previewData";

defineOptions({
  name: "ReadSettings"
});

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["close", "show-reader-click-map", "read-method-change", "page-mode-change"]);

const themeColors = [
  { background: "rgba(250, 245, 235, 0.8)" },
  { background: "rgba(245, 234, 204, 0.8)" },
  { background: "rgba(230, 242, 230, 0.8)" },
  { background: "rgba(228, 241, 245, 0.8)" },
  { background: "rgba(245, 228, 228, 0.8)" },
  { background: "rgba(224, 224, 224, 0.8)" },
  { background: "rgba(0, 0, 0, 0.5)" },
  { background: "rgba(255, 255, 255, 0.8)" }
];
const builtinBG = [
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
];
const readMethods = ["上下", "覆盖", "平移", "无动画"];
const selectionActions = ["操作弹窗", "忽略"];
const pageModes = ["自适应", "手机模式"];
const themeTypes = ["day", "night"];
const autoReadingMethods = ["像素滚动", "段落滚动"];
const chineseFonts = ["简体", "繁体"];
const configRules = {
  fontSize: { min: 8, delta: 1 },
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
};

const bgFileRef = ref(null);
const config = reactive({ ...previewConfig });
const isNight = ref(false);
const miniInterface = ref(getMiniInterface());

const moonIcon = computed(() => (config.themeType === "night" ? "" : ""));
const syncInterface = () => {
  miniInterface.value = getMiniInterface();
};

const setConfig = (name, value) => {
  config[name] = value;
};

const setPageMode = pageMode => {
  setConfig("pageMode", pageMode);
  emit("page-mode-change");
};

const setReadMethod = readMethod => {
  setConfig("readMethod", readMethod);
  emit("read-method-change");
};

const incConfig = name => {
  const rule = configRules[name];
  const value = +config[name];
  const nextValue =
    "max" in rule ? Math.min(rule.max, value + rule.delta) : value + rule.delta;
  setConfig(name, nextValue);
};

const decConfig = name => {
  const rule = configRules[name];
  const value = +config[name];
  const nextValue =
    "min" in rule ? Math.max(rule.min, value - rule.delta) : value - rule.delta;
  setConfig(name, nextValue);
};

const setBGImg = item => {
  setConfig("contentBGImg", typeof item === "string" ? item : item.src);
};

const uploadBGFile = () => {
  bgFileRef.value?.click();
};

const onBGFileChange = event => {
  event.target.value = null;
  ElMessage.success("上传背景预览");
};

const getCustomBGImgURL = src => src;

const deleteCustomBGImg = src => {
  config.customBGImgList = (config.customBGImgList || []).filter(
    item => item !== src
  );
};

const showReaderClickMap = () => {
  emit("close");
  emit("show-reader-click-map");
};

const showRuleEditor = () => {
  ElMessage.success("过滤规则管理预览");
};

onMounted(() => {
  window.addEventListener("resize", syncInterface);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncInterface);
});
</script>

<style lang="stylus" scoped>
:deep(.iconfont) {
  font-family: iconfont;
  font-style: normal;
}

:deep(.moon-icon) {
  font-family: iconfont;
  font-style: normal;
}

.reading-settings {
  user-select: none;
  margin: -16px;
  margin-bottom: -13px;
  text-align: left;
  padding: 24px;
  background: var(--reader-panel-background, #ede7da);
  color: var(--reader-font-color, inherit);
  padding-top: calc(24px + constant(safe-area-inset-top));
  padding-top: calc(24px + env(safe-area-inset-top));

  .reading-settings__body {
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
        display: flex;
        align-items: flex-start;
        gap: 16px;

        .setting-field__label {
          flex: 0 0 56px;
          display: flex;
          align-items: center;
          min-height: 36px;
          line-height: 1;
          color: #666;
        }
        .setting-field__label--color {
          line-height: 40px;
        }
        .setting-choice-list {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 5px 16px;

          span {
            margin-bottom: 0;
          }
        }

        .setting-color-row {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .setting-theme-scroll {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
        }

        .setting-theme-scroll::-webkit-scrollbar {
          display: none;
        }

        .setting-choice--fixed {
          flex: 0 0 78px;
        }

        .setting-choice {
          width: 78px;
          height: 34px;
          cursor: pointer;
          border-radius: 2px;
          text-align: center;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font: 14px / 1 PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', 'Microsoft YaHei', sans-serif;
          position: relative;

          .setting-choice__delete {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: absolute;
            top: -10px;
            right: -10px;
            font-size: 20px;
            color: #ed4259;
            z-index: 10;
          }

          .setting-choice__upload {
            display: inline-flex;
            align-items: center;
            justify-content: center;
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

        .setting-choice.selected  {
          border: 1px solid #ed4259;
          color: #ed4259;
        }

        .custom-theme-editor {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 12px;

          .custom-theme-editor__field {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-right: 20px;
            margin-bottom: 5px;
          }

          .theme-background-option {
            width: 36px;
            height: 36px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-left: 0;
            margin-bottom: 8px;
            position: relative;
            box-sizing: border-box;

            img {
              width: 100%;
              height: 100%;
              display: block;
            }

            .theme-background-delete {
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
          .theme-background-upload {
            display: inline-flex;
            align-items: center;
            margin-left: 0;
            color: #ed4259;
            cursor: pointer;
          }
        }

        .theme-choice {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          margin-right: 0;
          border-radius: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

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

        .setting-stepper {
          display: inline-flex;
          align-items: center;
          height: 34px;
          border-radius: 2px;

          span {
            min-width: 72px;
            height: 34px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            text-align: center;
            line-height: 1;

            em {
              font-style: normal;
            }
          }

          .setting-stepper__value {
            color: #a6a6a6;
            font-weight: 400;
            font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
          }

          b {
            display: inline-flex;
            align-items: center;
            height: 20px;
          }
        }
      }

      .reading-settings__operations {
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        .reading-settings__operation {
          cursor: pointer;
          color: #ed4259;
        }
      }
    }
  }
  .reading-settings__body::-webkit-scrollbar {
    width: 0 !important;
  }
  .el-color-picker {
    display: inline-flex;
  }
}

.night {
  :deep(.theme-choice) {
    border: 1px solid #666;
  }

  :deep(.selected) {
    border: 1px solid #666;
  }

  :deep(.moon-icon) {
    color: #ed4259;
  }

  .setting-choice {
    border: 1px solid #666;
    background: var(--reader-content-background, rgba(45, 45, 45, 0.5));
  }

  :deep(.setting-stepper) {
    border: 1px solid #666;
    background: var(--reader-content-background, rgba(45, 45, 45, 0.5));

    b {
      border-right: 1px solid #666;
    }
  }
}

.day {
  :deep(.theme-choice) {
    border: 1px solid #e5e5e5;
  }

  :deep(.selected) {
    border: 1px solid #ed4259;
  }

  :deep(.moon-icon) {
    display: inline;
    color: rgba(255, 255, 255, 0.2);
  }

  .setting-choice {
    background: var(--reader-content-background, rgba(255, 255, 255, 0.5));
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  :deep(.setting-stepper) {
    border: 1px solid #e5e5e5;
    background: var(--reader-content-background, rgba(255, 255, 255, 0.5));

    b {
      border-right: 1px solid #e5e5e5;
    }
  }
}

@media (hover: hover) {
  .setting-choice:hover {
    border: 1px solid #ed4259;
    color: #ed4259;
  }
  li {
    .less:hover, .more:hover {
      color: #ed4259;
    }
  }
}
</style>

<style lang="stylus">
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
