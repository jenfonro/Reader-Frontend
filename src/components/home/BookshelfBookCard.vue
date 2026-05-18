<template>
  <article
    class="home-book-card"
    :class="{ 'is-menu-active': active }"
    @click="emit('open', book)"
    @contextmenu.prevent="emit('context-menu', book, $event, { suppressBookClick: false })"
    @pointerdown="emit('pointer-down', book, $event)"
    @pointermove="emit('pointer-move', $event)"
    @pointerup="emit('pointer-end')"
    @pointercancel="emit('pointer-end')"
    @pointerleave="emit('pointer-end')"
  >
    <div class="home-book-card__cover-wrap">
      <img
        class="home-book-card__cover"
        :src="book.coverUrl || noCoverImage"
        :alt="book.name"
        loading="lazy"
        @error="useFallbackCover"
      />
    </div>
    <div class="home-book-card__name">{{ book.name }}</div>
    <div class="home-book-card__chapter">{{ chapterText }}</div>
    <button
      v-if="historyTab"
      type="button"
      class="home-book-card__shelf-button"
      :disabled="inShelf"
      @click.stop="emit('add-to-shelf', book)"
      @pointerdown.stop
    >
      {{ inShelf ? "已在书架" : "加入书架" }}
    </button>
  </article>
</template>

<script setup>
const props = defineProps({
  active: { type: Boolean, default: false },
  book: { type: Object, required: true },
  chapterText: { type: String, required: true },
  historyTab: { type: Boolean, default: false },
  inShelf: { type: Boolean, default: false },
  noCoverImage: { type: String, required: true }
});

const emit = defineEmits([
  "add-to-shelf",
  "context-menu",
  "open",
  "pointer-down",
  "pointer-end",
  "pointer-move"
]);

const useFallbackCover = event => {
  if (event.target.src !== props.noCoverImage) {
    event.target.src = props.noCoverImage;
  }
};
</script>
