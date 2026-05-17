<template>
  <form class="reader-search-bar" role="search" @submit.prevent="submitSearch">
    <label class="reader-search reader-search-bar__input">
      <Icon name="search" :size="20" />
      <input
        :value="modelValue"
        type="search"
        autocomplete="off"
        :placeholder="placeholder"
        @input="updateValue"
      />
      <button
        v-if="modelValue"
        class="reader-search-bar__clear"
        type="button"
        aria-label="清空搜索"
        @click="clearSearch"
      >×</button>
    </label>
    <button class="reader-search-bar__button" type="submit">{{ buttonLabel }}</button>
  </form>
</template>

<script setup>
import Icon from "./Icon.vue";

defineOptions({
  name: "SearchBar"
});

const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "搜索书名、作者、关键词..." },
  buttonLabel: { type: String, default: "搜索" }
});

const emit = defineEmits(["update:modelValue", "submit", "clear"]);

const updateValue = event => {
  emit("update:modelValue", event.target.value);
};

const clearSearch = () => {
  emit("update:modelValue", "");
  emit("clear");
};

const submitSearch = () => {
  emit("submit", props.modelValue.trim());
};
</script>

<style scoped>
.reader-search-bar {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--reader-search-bar-gap, 10px);
}

.reader-search-bar__input.reader-search {
  width: 100%;
  height: var(--reader-search-bar-input-height, 44px);
  border-radius: var(--reader-search-bar-input-radius, 18px);
}

.reader-search-bar__clear {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 26px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(118, 118, 128, 0.14);
  color: #8e8e93;
  font-size: 18px;
  line-height: 1;
  font-weight: 400;
}

.reader-search-bar__clear:hover {
  background: rgba(118, 118, 128, 0.22);
}

.reader-search-bar__button {
  height: var(--reader-search-bar-button-height, 42px);
  padding: 0 var(--reader-search-bar-button-x, 12px);
  border: 0;
  border-radius: var(--reader-search-bar-button-radius, 14px);
  background: transparent;
  color: var(--reader-blue, var(--reader-app-accent, #007aff));
  font-size: 14px;
  line-height: 1;
  font-weight: 650;
  white-space: nowrap;
}

.reader-search-bar__button:hover {
  background: rgba(0, 122, 255, 0.08);
}
</style>
