<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'saveBook', 'setBookGroup']);

function close() {
  emit('update:modelValue', false);
}
</script>

<template>
  <el-dialog :model-value="modelValue" title="书籍信息" width="520px" top="10vh" class="book-info-dialog" @close="close">
    <div class="book-info-container">
      <div class="book-cover">
        <div class="book-cover-bg"></div>
        <div class="book-cover-bg-image"><div class="static-cover">示例</div></div>
      </div>
      <div class="book-name">示例书籍</div>
      <div class="book-kind">玄幻 · 连载</div>
      <div class="book-props">
        <div class="book-prop book-author">作者： 示例作者</div>
        <div class="book-prop book-origin">来源： 示例书源</div>
        <div class="book-prop book-latest"><span class="latest-title">最新： 第一百二十章 风起</span></div>
        <div class="book-prop book-group">分组： 默认分组 <el-button type="primary" link class="book-prop-btn" @click="emit('setBookGroup')">设置分组</el-button></div>
        <div class="book-prop book-operate-zone"><el-tag type="success" class="book-operate-btn" @click="emit('saveBook')">加入书架</el-tag></div>
      </div>
      <div class="book-intro">这里是书籍简介占位，用于复刻 reader-server 的书籍信息弹窗布局。</div>
    </div>
  </el-dialog>
</template>

<style scoped>
.book-info-container {
  text-align: center;
}

.book-cover {
  width: 112px;
  height: 150px;
  margin: 0 auto 14px;
  position: relative;
}

.book-cover-bg,
.book-cover-bg-image {
  position: absolute;
  inset: 0;
}

.book-cover-bg {
  background: #b99c70;
  filter: blur(12px);
  opacity: 0.4;
}

.book-cover-bg-image {
  background: #e8d7b8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.static-cover {
  color: #8b6f4d;
}

.book-name {
  font-size: 20px;
  margin-bottom: 6px;
}

.book-kind,
.book-prop,
.book-intro {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.book-props,
.book-intro {
  text-align: left;
}
</style>
