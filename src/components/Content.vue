<template>
  <div
    v-if="showContent"
    class="content-body chapter-content reading-chapter"
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
p.reading {
  color: red !important;
}
h3 {
  font-size: 28px;
  line-height: 1.2;
  margin: 1em 0;
  text-align: center;
}
h3.reading {
  color: red !important;
}
.volume-chapter {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  .volume-content {
    text-align: center;
  }

  .volume-tag {
    text-align: right;
  }
}
.content-audio {
  margin: 0 auto;
  width: 100%;

  .book-cover {

    img {
      max-width: 200px;
      margin: 0 auto;
      display: block;
    }
  }

  .book-progress {
    padding: 25px 15px;
    display: flex;
    flex-direction: row;
    align-items: center;

    .progress-tip {
      padding-top: 5px;
      padding-bottom: 5px;
      font-size: 14px;
      width: 45px;
    }

    .progress-container {
      flex: 1;
      margin-left: 10px;
      margin-right: 10px;
    }

    .total-time {
      text-align: right;
    }
  }

  .book-operation {
    padding: 0px 15px 25px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;

    i {
      display: inline-block;
      cursor: pointer;
      font-size: 24px;
      line-height: 1;
    }
  }

  .book-info {
    padding: 10px 15px;
    display: flex;
    flex-direction: row;
    align-items: center;

    .book-cover {
      width: 50px;

      img {
        width: 100%;
        max-height: 100%;
      }
    }

    .book-intro {
      flex: 1;
      padding-left: 15px;

      .title {
        font-size: 16px;
      }

      .subtitle {
        margin-top: 5px;
        font-size: 14px;
      }
    }
  }
}
.epub-iframe {
  border: none;
  width: 100%;
  min-height: calc(var(--vh, 1vh) * 50);
  // pointer-events: none;
}
</style><style lang="stylus">
.content-body {
  img {
    width: 100%;
    max-width: 100vw;
    display: block;
  }
}
.day {
  .content-audio {
    .book-operation {
      color: #222;
    }

    .book-intro {
      .title {
        color: #121212;
      }
      .subtitle {
        color: #666;
      }
    }
  }
}
.night {
  .content-audio {
    .book-operation {
      color: #888;
    }

    .book-intro {
      .title {
        color: #888;
      }
      .subtitle {
        color: #666;
      }
    }
  }
}
</style>
