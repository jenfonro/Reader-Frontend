<template>
  <div class="reader-popup">
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
          {{ refreshLoading ? "正在加载" : "刷新" }}
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
            {{ getDisplayTitle(note.title) }}
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
import "../styles/reader-popup.css";
import { convertChineseText } from "../utils/chinese";

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
  },
  chineseFont: {
    type: String,
    default: "简体"
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
const isSelected = note => note.index === props.currentIndex;
const getDisplayTitle = title => convertChineseText(title, props.chineseFont);

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
