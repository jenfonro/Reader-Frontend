<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'search', 'rowClick']);

const searchResultList = [
  { chapterTitle: '第一章 示例章节', resultCountWithinChapter: 1, content: '这里显示搜索到的正文片段。' },
  { chapterTitle: '第二章 示例章节', resultCountWithinChapter: 2, content: '这里显示另一条搜索结果。' },
];

function close() {
  emit('update:modelValue', false);
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    width="720px"
    top="10vh"
    class="search-book-content-dialog"
    @close="close"
  >
    <template #header>
      <div class="custom-dialog-title">
        <span class="el-dialog__title">
          <span class="title-input">
            <el-input
              size="small"
              placeholder="搜索书籍内容"
              class="search-input"
              @keyup.enter="emit('search')"
            >
              <template #prefix><i class="el-input__icon el-icon-search"></i></template>
            </el-input>
          </span>
        </span>
      </div>
    </template>
    <div class="source-container table-container">
      <el-table :data="searchResultList" height="360" @row-click="row => emit('rowClick', row)">
        <el-table-column property="chapterTitle" min-width="100px" label="章节" />
        <el-table-column property="resultCountWithinChapter" width="80px" label="结果" />
        <el-table-column property="content" min-width="220px" label="内容" />
      </el-table>
    </div>
  </el-dialog>
</template>

<style scoped>
.title-input {
  display: inline-block;
  width: 260px;
}
</style>
