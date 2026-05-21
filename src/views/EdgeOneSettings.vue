<template>
  <PageLayout
    root-class="reader-edgeone-settings"
    body-class="reader-settings-page__body"
  >
    <template #header>
      <PageTopbar title="EdgeOne 接口设置" back-visible @back="emit('back')" />
    </template>

    <section class="reader-settings-form-card">
      <button
        type="button"
        class="reader-settings-field reader-settings-field--button"
        @click="openUrlDialog"
      >
        <span>地址</span>
        <strong>{{ edgeOneUrl || "未设置" }}</strong>
        <span class="reader-settings-field__chevron" aria-hidden="true">›</span>
      </button>

      <button
        type="button"
        class="reader-settings-field reader-settings-field--button"
        @click="openSecretDialog"
      >
        <span>Secret</span>
        <strong>{{ secretSummary }}</strong>
        <span class="reader-settings-field__chevron" aria-hidden="true">›</span>
      </button>

    </section>

    <template #overlay>
      <ManageInputDialog
        v-model="edgeOneUrlDraft"
        :open="urlDialogOpen"
        title="EdgeOne 地址"
        title-id="readerEdgeOneUrlDialogTitle"
        label="地址"
        placeholder="请输入 EdgeOne 部署根地址或 /api/fetch"
        @close="closeUrlDialog"
        @submit="submitUrl"
      />

      <ManageInputDialog
        v-model="edgeOneSecretDraft"
        :open="secretDialogOpen"
        title="EdgeOne Secret"
        title-id="readerEdgeOneSecretDialogTitle"
        label="Secret"
        type="password"
        autocomplete="new-password"
        placeholder="请输入 Secret"
        @close="closeSecretDialog"
        @submit="submitSecret"
      />
    </template>
  </PageLayout>
</template>

<script setup>
import { computed, ref } from "vue";
import ManageInputDialog from "../components/ManageInputDialog.vue";
import PageLayout from "../components/PageLayout.vue";
import PageTopbar from "../components/PageTopbar.vue";
import { getApiSettings, setApiSetting } from "../data/apiSettings";

const emit = defineEmits(["back"]);
const settings = getApiSettings();

const edgeOneUrl = ref(settings.edgeOneUrl);
const edgeOneSecret = ref(settings.edgeOneSecret);
const edgeOneUrlDraft = ref("");
const edgeOneSecretDraft = ref("");
const urlDialogOpen = ref(false);
const secretDialogOpen = ref(false);
const secretSummary = computed(() => {
  if (!edgeOneSecret.value) return "未设置";
  return "••••••••";
});

const openUrlDialog = () => {
  edgeOneUrlDraft.value = edgeOneUrl.value;
  urlDialogOpen.value = true;
};

const closeUrlDialog = () => {
  urlDialogOpen.value = false;
};

const openSecretDialog = () => {
  edgeOneSecretDraft.value = edgeOneSecret.value;
  secretDialogOpen.value = true;
};

const closeSecretDialog = () => {
  secretDialogOpen.value = false;
};

const submitUrl = () => {
  edgeOneUrl.value = setApiSetting("edgeOneUrl", edgeOneUrlDraft.value).edgeOneUrl;
  urlDialogOpen.value = false;
};

const submitSecret = () => {
  edgeOneSecret.value = setApiSetting("edgeOneSecret", edgeOneSecretDraft.value).edgeOneSecret;
  secretDialogOpen.value = false;
};
</script>
