<template>
  <div
    class="index-wrapper"
    :class="{
      night: isNight,
      day: !isNight
    }"
  >
    <div
      class="navigation-wrapper"
      :class="[
        navigationClass,
        isWebApp && !isNight ? 'status-bar-light-bg' : ''
      ]"
      :style="navigationStyle"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      v-if="$store.getters.isNormalPage"
    >
      <div class="navigation-inner-wrapper">
        <div class="navigation-title">
          阅读
        </div>
        <div class="navigation-sub-title">
          清风不识字，何故乱翻书
        </div>
        <div class="search-wrapper">
          <el-input
            size="mini"
            placeholder="搜索书籍"
            class="search-input"
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
        <div class="setting-wrapper search-setting">
          <div class="setting-title">
            搜索设置
          </div>
          <div class="setting-item">
            <el-select
              size="mini"
              class="setting-select"
              filterable
              placeholder="请选择搜索方式"
            >
              <el-option
              >
              </el-option>
            </el-select>
          </div>
          <div
            class="setting-item"
          >
            <el-select
              size="mini"
              class="setting-select"
              filterable
              placeholder="请选择搜索书源"
            >
              <el-option
              >
              </el-option>
            </el-select>
          </div>
          <div
            class="setting-item"
          >
            <el-select
              size="mini"
              class="setting-select"
              filterable
              placeholder="请选择搜索书源分组"
            >
              <el-option
              >
              </el-option>
            </el-select>
          </div>
          <div
            class="setting-item"
          >
            <el-select
              size="mini"
              class="setting-select"
              filterable
              placeholder="请选择并发线程"
            >
              <el-option
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="recent-wrapper">
          <div class="recent-title">
            最近阅读
          </div>
          <div class="reading-recent">
            <el-tag
              type="warning"
              class="recent-book"
            >
            </el-tag>
          </div>
        </div>
        <div class="setting-wrapper">
          <div class="setting-title">
            后端设定
          </div>
          <div class="setting-item">
            <el-tag
              class="setting-connect"
            >
            </el-tag>
          </div>
        </div>
        <div class="setting-wrapper">
          <div class="setting-title">
            书源设置
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              class="setting-btn"
            >
              书源管理
            </el-tag>
            <el-popover
              placement="right"
              trigger="click"
              popper-class="popper-component"
            >
              <Explore
                class="popup"
              />
              <el-tag
                type="info"
                slot="reference"
                class="setting-btn"
              >
                探索书源
              </el-tag>
            </el-popover>
            <el-tag
              type="info"
              class="setting-btn"
            >
              导入书源
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              远程书源
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              失效书源
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              调试书源
            </el-tag>
            <input
              type="file"
              style="display:none"
            />
          </div>
        </div>
        <div class="setting-wrapper">
          <div class="setting-title">
            书架设置
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              class="setting-btn"
            >
              书籍管理
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              分组管理
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              导入书籍
            </el-tag>
            <input
              type="file"
              multiple="multiple"
              style="display:none"
            />
            <el-tag
              type="info"
              class="setting-btn"
            >
              浏览书仓
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              刷新缓存
            </el-tag>
          </div>
        </div>

        <div class="setting-wrapper">
          <div class="setting-title">
            用户空间
            <span
              class="right-text"
              >注销</span
            >
            <span
              class="right-text"
              >登录</span
            >
          </div>
          <div class="setting-item">
            <el-select
              size="mini"
              class="setting-select"
              filterable
              placeholder="请选择用户空间"
            >
              <el-option
              >
              </el-option>
            </el-select>
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              class="setting-btn"
            >
              备份用户配置
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              同步用户配置
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              加载用户空间
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              管理用户空间
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              退出管理模式
            </el-tag>
          </div>
        </div>
        <div
          class="setting-wrapper"
        >
          <div class="setting-title">
            WebDAV
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              class="setting-btn"
            >
              文件管理
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              保存备份
            </el-tag>
          </div>
        </div>
        <div class="setting-wrapper">
          <div class="setting-title">
            其它
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              class="setting-btn"
            >
              关注公众号【假装大佬】
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              加入TG频道【假装大佬】
            </el-tag>
          </div>
        </div>
        <div class="setting-wrapper">
          <div class="setting-title">
            本地缓存
            <span class="right-text"></span>
          </div>
          <div class="setting-item">
            <el-tag
              type="info"
              class="setting-btn"
            >
              清空书源缓存
              <span></span>
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              清空RSS源缓存
              <span></span>
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              清空章节列表缓存
              <span></span>
            </el-tag>
            <el-tag
              type="info"
              class="setting-btn"
            >
              清空章节内容缓存
              <span></span>
            </el-tag>
          </div>
        </div>
      </div>
      <div class="bottom-icons">
        <a href="https://github.com/hectorqin/reader" target="_blank">
          <div class="bottom-icon">
            <img
              alt=""
            />
          </div>
        </a>
        <span
          class="theme-item"
        >
          <i class="el-icon-moon"></i>
          <i class="el-icon-sunny"></i>
        </span>
      </div>
    </div>
    <div
      class="shelf-wrapper"
      :class="isWebApp && !isNight ? 'status-bar-light-bg' : ''"
      ref="shelfWrapper"
      @click="showNavigation = false"
    >
      <div class="shelf-title">
        <i
          class="el-icon-menu"
          v-if="$store.getters.isNormalPage && collapseMenu"
          @click.stop="showNavigation = true"
        ></i>
        ()
        <div
          class="title-btn"
        >
          书架
        </div>
        <div
          class="title-btn"
        >
          <i class="el-icon-loading"></i>
        </div>
        <div
          class="title-btn"
        >
        </div>
        <div class="title-btn">
          <i class="el-icon-loading"></i>
        </div>
        <div
          class="title-btn"
        >
          RSS
        </div>
        <div
          class="title-btn"
        >
          书海
        </div>
      </div>
      <div class="book-group-wrapper">
        <el-tabs class="book-group-tabs" stretch>
          <el-tab-pane
          ></el-tab-pane>
        </el-tabs>
      </div>
      <div
        class="books-wrapper"
      >
        <div class="wrapper">
          <div
            class="book"
          >
            <div class="cover-img">
              <!-- <img class="cover" alt="" /> -->
              <el-image
                class="cover"
                fit="cover"
                lazy
              >
              </el-image>
            </div>
            <div class="info">
              <div
                class="name"
                slot="reference"
              >
                <a href="#/reader">进入阅读页</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
    >
      <div class="source-container source-list-container">
        <el-checkbox-group
        >
          <el-checkbox
            class="source-checkbox"
            >
            </el-checkbox
          >
        </el-checkbox-group>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-checkbox
          border
          size="medium"
          class="float-left"
          >全选</el-checkbox
        >
        <span class="check-tip">已选择  个</span>
        <el-button
          size="medium"
          >取消</el-button
        >
        <el-button size="medium" type="primary"
          >确定</el-button
        >
      </div>
    </el-dialog>
    <el-dialog
    >
      <div class="custom-dialog-title" slot="title">
        <span class="el-dialog__title"
          >
          <span
            class="float-right span-btn"
            >清空</span
          >
          <span
            class="float-right span-btn"
            >恢复默认</span
          >
          <span
            class="float-right span-btn"
            >导出</span
          >
          <span
            class="float-right span-btn"
            >新增</span
          >
        </span>
      </div>
      <div class="source-container table-container">
        <div class="check-form">
          <span class="check-form-label">搜索词：</span>
          <el-input size="small">
          </el-input>
          <span class="check-form-label" style="min-width: 68px;">
            超时(ms)：
          </span>
          <el-input-number
            size="small"
          >
          </el-input-number>
          <span class="check-form-label">并发数：</span>
          <el-input-number
            size="small"
          >
          </el-input-number>
        </div>
        <div class="source-group-wrapper">
          <el-tag
            type="info"
            class="source-group-btn"
          >
          </el-tag>
        </div>
        <el-table
        >
          <el-table-column
            type="selection"
            width="25"
          >
          </el-table-column>
          <el-table-column
            property="bookSourceName"
            label="书源名称"
            min-width="120"
          ></el-table-column>
          <el-table-column
            property="bookSourceUrl"
            label="书源链接"
            min-width="120"
          >
            <template slot-scope="scope">
              <el-link
                type="primary"
                target="_blank"
                ></el-link
              >
            </template>

          </el-table-column>
          <el-table-column
            property="errorMsg"
            label="错误信息"
            min-width="120"
          ></el-table-column>
          <el-table-column label="书架书籍" min-width="120">
            <template slot-scope="scope">
              <pre></pre>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="100px"
          >
            <template slot-scope="scope">
              <el-button type="text"
                >编辑</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <div class="source-pagination">
          <el-pagination
            layout="total, sizes, prev, pager, next"
          >
          </el-pagination>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          class="float-left"
          size="medium"
          >批量删除</el-button
        >
        <span class="check-tip"
          >已选择  个</span
        >
        <el-button
          size="medium"
          style="margin-bottom: 5px;"
          >检测书源
          </el-button
        >
        <el-button size="medium"
          >取消</el-button
        >
      </div>
    </el-dialog>

    <el-dialog
    >
      <div class="source-container table-container">
        <div class="check-form">
          <div class="book-cover">
            <el-image
              class="cover"
              fit="cover"
              lazy
            >
            </el-image>
          </div>
          <div class="book-info">
            <div>
              <span>书名：</span>
              <el-input size="small"> </el-input>
            </div>
            <div>
              <span>作者：</span>
              <el-input size="small">
              </el-input>
            </div>
            <div>
              <span>分组：</span>
              <el-select
                size="mini"
                filterable
                multiple
                placeholder="未分组"
              >
                <el-option
                >
                </el-option>
              </el-select>
            </div>
            <div>
              <span>规则：</span>
              <el-select
                size="mini"
                filterable
                placeholder="内置规则"
              >
                <el-option
                >
                </el-option>
              </el-select>
              <el-button
                class="toc-refresh-btn"
                type="text"
                >刷新目录</el-button
              >
            </div>
            <div>
              <el-input
                type="textarea"
                size="small"
              >
              </el-input>
            </div>
          </div>
        </div>
        <div class="chapter-title">
          章节列表()
        </div>
        <div
          class="chapter-list"
        >
          <p>
            . 
          </p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          size="medium"
          >确定导入</el-button
        >
        <el-button size="medium"
          >取消</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showNavigation: false,
      navigationClass: "",
      navigationStyle: {},
      touchStartPoint: null
    };
  },
  computed: {
    collapseMenu() {
      return this.$store.getters.collapseMenu;
    },
    isNight() {
      return this.$store.getters.isNight;
    }
  },
  watch: {
    collapseMenu(value) {
      if (!value) {
        this.navigationClass = "";
      } else if (!this.showNavigation) {
        this.navigationClass = "navigation-hidden";
      }
    },
    showNavigation(value) {
      if (!this.collapseMenu) {
        return;
      }
      if (!value) {
        this.navigationClass = "navigation-out";
        setTimeout(() => {
          if (!this.showNavigation) {
            this.navigationClass = "navigation-hidden";
          }
        }, 300);
      } else {
        this.navigationClass = "navigation-in";
      }
    }
  },
  mounted() {
    this.navigationClass =
      this.collapseMenu && !this.showNavigation ? "navigation-hidden" : "";
  },
  methods: {
    handleTouchStart(event) {
      this.touchStartPoint = event.touches && event.touches[0];
    },
    handleTouchMove(event) {
      if (!this.collapseMenu || !this.touchStartPoint || !event.touches[0]) {
        return;
      }
      const moveX = event.touches[0].clientX - this.touchStartPoint.clientX;
      if (moveX < 0) {
        this.navigationStyle = { marginLeft: Math.max(-260, moveX) + "px" };
      }
    },
    handleTouchEnd() {
      this.navigationStyle = {};
      this.touchStartPoint = null;
    }
  }
};
</script>

<style lang="stylus" scoped>
.index-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;

  .navigation-wrapper {
    width: 260px;
    min-width: 260px;
    height: 100%;
    box-sizing: border-box;
    background-color: #F7F7F7;
    position: relative;
    padding-top: 0;
    padding-top: constant(safe-area-inset-top) !important;
    padding-top: env(safe-area-inset-top) !important;

    .navigation-inner-wrapper {
      padding: 48px 36px 66px 36px;
      height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
    }

    .navigation-title {
      font-size: 24px;
      font-weight: 600;
      font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;

      .version-text {
        float: right;
        font-size: 14px;
        line-height: 33px;
        font-weight: 400;
        color: #b1b1b1;
        display: inline-block;
        cursor: pointer;
      }
    }

    .navigation-sub-title {
      font-size: 16px;
      font-weight: 500;
      font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
      margin-top: 16px;
      color: #b1b1b1;
    }

    .search-wrapper {
      .search-input {
        border-radius: 50%;
        margin-top: 24px;

        >>> .el-input__inner {
          border-radius: 50px;
          border-color: #E3E3E3;
        }
      }
    }

    .recent-wrapper {
      margin-top: 36px;

      .recent-title {
        font-size: 14px;
        color: #b1b1b1;
        font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
      }

      .reading-recent {
        margin: 18px 0;

        .recent-book {
          cursor: pointer;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .setting-wrapper {
      margin-top: 36px;

      .setting-title {
        font-size: 14px;
        color: #b1b1b1;
        font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;

        .right-text {
          float: right;
          display: inline-block;
          height: 20px;
          line-height: 20px;
          cursor: pointer;
          user-select: none;
        }
      }

      .no-point {
        pointer-events: none;
      }

      .setting-connect {
        cursor: pointer;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .setting-item {
        padding-top: 16px;
      }

      .setting-btn {
        margin-right: 15px;
        margin-bottom: 15px;
        cursor: pointer;
      }

      .setting-select {
        width: 100%;
      }
    }

    .search-setting {
      margin-top: 28px;
    }

    .bottom-icons {
      position: absolute;
      bottom: 30px;
      width: 188px;
      left: 36px;
      align-items: center;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      pointer-events: none;

      .bottom-icon {
        height: 36px;
        pointer-events: all;
        img {
          width: 36px;
          height: 36px;
        }
      }

      .theme-item {
        line-height: 32px;
        width: 36px;
        height: 36px;
        border-radius: 100%;
        display: inline-block;
        cursor: pointer;
        text-align: center;
        vertical-align: middle;
        pointer-events: all;

        .el-icon-moon {
          color: #f7f7f7;
          line-height: 34px;
        }
        .el-icon-sunny {
          color: #121212;
          line-height: 34px;
        }
      }
    }

    .setting-wrapper:nth-last-child(1) {
      padding-bottom: 20px;
    }
  }

  .shelf-wrapper {
    padding: 48px 48px;
    height: 100%;
    max-height: 100%;
    width: 100%;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .shelf-title {
      font-size: 20px;
      font-weight: 600;
      font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
      margin-bottom: 5px;
      min-width: 320px;
      box-sizing: border-box;

      .el-icon-menu {
        cursor: pointer;
      }

      .title-btn {
        font-size: 14px;
        line-height: 28px;
        float: right;
        cursor: pointer;
        user-select: none;
        margin-left: 10px;

        >>>.el-icon-loading {
          font-size: 16px;
        }
      }
    }

    >>>.el-icon-loading {
      font-size: 36px;
      color: #B5B5B5;
    }

    >>>.el-loading-text {
      font-weight: 500;
      color: #B5B5B5;
    }

    .book-group-wrapper {
      padding: 5px 0;
      margin-bottom: 10px;

      .book-group-tabs {
        width: 100%;
      }

      .book-group-btn {
        margin-right: 10px;
        cursor: pointer;
      }

      .book-group-btn.selected {
        color: #fff;
        background: #409EFF;
        border-color: #409EFF;
      }
    }

    .books-wrapper {
      flex: 1;
      overflow-x: hidden;
      overflow-y: scroll;

      .wrapper {
        display: grid ;
        grid-template-columns: repeat(auto-fill, 380px);
        justify-content: space-around;
        grid-gap: 10px;

        .book {
          user-select: none;
          display: flex;
          cursor: pointer;
          margin-bottom: 18px;
          padding: 24px 24px;
          width: 360px;
          flex-direction: row;
          justify-content: space-around;

          .cover-img {
            width: 84px;
            height: 112px;

            .cover {
              width: 84px;
              height: 112px;
            }
          }

          .info {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: left;
            height: 112px;
            margin-left: 20px;
            flex: 1;

            .book-operation {
              position: absolute;
              right: 5px;
              top: 0px;
              font-size: 24px;
              color: #969ba3;

              i {
                margin-left: 10px;
              }
            }

            .name {
              width: fit-content;
              font-size: 16px;
              font-weight: 700;
              color: #33373D;
              margin-right: 38px;
              max-height: 45px;
              word-wrap: break-word;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
            }

            .name.edit {
              margin-right: 62px;
            }

            .sub {
              display: flex;
              flex-direction: row;
              font-size: 12px;
              font-weight: 600;
              color: #969ba3;

              .dot {
                margin: 0 7px;
              }
            }

            .intro, .dur-chapter, .last-chapter {
              color: #6b6b6b;
              font-size: 13px;
              margin-top: 3px;
              font-weight: 500;
              word-wrap: break-word;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
              text-align: left;
            }
          }
        }
      }

      .wrapper:last-child {
        margin-right: auto;
      }
    }

    .books-wrapper::-webkit-scrollbar {
      width: 0 !important;
    }
  }
}

.unread-num-badge {
  >>>.el-badge__content {
    border: none;
  }
}

.night {
  >>>.navigation-wrapper {
    background-color: #121212;
    border-right: 1px solid #555;
  }
  >>>.navigation-title {
    color: #bbb;
  }
  >>>.shelf-title {
    color: #bbb;
  }
  >>>.shelf-wrapper {
    background-color: #222;
  }
  >>>.el-input__inner {
    background-color: #444;
    border: 1px solid #444 !important;
    color: #aaa;
  }
  .book .info .name {
    color: #bbb !important;
  }
  .book .info .book-operation {
    color: #6b6b6b !important;
  }
  .book .info .sub {
    color: #6b6b6b !important;
  }
  .book .info .intro, .book .info .dur-chapter, .book .info .last-chapter {
    color: #969ba3 !important;
  }

  >>>.check-tip {
    color: #bbb;
  }
}

.source-container {
  // max-height: 400px;
  // overflow-y: auto;
  padding: 0 10px;

  &.table-container {
    padding: 0;
  }

  .check-form {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    align-items: center;

    .check-form-label {
      min-width: 60px;
    }

    .el-input {
      width: auto;
      min-width: 100px;
      margin-right: 10px;
    }

    .el-input-number {
      min-width: 130px;
      margin-right: 10px;
    }

    .book-cover {
      width: 84px;
      height: 112px;

      .cover {
        width: 84px;
        height: 112px;
      }
    }

    .book-info {
      display: flex;
      flex-direction: column;
      margin-left: 30px;
      justify-content: space-between;
      min-height: 100px;

      .toc-refresh-btn {
        margin-left: 5px;
      }

      span {
        display: inline-block;
        min-width: 56px;
        text-align-last: justify;
      }
      .el-input {
        width: auto;
        min-width: 100px;
        margin-right: 10px;
      }
      .el-input-number {
        min-width: 130px;
        margin-right: 10px;
      }
    }
  }

  .chapter-title {
    font-size: 15px;
    padding: 5px 0;
    font-weight: 600;
    margin-top: 10px;
  }

  .chapter-list {
    overflow-y: auto;
    box-sizing: border-box;
    padding: 0 5px;

    p {
      margin-top: 0.4em;
      margin-bottom: 0.4em;
    }
  }

  .source-group-wrapper {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    padding: 5px 0;

    .source-group-btn {
      margin-right: 10px;
      cursor: pointer;
    }

    .source-group-btn.selected {
      color: #fff;
      background: #409EFF;
      border-color: #409EFF;
    }
  }

  .el-pagination {
    margin-top: 8px;
    float: right;
    max-width: 100%;
    overflow-x: auto;
    box-sizing: border-box;
  }

  >>>.source-checkbox {
    display: block;
    padding: 8px 0;
    width: 100%;
  }

  pre {
    margin: 0;
  }

  .source-pagination::after {
    display: table;
    content: "";
    clear: both;
  }
}

.source-list-container {
  max-height: calc(var(--vh, 1vh) * 70 - 54px - 60px - 66px);
  overflow-y: auto;
  overflow-x: auto;
}

.night {
  .source-container {
    .source-group-wrapper {
      .source-group-btn.selected {
        color: #fff;
        background: #185798;
        border-color: #185798;
      }
    }
  }
  .book-group-wrapper {
    .book-group-btn.selected {
      color: #fff;
      background: #185798 !important;
      border-color: #185798 !important;
    }
  }
}

.source-container::-webkit-scrollbar {
  width: 0 !important;
}
.navigation-inner-wrapper::-webkit-scrollbar {
  width: 0 !important;
}
>>> .el-table__body-wrapper::-webkit-scrollbar {
  width: 0 !important;
}
>>> .el-dialog__wrapper::-webkit-scrollbar {
  width: 0 !important;
}
@media screen and (max-width: 750px) {
  .index-wrapper {
    overflow-x: hidden;

    >>>.navigation-wrapper {
      .navigation-inner-wrapper {
        padding: 20px 36px 66px 36px;
      }
    }
    >>>.shelf-wrapper {
      padding: 0;
      padding-top: constant(safe-area-inset-top) !important;
      padding-top: env(safe-area-inset-top) !important;

      .shelf-title {
        padding: 20px 24px 0 24px;
      }

      .book-group-wrapper {
        margin-left: 24px;
        margin-right: 24px;
      }

      .books-wrapper {
        .wrapper {
          display: flex;
          flex-direction: column;

          .book {
            box-sizing: border-box;
            width: 100%;
            margin-bottom: 0;
            padding: 10px 20px;
          }
        }
      }
    }
  }
  .source-list-container  {
    max-height: calc(var(--vh, 1vh) * 100 - 54px - 40px - 66px);
  }
}
@media screen and (max-width: 480px) {
  .source-container.table-container {
    margin: -15px -5px;
  }
}
</style>

<style>
.navigation-hidden {
  margin-left: -260px;
}
.navigation-in {
  margin-left: 0px;
  transition: margin-left 0.3s;
}
.navigation-out {
  margin-left: -260px;
  transition: margin-left 0.3s;
}
.popper-intro {
  padding: 15px;
}
.book-kind span {
  display: inline-block;
  margin-left: 5px;
  margin-right: 5px;
}
.night-theme .popper-intro {
  background: #121212;
  color: #bbb !important;
  border: none;
}
.night-theme .popper-intro.el-popper[x-placement^="bottom"] .popper__arrow,
.night-theme
  .popper-intro.el-popper[x-placement^="bottom"]
  .popper__arrow::after {
  border-bottom-color: #121212 !important;
}
.night-theme .popper-intro.el-popper[x-placement^="top"] .popper__arrow,
.night-theme .popper-intro.el-popper[x-placement^="top"] .popper__arrow::after {
  border-top-color: #121212 !important;
}
.night-theme .el-popover__title {
  color: #ddd !important;
}
.status-bar-light-bg {
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0,
    transparent 36px
  ) !important;
}
.status-bar-light-bg-dialog .el-dialog.is-fullscreen {
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0,
    transparent 36px
  ) !important;
}
@media (hover: hover) {
  .book:hover {
    background: rgba(0, 0, 0, 0.1);
    transition-duration: 0.5s;
  }
  .el-icon-close:hover {
    color: #409eff;
  }
  .el-icon-edit:hover {
    color: #409eff;
  }
}

.mini-interface .el-dialog__body {
  padding: 15px 20px;
}
.book-group-tabs .el-tabs__header {
  margin-bottom: 0px;
}
</style>
