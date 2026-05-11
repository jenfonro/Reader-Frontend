<template>
  <ManageDialog
    :open="open"
    :title="title"
    :title-id="titleId"
    :variant="variant"
    @close="emit('close')"
  >
    <p class="reader-manage-confirm-text">{{ text }}</p>
    <p v-if="message" class="reader-manage-form__error reader-manage-dialog-message">
      {{ message }}
    </p>
    <ManageDialogActions
      :confirm-text="confirmText"
      :confirm-variant="confirmVariant"
      :submitting="submitting"
      :submitting-text="submittingText"
      @cancel="emit('close')"
      @confirm="emit('confirm')"
    />
  </ManageDialog>
</template>

<script setup>
import ManageDialog from "./ManageDialog.vue";
import ManageDialogActions from "./ManageDialogActions.vue";

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  titleId: { type: String, default: "" },
  text: { type: String, required: true },
  message: { type: String, default: "" },
  variant: { type: String, default: "narrow" },
  confirmText: { type: String, default: "确定" },
  confirmVariant: { type: String, default: "primary" },
  submitting: { type: Boolean, default: false },
  submittingText: { type: String, default: "处理中..." }
});

const emit = defineEmits(["close", "confirm"]);
</script>
