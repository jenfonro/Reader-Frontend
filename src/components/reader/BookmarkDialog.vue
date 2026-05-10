<script setup>
import { ref } from 'vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'showBookmark', 'editBookmark', 'deleteBookmarks']);

const localSelection = ref([]);
const bookmarks = [
  { bookName: '示例书籍', bookAuthor: '示例作者', chapterName: '第一章 示例章节', bookText: '书签正文', content: '备注' },
  { bookName: '示例书籍', bookAuthor: '示例作者', chapterName: '第三章 示例章节', bookText: '另一条书签正文', content: '备注' },
];

function close() {
  emit('update:modelValue', false);
}
</script>

<template>
  <el-dialog :model-value="modelValue" title="书签" width="760px" top="10vh" class="bookmark-dialog" @close="close">
    <div class="source-container table-container">
      <el-table :data="bookmarks" height="360" @selection-change="localSelection = $event">
        <el-table-column type="selection" width="25" />
        <el-table-column min-width="150px" label="书籍">
          <template #default="scope">{{ scope.row.bookName }} - {{ scope.row.bookAuthor }}</template>
        </el-table-column>
        <el-table-column property="chapterName" label="章节" min-width="150px" />
        <el-table-column property="bookText" label="内容" min-width="150px" />
        <el-table-column property="content" label="备注" min-width="150px" />
        <el-table-column label="操作" width="100px">
          <template #default="scope">
            <el-button type="primary" link @click="emit('showBookmark', scope.row)">跳转</el-button>
            <el-button type="primary" link @click="emit('editBookmark', scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" class="float-left" @click="emit('deleteBookmarks')">批量删除</el-button>
        <span class="check-tip">已选择 {{ localSelection.length }} 个</span>
        <el-button @click="close">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  text-align: right;
}

.float-left {
  float: left;
}

.check-tip {
  margin-right: 16px;
  color: #909399;
}
</style>
