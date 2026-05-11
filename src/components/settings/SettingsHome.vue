<template>
  <section
    v-for="(group, index) in settingsGroups"
    :key="index"
    class="reader-settings-list-card"
  >
    <button
      v-for="item in group"
      :key="item.key"
      type="button"
      class="reader-settings-list-item"
      @click="emit('select', item.key)"
    >
      <span class="reader-settings-list-item__icon">
        <Icon :name="item.icon" :size="22" />
      </span>
      <span class="reader-settings-list-item__copy">
        <strong>{{ item.label }}</strong>
        <span>{{ item.description }}</span>
      </span>
      <span class="reader-settings-list-item__chevron" aria-hidden="true">›</span>
    </button>
  </section>
</template>

<script setup>
import { computed } from "vue";
import Icon from "../Icon.vue";
import { settingsItems } from "../../data/settings";

const emit = defineEmits(["select"]);

const settingsGroups = computed(() =>
  [settingsItems.slice(0, 3), settingsItems.slice(3, 6), settingsItems.slice(6)].filter(
    group => group.length
  )
);
</script>
