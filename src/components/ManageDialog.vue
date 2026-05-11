<template>
  <div
    v-if="open"
    class="reader-manage-dialog-layer"
    :class="{ 'reader-manage-dialog-layer--page': page }"
    role="presentation"
    @pointerdown.self="handleBackdrop"
  >
    <section
      class="reader-manage-dialog"
      :class="variant ? `reader-manage-dialog--${variant}` : ''"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId || undefined"
    >
      <header v-if="$slots.header || title" class="reader-manage-dialog__head">
        <slot name="header">
          <h2 v-if="title" :id="titleId">{{ title }}</h2>
          <slot name="header-actions"></slot>
        </slot>
      </header>
      <slot></slot>
    </section>
  </div>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "" },
  titleId: { type: String, default: "" },
  variant: { type: String, default: "" },
  page: { type: Boolean, default: true },
  closeOnBackdrop: { type: Boolean, default: true }
});

const emit = defineEmits(["close"]);

const handleBackdrop = () => {
  if (!props.closeOnBackdrop) return;
  emit("close");
};
</script>
