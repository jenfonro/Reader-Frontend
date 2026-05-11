<template>
  <div class="reader-replace-row-menu-layer" role="presentation" @pointerdown.stop="emit('close')">
    <section class="reader-manage-menu reader-replace-row-menu" @pointerdown.stop>
      <button type="button" class="reader-manage-menu__button" @click="emit('action', 'top')">
        置顶
      </button>
      <button type="button" class="reader-manage-menu__button" @click="emit('action', 'bottom')">
        置底
      </button>
      <button type="button" class="reader-manage-menu__button is-danger" @click="emit('action', 'delete')">
        删除
      </button>
    </section>
  </div>
</template>

<script setup>
defineEmits(["action", "close"]);
</script>
