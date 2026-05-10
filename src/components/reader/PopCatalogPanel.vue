<script setup>
import { computed, ref } from 'vue';

const emit = defineEmits(['getContent', 'refresh', 'toTop', 'toBottom', 'changeRule']);

const refreshLoading = ref(false);
const asc = ref(true);
const catalog = Array.from({ length: 24 }, (_, index) => ({
  index,
  title: `第${index + 1}章 示例章节`,
  cached: index < 4,
}));

const cataList = computed(() => (asc.value ? catalog : [...catalog].reverse()));

function refreshChapter() {
  refreshLoading.value = true;
  emit('refresh');
  window.setTimeout(() => {
    refreshLoading.value = false;
  }, 600);
}
</script>

<template>
  <div class="popup-wrapper">
    <div class="title-zone">
      <div class="title">
        目录
        <span v-if="catalog.length">({{ catalog.length }})</span>
      </div>
      <div class="title-btn">
        <span class="span-btn" @click="asc = !asc">{{ asc ? '倒序' : '顺序' }}</span>
        <span class="span-btn" @click="emit('toTop')">顶部</span>
        <span class="span-btn" @click="emit('toBottom')">底部</span>
        <span class="span-btn" @click="emit('changeRule')">修改规则</span>
        <span :class="{ loading: refreshLoading, 'refresh-btn': true }" @click="refreshChapter">
          {{ refreshLoading ? '刷新中...' : '刷新' }}
        </span>
      </div>
    </div>
    <div class="data-wrapper day">
      <div class="cata">
        <div
          v-for="note in cataList"
          :key="note.index"
          class="log"
          :class="{ selected: note.index === 0 }"
          @click="emit('getContent', note.index)"
        >
          <div class="log-text" :class="{ cached: note.cached }">{{ note.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-wrapper {
  margin: -16px;
  margin-bottom: -13px;
  padding: 24px;
  padding-top: calc(24px + constant(safe-area-inset-top));
  padding-top: calc(24px + env(safe-area-inset-top));
  background: var(--reader-popup-bg);
}

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
  color: #ed4259;
  border-bottom: 1px solid #ed4259;
  width: fit-content;
}

.title-btn {
  font-size: 14px;
  line-height: 26px;
  color: #606266;
}

.span-btn,
.refresh-btn {
  display: inline-block;
  color: #ed4259;
  margin-left: 15px;
  cursor: pointer;
}

.refresh-btn.loading {
  color: #606266;
}

.data-wrapper {
  height: 300px;
  overflow: auto;
}

.data-wrapper::-webkit-scrollbar {
  width: 0 !important;
}

.cata {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

.log {
  width: 50%;
  height: 40px;
  cursor: pointer;
  float: left;
  border-bottom: 1px solid #eee;
  font: 16px / 40px PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', 'Microsoft YaHei', sans-serif;
}

.log-text {
  margin-right: 26px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.cached {
  color: #bbb !important;
}

.selected .log-text {
  color: #eb4259 !important;
}

@media screen and (max-width: 500px) {
  .log {
    width: 100%;
  }

  .log-text {
    margin-right: 0;
  }
}
</style>
