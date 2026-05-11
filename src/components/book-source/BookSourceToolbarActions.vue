<template>
  <button
    type="button"
    class="reader-manage-icon-button reader-source-sort-btn"
    :class="{ 'is-active': activeMenu === 'sort' }"
    aria-label="排序"
    @click.stop="emit('toggle-menu', 'sort')"
  >
    AŽ
  </button>
  <button
    type="button"
    class="reader-manage-icon-button"
    :class="{ 'is-active': activeMenu === 'group' }"
    aria-label="分组"
    @click.stop="emit('toggle-menu', 'group')"
  >
    <Icon name="source-group" :size="22" :stroke-width="2.1" />
  </button>
  <button
    type="button"
    class="reader-manage-icon-button"
    :class="{ 'is-active': activeMenu === 'more' }"
    aria-label="更多"
    @click.stop="emit('toggle-menu', 'more')"
  >
    <span class="reader-source-more-icon" aria-hidden="true"></span>
  </button>

  <section v-if="activeMenu === 'sort'" class="reader-manage-menu reader-source-menu--sort">
    <label class="reader-manage-menu__item">
      <span>反序</span>
      <input
        :checked="reverseSort"
        type="checkbox"
        @change="emit('update:reverseSort', $event.target.checked)"
      />
    </label>
    <label v-for="item in sortItems" :key="item.value" class="reader-manage-menu__item">
      <span>{{ item.label }}</span>
      <input
        :checked="sortMode === item.value"
        type="radio"
        name="sourceSort"
        :value="item.value"
        @change="emit('update:sortMode', item.value)"
      />
    </label>
  </section>

  <section v-if="activeMenu === 'group'" class="reader-manage-menu reader-source-menu--group">
    <button type="button" class="reader-manage-menu__button" @click="emit('open-group-dialog')">
      分组管理
    </button>
    <button v-for="item in groupFilters" :key="item" type="button" class="reader-manage-menu__button">
      {{ item }}
    </button>
  </section>

  <section v-if="activeMenu === 'more'" class="reader-manage-menu reader-source-menu--more">
    <button
      v-for="item in moreActions"
      :key="item.label"
      type="button"
      class="reader-manage-menu__action"
      @click="emit('more-action', item)"
    >
      <span class="reader-manage-menu__action-icon" aria-hidden="true">{{ item.icon }}</span>
      <span>{{ item.label }}</span>
    </button>
  </section>
</template>

<script setup>
import Icon from "../Icon.vue";

defineProps({
  activeMenu: { type: String, default: "" },
  reverseSort: { type: Boolean, default: false },
  sortMode: { type: String, default: "manual" },
  sortItems: { type: Array, default: () => [] },
  groupFilters: { type: Array, default: () => [] },
  moreActions: { type: Array, default: () => [] }
});

const emit = defineEmits([
  "toggle-menu",
  "update:reverseSort",
  "update:sortMode",
  "open-group-dialog",
  "more-action"
]);
</script>
