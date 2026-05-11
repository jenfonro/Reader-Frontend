<template>
  <ManageDialog
    :open="open"
    title="分组管理"
    title-id="readerSourceGroupTitle"
    variant="wide"
    @close="emit('close')"
  >
    <template #header-actions>
      <button type="button" aria-label="新增分组">＋</button>
    </template>

    <div class="reader-source-group-list">
      <div v-if="!groups.length" class="reader-manage-empty">暂无分组</div>
      <div v-for="item in groups" :key="item" class="reader-source-group-item">
        <span>{{ item }}</span>
        <div>
          <button type="button">编辑</button>
          <button type="button">删除</button>
        </div>
      </div>
    </div>
  </ManageDialog>
</template>

<script setup>
import ManageDialog from "../ManageDialog.vue";

defineProps({
  open: { type: Boolean, default: false },
  groups: { type: Array, default: () => [] }
});

const emit = defineEmits(["close"]);
</script>
