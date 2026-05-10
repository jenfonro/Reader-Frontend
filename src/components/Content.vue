<template>
  <div
    v-if="showContent"
    class="reader-text-content"
    :style="containerStyle"
  >
    <h3 data-pos="0">{{ title }}</h3>
    <p
      v-for="paragraph in paragraphs"
      :key="paragraph.pos"
      :style="pStyle"
      :data-pos="paragraph.pos"
      v-html="paragraph.text"
    ></p>
  </div>
  <div v-else></div>
</template>

<script setup>
import { computed } from "vue";
import { previewConfig, previewTheme } from "../previewData";

defineOptions({
  name: "Content"
});

const props = defineProps({
  content: {
    type: String,
    default: ""
  },
  error: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ""
  },
  showContent: {
    type: Boolean,
    default: true
  },
  isScrollRead: {
    type: Boolean,
    default: false
  },
  showChapterList: {
    type: Array,
    default: () => []
  },
  currentShowChapter: {
    type: Object,
    default: null
  }
});

const containerStyle = computed(() => ({
  fontSize: `${previewConfig.fontSize}px`,
  fontWeight: previewConfig.fontWeight || undefined,
  color: previewConfig.fontColor,
  background: previewTheme.content
}));

const pStyle = computed(() => ({
  lineHeight: previewConfig.lineHeight,
  marginTop: `${previewConfig.paragraphSpace}em`,
  marginBottom: `${previewConfig.paragraphSpace}em`
}));

const paragraphs = computed(() => {
  let wordCount = (props.title || "").length + 2;
  return String(props.content || "")
    .split(/\n+/)
    .map(paragraph => paragraph.replace(/^\s+/g, ""))
    .filter(Boolean)
    .map(text => {
      const pos = wordCount;
      wordCount += text.length + 2;
      return { pos, text };
    });
});
</script>

<style lang="stylus" scoped>
p {
  display: block;
  word-wrap: break-word;
  word-break: break-all;
  text-indent: 2em;
}
h3 {
  font-size: 28px;
  line-height: 1.2;
  margin: 1em 0;
  text-align: center;
}
</style><style lang="stylus">
.reader-text-content {
  img {
    width: 100%;
    max-width: 100vw;
    display: block;
  }
}
</style>
