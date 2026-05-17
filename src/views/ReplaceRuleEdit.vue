<template>
  <PageLayout
    root-class="reader-page--fixed"
    body-class="reader-replace-editor-page__body"
  >
    <template #header>
      <PageTopbar
        title="替换规则编辑"
        back-visible
        :actions="pageActions"
        @back="emit('back')"
        @action="handlePageAction"
      />
    </template>

    <section class="reader-replace-editor">
      <form class="reader-replace-editor__body" @submit.prevent>
        <div class="reader-replace-editor__card">
          <label class="reader-replace-editor__field" :class="getFieldClass('name')">
            <span>替换规则名称（name）</span>
            <input v-model="editorForm.name" type="text" @input="clearFieldError('name')" />
          </label>
          <label class="reader-replace-editor__field" :class="getFieldClass('group')">
            <span>分组（group）</span>
            <input v-model="editorForm.group" type="text" @input="clearFieldError('group')" />
          </label>
          <label
            class="reader-replace-editor__field reader-replace-editor__field--multiline"
            :class="getFieldClass('pattern')"
          >
            <span>替换规则（pattern）</span>
            <textarea v-model="editorForm.pattern" rows="5" @input="clearFieldError('pattern')"></textarea>
          </label>
          <label class="reader-replace-editor__check">
            <input v-model="editorForm.isRegex" type="checkbox" />
            <span></span>
            使用正则表达式
          </label>
          <label
            class="reader-replace-editor__field reader-replace-editor__field--multiline"
            :class="getFieldClass('replacement')"
          >
            <span>替换为（replacement）</span>
            <textarea
              v-model="editorForm.replacement"
              rows="4"
              @input="clearFieldError('replacement')"
            ></textarea>
          </label>
          <div class="reader-replace-editor__checks">
            <label class="reader-replace-editor__check">
              <input v-model="editorForm.scopeTitle" type="checkbox" />
              <span></span>
              作用于标题
            </label>
            <label class="reader-replace-editor__check">
              <input v-model="editorForm.scopeContent" type="checkbox" />
              <span></span>
              作用于正文
            </label>
          </div>
          <label class="reader-replace-editor__field" :class="getFieldClass('scope')">
            <span>替换范围，选填书名或者书源 URL（scope）</span>
            <input v-model="editorForm.scope" type="text" @input="clearFieldError('scope')" />
          </label>
          <label class="reader-replace-editor__field" :class="getFieldClass('excludeScope')">
            <span>排除范围，选填书名或者书源 URL（excludeScope）</span>
            <input
              v-model="editorForm.excludeScope"
              type="text"
              @input="clearFieldError('excludeScope')"
            />
          </label>
          <label class="reader-replace-editor__field" :class="getFieldClass('timeoutMillisecond')">
            <span>超时毫秒数（timeoutMillisecond）</span>
            <input
              v-model="editorForm.timeoutMillisecond"
              type="number"
              min="1"
              inputmode="numeric"
              @input="clearFieldError('timeoutMillisecond')"
            />
          </label>
        </div>
      </form>
    </section>

    <template #overlay>
      <EditorMoreMenu
        :open="moreMenuOpen"
        :items="replaceRuleMoreMenuItems"
        @action="handleMoreMenuAction"
      />
      <div
        v-if="toast.open"
        class="reader-replace-editor__toast"
        :class="`reader-replace-editor__toast--${toast.type}`"
        role="status"
      >
        {{ toast.text }}
      </div>
    </template>
  </PageLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import EditorMoreMenu from "../components/EditorMoreMenu.vue";
import PageLayout from "../components/PageLayout.vue";
import PageTopbar from "../components/PageTopbar.vue";
import {
  createDefaultReplaceRule,
  findReplaceRuleByKey,
  getReplaceRuleKey,
  saveReplaceRule
} from "../data/replaceRules";

const props = defineProps({
  ruleKey: { type: String, default: "" },
  ruleName: { type: String, default: "" }
});
const emit = defineEmits(["back", "saved-replace"]);

const currentRuleKey = ref(props.ruleKey);
const editorForm = ref(createDefaultReplaceRule());
const invalidField = ref("");
const moreMenuOpen = ref(false);
const toast = ref({ open: false, text: "", type: "info" });
let toastTimer = 0;
const savingRule = ref(false);
const pageActions = [
  { key: "replace-editor-save", label: "保存", icon: "save" },
  { key: "replace-editor-more", label: "更多", icon: "more-vertical" }
];
const replaceRuleMoreMenuItems = [
  { label: "复制规则", value: "copy" },
  { label: "粘贴规则", value: "paste" }
];

const normalizeEditorRule = rule => ({
  ...createDefaultReplaceRule(),
  ...rule,
  group: rule.group || "",
  scope: rule.scope || "",
  excludeScope: rule.excludeScope || "",
  timeoutMillisecond: String(rule.timeoutMillisecond || 3000)
});

const getFieldClass = field => ({
  "is-error": invalidField.value === field
});

const clearFieldError = field => {
  if (invalidField.value === field) invalidField.value = "";
};

const showToast = (text, type = "info") => {
  window.clearTimeout(toastTimer);
  toast.value = { open: true, text, type };
  toastTimer = window.setTimeout(() => {
    toast.value = { open: false, text: "", type: "info" };
  }, 2200);
};

const showFieldError = (field, message) => {
  invalidField.value = field;
  showToast(message, "error");
};

const buildRulePayload = () => ({
  ...editorForm.value,
  name: String(editorForm.value.name || "").trim(),
  group: String(editorForm.value.group || "").trim() || null,
  pattern: String(editorForm.value.pattern || ""),
  replacement: String(editorForm.value.replacement || ""),
  scope: String(editorForm.value.scope || "").trim() || null,
  excludeScope: String(editorForm.value.excludeScope || "").trim() || null,
  scopeTitle: editorForm.value.scopeTitle === true,
  scopeContent: editorForm.value.scopeContent !== false,
  isEnabled: editorForm.value.isEnabled !== false,
  isRegex: editorForm.value.isRegex === true,
  timeoutMillisecond: Number(editorForm.value.timeoutMillisecond || 3000) || 3000
});

const loadRuleDetail = () => {
  if (!currentRuleKey.value) {
    editorForm.value = normalizeEditorRule({
      ...createDefaultReplaceRule(),
      name: props.ruleName === "新建替换" ? "" : props.ruleName
    });
    return;
  }

  const rule = findReplaceRuleByKey(currentRuleKey.value);
  if (!rule) {
    editorForm.value = normalizeEditorRule({
      ...createDefaultReplaceRule(),
      name: props.ruleName
    });
    showToast("未找到替换规则，保存后将作为新规则创建", "error");
    return;
  }

  editorForm.value = normalizeEditorRule(rule);
  currentRuleKey.value = getReplaceRuleKey(rule);
};

const validateRule = rule => {
  if (!rule.pattern.trim()) {
    return { field: "pattern", message: "请填写替换规则" };
  }
  if (rule.isRegex) {
    try {
      new RegExp(rule.pattern);
    } catch (error) {
      return { field: "pattern", message: "正则语法错误或不支持" };
    }
    if (rule.pattern.endsWith("|") && !rule.pattern.endsWith("\\|")) {
      return { field: "pattern", message: "正则语法错误或不支持" };
    }
  }
  return null;
};

const saveCurrentRule = () => {
  if (savingRule.value) return;
  const rule = buildRulePayload();
  const validationError = validateRule(rule);
  if (validationError) {
    showFieldError(validationError.field, validationError.message);
    return;
  }

  savingRule.value = true;
  invalidField.value = "";
  moreMenuOpen.value = false;
  try {
    const result = saveReplaceRule(rule, currentRuleKey.value);
    currentRuleKey.value = result.key;
    editorForm.value = normalizeEditorRule(result.rule);
    emit("saved-replace", result);
    emit("back");
  } catch (error) {
    showFieldError("pattern", error?.message || "保存替换规则失败");
  } finally {
    savingRule.value = false;
  }
};

const copyRule = async () => {
  moreMenuOpen.value = false;
  try {
    await navigator.clipboard?.writeText(JSON.stringify(buildRulePayload(), null, 2));
    showToast("规则已复制");
  } catch (error) {
    showToast("复制失败", "error");
  }
};

const pasteRule = async () => {
  moreMenuOpen.value = false;
  try {
    const text = await navigator.clipboard?.readText();
    const parsed = JSON.parse(text || "");
    editorForm.value = normalizeEditorRule(parsed);
    invalidField.value = "";
    showToast("规则已粘贴");
  } catch (error) {
    showToast("剪贴板内容格式不对", "error");
  }
};

const handlePageAction = action => {
  if (action === "replace-editor-save") {
    saveCurrentRule();
    return;
  }
  if (action === "replace-editor-more") {
    moreMenuOpen.value = !moreMenuOpen.value;
  }
};

const handleMoreMenuAction = action => {
  if (action === "copy") {
    copyRule();
    return;
  }
  if (action === "paste") pasteRule();
};


const handleDocumentPointerDown = () => {
  moreMenuOpen.value = false;
};

onMounted(() => {
  document.addEventListener("pointerdown", handleDocumentPointerDown);
  loadRuleDetail();
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handleDocumentPointerDown);
  window.clearTimeout(toastTimer);
});
</script>
