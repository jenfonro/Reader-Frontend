<template>
  <PageLayout root-class="reader-home-page" :body-class="pageBodyClass">
    <template #header>
      <PageTopbar v-if="activeKey === 'settings'" title="设置" />
    </template>

    <SettingsHome
      v-if="activeKey === 'settings'"
      @select="openSettingPage"
    />
    <div v-else class="home-header">
      <span class="home-header__reader-link" @click="emit('enter-reader')">进入阅读页</span>
    </div>
  </PageLayout>
</template>

<script setup>
import { computed } from "vue";
import PageLayout from "../components/PageLayout.vue";
import PageTopbar from "../components/PageTopbar.vue";
import SettingsHome from "../components/settings/SettingsHome.vue";

defineOptions({
  name: "Index"
});

const props = defineProps({
  activeKey: { type: String, default: "home" }
});

const emit = defineEmits(["enter-reader", "open-page"]);
const pageBodyClass = computed(() =>
  props.activeKey === "settings" ? "reader-settings-menu-body" : "reader-home-page__body"
);

const openSettingPage = key => {
  emit("open-page", { name: key });
};
</script>

<style scoped>
.home-header {
  min-width: 320px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  margin-bottom: 5px;
  font-family: -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial,
    "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC",
    "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei",
    "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
  font-size: 20px;
  font-weight: 600;
}

.home-header__reader-link {
  margin-left: auto;
  cursor: pointer;
  font-size: 14px;
  line-height: 28px;
  user-select: none;
}
</style>
