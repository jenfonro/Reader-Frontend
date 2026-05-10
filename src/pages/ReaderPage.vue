<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BookmarkDialog from '../components/reader/BookmarkDialog.vue';
import BookInfoDialog from '../components/reader/BookInfoDialog.vue';
import BookShelfPanel from '../components/reader/BookShelfPanel.vue';
import BookSourcePanel from '../components/reader/BookSourcePanel.vue';
import PopCatalogPanel from '../components/reader/PopCatalogPanel.vue';
import ReadSettingsPanel from '../components/reader/ReadSettingsPanel.vue';
import SearchBookContentDialog from '../components/reader/SearchBookContentDialog.vue';

const router = useRouter();
const chapterWrapperRef = ref(null);
const popBookShelfVisible = ref(false);
const popBookSourceVisible = ref(false);
const popCataVisible = ref(false);
const readSettingsVisible = ref(false);
const showToolBar = ref(true);
const showReadBar = ref(false);
const showSpeechConfig = ref(true);
const showClickZone = ref(false);
const showCacheContentZone = ref(false);
const isNight = ref(false);
const windowWidth = ref(window.innerWidth);
const isMiniInterface = ref(windowWidth.value <= 750);
const currentPage = ref(1);
const totalPages = ref(6);
const currentChapter = ref(1);
const totalChapters = ref(24);
const activeDialog = ref('');
const speechSpeaking = ref(false);
const refreshLoading = ref(false);

const readWidthConfig = 800;
const popperWidth = computed(() => (isMiniInterface.value ? windowWidth.value - 33 : readWidthConfig - 33));
const readingProgress = computed(() => `${Math.floor((currentChapter.value * 100) / totalChapters.value)}%`);
const title = computed(() => `第${currentChapter.value}章 示例章节`);
const timeStr = '12:00';

function syncBodyClass() {
  document.body.classList.toggle('mini-interface', isMiniInterface.value);
  document.body.classList.toggle('night-theme', isNight.value);
}

function updateMiniInterface() {
  windowWidth.value = window.innerWidth;
  isMiniInterface.value = windowWidth.value <= 750;
  syncBodyClass();
}

function hidePopovers() {
  popBookShelfVisible.value = false;
  popBookSourceVisible.value = false;
  popCataVisible.value = false;
  readSettingsVisible.value = false;
}

function toShelf() {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.replace('/');
}

function toTop(interval = 0) {
  chapterWrapperRef.value?.scrollTo({ top: 0, behavior: interval ? 'smooth' : 'auto' });
}

function toBottom(interval = 0) {
  const wrapper = chapterWrapperRef.value;
  wrapper?.scrollTo({ top: wrapper.scrollHeight, behavior: interval ? 'smooth' : 'auto' });
}

function getContent(index) {
  currentChapter.value = index + 1;
  currentPage.value = 1;
  hidePopovers();
  toTop(0);
}

function refreshContent() {
  refreshLoading.value = true;
  window.setTimeout(() => {
    refreshLoading.value = false;
  }, 600);
}

function refreshCatalog() {
  refreshContent();
}

function toNextChapter() {
  hidePopovers();
  currentChapter.value = Math.min(currentChapter.value + 1, totalChapters.value);
  currentPage.value = 1;
  toTop(0);
}

function toLastChapter() {
  hidePopovers();
  currentChapter.value = Math.max(currentChapter.value - 1, 1);
  currentPage.value = 1;
  toTop(0);
}

function nextPage() {
  showToolBar.value = false;
  hidePopovers();
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
    return;
  }
  toNextChapter();
}

function prevPage() {
  showToolBar.value = false;
  hidePopovers();
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    return;
  }
  toLastChapter();
}

function toggleAutoReading() {
  showToolBar.value = false;
}

function toogleNight() {
  isNight.value = !isNight.value;
}

function showCacheContent() {
  showCacheContentZone.value = !showCacheContentZone.value;
}

function cacheChapterContent() {}

function cancelCaching() {
  showCacheContentZone.value = false;
}

function showBookmarkDialog() {
  activeDialog.value = 'bookmark';
}

function showSearchBookContentDialog() {
  activeDialog.value = 'search';
}

function showReadingBookInfo() {
  activeDialog.value = 'bookInfo';
}

function closeDialog() {
  activeDialog.value = '';
}

function exitRead() {
  showReadBar.value = false;
}

function speechPrev() {}

function speechNext() {}

function toggleSpeech() {
  speechSpeaking.value = !speechSpeaking.value;
}

function handlerClick(event) {
  if (popBookShelfVisible.value || popBookSourceVisible.value || popCataVisible.value || readSettingsVisible.value) {
    return;
  }

  const midX = window.innerWidth / 2;
  const midY = window.innerHeight / 2;
  if (Math.abs(event.clientY - midY) <= window.innerHeight * 0.2 && Math.abs(event.clientX - midX) <= window.innerWidth * 0.2) {
    if (!showReadBar.value) {
      showToolBar.value = !showToolBar.value;
    }
    return;
  }

  if (event.clientY > midY) {
    nextPage();
    return;
  }
  prevPage();
}

function keydownHandler(event) {
  if (popBookShelfVisible.value || popBookSourceVisible.value || popCataVisible.value || readSettingsVisible.value) {
    return;
  }
  const keyCodeMap = { 37: 'ArrowLeft', 38: 'ArrowUp', 39: 'ArrowRight', 40: 'ArrowDown', 27: 'Escape' };
  const eventKey = event.key || keyCodeMap[event.keyCode];
  switch (eventKey) {
    case 'ArrowLeft':
      event.preventDefault();
      showToolBar.value = false;
      toLastChapter();
      break;
    case 'ArrowRight':
      event.preventDefault();
      showToolBar.value = false;
      toNextChapter();
      break;
    case 'ArrowUp':
      event.preventDefault();
      prevPage();
      break;
    case 'ArrowDown':
      event.preventDefault();
      nextPage();
      break;
    case 'Escape':
      toShelf();
      break;
    default:
      break;
  }
}

watch(isNight, syncBodyClass);

onMounted(() => {
  updateMiniInterface();
  window.addEventListener('resize', updateMiniInterface);
  window.addEventListener('keydown', keydownHandler);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateMiniInterface);
  window.removeEventListener('keydown', keydownHandler);
  document.body.classList.remove('mini-interface');
  document.body.classList.remove('night-theme');
});
</script>

<template>
  <div
    ref="chapterWrapperRef"
    class="chapter-wrapper"
    :class="{
      night: isNight,
      day: !isNight,
      'mini-interface': isMiniInterface,
      'controls-hidden': isMiniInterface && !showToolBar,
    }"
  >
    <div class="tool-bar">
      <div class="tools">
        <el-popover
          placement="right"
          :width="popperWidth"
          trigger="click"
          :show-arrow="false"
          v-model:visible="popBookShelfVisible"
          popper-class="popper-component"
        >
          <BookShelfPanel @change-book="hidePopovers" @refresh-shelf="refreshContent" />
          <template #reference>
            <div class="tool-icon">
              <div class="iconfont">&#58892;</div>
              <div class="icon-text">书架</div>
            </div>
          </template>
        </el-popover>
        <el-popover
          placement="right"
          :width="popperWidth"
          trigger="click"
          :show-arrow="false"
          v-model:visible="popBookSourceVisible"
          popper-class="popper-component"
        >
          <BookSourcePanel @change-book-source="hidePopovers" @refresh="refreshContent" @load-more="refreshContent" />
          <template #reference>
            <div class="tool-icon">
              <div class="tool-el-icon"><i class="el-icon-menu"></i></div>
              <div class="icon-text">书源</div>
            </div>
          </template>
        </el-popover>
        <el-popover
          placement="right"
          :width="popperWidth"
          trigger="click"
          :show-arrow="false"
          v-model:visible="popCataVisible"
          popper-class="popper-component"
        >
          <PopCatalogPanel @get-content="getContent" @refresh="refreshCatalog" @to-top="toTop(0)" @to-bottom="toBottom(0)" @change-rule="refreshContent" />
          <template #reference>
            <div class="tool-icon">
              <div class="iconfont">&#58905;</div>
              <div class="icon-text">目录</div>
            </div>
          </template>
        </el-popover>
        <el-popover
          placement="right"
          :width="popperWidth"
          trigger="click"
          :show-arrow="false"
          v-model:visible="readSettingsVisible"
          popper-class="popper-component"
        >
          <ReadSettingsPanel @show-click-zone="showClickZone = true; readSettingsVisible = false" @reset-config="refreshContent" @show-rule-editor="refreshContent" @noop="refreshContent" />
          <template #reference>
            <div class="tool-icon">
              <div class="iconfont">&#58971;</div>
              <div class="icon-text">设置</div>
            </div>
          </template>
        </el-popover>
        <div class="tool-icon" @click="toShelf" :style="isMiniInterface ? { order: -1 } : {}">
          <div class="iconfont">&#58920;</div>
          <div class="icon-text">首页</div>
        </div>
        <div class="tool-icon" @click="toTop(0)" v-if="!isMiniInterface">
          <div class="iconfont">&#58914;</div>
          <div class="icon-text">顶部</div>
        </div>
        <div class="tool-icon" @click="toBottom(0)" v-if="!isMiniInterface">
          <div class="iconfont">&#58915;</div>
          <div class="icon-text">底部</div>
        </div>
      </div>
    </div>

    <div class="read-bar">
      <div class="float-btn-zone">
        <div class="float-left-btn-zone">
          <div class="float-btn" @click="showBookmarkDialog"><i class="el-icon-collection-tag"></i></div>
          <div class="float-btn" @click="showSearchBookContentDialog"><i class="el-icon-search"></i></div>
          <div class="float-btn" @click="showReadingBookInfo"><i class="el-icon-info"></i></div>
          <div class="float-btn" @click="toTop(0)" v-if="isMiniInterface"><i class="el-icon-top"></i></div>
          <div class="float-btn" @click="toBottom(0)" v-if="isMiniInterface"><i class="el-icon-bottom"></i></div>
        </div>
        <div class="float-right-btn-zone">
          <div class="float-btn" @click="refreshContent"><i v-if="refreshLoading" class="el-icon-loading"></i><i v-else class="el-icon-refresh-right"></i></div>
          <div class="float-btn" @click="toggleAutoReading"><i class="el-icon-view"></i></div>
          <div class="float-btn" @click="showReadBar = !showReadBar"><i class="el-icon-headset"></i></div>
          <div class="float-btn" @click="toogleNight"><i class="el-icon-moon" v-if="!isNight"></i><i class="el-icon-sunny" v-else></i></div>
        </div>
      </div>
      <div class="progress" v-if="isMiniInterface">
        <div class="progress-bar"><div class="slider-runway"><div class="slider-bar"></div><div class="slider-button"></div></div></div>
        <span class="progress-tip">第 {{ currentPage }}/{{ totalPages }} 页</span>
      </div>
      <div class="cache-content-zone" v-if="showCacheContentZone">
        <div>缓存章节</div>
        <div class="cache-content-btn" @click="cacheChapterContent(50)">后面50章</div>
        <div class="cache-content-btn" @click="cacheChapterContent(100)">后面100章</div>
        <div class="cache-content-btn" @click="cacheChapterContent(true)">后面全部</div>
        <div class="caching-cancel-btn" @click="cancelCaching"><i class="el-icon-close"></i></div>
      </div>
      <div class="tools">
        <div class="tool-icon progress-text" @click="showCacheContent"><span v-if="isMiniInterface">阅读进度: </span>{{ readingProgress }}</div>
        <div class="tool-icon" @click="toLastChapter" :style="isMiniInterface ? { order: -1 } : {}">
          <div class="iconfont">&#58920;</div>
          <span v-if="isMiniInterface">上一章</span>
        </div>
        <div class="tool-icon" @click="toNextChapter">
          <span v-if="isMiniInterface">下一章</span>
          <div class="iconfont">&#58913;</div>
        </div>
      </div>
    </div>

    <div class="read-bar speech-read-bar" :class="{ 'is-visible': showReadBar }">
      <div class="reader-bar-inner">
        <div class="operate-bar">
          <div class="close-btn" @click="exitRead"><i class="el-icon-close"></i></div>
          <div class="center">
            <span class="ctrl-btn" @click="speechPrev">上一段</span>
            <span class="play-pause-btn" @click="toggleSpeech"><i class="el-icon-video-pause" v-if="speechSpeaking"></i><i class="el-icon-video-play" v-else></i></span>
            <span class="ctrl-btn" @click="speechNext">下一段</span>
          </div>
          <div class="collapse-btn" @click="showSpeechConfig = !showSpeechConfig"><i class="el-icon-bottom" v-if="showSpeechConfig"></i><i class="el-icon-top" v-else></i></div>
        </div>
        <div class="setting-item" v-if="showSpeechConfig">
          <div class="setting-title">语音库</div>
          <div class="setting-value"><div class="voice-list"><el-radio-group size="small" class="radio-group"><el-radio-button class="radio-button" label="默认语音" /><el-radio-button class="radio-button" label="中文语音" /></el-radio-group></div></div>
        </div>
        <div class="setting-item" v-if="showSpeechConfig">
          <div class="setting-title">语音设置</div>
          <div class="setting-value">
            <div class="progress"><span class="progress-tip">语速</span><div class="progress-bar"><el-slider :model-value="1" :min="0.5" :max="2" :step="0.1" :show-tooltip="false" /></div><span class="setting-btn">重置</span></div>
            <div class="progress"><span class="progress-tip">语调</span><div class="progress-bar"><el-slider :model-value="1" :min="0" :max="2" :step="0.1" :show-tooltip="false" /></div><span class="setting-btn">重置</span></div>
            <div class="progress"><span class="progress-tip">定时</span><div class="progress-bar"><el-slider :model-value="0" :min="0" :max="180" :step="1" :show-tooltip="false" /></div><span class="setting-btn">0分钟</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="chapter">
      <div class="click-zone" v-if="showClickZone">
        <div class="prev-zone"><span>点击前一页</span></div>
        <div class="menu-zone"><span>点击显示菜单</span></div>
        <div class="next-zone"><span>点击后一页</span></div>
        <div class="close-btn" @click="showClickZone = false">关闭</div>
      </div>
      <div class="top-bar">{{ isMiniInterface ? title : '' }}</div>
      <div class="content" @click="handlerClick">
        <div class="content-inner"></div>
      </div>
      <div class="bottom-bar">
        <span v-if="false">第{{ currentPage }}/{{ totalPages }}页 {{ readingProgress }}</span>
        <span v-if="false">{{ timeStr }}</span>
        <span class="bottom-btn" @click="toNextChapter">加载下一章</span>
      </div>
    </div>

    <BookInfoDialog v-if="activeDialog === 'bookInfo'" :model-value="activeDialog === 'bookInfo'" @update:model-value="closeDialog" @save-book="refreshContent" @set-book-group="refreshContent" />
    <SearchBookContentDialog v-if="activeDialog === 'search'" :model-value="activeDialog === 'search'" @update:model-value="closeDialog" @search="refreshContent" @row-click="getContent(0)" />
    <BookmarkDialog v-if="activeDialog === 'bookmark'" :model-value="activeDialog === 'bookmark'" @update:model-value="closeDialog" @show-bookmark="getContent(0)" @edit-bookmark="refreshContent" @delete-bookmarks="refreshContent" />
  </div>
</template>
