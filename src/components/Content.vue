<script>
import { getWindowSize, previewConfig, previewTheme } from "../previewData";

export default {
  name: "Content",
  props: [
    "content",
    "error",
    "title",
    "showContent",
    "isScrollRead",
    "showChapterList",
    "currentShowChapter"
  ],
  computed: {
    fontSize() {
      return previewConfig.fontSize + "px";
    },
    containerStyle() {
      return {
        fontSize: previewConfig.fontSize + "px",
        fontWeight: previewConfig.fontWeight || undefined,
        color: previewConfig.fontColor,
        background: previewTheme.content
      };
    },
    pStyle() {
      return {
        lineHeight: previewConfig.lineHeight,
        marginTop: previewConfig.paragraphSpace + "em",
        marginBottom: previewConfig.paragraphSpace + "em"
      };
    },
    windowSize() {
      return getWindowSize();
    }
  },
  render(h) {
    if (!this.showContent) {
      return h("div");
    }
    let wordCount = (this.title || "").length + 2;
    const children = [h("h3", { attrs: { "data-pos": 0 } }, this.title)];
    String(this.content || "")
      .split(/\n+/)
      .forEach(paragraph => {
        const text = paragraph.replace(/^\s+/g, "");
        if (!text) {
          return;
        }
        const pos = wordCount;
        wordCount += text.length + 2;
        children.push(
          h("p", {
            style: this.pStyle,
            domProps: { innerHTML: text },
            attrs: { "data-pos": pos }
          })
        );
      });
    return h(
      "div",
      {
        class: "content-body chapter-content reading-chapter",
        style: this.containerStyle
      },
      children
    );
  }
};
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
