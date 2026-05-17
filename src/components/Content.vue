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
import { getReaderTheme, previewConfig } from "../previewData";

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
  readerConfig: {
    type: Object,
    default: null
  }
});

const resolvedConfig = computed(() => ({
  ...previewConfig,
  ...(props.readerConfig || {})
}));

const fontSize = computed(() => {
  const parsedSize = Number(resolvedConfig.value.fontSize);
  return Number.isFinite(parsedSize) ? parsedSize : previewConfig.fontSize;
});

const getPixelConfig = name => {
  const parsedValue = Number(resolvedConfig.value[name]);
  const fallbackValue = Number(previewConfig[name]) || 0;
  return Math.max(0, Number.isFinite(parsedValue) ? parsedValue : fallbackValue);
};

const containerStyle = computed(() => ({
  fontWeight: resolvedConfig.value.fontWeight || undefined,
  color: resolvedConfig.value.fontColor,
  background: getReaderTheme(resolvedConfig.value.theme).content,
  padding: `${getPixelConfig("pageTopMargin")}px ${getPixelConfig("pageHorizontalMargin")}px ${getPixelConfig("pageBottomMargin")}px`,
  boxSizing: "border-box"
}));

const pStyle = computed(() => ({
  fontSize: `${fontSize.value}px`,
  lineHeight: resolvedConfig.value.lineHeight,
  marginTop: `${resolvedConfig.value.paragraphSpace}em`,
  marginBottom: `${resolvedConfig.value.paragraphSpace}em`
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
