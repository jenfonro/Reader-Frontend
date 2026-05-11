<template>
  <PageLayout
    root-class="reader-page--fixed"
    body-class="reader-source-page__body"
    footer-class="reader-source-page__footer"
  >
    <template #header>
      <PageTopbar title="书源管理" back-visible @back="emit('back')" />
    </template>

    <ManagePage ref="rootEl" variant="source" body-label="书源列表">
      <template #toolbar-main>
        <BookSourceSearch v-model="keyword" />
      </template>

      <template #toolbar-actions>
        <BookSourceToolbarActions
          :active-menu="activeMenu"
          v-model:reverse-sort="reverseSort"
          v-model:sort-mode="sortMode"
          :sort-items="sortItems"
          :group-filters="groupFilters"
          :more-actions="moreActions"
          @toggle-menu="toggleMenu"
          @open-group-dialog="openGroupDialog"
          @more-action="handleToolbarAction"
        />
      </template>

      <BookSourceList
        v-model:selected-sources="selectedSources"
        :loading="loading"
        :sources="filteredSources"
        :total="sourceTotal"
        @enabled-change="handleEnabledChange"
        @edit="openSourceEditor"
      />

    </ManagePage>

    <template #footer>
      <div class="reader-source-page__footer-bar">
        <BookSourceFooter
          v-model:all-checked="allChecked"
          :selected-count="selectedSourceCount"
          :total="sourceTotal"
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
      <ManageConfirmDialog
        :open="deleteDialogOpen"
        title="删除书源"
        title-id="readerDeleteSourceTitle"
        :text="`确认删除选中的 ${selectedSourceCount} 个书源吗？`"
        :message="deleteDialogMessage"
        confirm-text="删除"
        confirm-variant="danger"
        :submitting="deleteSubmitting"
        submitting-text="删除中..."
        @close="closeDeleteDialog"
        @confirm="confirmDeleteSources"
      />
      <BookSourceGroupDialog
        :open="groupDialogOpen"
        :groups="managedGroups"
        @close="closeGroupDialog"
      />
      <ManageInputDialog
        :open="networkDialogOpen"
        :model-value="networkImportUrl"
        title="网络导入"
        title-id="readerSourceNetworkImportTitle"
        label="书源地址"
        type="url"
        placeholder="请输入网络书源地址"
        :message="networkDialogMessage"
        :submitting="previewingImport"
        submitting-text="解析中..."
        @update:model-value="networkImportUrl = $event.trim()"
        @close="closeNetworkDialog"
        @submit="submitNetworkImport"
      />
      <BookSourceImportDialog
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
import BookSourceFooter from "../components/book-source/BookSourceFooter.vue";
import BookSourceGroupDialog from "../components/book-source/BookSourceGroupDialog.vue";
import BookSourceImportDialog from "../components/book-source/BookSourceImportDialog.vue";
import BookSourceList from "../components/book-source/BookSourceList.vue";
import BookSourceSearch from "../components/book-source/BookSourceSearch.vue";
import BookSourceToolbarActions from "../components/book-source/BookSourceToolbarActions.vue";
import ManageConfirmDialog from "../components/ManageConfirmDialog.vue";
import ManageInputDialog from "../components/ManageInputDialog.vue";
import ManagePage from "../components/ManagePage.vue";
import PageLayout from "../components/PageLayout.vue";
import PageTopbar from "../components/PageTopbar.vue";
import { useBookSourceManager } from "../composables/useBookSourceManager";

const emit = defineEmits(["back", "edit"]);
const rootEl = ref(null);
const localImportInput = ref(null);
const manager = useBookSourceManager({ rootEl, localImportInput });

const {
  activeMenu,
  allChecked,
  allImportChecked,
  closeDeleteDialog,
  closeGroupDialog,
  closeImportDialog,
  closeMenu,
  closeNetworkDialog,
  confirmDeleteSources,
  confirmImport,
  deleteDialogMessage,
  deleteDialogOpen,
  deleteSubmitting,
  filteredSources,
  groupDialogOpen,
  groupFilters,
  handleEnabledChange,
  handleLocalImportFile,
  handleMoreAction,
  importDialogMessage,
  importDialogOpen,
  importPreviewItems,
  importSubmitting,
  invertSelection,
  keyword,
  loading,
  managedGroups,
  moreActions,
  networkDialogMessage,
  networkDialogOpen,
  networkImportUrl,
  openDeleteDialog,
  openGroupDialog,
  previewingImport,
  reverseSort,
  selectedImportCount,
  selectedImportKeys,
  selectedSourceCount,
  selectedSources,
  sortItems,
  sortMode,
  sourceTotal,
  submitNetworkImport,
  toggleMenu
} = manager;

const openSourceEditor = (source = null) => {
  closeMenu();
  emit("edit", source ? { key: source.key, name: source.name } : { key: "", name: "新建书源" });
};

const handleToolbarAction = item => {
  if (handleMoreAction(item) === "create") {
    openSourceEditor();
  }
};
</script>
