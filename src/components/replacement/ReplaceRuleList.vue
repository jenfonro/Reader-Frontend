<template>
  <div class="reader-manage-list-card">
    <div v-if="loading" class="reader-manage-empty">正在加载替换规则...</div>
    <div v-else-if="!rules.length" class="reader-manage-empty">
      {{ total ? "没有匹配的替换规则" : "暂无替换规则，请先新建" }}
    </div>
    <template v-else>
      <article v-for="rule in rules" :key="rule.key" class="reader-manage-list-row reader-replace-row">
        <label class="reader-source-check" :aria-label="`选择 ${rule.displayName}`">
          <input v-model="selectedModel" type="checkbox" :value="rule.key" />
          <span></span>
        </label>
        <div class="reader-manage-row-title">{{ rule.displayName }}</div>
        <label class="reader-source-switch" :aria-label="`${rule.isEnabled ? '禁用' : '启用'} ${rule.displayName}`">
          <input
            :checked="rule.isEnabled"
            type="checkbox"
            @change="emit('enabled-change', rule, $event.target.checked)"
          />
          <span></span>
        </label>
        <button
          type="button"
          class="reader-manage-row-icon-button reader-source-row__edit"
          :aria-label="`编辑 ${rule.displayName}`"
          @click="emit('edit', rule)"
        >
          <Icon name="edit-square" :size="22" :stroke-width="2.1" />
        </button>
        <button
          type="button"
          class="reader-manage-row-icon-button reader-source-row__more"
          aria-label="替换规则更多操作"
          @click.stop="emit('toggle-row-menu', rule)"
        >
          <span aria-hidden="true"></span>
        </button>
        <ManageRowMenu
          v-if="activeRowMenuKey === rule.key"
          :items="replaceRuleRowMenuItems"
          @close="emit('toggle-row-menu', rule)"
          @action="emit('row-menu-action', rule, $event)"
        />
      </article>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Icon from "../Icon.vue";
import ManageRowMenu from "../ManageRowMenu.vue";

const props = defineProps({
  activeRowMenuKey: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  rules: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  selectedRules: { type: Array, default: () => [] }
});

const emit = defineEmits([
  "update:selectedRules",
  "enabled-change",
  "edit",
  "toggle-row-menu",
  "row-menu-action"
]);

const replaceRuleRowMenuItems = [
  { label: "置顶", value: "top" },
  { label: "置底", value: "bottom" },
  { label: "删除", value: "delete", danger: true }
];

const selectedModel = computed({
  get: () => props.selectedRules,
  set: value => emit("update:selectedRules", value)
});
</script>
