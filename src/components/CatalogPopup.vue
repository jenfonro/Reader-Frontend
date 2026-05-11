<template>
  <div class="reader-popup" :style="popupTheme">
    <div class="reader-popup__header">
      <div class="reader-popup__title">
        目录
        <span v-if="catalog.length">({{ catalog.length }})</span>
      </div>
      <div class="reader-popup__actions">
        <span v-if="catalog.length" class="reader-popup__action" @click="asc = !asc">
          {{ asc ? "倒序" : "顺序" }}
        </span>
        <span v-if="catalog.length" class="reader-popup__action" @click="toTop">顶部</span>
        <span v-if="catalog.length" class="reader-popup__action" @click="toBottom">
          底部
        </span>
        <span
          v-if="book.origin === 'loc_book'"
          class="reader-popup__action"
          @click="changeRule"
        >
          修改规则
        </span>
        <span
          :class="{ loading: refreshLoading, 'reader-popup__refresh': true }"
          @click="refreshChapter"
        >
          <el-icon v-if="refreshLoading" class="is-loading">
            <Loading />
          </el-icon>
          {{ refreshLoading ? "刷新中..." : "刷新" }}
        </span>
      </div>
    </div>
    <div
      ref="catalogBodyRef"
      class="reader-popup__body"
      :class="{ night: isNight, day: !isNight }"
    >
      <div class="catalog-list">
        <div
          v-for="note in catalogList"
          :key="note.index"
          class="catalog-list__item"
          :class="{ selected: isSelected(note) }"
          @click="gotoChapter(note)"
        >
          <div
            :class="{
              'catalog-list__text': true,
              cached: cachedChapterMap[note.index]
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
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import "element-plus/es/components/icon/style/css.mjs";
import "element-plus/es/components/message/style/css.mjs";
import { ElMessage } from "element-plus/es/components/message/index.mjs";
import { Loading } from "@element-plus/icons-vue";
import { previewTheme } from "../previewData";

defineOptions({
  name: "CatalogPopup"
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  catalog: {
    type: Array,
    default: () => []
  },
  book: {
    type: Object,
    default: () => ({})
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  isNight: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["get-content", "refresh"]);

const catalogBodyRef = ref(null);
const asc = ref(true);
const cachedChapterMap = ref({});

const catalogList = computed(() =>
  asc.value ? props.catalog : [...props.catalog].reverse()
);
const refreshLoading = computed(() => props.loading);
const popupTheme = computed(() => ({
  background: previewTheme.popup
}));

const isSelected = note => note.index === props.currentIndex;

const gotoChapter = note => {
  emit("get-content", note);
};

const refreshChapter = () => {
  if (refreshLoading.value) return;
  emit("refresh");
};

const changeRule = () => {
  ElMessage.success("修改规则预览");
};

const toTop = () => {
  if (catalogBodyRef.value) {
    catalogBodyRef.value.scrollTop = 0;
  }
};

const toBottom = () => {
  if (catalogBodyRef.value) {
    catalogBodyRef.value.scrollTop = catalogBodyRef.value.scrollHeight;
  }
};
</script>

<style lang="stylus" scoped>
.reader-popup {
  margin: -16px;
  margin-bottom: -13px;
  padding: 24px;
  padding-top: calc(24px + constant(safe-area-inset-top));
  padding-top: calc(24px + env(safe-area-inset-top));

  .reader-popup__header {
    margin: 0 0 20px 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .reader-popup__title {
    font-size: 18px;
    font-weight: 400;
    font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica,
      "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC",
      "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC",
      "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei",
      "WenQuanYi Zen Hei", "ST Heiti", SimHei,
      "WenQuanYi Zen Hei Sharp", sans-serif;
    color: #ed4259;
    border-bottom: 1px solid #ed4259;
    width: fit-content;
  }

  .reader-popup__actions {
    font-size: 14px;
    line-height: 26px;
    color: #606266;
    display: inline-flex;
    align-items: center;
    gap: 8px;

    .progress-percent {
      display: inline-flex;
      align-items: center;
    }
    .reader-popup__action {
      display: inline-flex;
      align-items: center;
      color: #ed4259;
      cursor: pointer;
    }
    .reader-popup__refresh {
      display: inline-flex;
      align-items: center;
      color: #ed4259;
      cursor: pointer;
      &.loading {
        color: #606266;
      }
    }
  }

  .reader-popup__body {
    height: 300px;
    overflow: auto;

    .catalog-list {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;

      .cached {
        color: #444;
      }

      .selected .catalog-list__text {
        color: #EB4259 !important;
      }

      .catalog-list__item {
        width: 50%;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        font: 16px / 40px PingFangSC-Regular, HelveticaNeue-Light,
          'Helvetica Neue Light', 'Microsoft YaHei', sans-serif;

        .catalog-list__text {
          margin-right: 26px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .reader-popup__body::-webkit-scrollbar {
    width: 0 !important;
  }

  .night {
    :deep(.catalog-list__item) {
      border-bottom: 1px solid #333;
    }
  }

  .day {
    :deep(.catalog-list__item) {
      border-bottom: 1px solid #eee;
    }

    :deep(.cached) {
      color: #bbb !important;
    }
  }
}
@media screen and (max-width: 500px) {
  .reader-popup .reader-popup__body .catalog-list .catalog-list__item {
    width: 100%;

    .catalog-list__text {
      margin-right: 0;
    }
  }
}
</style>
