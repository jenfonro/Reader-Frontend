<template>
  <div class="popup-wrapper" :style="popupTheme">
    <div class="title-zone">
      <div class="title">来源({{ bookSource.length }})</div>
      <div :class="{ 'title-btn': true, loading: loadingMore }">
        <el-select
          size="mini"
          v-model="bookSourceGroup"
          class="booksource-group-select"
          filterable
          placeholder="全部分组"
        >
          <el-option
            v-for="(item, index) in bookSourceGroupList"
            :key="'source-group-' + index"
            :label="item.name + ' (' + item.count + ')'"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <span :class="{ loading: loading }" @click="refresh">
          <i class="el-icon-loading" v-if="loading"></i>
          {{ loading ? "刷新中..." : "刷新" }}
        </span>
        <span
          :class="{ loading: loadingMore }"
          @click="searchBookSourceByEventStream"
        >
          <i class="el-icon-loading" v-if="loadingMore"></i>
          {{ loadingMore ? "加载中..." : "加载更多" }}
        </span>
      </div>
    </div>
    <div
      class="data-wrapper"
      ref="sourceList"
      :class="{ night: isNight, day: !isNight }"
    >
      <div class="source-list">
        <div
          class="source-item"
          v-for="(searchBook, index) in bookSource"
          :class="{ selected: isSelected(searchBook) }"
          :key="index"
          @click="changeBookSource(searchBook)"
          ref="source"
        >
          <div class="source-title">
            <div class="source-name">
              {{ searchBook.originName }}
            </div>
            <div class="source-time">
              {{ searchBook.time ? "⏱ " + searchBook.time + "ms" : "" }}
            </div>
          </div>
          <div class="source-latest-chapter">
            {{ searchBook.latestChapterTitle || "无最新章节" }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  previewBook,
  previewBookSourceGroups,
  previewBookSources,
  previewTheme
} from "../previewData";

export default {
  name: "BookSource",
  props: ["visible"],
  data() {
    return {
      bookSource: previewBookSources,
      bookSourceGroup: "",
      bookSourceGroupList: previewBookSourceGroups,
      loading: false,
      loadingMore: false,
      isNight: false
    };
  },
  computed: {
    popupTheme() {
      return {
        background: previewTheme.popup
      };
    }
  },
  methods: {
    isSelected(searchBook) {
      return searchBook.bookUrl === previewBook.bookUrl;
    },
    refresh() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 300);
    },
    searchBookSourceByEventStream() {
      this.loadingMore = true;
      setTimeout(() => {
        this.loadingMore = false;
      }, 300);
    },
    changeBookSource(searchBook) {
      this.$emit("changeBookSource", searchBook);
    }
  }
};
</script>

<style lang="stylus" scoped>
.popup-wrapper {
  margin: -16px;
  margin-bottom: -13px;
  padding: 24px;
  padding-top: calc(24px + constant(safe-area-inset-top));
  padding-top: calc(24px + env(safe-area-inset-top));

  .title-zone {
    margin: 0 0 20px 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .title {
    font-size: 18px;
    font-weight: 400;
    font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
    color: #ed4259;
    border-bottom: 1px solid #ed4259;
    width: fit-content;
  }

  .title-btn {
    font-size: 14px;
    line-height: 26px;
    color: #ed4259;
    cursor: pointer;

    .booksource-group-select {
      width: 140px;
    }
    .source-count {
      display: inline-block;
      color: #606266;
    }
    span {
      margin-left: 15px;
    }
    &.loading {
      color: #606266;
    }
  }

  .data-wrapper {
    height: 300px;
    overflow: auto;

    .source-list {
      .source-item {
        width: 100%;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        max-width: 100%;
        overflow: hidden;
        padding: 8px 0;

        .source-title {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;

          .source-name {
            font-size: 16px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

          }
          .source-time {
            float: right;
            font-size: 12px;
          }
        }

        .source-latest-chapter {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #888;
          font-size: 14px;
          margin-top: 6px;
        }

        &.selected {
          .source-name {
            color: #EB4259;
          }
        }
      }
    }
  }

  .data-wrapper::-webkit-scrollbar {
    width: 0 !important;
  }

  .night {
    >>>.source-item {
      border-bottom: 1px solid #333;
    }
  }

  .day {
    >>>.source-item {
      border-bottom: 1px solid #eee;
    }
  }
}
</style>
