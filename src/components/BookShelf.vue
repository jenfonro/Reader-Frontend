<template>
  <div class="reader-popup" :style="popupTheme">
    <div class="reader-popup__header">
      <div class="reader-popup__title">书架({{ shelfBooks.length }})</div>
      <div class="reader-popup__actions" :class="{ loading: refreshLoading }">
        <span :class="{ loading: refreshLoading }" @click="refreshShelf">
          <el-icon v-if="refreshLoading" class="is-loading">
            <Loading />
          </el-icon>
          {{ refreshLoading ? "刷新中..." : "刷新" }}
        </span>
      </div>
    </div>
    <div
      class="reader-popup__body"
      :class="{ night: isNight, day: !isNight }"
    >
      <div class="shelfbook-list">
        <div
          v-for="book in shelfBooks"
          :key="book.bookUrl"
          class="book-item"
          :class="{ selected: isSelected(book) }"
          @click="changeBook(book)"
        >
          <div class="book-title">
            <div class="book-name">
              {{ book.name }}
            </div>
            <div
              v-if="book.totalChapterNum - 1 - book.durChapterIndex"
              class="book-progress"
            >
              {{ book.totalChapterNum - 1 - book.durChapterIndex }}
            </div>
          </div>
          <div class="chapter-text">
            {{ book.durChapterTitle }}
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
import { Loading } from "@element-plus/icons-vue";
import { previewBook, previewShelfBooks, previewTheme } from "../previewData";

defineOptions({
  name: "BookShelf"
});

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["change-book", "to-shelf"]);

const refreshLoading = ref(false);
const shelfBooks = ref(previewShelfBooks);
const isNight = ref(false);

const popupTheme = computed(() => ({
  background: previewTheme.popup
}));

const isSelected = book => book.bookUrl === previewBook.bookUrl;

const refreshShelf = () => {
  refreshLoading.value = true;
  window.setTimeout(() => {
    refreshLoading.value = false;
  }, 300);
};

const changeBook = book => {
  emit("change-book", book);
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

    &.loading {
      color: #606266;
    }
  }

  .reader-popup__body {
    height: 300px;
    overflow: auto;

    .shelfbook-list {

      .book-item {
        width: 100%;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        max-width: 100%;
        overflow: hidden;
        padding: 8px 0;

        .book-title {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;

          .book-name {
            font-size: 16px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .book-progress {
            margin-left: 12px;
            flex: 0 0 auto;
            font-size: 12px;
          }
        }

        .chapter-text {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #888;
          font-size: 14px;
          margin-top: 6px;
        }

        &.selected {
          .book-name {
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
    .shelfbook-list {
      .book-item {
        border-bottom: 1px solid #333;

        .book-title {
          color: #888;
        }

        .chapter-text {
          color: #555;
        }
      }
    }
  }

  .day {
    :deep(.book-item) {
      border-bottom: 1px solid #eee;
    }
  }
}
</style>
