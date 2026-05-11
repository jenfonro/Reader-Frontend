import { computed, ref } from "vue";
import {
  createReplaceRuleImportPreview,
  importReplaceRules,
  parseReplaceRuleText,
  readReplaceRuleFile
} from "../data/replaceRuleImport";

const hasBarcodeDetector = () =>
  typeof window !== "undefined" && typeof window.BarcodeDetector === "function";

export const useReplaceRuleImport = ({ localImportInput, qrImportInput, loadRules }) => {
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

  const openQrImport = () => {
    networkDialogMessage.value = "";
    importDialogMessage.value = "";
    if (!hasBarcodeDetector()) {
      importPreviewItems.value = [];
      selectedImportKeys.value = [];
      importDialogMessage.value = "当前浏览器不支持二维码识别";
      importDialogOpen.value = true;
      return;
    }
    qrImportInput?.value?.click();
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

  const openImportPreview = rules => {
    const items = createReplaceRuleImportPreview(rules);
    importPreviewItems.value = items;
    selectedImportKeys.value = items
      .filter(item => item.status !== "已有")
      .map(item => item.key);
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
      const rules = await readReplaceRuleFile(file);
      openImportPreview(rules);
    } catch (error) {
      importPreviewItems.value = [];
      selectedImportKeys.value = [];
      importDialogMessage.value = error?.message || "解析替换规则失败";
      importDialogOpen.value = true;
    } finally {
      previewingImport.value = false;
    }
  };

  const handleQrImportFile = async event => {
    const file = event?.target?.files ? event.target.files[0] : null;
    if (event?.target) event.target.value = "";
    if (!file || previewingImport.value || !hasBarcodeDetector()) return;

    previewingImport.value = true;
    try {
      const bitmap = await createImageBitmap(file);
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const codes = await detector.detect(bitmap);
      bitmap.close?.();
      const rawValue = codes[0]?.rawValue || "";
      if (!rawValue) throw new Error("未识别到二维码内容");
      openImportPreview(parseReplaceRuleText(rawValue));
    } catch (error) {
      importPreviewItems.value = [];
      selectedImportKeys.value = [];
      importDialogMessage.value = error?.message || "二维码导入失败";
      importDialogOpen.value = true;
    } finally {
      previewingImport.value = false;
    }
  };

  const submitNetworkImport = async () => {
    if (previewingImport.value) return;
    const url = networkImportUrl.value.trim();
    if (!url) {
      networkDialogMessage.value = "请输入网络替换规则地址";
      return;
    }

    previewingImport.value = true;
    networkDialogMessage.value = "";
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`网络导入失败（${response.status}）`);
      const rules = parseReplaceRuleText(await response.text());
      networkDialogOpen.value = false;
      openImportPreview(rules);
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
      importDialogMessage.value = "请选择要导入的替换规则";
      return;
    }

    importSubmitting.value = true;
    importDialogMessage.value = "";
    importReplaceRules(selectedItems.map(item => item.raw));
    importDialogOpen.value = false;
    loadRules();
    importSubmitting.value = false;
  };

  return {
    allImportChecked,
    closeImportDialog,
    closeNetworkDialog,
    confirmImport,
    handleLocalImportFile,
    handleQrImportFile,
    importDialogMessage,
    importDialogOpen,
    importPreviewItems,
    importSubmitting,
    networkDialogMessage,
    networkDialogOpen,
    networkImportUrl,
    openLocalImport,
    openNetworkDialog,
    openQrImport,
    previewingImport,
    selectedImportCount,
    selectedImportKeys,
    submitNetworkImport
  };
};
