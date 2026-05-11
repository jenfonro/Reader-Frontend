<template>
  <div class="reader-manage-list-card">
    <div v-if="loading" class="reader-manage-empty">正在加载书源...</div>
    <div v-else-if="!sources.length" class="reader-manage-empty">
      {{ total ? "没有匹配的书源" : "暂无书源，请先导入" }}
    </div>
    <template v-else>
      <article v-for="source in sources" :key="source.key" class="reader-manage-list-row reader-source-row">
        <label class="reader-source-check" :aria-label="`选择 ${source.name}`">
          <input v-model="selectedModel" type="checkbox" :value="source.key" />
          <span></span>
        </label>
        <div class="reader-manage-row-title">{{ source.name }}</div>
        <label class="reader-source-switch" :aria-label="`${source.enabled ? '禁用' : '启用'} ${source.name}`">
          <input
            :checked="source.enabled"
            type="checkbox"
            @change="emit('enabled-change', source, $event.target.checked)"
          />
          <span></span>
        </label>
        <button
          type="button"
          class="reader-manage-row-icon-button reader-source-row__edit"
          :aria-label="`编辑 ${source.name}`"
          @click="emit('edit', source)"
        >
          <Icon name="edit-square" :size="22" :stroke-width="2.1" />
        </button>
        <button
          type="button"
          class="reader-manage-row-icon-button reader-source-row__more"
          aria-label="书源更多操作"
          @click.stop="emit('toggle-row-menu', source)"
        >
          <span aria-hidden="true"></span>
          <i
            class="reader-source-row__status"
            :class="{
              'is-error': source.status === 'error',
              'is-muted': !source.status
            }"
            aria-hidden="true"
          ></i>
        </button>
        <BookSourceRowMenu
          v-if="activeRowMenuKey === source.key"
          :source="source"
          @close="emit('toggle-row-menu', source)"
          @action="emit('row-menu-action', source, $event)"
        />
      </article>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Icon from "../Icon.vue";
import BookSourceRowMenu from "./BookSourceRowMenu.vue";

const props = defineProps({
  activeRowMenuKey: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  sources: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  selectedSources: { type: Array, default: () => [] }
});

const emit = defineEmits([
  "update:selectedSources",
  "enabled-change",
  "edit",
  "toggle-row-menu",
  "row-menu-action"
]);

const selectedModel = computed({
  get: () => props.selectedSources,
  set: value => emit("update:selectedSources", value)
});
</script>
