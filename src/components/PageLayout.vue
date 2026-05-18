<template>
  <div class="reader-content reader-page-layout" :class="rootClass">
    <header class="reader-page-header" :class="headerClass">
      <slot name="header"></slot>
    </header>

    <main class="reader-page-body" :class="bodyClass">
      <slot></slot>
    </main>

    <footer v-if="hasFooter" class="reader-page-footer" :class="footerClass">
      <slot name="footer"></slot>
    </footer>

    <slot name="overlay"></slot>
  </div>
</template>

<script setup>
import { computed, useSlots } from "vue";

defineOptions({
  name: "PageLayout"
});

defineProps({
  rootClass: { type: [String, Array, Object], default: "" },
  headerClass: { type: [String, Array, Object], default: "" },
  bodyClass: { type: [String, Array, Object], default: "" },
  footerClass: { type: [String, Array, Object], default: "" }
});

const slots = useSlots();
const hasFooter = computed(() => Boolean(slots.footer));
</script>
