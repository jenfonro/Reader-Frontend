<template>
  <ManageDialog
    :open="open"
    title="导入替换规则"
    title-id="readerReplaceImportTitle"
    variant="wide"
    @close="emit('close')"
  >
    <div class="reader-source-import-panel">
      <label class="reader-source-import-select-all">
        <span class="reader-source-check">
          <input :checked="allChecked" type="checkbox" @change="emit('update:allChecked', $event.target.checked)" />
          <span></span>
        </span>
        <strong>全选</strong>
        <span>{{ selectedCount }}/{{ items.length }}</span>
      </label>

      <div class="reader-source-import-list">
        <label v-for="item in items" :key="item.key" class="reader-source-import-row">
          <span class="reader-source-check">
            <input v-model="selectedKeysModel" type="checkbox" :value="item.key" />
            <span></span>
          </span>
          <span class="reader-source-import-row__body">
            <strong>{{ item.name }}</strong>
            <small>{{ item.group || item.pattern || "未分组" }}</small>
          </span>
          <span class="reader-source-import-row__badge" :class="getBadgeClass(item.status)">
            {{ item.status }}
          </span>
        </label>
      </div>

      <p v-if="message" class="reader-manage-form__error reader-manage-dialog-message">
        {{ message }}
      </p>
      <ManageDialogActions
        confirm-text="确定导入"
        :submitting="submitting"
        submitting-text="导入中..."
        @cancel="emit('close')"
        @confirm="emit('confirm')"
      />
    </div>
  </ManageDialog>
</template>

<script setup>
import { computed } from "vue";
import ManageDialog from "../ManageDialog.vue";
import ManageDialogActions from "../ManageDialogActions.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  selectedKeys: { type: Array, default: () => [] },
  allChecked: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  message: { type: String, default: "" },
  submitting: { type: Boolean, default: false }
});

const emit = defineEmits([
  "update:selectedKeys",
  "update:allChecked",
  "close",
  "confirm"
]);

const selectedKeysModel = computed({
  get: () => props.selectedKeys,
  set: value => emit("update:selectedKeys", value)
});

const getBadgeClass = status => ({
  "is-existing": status === "已有",
  "is-updated": status === "更新"
});
</script>
