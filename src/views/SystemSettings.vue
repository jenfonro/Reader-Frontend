<template>
  <div class="reader-content reader-page reader-system-settings">
    <PageTopbar title="系统设置" back-visible @back="emit('back')" />

    <section class="reader-settings-form-card">
      <button
        type="button"
        class="reader-settings-field reader-settings-field--button"
        @click="openSiteNameDialog"
      >
        <span>站点名称</span>
        <strong>{{ siteName || "未设置" }}</strong>
        <span class="reader-settings-field__chevron" aria-hidden="true">›</span>
      </button>

      <button
        type="button"
        class="reader-settings-field reader-settings-field--button"
        @click="openSearchConcurrencyDialog"
      >
        <span>搜索并发数</span>
        <strong>{{ searchConcurrency }}</strong>
        <span class="reader-settings-field__chevron" aria-hidden="true">›</span>
      </button>

      <p v-if="message" class="reader-settings-message" :class="{ 'is-error': messageType === 'error' }">
        {{ message }}
      </p>
    </section>

    <ManageDialog
      :open="siteNameDialogOpen"
      title="站点名称"
      title-id="readerSiteNameDialogTitle"
      @close="closeSiteNameDialog"
    >
      <form class="reader-manage-form" @submit.prevent="submitSiteName">
        <label>
          <span>站点名称</span>
          <input v-model.trim="siteNameDraft" type="text" autocomplete="off" placeholder="请输入站点名称" />
        </label>
        <p v-if="dialogMessage" class="reader-manage-form__error">{{ dialogMessage }}</p>
        <div class="reader-manage-dialog__actions">
          <button type="button" @click="closeSiteNameDialog">取消</button>
          <button type="submit" class="is-primary">确定</button>
        </div>
      </form>
    </ManageDialog>

    <ManageDialog
      :open="searchConcurrencyDialogOpen"
      title="搜索并发数"
      title-id="readerSearchConcurrencyDialogTitle"
      @close="closeSearchConcurrencyDialog"
    >
      <form class="reader-manage-form" @submit.prevent="submitSearchConcurrency">
        <label>
          <span>搜索并发数</span>
          <input v-model.number="searchConcurrencyDraft" type="number" min="1" inputmode="numeric" />
        </label>
        <p v-if="dialogMessage" class="reader-manage-form__error">{{ dialogMessage }}</p>
        <div class="reader-manage-dialog__actions">
          <button type="button" @click="closeSearchConcurrencyDialog">取消</button>
          <button type="submit" class="is-primary">确定</button>
        </div>
      </form>
    </ManageDialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ManageDialog from "../components/ManageDialog.vue";
import PageTopbar from "../components/PageTopbar.vue";
import { getSystemSettings, setSystemSetting } from "../data/systemSettings";

const emit = defineEmits(["back"]);
const settings = getSystemSettings();

const siteName = ref(settings.siteName);
const searchConcurrency = ref(settings.searchConcurrency);
const siteNameDialogOpen = ref(false);
const searchConcurrencyDialogOpen = ref(false);
const siteNameDraft = ref("");
const searchConcurrencyDraft = ref(24);
const message = ref("");
const messageType = ref("info");
const dialogMessage = ref("");

const setMessage = (text, type = "info") => {
  message.value = text;
  messageType.value = type;
};

const normalizeSearchConcurrency = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 24;
};

const openSiteNameDialog = () => {
  siteNameDraft.value = siteName.value;
  dialogMessage.value = "";
  siteNameDialogOpen.value = true;
};

const closeSiteNameDialog = () => {
  siteNameDialogOpen.value = false;
  dialogMessage.value = "";
};

const openSearchConcurrencyDialog = () => {
  searchConcurrencyDraft.value = searchConcurrency.value;
  dialogMessage.value = "";
  searchConcurrencyDialogOpen.value = true;
};

const closeSearchConcurrencyDialog = () => {
  searchConcurrencyDialogOpen.value = false;
  dialogMessage.value = "";
};

const submitSiteName = () => {
  const value = siteNameDraft.value.trim();
  if (!value) {
    dialogMessage.value = "站点名称不能为空";
    return;
  }

  siteName.value = setSystemSetting("siteName", value).siteName;
  siteNameDialogOpen.value = false;
  setMessage("已保存");
};

const submitSearchConcurrency = () => {
  const parsed = Number(searchConcurrencyDraft.value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    dialogMessage.value = "搜索并发数必须大于 0";
    return;
  }

  searchConcurrency.value = setSystemSetting(
    "searchConcurrency",
    normalizeSearchConcurrency(parsed)
  ).searchConcurrency;
  searchConcurrencyDialogOpen.value = false;
  setMessage("已保存");
};
</script>
