<template>
  <div class="reader-popup">
    <div class="reader-popup__header">
      <div class="reader-popup__title">来源({{ bookSource.length }})</div>
      <div class="reader-popup__actions" :class="{ loading: loadingMore }">
        <el-select
          v-model="bookSourceGroup"
          size="small"
          class="booksource-group-select"
          filterable
          placeholder="全部分组"
        >
          <el-option
            v-for="(item, index) in bookSourceGroupList"
            :key="`source-group-${index}`"
            :label="`${item.name} (${item.count})`"
            :value="item.value"
          />
        </el-select>
        <span :class="{ loading }" @click="refresh">
          <el-icon v-if="loading" class="is-loading">
            <Loading />
          </el-icon>
          {{ loading ? "刷新中..." : "刷新" }}
        </span>
        <span
          :class="{ loading: loadingMore }"
          @click="loadMoreBookSources"
        >
          <el-icon v-if="loadingMore" class="is-loading">
            <Loading />
          </el-icon>
          {{ loadingMore ? "加载中..." : "加载更多" }}
        </span>
      </div>
    </div>
    <div
      class="reader-popup__body"
      :class="{ night: isNight, day: !isNight }"
    >
      <div class="source-list">
        <div
          v-for="(searchBook, index) in bookSource"
          :key="index"
          class="source-item"
          :class="{ selected: isSelected(searchBook) }"
          @click="changeBookSource(searchBook)"
        >
          <div class="source-title">
            <div class="source-name">
              {{ searchBook.originName }}
            </div>
            <div class="source-time">
              {{ searchBook.time ? `⏱ ${searchBook.time}ms` : "" }}
            </div>
          </div>
          <div class="source-latest-chapter">
            {{ searchBook.latestChapterTitle || "无最新章节" }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import { ElOption, ElSelect } from "element-plus/es/components/select/index.mjs";
import "element-plus/es/components/icon/style/css.mjs";
import "element-plus/es/components/select/style/css.mjs";
import { Loading } from "@element-plus/icons-vue";
import {
  previewBook,
  previewBookSourceGroups,
  previewBookSources
} from "../previewData";

defineOptions({
  name: "BookSource"
});

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["change-book-source"]);

const bookSource = ref(previewBookSources);
const bookSourceGroup = ref("");
const bookSourceGroupList = ref(previewBookSourceGroups);
const loading = ref(false);
const loadingMore = ref(false);
const isNight = ref(false);

const isSelected = searchBook => searchBook.bookUrl === previewBook.bookUrl;

const refresh = () => {
  loading.value = true;
  window.setTimeout(() => {
    loading.value = false;
  }, 300);
};

const loadMoreBookSources = () => {
  loadingMore.value = true;
  window.setTimeout(() => {
    loadingMore.value = false;
  }, 300);
};

const changeBookSource = searchBook => {
  emit("change-book-source", searchBook);
};
</script>

<style lang="stylus" scoped>
.reader-popup {
  margin: -16px;
  margin-bottom: -13px;
  padding: 24px;
  background: var(--reader-panel-background, #ede7da);
  color: var(--reader-font-color, inherit);
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
    font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
    color: #ed4259;
    border-bottom: 1px solid #ed4259;
    width: fit-content;
  }

  .reader-popup__actions {
    font-size: 14px;
    line-height: 26px;
    color: #ed4259;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;

    .booksource-group-select {
      width: 140px;
    }
    .source-count {
      display: inline-flex;
      align-items: center;
      color: #606266;
    }
    span {
      margin-left: 0;
    }
    &.loading {
      color: #606266;
    }
  }

  .reader-popup__body {
    height: 300px;
    overflow: auto;

    .source-list {
      .source-item {
        width: 100%;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        max-width: 100%;
        overflow: hidden;
        padding: 8px 0;

        .source-title {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;

          .source-name {
            font-size: 16px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

          }
          .source-time {
            margin-left: 12px;
            flex: 0 0 auto;
            font-size: 12px;
          }
        }

        .source-latest-chapter {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #888;
          font-size: 14px;
          margin-top: 6px;
        }

        &.selected {
          .source-name {
            color: #EB4259;
          }
        }
      }
    }
  }

  .reader-popup__body::-webkit-scrollbar {
    width: 0 !important;
  }

  .night {
    :deep(.source-item) {
      border-bottom: 1px solid #333;
    }
  }

  .day {
    :deep(.source-item) {
      border-bottom: 1px solid #eee;
    }
  }
}
</style>
