<template>
  <div class="popup-wrapper" :style="popupTheme">
    <div class="title-zone">
      <div class="title">
        目录
        <span v-if="catalog.length">({{ catalog.length }})</span>
      </div>
      <div :class="{ 'title-btn': true }">
        <span v-if="catalog.length" class="span-btn" @click="asc = !asc">
          {{ asc ? "倒序" : "顺序" }}
        </span>
        <span v-if="catalog.length" class="span-btn" @click="toTop">顶部</span>
        <span v-if="catalog.length" class="span-btn" @click="toBottom">
          底部
        </span>
        <span
          v-if="book.origin === 'loc_book'"
          class="span-btn"
          @click="changeRule"
        >
          修改规则
        </span>
        <span
          :class="{ loading: refreshLoading, 'refresh-btn': true }"
          @click="refreshChapter"
        >
          <el-icon v-if="refreshLoading" class="el-icon-loading">
            <Loading />
          </el-icon>
          {{ refreshLoading ? "刷新中..." : "刷新" }}
        </span>
      </div>
    </div>
    <div
      ref="cataDataRef"
      class="data-wrapper"
      :class="{ night: isNight, day: !isNight }"
    >
      <div class="cata">
        <div
          v-for="(note, index) in cataList"
          :key="note.index"
          class="log"
          :class="{ selected: isSelected(index) }"
          @click="gotoChapter(note)"
        >
          <div
            :class="{
              'log-text': true,
              cached: cachedCataMap[note.index]
            }"
          >
            {{ note.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
import { previewBook, previewCatalog, previewTheme } from "../previewData";

defineOptions({
  name: "PopCata"
});

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["getContent", "refresh"]);

const cataDataRef = ref(null);
const refreshLoading = ref(false);
const asc = ref(true);
const cachedCataMap = ref({});
const book = ref(previewBook);
const catalog = ref(previewCatalog);
const isNight = ref(false);

const cataList = computed(() =>
  asc.value ? catalog.value : [...catalog.value].reverse()
);
const popupTheme = computed(() => ({
  background: previewTheme.popup
}));

const isSelected = index => index === (book.value.index || 0);

const gotoChapter = note => {
  emit("getContent", note);
};

const refreshChapter = () => {
  refreshLoading.value = true;
  window.setTimeout(() => {
    refreshLoading.value = false;
    emit("refresh");
  }, 300);
};

const changeRule = () => {
  ElMessage.success("修改规则预览");
};

const toTop = () => {
  if (cataDataRef.value) {
    cataDataRef.value.scrollTop = 0;
  }
};

const toBottom = () => {
  if (cataDataRef.value) {
    cataDataRef.value.scrollTop = cataDataRef.value.scrollHeight;
  }
};
</script>

<style lang="stylus" scoped>
.popup-wrapper {
  margin: -16px;
  margin-bottom: -13px;
  padding: 24px;
  padding-top: calc(24px + constant(safe-area-inset-top));
  padding-top: calc(24px + env(safe-area-inset-top));

  .title-zone {
    margin: 0 0 20px 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .title {
    font-size: 18px;
    font-weight: 400;
    font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
    color: #ed4259;
    border-bottom: 1px solid #ed4259;
    width: fit-content;
  }

  .title-btn {
    font-size: 14px;
    line-height: 26px;
    color: #606266;
    .progress-percent {
      display: inline-block;
      margin-right: 25px;
    }
    .span-btn {
      display: inline-block;
      color: #ed4259;
      margin-left: 15px;
      cursor: pointer;
    }
    .refresh-btn {
      display: inline-block;
      margin-left: 15px;
      color: #ed4259;
      cursor: pointer;
      &.loading {
        color: #606266;
      }
    }
  }

  .data-wrapper {
    height: 300px;
    overflow: auto;

    .cata {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;

      .cached {
        color: #444;
      }

      .selected .log-text {
        color: #EB4259 !important;
      }

      .log {
        width: 50%;
        height: 40px;
        cursor: pointer;
        float: left;
        font: 16px / 40px PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', 'Microsoft YaHei', sans-serif;

        .log-text {
          margin-right: 26px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .data-wrapper::-webkit-scrollbar {
    width: 0 !important;
  }

  .night {
    :deep(.log) {
      border-bottom: 1px solid #333;
    }
  }

  .day {
    :deep(.log) {
      border-bottom: 1px solid #eee;
    }

    :deep(.cached) {
      color: #bbb !important;
    }
  }
}
@media screen and (max-width: 500px) {
  .popup-wrapper .data-wrapper .cata .log {
    width: 100%;

    .log-text {
      margin-right: 0;
    }
  }
}
</style>
