<template>
  <header class="reader-topbar" :style="theme" aria-label="阅读器顶部栏">
    <div class="reader-topbar__inner" @click.stop>
      <button
        type="button"
        class="reader-topbar__circle-button"
        aria-label="返回"
        @click="emit('back')"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div class="reader-topbar__actions" aria-label="阅读操作">
        <button
          type="button"
          class="reader-topbar__text-button"
          :class="{ 'is-danger': inBookshelf }"
          @click="emit('toggle-bookshelf')"
        >
          {{ bookshelfActionText }}
        </button>
        <button
          type="button"
          class="reader-topbar__text-button"
          @click="emit('toggle-source')"
        >
          换源
        </button>
        <el-popover
          :visible="moreVisible"
          placement="bottom-end"
          :width="160"
          trigger="click"
          :show-arrow="false"
          popper-class="reader-more-popper"
          :popper-options="popperOptions"
          :teleported="false"
          @update:visible="emit('update:moreVisible', $event)"
        >
          <template #reference>
            <button type="button" class="reader-topbar__circle-button" aria-label="更多">
              <el-icon :size="18">
                <MoreFilled />
              </el-icon>
            </button>
          </template>
          <div class="reader-more-menu">
            <button type="button" class="reader-more-menu__item" @click="emit('toggle-cache')">
              <el-icon :size="16">
                <Download />
              </el-icon>
              <span>下载</span>
            </button>
          </div>
        </el-popover>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ElIcon } from "element-plus/es/components/icon/index.mjs";
import { ElPopover } from "element-plus/es/components/popover/index.mjs";
import "element-plus/es/components/icon/style/css.mjs";
import "element-plus/es/components/popover/style/css.mjs";
import { Download, MoreFilled } from "@element-plus/icons-vue";

defineOptions({
  name: "ReaderTopbar"
});

defineProps({
  theme: { type: Object, default: () => ({}) },
  inBookshelf: { type: Boolean, default: false },
  bookshelfActionText: { type: String, default: "加入书架" },
  moreVisible: { type: Boolean, default: false },
  popperOptions: { type: Object, default: () => ({}) }
});

const emit = defineEmits([
  "back",
  "toggle-bookshelf",
  "toggle-source",
  "toggle-cache",
  "update:moreVisible"
]);
</script>
