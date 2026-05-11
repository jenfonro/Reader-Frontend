<template>
  <div class="reader-manage-dialog__actions">
    <button type="button" @click="emit('cancel')">{{ cancelText }}</button>
    <button
      :type="confirmType"
      :class="confirmClass"
      :disabled="submitting"
      @click="handleConfirmClick"
    >
      {{ submitting ? submittingText : confirmText }}
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  cancelText: { type: String, default: "取消" },
  confirmText: { type: String, default: "确定" },
  confirmType: { type: String, default: "button" },
  confirmVariant: { type: String, default: "primary" },
  submitting: { type: Boolean, default: false },
  submittingText: { type: String, default: "处理中..." }
});

const emit = defineEmits(["cancel", "confirm"]);

const confirmClass = computed(() => {
  if (!props.confirmVariant) return "";
  return `is-${props.confirmVariant}`;
});

const handleConfirmClick = () => {
  if (props.confirmType === "submit") return;
  emit("confirm");
};
</script>
