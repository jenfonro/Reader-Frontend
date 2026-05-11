<template>
  <div
    ref="rootElement"
    class="reader-manage"
    :class="[
      `reader-manage--${variant}`,
      {
        'reader-manage--no-footer': !hasFooter,
        'reader-manage--no-toolbar': !hasToolbar
      }
    ]"
  >
    <header v-if="hasToolbar" class="reader-manage__toolbar">
      <div class="reader-manage__toolbar-main">
        <slot name="toolbar-main">
          <h1 v-if="title">{{ title }}</h1>
        </slot>
      </div>
      <div class="reader-manage__toolbar-actions">
        <slot name="toolbar-actions"></slot>
      </div>
    </header>

    <main class="reader-manage__body" :aria-label="normalizedBodyLabel">
      <slot></slot>
    </main>

    <footer v-if="hasFooter" class="reader-manage__footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, useSlots } from "vue";

const props = defineProps({
  title: { type: String, default: "" },
  variant: { type: String, default: "default" },
  bodyLabel: { type: String, default: "内容" }
});

const slots = useSlots();
const rootElement = ref(null);
const hasFooter = computed(() => Boolean(slots.footer));
const hasToolbarMain = computed(() => Boolean(slots["toolbar-main"]));
const hasToolbarActions = computed(() => Boolean(slots["toolbar-actions"]));
const hasToolbar = computed(
  () => Boolean(props.title) || hasToolbarMain.value || hasToolbarActions.value
);
const normalizedBodyLabel = computed(() => props.bodyLabel || props.title || "内容");
const getRootElement = () => rootElement.value;

defineExpose({ getRootElement });
</script>
