<template>
  <div class="reader-source-row-menu-layer" role="presentation" @pointerdown.stop="emit('close')">
    <section class="reader-manage-menu reader-source-row-menu" @pointerdown.stop>
      <button type="button" class="reader-manage-menu__button" @click="emit('action', 'top')">
        置顶
      </button>
      <button type="button" class="reader-manage-menu__button" @click="emit('action', 'bottom')">
        置底
      </button>
      <button
        v-if="source?.hasExplore"
        type="button"
        class="reader-manage-menu__button"
        @click="emit('action', 'toggle-explore')"
      >
        {{ source.enabledExplore ? "禁用发现" : "启用发现" }}
      </button>
      <button type="button" class="reader-manage-menu__button is-danger" @click="emit('action', 'delete')">
        删除
      </button>
    </section>
  </div>
</template>

<script setup>
defineProps({
  source: { type: Object, default: null }
});

const emit = defineEmits(["action", "close"]);
</script>
