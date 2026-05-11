import { computed, ref } from "vue";
import {
  createImportPreview,
  importBookSources,
  parseBookSourceText,
  readBookSourceFile
} from "../data/bookSources";

export const useBookSourceImport = ({ localImportInput, loadSources }) => {
  const networkDialogOpen = ref(false);
  const importDialogOpen = ref(false);
  const importPreviewItems = ref([]);
  const selectedImportKeys = ref([]);
  const networkImportUrl = ref("");
  const previewingImport = ref(false);
  const importSubmitting = ref(false);
  const networkDialogMessage = ref("");
  const importDialogMessage = ref("");

  const selectedImportCount = computed(() => selectedImportKeys.value.length);

  const allImportChecked = computed({
    get() {
      return importPreviewItems.value.length > 0 && importPreviewItems.value.every(item =>
        selectedImportKeys.value.includes(item.key)
      );
    },
    set(checked) {
      selectedImportKeys.value = checked ? importPreviewItems.value.map(item => item.key) : [];
    }
  });

  const openLocalImport = () => {
    networkDialogMessage.value = "";
    importDialogMessage.value = "";
    localImportInput?.value?.click();
  };

  const openNetworkDialog = () => {
    networkImportUrl.value = "";
    networkDialogMessage.value = "";
    networkDialogOpen.value = true;
  };

  const closeNetworkDialog = () => {
    if (previewingImport.value) return;
    networkDialogOpen.value = false;
  };

  const openImportPreview = sources => {
    const items = createImportPreview(sources);
    importPreviewItems.value = items;
    selectedImportKeys.value = items.map(item => item.key);
    importDialogMessage.value = "";
    importDialogOpen.value = true;
  };

  const closeImportDialog = () => {
    if (importSubmitting.value) return;
    importDialogOpen.value = false;
  };

  const handleLocalImportFile = async event => {
    const file = event?.target?.files ? event.target.files[0] : null;
    if (event?.target) event.target.value = "";
    if (!file || previewingImport.value) return;

    previewingImport.value = true;
    try {
      const sources = await readBookSourceFile(file);
      openImportPreview(sources);
    } catch (error) {
      importPreviewItems.value = [];
      selectedImportKeys.value = [];
      importDialogMessage.value = error?.message || "解析书源失败";
      importDialogOpen.value = true;
    } finally {
      previewingImport.value = false;
    }
  };

  const submitNetworkImport = async () => {
    if (previewingImport.value) return;
    const url = networkImportUrl.value.trim();
    if (!url) {
      networkDialogMessage.value = "请输入网络书源地址";
      return;
    }

    previewingImport.value = true;
    networkDialogMessage.value = "";
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`网络导入失败（${response.status}）`);
      const sources = parseBookSourceText(await response.text());
      networkDialogOpen.value = false;
      openImportPreview(sources);
    } catch (error) {
      networkDialogMessage.value = error?.message || "网络导入失败";
    } finally {
      previewingImport.value = false;
    }
  };

  const confirmImport = () => {
    if (importSubmitting.value) return;
    const selectedKeys = new Set(selectedImportKeys.value);
    const selectedItems = importPreviewItems.value.filter(item => selectedKeys.has(item.key));
    if (!selectedItems.length) {
      importDialogMessage.value = "请选择要导入的书源";
      return;
    }

    importSubmitting.value = true;
    importDialogMessage.value = "";
    importBookSources(selectedItems.map(item => item.raw));
    importDialogOpen.value = false;
    loadSources();
    importSubmitting.value = false;
  };

  return {
    allImportChecked,
    closeImportDialog,
    closeNetworkDialog,
    confirmImport,
    handleLocalImportFile,
    importDialogMessage,
    importDialogOpen,
    importPreviewItems,
    importSubmitting,
    networkDialogMessage,
    networkDialogOpen,
    networkImportUrl,
    openLocalImport,
    openNetworkDialog,
    previewingImport,
    selectedImportCount,
    selectedImportKeys,
    submitNetworkImport
  };
};
