<template>
  <div class="reader-side-panel" :style="panelTheme">
    <div class="reader-side-actions" @click.stop>
      <div class="reader-side-actions__left">
        <button type="button" class="reader-side-action" :style="actionStyle" aria-label="书签">
          <el-icon :size="18">
            <CollectionTag />
          </el-icon>
        </button>
        <button type="button" class="reader-side-action" :style="actionStyle" aria-label="搜索">
          <el-icon :size="18">
            <Search />
          </el-icon>
        </button>
        <button
          type="button"
          class="reader-side-action"
          :style="actionStyle"
          aria-label="书籍简介"
          @click="emit('open-intro')"
        >
          <el-icon :size="18">
            <InfoFilled />
          </el-icon>
        </button>
        <button type="button" class="reader-side-action" :style="actionStyle" aria-label="顶部">
          <el-icon :size="18">
            <Top />
          </el-icon>
        </button>
        <button type="button" class="reader-side-action" :style="actionStyle" aria-label="底部">
          <el-icon :size="18">
            <Bottom />
          </el-icon>
        </button>
      </div>
      <div class="reader-side-actions__right">
        <button type="button" class="reader-side-action" :style="actionStyle" aria-label="刷新">
          <el-icon :size="18">
            <RefreshRight />
          </el-icon>
        </button>
        <button type="button" class="reader-side-action" :style="actionStyle" aria-label="界面">
          <el-icon :size="18">
            <View />
          </el-icon>
        </button>
        <button type="button" class="reader-side-action" :style="actionStyle" aria-label="朗读">
          <el-icon :size="18">
            <Headset />
          </el-icon>
        </button>
        <button type="button" class="reader-side-action" :style="actionStyle" aria-label="夜间">
          <el-icon v-if="!isNight" :size="18" class="reader-theme-icon reader-theme-icon--moon">
            <Moon />
          </el-icon>
          <el-icon v-else :size="18" class="reader-theme-icon reader-theme-icon--sun">
            <Sunny />
          </el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import "element-plus/es/components/icon/style/css.mjs";
import {
  Bottom,
  CollectionTag,
  Headset,
  InfoFilled,
  Moon,
  RefreshRight,
  Search,
  Sunny,
  Top,
  View
} from "@element-plus/icons-vue";

defineOptions({
  name: "ReaderSideActions"
});

defineProps({
  panelTheme: { type: Object, default: () => ({}) },
  actionStyle: { type: Object, default: () => ({}) },
  isNight: { type: Boolean, default: false }
});

const emit = defineEmits(["open-intro"]);
</script>
