<template>
  <PageLayout
    root-class="reader-page--fixed"
    body-class="reader-source-editor-page__body"
  >
    <template #header>
      <PageTopbar
        title="编辑书源"
        back-visible
        :actions="pageActions"
        @back="goSourceList"
        @action="handlePageAction"
      />
    </template>

    <section class="reader-source-editor">
      <div class="reader-source-editor__controls">
        <label class="reader-source-editor__type">
          <span>类型</span>
          <select v-model="editorForm.sourceType">
            <option v-for="option in sourceTypeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="reader-source-editor__check">
          <input v-model="editorForm.enabled" type="checkbox" />
          <span></span>
          启用
        </label>
        <label class="reader-source-editor__check">
          <input v-model="editorForm.enabledExplore" type="checkbox" />
          <span></span>
          发现
        </label>
        <label class="reader-source-editor__check">
          <input v-model="editorForm.enabledCookieJar" type="checkbox" />
          <span></span>
          CookieJar
        </label>
      </div>

      <nav class="reader-source-editor__tabs" aria-label="书源编辑分类">
        <button
          v-for="tab in sourceEditorTabs"
          :key="tab.key"
          type="button"
          :class="{ 'is-active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <form class="reader-source-editor__body" @submit.prevent>
        <div class="reader-source-editor__card">
          <label
            v-for="field in activeFields"
            :key="field.key"
            class="reader-source-editor__field"
            :class="{ 'reader-source-editor__field--multiline': field.rows && field.rows > 1 }"
          >
            <span class="reader-source-editor__label">{{ getFieldLabel(field) }}</span>
            <textarea
              v-if="field.rows && field.rows > 1"
              v-model="editorForm[field.key]"
              :rows="field.rows"
              :placeholder="field.placeholder || ''"
            ></textarea>
            <input
              v-else
              v-model="editorForm[field.key]"
              type="text"
              :placeholder="field.placeholder || ''"
            />
          </label>
        </div>
        <p v-if="actionMessage" class="reader-source-editor__message">{{ actionMessage }}</p>
      </form>
    </section>

    <template #overlay>
      <EditorMoreMenu
        :open="moreMenuOpen"
        :items="bookSourceMoreMenuItems"
        @action="handleMoreMenuAction"
      />
    </template>
  </PageLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  buildBookSourcePayload,
  createSourceEditorForm,
  sourceEditorTabs,
  sourceTypeOptions
} from "../data/bookSourceEditor";
import { findBookSourceByKey, getSourceKey, saveBookSource } from "../data/bookSources";
import EditorMoreMenu from "../components/EditorMoreMenu.vue";
import PageLayout from "../components/PageLayout.vue";
import PageTopbar from "../components/PageTopbar.vue";

const props = defineProps({
  sourceKey: { type: String, default: "" },
  sourceName: { type: String, default: "" }
});
const emit = defineEmits(["back", "saved"]);

const currentSourceKey = ref(props.sourceKey);
const editorForm = ref(createSourceEditorForm(props.sourceName));
const activeTab = ref(sourceEditorTabs[0].key);
const actionMessage = ref("");
const moreMenuOpen = ref(false);
const savingSource = ref(false);
const pageActions = [
  { key: "source-editor-save", label: "保存", icon: "save" },
  { key: "source-editor-debug", label: "Debug", icon: "debug" },
  { key: "source-editor-more", label: "更多", icon: "more-vertical" }
];
const bookSourceMoreMenuItems = [
  { label: "复制书源", value: "copy" },
  { label: "导出书源", value: "export" },
  { label: "校验规则", value: "validate" }
];

const activeFields = computed(() => {
  const tab = sourceEditorTabs.find(item => item.key === activeTab.value);
  return tab ? tab.fields : [];
});

const getFieldLabel = (field = {}) => {
  if (typeof field.displayLabel === "string" && field.displayLabel) return field.displayLabel;
  const label = typeof field.label === "string" ? field.label : "";
  const ruleKey = typeof field.ruleKey === "string" && field.ruleKey ? field.ruleKey : field.key;
  return ruleKey ? `${label}（${ruleKey}）` : label;
};

const goSourceList = () => {
  emit("back");
};

const setActionMessage = message => {
  actionMessage.value = message;
  moreMenuOpen.value = false;
};

const loadSourceDetail = () => {
  if (!currentSourceKey.value) {
    editorForm.value = createSourceEditorForm(props.sourceName);
    return;
  }

  const source = findBookSourceByKey(currentSourceKey.value);
  if (!source) {
    editorForm.value = createSourceEditorForm(props.sourceName);
    actionMessage.value = "未找到书源，保存后将作为新书源创建";
    return;
  }

  editorForm.value = createSourceEditorForm(source.bookSourceName || props.sourceName, source);
  currentSourceKey.value = getSourceKey(source);
};

const saveCurrentSource = () => {
  if (savingSource.value) return;
  const source = buildBookSourcePayload(editorForm.value);
  if (!source.bookSourceUrl) {
    setActionMessage("请填写源 URL");
    return;
  }
  if (!source.bookSourceName) {
    setActionMessage("请填写源名称");
    return;
  }

  savingSource.value = true;
  actionMessage.value = "正在保存书源...";
  moreMenuOpen.value = false;
  try {
    const result = saveBookSource(source, currentSourceKey.value);
    currentSourceKey.value = result.key;
    editorForm.value = createSourceEditorForm(result.source.bookSourceName || source.bookSourceName, result.source);
    actionMessage.value = result.created ? "书源已新增" : "书源已保存";
    emit("saved", result);
  } catch (error) {
    actionMessage.value = error?.message || "保存书源失败";
  } finally {
    savingSource.value = false;
  }
};

const handlePageAction = action => {
  if (action === "source-editor-save") {
    saveCurrentSource();
    return;
  }
  if (action === "source-editor-debug") {
    setActionMessage("Debug 调试入口待接入");
    return;
  }
  if (action === "source-editor-more") {
    actionMessage.value = "";
    moreMenuOpen.value = !moreMenuOpen.value;
  }
};

const handleMoreMenuAction = action => {
  const messageMap = {
    copy: "复制书源功能待接入",
    export: "导出书源功能待接入",
    validate: "校验规则功能待接入"
  };
  setActionMessage(messageMap[action] || "功能待接入");
};


const handleDocumentPointerDown = () => {
  moreMenuOpen.value = false;
};

onMounted(() => {
  document.addEventListener("pointerdown", handleDocumentPointerDown);
  loadSourceDetail();
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
});
</script>
