<template>
  <div class="reader-bottom-panel reader-controls-panel" :style="theme">
    <div class="reader-control-row reader-control-row--progress" @click.stop>
      <button type="button" class="reader-control-text" @click="emit('previous-chapter')">
        上一章
      </button>
      <div class="reader-control-progress">
        <el-slider
          :model-value="page"
          :min="1"
          :max="totalPages"
          :show-tooltip="false"
          :step="1"
          @update:model-value="emit('update:page', $event)"
          @change="emit('change-page', $event)"
        />
      </div>
      <button type="button" class="reader-control-text" @click="emit('next-chapter')">
        下一章
      </button>
    </div>
    <div class="reader-control-row reader-control-row--actions" @click.stop>
      <button type="button" class="reader-bottom-action" @click="emit('toggle-catalog')">
        <span class="iconfont">&#58905;</span>
        <span>目录</span>
      </button>
      <button type="button" class="reader-bottom-action">
        <el-icon :size="24">
          <VideoPlay />
        </el-icon>
        <span>自动阅读</span>
      </button>
      <button type="button" class="reader-bottom-action" @click="emit('toggle-settings')">
        <span class="iconfont">&#58971;</span>
        <span>设置</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import { ElSlider } from "element-plus/es/components/slider/index.mjs";
import "element-plus/es/components/icon/style/css.mjs";
import "element-plus/es/components/slider/style/css.mjs";
import { VideoPlay } from "@element-plus/icons-vue";

defineOptions({
  name: "ReaderBottomControls"
});

defineProps({
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  theme: { type: Object, default: () => ({}) }
});

const emit = defineEmits([
  "update:page",
  "change-page",
  "previous-chapter",
  "next-chapter",
  "toggle-catalog",
  "toggle-settings"
]);
</script>
