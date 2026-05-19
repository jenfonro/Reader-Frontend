<template>
  <div class="reader-popup">
    <div class="reader-popup__header">
      <div class="reader-popup__title">来源({{ filteredBookSources.length }})</div>
      <div class="reader-popup__actions" :class="{ loading: searchRunning }">
        <el-select
          v-model="bookSourceGroup"
          size="small"
          class="booksource-group-select"
          filterable
          placeholder="全部分组"
        >
          <el-option
            v-for="item in bookSourceGroupList"
            :key="item.value || 'all'"
            :label="`${item.name} (${item.count})`"
            :value="item.value"
          />
        </el-select>
        <span :class="{ loading }" @click="refresh">
          <el-icon v-if="loading" class="is-loading">
            <Loading />
          </el-icon>
          {{ loading ? "正在加载" : "刷新" }}
        </span>
        <span :class="{ loading: loadingMore }" @click="loadMoreBookSources">
          <el-icon v-if="loadingMore" class="is-loading">
            <Loading />
          </el-icon>
          {{ loadingMore ? "正在加载" : "加载更多" }}
        </span>
      </div>
    </div>
    <div class="reader-popup__body">
      <p v-if="statusText" class="source-status" :class="{ 'is-error': Boolean(searchError) }">
        {{ statusText }}
      </p>
      <div v-if="filteredBookSources.length" class="source-list">
        <div
          v-for="searchBook in filteredBookSources"
          :key="searchBook.key"
          class="source-item"
          :class="{ selected: isSelected(searchBook) }"
          @click="changeBookSource(searchBook)"
        >
          <div class="source-title">
            <div class="source-name">
              {{ searchBook.originName || "未知书源" }}
            </div>
            <div class="source-time">
              {{ isSelected(searchBook) ? "当前" : formatResponseTime(searchBook.time) }}
            </div>
          </div>
          <div class="source-latest-chapter">
            {{ formatBookSummary(searchBook) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import { ElOption, ElSelect } from "element-plus/es/components/select/index.mjs";
import "element-plus/es/components/icon/style/css.mjs";
import "element-plus/es/components/select/style/css.mjs";
import { Loading } from "@element-plus/icons-vue";
import { useBookSourceSwitcher } from "../composables/useBookSourceSwitcher.js";
import "../styles/reader-popup.css";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  book: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["change-book-source"]);

const {
  bookSourceGroup,
  bookSourceGroupList,
  changeBookSource,
  filteredBookSources,
  formatBookSummary,
  formatResponseTime,
  isSelected,
  loadMoreBookSources,
  loading,
  loadingMore,
  refresh,
  searchError,
  searchRunning,
  statusText
} = useBookSourceSwitcher({ props, emit });
</script>
