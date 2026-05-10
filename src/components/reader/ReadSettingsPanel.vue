<script setup>
const emit = defineEmits(['resetConfig', 'showClickZone', 'showRuleEditor', 'noop']);

const themeColors = [
  { background: 'rgba(250, 245, 235, 0.8)' },
  { background: 'rgba(245, 234, 204, 0.8)' },
  { background: 'rgba(230, 242, 230, 0.8)' },
  { background: 'rgba(228, 238, 247, 0.8)' },
  { background: '#f5e4e4' },
  { background: 'rgba(240, 230, 210, 0.8)' },
  { background: '#121212' },
];

const rows = [
  { title: '特殊模式', type: 'selection', values: ['正常', '简洁'], selected: '正常', tip: '❗️开启简洁模式会关闭动画以及首页的部分功能' },
  { title: '配置方案', type: 'selection', values: ['内置白天', '内置黑夜', '新增方案', '自动切换'], selected: '内置白天' },
  { title: '方案类型', type: 'selection', values: ['白天默认', '黑夜默认'], selected: '白天默认' },
  { title: '正文字体', type: 'selection', values: ['默认', '黑体', '楷体', '宋体', '仿宋'], selected: '默认' },
  { title: '简繁转换', type: 'selection', values: ['简体', '繁体'], selected: '简体' },
  { title: '字体大小', type: 'resize', value: 18 },
  { title: '字体粗细', type: 'resize', value: 400 },
  { title: '阅读宽度', type: 'resize', value: 800 },
  { title: '行间距', type: 'resize', value: 1.8 },
  { title: '段落间距', type: 'resize', value: 0.2 },
  { title: '阅读方式', type: 'selection', values: ['上下滑动', '上下滚动', '上下滚动2', '左右翻页', '仿真翻页'], selected: '上下滑动' },
  { title: '自动阅读', type: 'selection', values: ['像素滚动', '逐行滚动'], selected: '像素滚动' },
  { title: '翻页速度', type: 'resize', value: 1000 },
  { title: '全屏点击', type: 'selection', values: ['自动', '下一页', '不翻页'], selected: '自动' },
  { title: '选择文字', type: 'selection', values: ['操作弹窗', '过滤弹窗', '禁用'], selected: '操作弹窗' },
];
</script>

<template>
  <div class="settings-wrapper day">
    <div class="settings-title">
      设置
      <div class="title-btn" @click="emit('resetConfig')">重置为默认配置</div>
    </div>
    <div class="setting-list">
      <ul>
        <li>
          <span class="setting-item-title">阅读主题</span>
          <div class="selection-zone">
            <span
              v-for="(themeColor, index) in themeColors"
              :key="index"
              class="theme-item"
              :style="themeColor"
              :class="{ selected: index === 0 }"
              @click="emit('noop', '阅读主题')"
            >
              <em v-if="index !== 6" class="iconfont">&#58980;</em>
              <em v-else class="moon-icon">&#58994;</em>
            </span>
            <span class="span-item" @click="emit('noop', '自定义主题')">自定义</span>
          </div>
        </li>
        <li v-for="row in rows" :key="row.title">
          <span class="setting-item-title">{{ row.title }}</span>
          <div v-if="row.type === 'selection'" class="selection-zone">
            <span
              v-for="value in row.values"
              :key="value"
              class="span-item"
              :class="{ selected: value === row.selected }"
              @click="emit('noop', row.title)"
            >{{ value }}</span>
            <span v-if="row.tip" class="small-tip">{{ row.tip }}</span>
          </div>
          <div v-else class="resize">
            <span class="less" @click="emit('noop', row.title)"><i class="el-icon-minus"></i></span><b></b>
            <span class="lang">{{ row.value }}</span><b></b>
            <span class="more" @click="emit('noop', row.title)"><i class="el-icon-plus"></i></span>
          </div>
        </li>
        <li class="operation-zone">
          <span class="span-btn" @click="emit('showClickZone')">显示翻页区域</span>
          <span class="span-btn" @click="emit('showRuleEditor')">过滤规则管理</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.settings-wrapper {
  user-select: none;
  margin: -16px;
  margin-bottom: -13px;
  text-align: left;
  padding: 24px;
  padding-top: calc(24px + constant(safe-area-inset-top));
  padding-top: calc(24px + env(safe-area-inset-top));
  background: var(--reader-popup-bg);
}

.settings-title {
  font-size: 18px;
  line-height: 22px;
  margin-bottom: 28px;
  font-weight: 400;
}

.title-btn {
  float: right;
  font-size: 14px;
  color: #ed4259;
  cursor: pointer;
}

.setting-list {
  max-height: 45vh;
  overflow-y: auto;
}

.setting-list::-webkit-scrollbar {
  width: 0 !important;
}

ul {
  list-style: none outside none;
  margin: 0;
  padding: 0;
}

li {
  list-style: none outside none;
}

li:not(:first-child) {
  margin-top: 20px;
}

.setting-item-title {
  display: inline-block;
  width: 56px;
  margin-right: 16px;
  vertical-align: top;
  line-height: 36px;
  color: #666;
}

.selection-zone {
  display: inline-block;
  width: calc(100% - 72px);
  word-wrap: break-word;
}

.selection-zone span {
  margin-bottom: 5px;
}

.span-item {
  width: 78px;
  height: 34px;
  cursor: pointer;
  margin-right: 16px;
  border-radius: 2px;
  text-align: center;
  vertical-align: middle;
  display: inline-block;
  font: 14px / 34px PingFangSC-Regular, HelveticaNeue-Light, 'Helvetica Neue Light', 'Microsoft YaHei', sans-serif;
  position: relative;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.span-item.selected {
  border: 1px solid #ed4259;
  color: #ed4259;
}

.small-tip {
  color: #909399;
  font-size: 12px;
}

.theme-item {
  line-height: 32px;
  width: 34px;
  height: 34px;
  margin-right: 16px;
  border-radius: 100%;
  display: inline-block;
  cursor: pointer;
  text-align: center;
  vertical-align: middle;
  border: 1px solid #e5e5e5;
}

.theme-item .iconfont {
  display: none;
}

.theme-item.selected {
  color: #ed4259;
  border: 1px solid #ed4259;
}

.theme-item.selected .iconfont {
  display: inline;
}

.moon-icon {
  display: inline;
  color: rgba(255, 255, 255, 0.2);
  font-family: iconfont;
  font-style: normal;
}

.resize {
  display: inline-block;
  height: 34px;
  vertical-align: middle;
  border-radius: 2px;
  border: 1px solid #e5e5e5;
  background: rgba(255, 255, 255, 0.5);
}

.resize span {
  min-width: 72px;
  height: 34px;
  line-height: 34px;
  display: inline-block;
  cursor: pointer;
  text-align: center;
  vertical-align: middle;
}

.resize .lang {
  color: #a6a6a6;
  font-weight: 400;
}

.resize b {
  display: inline-block;
  height: 20px;
  vertical-align: middle;
  border-right: 1px solid #e5e5e5;
}

.operation-zone {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.operation-zone .span-btn {
  cursor: pointer;
  color: #ed4259;
}

@media (hover: hover) {
  .span-item:hover {
    border: 1px solid #ed4259;
    color: #ed4259;
  }

  .less:hover,
  .more:hover {
    color: #ed4259;
  }
}
</style>
