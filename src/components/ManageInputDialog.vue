<template>
  <ManageDialog
    :open="open"
    :title="title"
    :title-id="titleId"
    :variant="variant"
    @close="emit('close')"
  >
    <form class="reader-manage-form" @submit.prevent="emit('submit')">
      <label>
        <span>{{ label }}</span>
        <input
          :value="modelValue"
          :type="type"
          :min="min"
          :inputmode="inputmode"
          :autocomplete="autocomplete"
          :placeholder="placeholder"
          @input="handleInput"
        />
      </label>
      <p v-if="message" class="reader-manage-form__error">{{ message }}</p>
      <ManageDialogActions
        confirm-type="submit"
        :confirm-text="confirmText"
        :submitting="submitting"
        :submitting-text="submittingText"
        @cancel="emit('close')"
      />
    </form>
  </ManageDialog>
</template>

<script setup>
import ManageDialog from "./ManageDialog.vue";
import ManageDialogActions from "./ManageDialogActions.vue";

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  titleId: { type: String, default: "" },
  label: { type: String, required: true },
  modelValue: { type: [String, Number], default: "" },
  type: { type: String, default: "text" },
  min: { type: [String, Number], default: undefined },
  inputmode: { type: String, default: undefined },
  autocomplete: { type: String, default: "off" },
  placeholder: { type: String, default: "" },
  message: { type: String, default: "" },
  variant: { type: String, default: "" },
  confirmText: { type: String, default: "确定" },
  submitting: { type: Boolean, default: false },
  submittingText: { type: String, default: "处理中..." }
});

const emit = defineEmits(["update:modelValue", "close", "submit"]);

const handleInput = event => {
  const value = event.target.value;
  emit("update:modelValue", value);
};
</script>
