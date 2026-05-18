<template>
  <div
    v-if="showContent"
    class="reader-text-content"
    :style="containerStyle"
  >
    <h3 data-pos="0">{{ displayTitle }}</h3>
    <p
      v-for="paragraph in paragraphs"
      :key="paragraph.pos"
      :style="pStyle"
      :data-pos="paragraph.pos"
    >{{ paragraph.text }}</p>
  </div>
  <div v-else></div>
</template>

<script setup>
import { computed } from "vue";
import { getReaderTheme } from "../previewData";
import { normalizeReaderSettings } from "../data/readerSettings";
import { convertChineseText } from "../utils/chinese";

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

const resolvedConfig = computed(() => normalizeReaderSettings(props.readerConfig));

const readerFontFamilies = {
  0: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
  1: 'reader-ht, "Microsoft YaHei", "PingFang SC", sans-serif',
  2: 'reader-kt, Kaiti, "Kaiti SC", serif',
  3: 'reader-st, "Songti SC", SimSun, serif',
  4: 'reader-fs, FangSong, serif'
};

const fontSize = computed(() => resolvedConfig.value.fontSize);

const fontFamily = computed(() =>
  readerFontFamilies[resolvedConfig.value.font] || readerFontFamilies[0]
);

const convertByConfig = text => convertChineseText(text, resolvedConfig.value.chineseFont);
const displayTitle = computed(() => convertByConfig(props.title));
const displayContent = computed(() => convertByConfig(props.content));

const getPixelConfig = name => Math.max(0, Number(resolvedConfig.value[name]) || 0);

const containerStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontWeight: resolvedConfig.value.fontWeight || undefined,
  color: resolvedConfig.value.fontColor,
  background: getReaderTheme(resolvedConfig.value.theme).content,
  padding: `${getPixelConfig("pageTopMargin")}px ${getPixelConfig("pageHorizontalMargin")}px ${getPixelConfig("pageBottomMargin")}px`,
  boxSizing: "border-box",
  fontSynthesis: "none"
}));

const pStyle = computed(() => ({
  fontSize: `${fontSize.value}px`,
  lineHeight: resolvedConfig.value.lineHeight,
  marginTop: `${resolvedConfig.value.paragraphSpace}em`,
  marginBottom: `${resolvedConfig.value.paragraphSpace}em`
}));

const paragraphs = computed(() => {
  let wordCount = displayTitle.value.length + 2;
  return displayContent.value
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
  font-family: inherit;
  font-weight: inherit;
}
h3 {
  font-family: inherit;
  font-size: 28px;
  font-weight: inherit;
  line-height: 1.2;
  margin: 1em 0;
  text-align: center;
}
</style>
