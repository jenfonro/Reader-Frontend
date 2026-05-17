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
import "../styles/reader-popup.css";
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
