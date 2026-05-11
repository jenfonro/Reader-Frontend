<template>
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

  <section v-if="activeMenu === 'group'" class="reader-manage-menu reader-replace-menu--group">
    <button type="button" class="reader-manage-menu__button" @click="emit('open-group-dialog')">
      分组管理
    </button>
    <button type="button" class="reader-manage-menu__button" @click="emit('select-group', '')">
      全部分组
    </button>
    <button type="button" class="reader-manage-menu__button" @click="emit('select-group', '__NO_GROUP__')">
      无分组
    </button>
    <button
      v-for="item in groups"
      :key="item"
      type="button"
      class="reader-manage-menu__button"
      @click="emit('select-group', item)"
    >
      {{ item }}
    </button>
  </section>

  <section v-if="activeMenu === 'more'" class="reader-manage-menu reader-replace-menu--more">
    <button
      v-for="item in moreActions"
      :key="item.label"
      type="button"
      class="reader-manage-menu__action"
      @click="emit('more-action', item)"
    >
      <span class="reader-manage-menu__action-icon" aria-hidden="true">
        <Icon v-if="item.iconName" :name="item.iconName" :size="22" />
        <template v-else>{{ item.icon }}</template>
      </span>
      <span>{{ item.label }}</span>
    </button>
  </section>
</template>

<script setup>
import Icon from "../Icon.vue";

defineProps({
  activeMenu: { type: String, default: "" },
  groups: { type: Array, default: () => [] },
  moreActions: { type: Array, default: () => [] }
});

const emit = defineEmits([
  "toggle-menu",
  "open-group-dialog",
  "select-group",
  "more-action"
]);
</script>
