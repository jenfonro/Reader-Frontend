<template>
  <PageLayout
    root-class="reader-page--fixed"
    body-class="reader-source-page__body"
    footer-class="reader-source-page__footer"
  >
    <template #header>
      <PageTopbar title="替换净化" back-visible @back="emit('back')" />
    </template>

    <ManagePage ref="rootEl" variant="source" body-label="替换规则列表">
      <template #toolbar-main>
        <ReplaceRuleSearch v-model="keyword" />
      </template>

      <template #toolbar-actions>
        <ReplaceRuleToolbarActions
          :active-menu="activeMenu"
          :groups="ruleGroups"
          :more-actions="moreActions"
          @toggle-menu="toggleMenu"
          @open-group-dialog="openGroupDialog"
          @select-group="selectGroup"
          @more-action="handleToolbarAction"
        />
      </template>

      <ReplaceRuleList
        v-model:selected-rules="selectedRules"
        :active-row-menu-key="activeRowMenuKey"
        :loading="loading"
        :rules="filteredRules"
        :total="ruleTotal"
        @enabled-change="handleEnabledChange"
        @edit="openRuleEditor"
        @toggle-row-menu="toggleRowMenu"
        @row-menu-action="handleRowMenuAction"
      />
    </ManagePage>

    <template #footer>
      <div class="reader-source-page__footer-bar">
        <ReplaceRuleFooter
          v-model:all-checked="allChecked"
          :selected-count="selectedRuleCount"
          :total="ruleTotal"
          @invert="invertSelection"
          @delete="openDeleteDialog"
        />
      </div>
    </template>

    <template #overlay>
      <input
        ref="localImportInput"
        class="reader-source-file-input"
        type="file"
        accept=".json,.txt,application/json,text/plain"
        @change="handleLocalImportFile"
      />
      <input
        ref="qrImportInput"
        class="reader-source-file-input"
        type="file"
        accept="image/*"
        @change="handleQrImportFile"
      />
      <ManageConfirmDialog
        :open="deleteDialogOpen"
        title="删除替换规则"
        title-id="readerDeleteReplaceRuleTitle"
        :text="`确认删除选中的 ${selectedRuleCount} 个替换规则吗？`"
        :message="deleteDialogMessage"
        confirm-text="删除"
        confirm-variant="danger"
        :submitting="deleteSubmitting"
        submitting-text="删除中..."
        @close="closeDeleteDialog"
        @confirm="confirmDeleteRules"
      />
      <ReplaceRuleGroupDialog
        :open="groupDialogOpen"
        :groups="ruleGroups"
        @close="closeGroupDialog"
      />
      <ManageInputDialog
        :open="networkDialogOpen"
        :model-value="networkImportUrl"
        title="网络导入"
        title-id="readerReplaceNetworkImportTitle"
        label="替换规则地址"
        type="url"
        placeholder="请输入网络替换规则地址"
        :message="networkDialogMessage"
        :submitting="previewingImport"
        submitting-text="解析中..."
        @update:model-value="networkImportUrl = $event.trim()"
        @close="closeNetworkDialog"
        @submit="submitNetworkImport"
      />
      <ReplaceRuleImportDialog
        v-model:selected-keys="selectedImportKeys"
        v-model:all-checked="allImportChecked"
        :open="importDialogOpen"
        :items="importPreviewItems"
        :selected-count="selectedImportCount"
        :message="importDialogMessage"
        :submitting="importSubmitting"
        @close="closeImportDialog"
        @confirm="confirmImport"
      />
    </template>
  </PageLayout>
</template>

<script setup>
import { ref } from "vue";
import ManageConfirmDialog from "../components/ManageConfirmDialog.vue";
import ManageInputDialog from "../components/ManageInputDialog.vue";
import ManagePage from "../components/ManagePage.vue";
import PageLayout from "../components/PageLayout.vue";
import PageTopbar from "../components/PageTopbar.vue";
import ReplaceRuleFooter from "../components/replacement/ReplaceRuleFooter.vue";
import ReplaceRuleGroupDialog from "../components/replacement/ReplaceRuleGroupDialog.vue";
import ReplaceRuleImportDialog from "../components/replacement/ReplaceRuleImportDialog.vue";
import ReplaceRuleList from "../components/replacement/ReplaceRuleList.vue";
import ReplaceRuleSearch from "../components/replacement/ReplaceRuleSearch.vue";
import ReplaceRuleToolbarActions from "../components/replacement/ReplaceRuleToolbarActions.vue";
import { useReplaceRuleManager } from "../composables/useReplaceRuleManager";

const emit = defineEmits(["back", "edit-replace"]);
const rootEl = ref(null);
const localImportInput = ref(null);
const qrImportInput = ref(null);
const manager = useReplaceRuleManager({ rootEl, localImportInput, qrImportInput });

const {
  activeMenu,
  activeRowMenuKey,
  allChecked,
  allImportChecked,
  closeDeleteDialog,
  closeGroupDialog,
  closeImportDialog,
  closeMenu,
  closeNetworkDialog,
  confirmDeleteRules,
  confirmImport,
  deleteDialogMessage,
  deleteDialogOpen,
  deleteSubmitting,
  filteredRules,
  groupDialogOpen,
  handleEnabledChange,
  handleLocalImportFile,
  handleMoreAction,
  handleQrImportFile,
  handleRowMenuAction,
  importDialogMessage,
  importDialogOpen,
  importPreviewItems,
  importSubmitting,
  invertSelection,
  keyword,
  loading,
  moreActions,
  networkDialogMessage,
  networkDialogOpen,
  networkImportUrl,
  openDeleteDialog,
  openGroupDialog,
  previewingImport,
  ruleGroups,
  ruleTotal,
  selectGroup,
  selectedImportCount,
  selectedImportKeys,
  selectedRuleCount,
  selectedRules,
  submitNetworkImport,
  toggleMenu,
  toggleRowMenu
} = manager;

const openRuleEditor = (rule = null) => {
  closeMenu();
  emit(
    "edit-replace",
    rule ? { key: rule.key, name: rule.name } : { key: "", name: "新建替换" }
  );
};

const handleToolbarAction = item => {
  if (handleMoreAction(item) === "create") {
    openRuleEditor();
  }
};
</script>
