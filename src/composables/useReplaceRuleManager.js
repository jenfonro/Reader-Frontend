import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { replaceRuleMoreActions } from "../data/replaceRuleUi";
import {
  deleteReplaceRulesByKeys,
  filterReplaceRules,
  moveReplaceRuleToBottom,
  moveReplaceRuleToTop,
  readReplaceRuleList,
  setReplaceRuleEnabled,
  splitReplaceRuleGroups
} from "../data/replaceRules";
import { useReplaceRuleImport } from "./useReplaceRuleImport";
import { useReplaceRuleSelection } from "./useReplaceRuleSelection";

export const useReplaceRuleManager = ({ rootEl, localImportInput, qrImportInput } = {}) => {
  const keyword = ref("");
  const activeMenu = ref("");
  const activeRowMenuKey = ref("");
  const groupFilter = ref("");
  const groupDialogOpen = ref(false);
  const deleteDialogOpen = ref(false);
  const deleteSubmitting = ref(false);
  const deleteDialogMessage = ref("");
  const loading = ref(false);
  const ruleItems = ref([]);

  const filteredRules = computed(() =>
    filterReplaceRules(ruleItems.value, keyword.value, groupFilter.value)
  );
  const ruleTotal = computed(() => ruleItems.value.length);
  const ruleGroups = computed(() => {
    const groups = new Set();
    ruleItems.value.forEach(rule => {
      splitReplaceRuleGroups(rule.group).forEach(group => groups.add(group));
    });
    return [...groups].sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));
  });

  const selection = useReplaceRuleSelection({ ruleItems, filteredRules });

  const loadRules = () => {
    loading.value = true;
    ruleItems.value = readReplaceRuleList();
    selection.pruneSelection();
    loading.value = false;
  };

  const replaceRuleImport = useReplaceRuleImport({
    localImportInput,
    qrImportInput,
    loadRules
  });

  const closeMenu = () => {
    activeMenu.value = "";
    activeRowMenuKey.value = "";
  };

  const toggleMenu = name => {
    activeRowMenuKey.value = "";
    activeMenu.value = activeMenu.value === name ? "" : name;
  };

  const toggleRowMenu = rule => {
    activeMenu.value = "";
    activeRowMenuKey.value = activeRowMenuKey.value === rule?.key ? "" : rule?.key || "";
  };

  const openGroupDialog = () => {
    closeMenu();
    groupDialogOpen.value = true;
  };

  const closeGroupDialog = () => {
    groupDialogOpen.value = false;
  };

  const selectGroup = group => {
    groupFilter.value = group;
    closeMenu();
  };

  const handleEnabledChange = (rule, enabled) => {
    const updatedRule = setReplaceRuleEnabled(rule.key, enabled);
    if (!updatedRule) return;
    Object.assign(rule, updatedRule);
  };

  const openDeleteDialog = () => {
    if (!selection.selectedRuleCount.value) return;
    closeMenu();
    deleteDialogMessage.value = "";
    deleteDialogOpen.value = true;
  };

  const openSingleDeleteDialog = rule => {
    if (!rule?.key) return;
    selection.selectedRules.value = [rule.key];
    openDeleteDialog();
  };

  const closeDeleteDialog = () => {
    if (deleteSubmitting.value) return;
    deleteDialogOpen.value = false;
  };

  const confirmDeleteRules = () => {
    if (deleteSubmitting.value) return;
    if (!selection.selectedRules.value.length) {
      deleteDialogMessage.value = "请选择要删除的替换规则";
      return;
    }

    deleteSubmitting.value = true;
    deleteDialogMessage.value = "";
    deleteReplaceRulesByKeys(selection.selectedRules.value);
    selection.clearSelection();
    deleteDialogOpen.value = false;
    loadRules();
    deleteSubmitting.value = false;
  };

  const handleMoreAction = item => {
    closeMenu();
    if (!item) return "";
    if (item.action === "local-import") {
      replaceRuleImport.openLocalImport();
      return "";
    }
    if (item.action === "network-import") {
      replaceRuleImport.openNetworkDialog();
      return "";
    }
    if (item.action === "qr-import") {
      replaceRuleImport.openQrImport();
      return "";
    }
    return item.action;
  };

  const handleRowMenuAction = (rule, action) => {
    closeMenu();
    if (!rule?.key) return;
    if (action === "top") {
      moveReplaceRuleToTop(rule.key);
      loadRules();
      return;
    }
    if (action === "bottom") {
      moveReplaceRuleToBottom(rule.key);
      loadRules();
      return;
    }
    if (action === "delete") {
      openSingleDeleteDialog(rule);
    }
  };

  const handleDocumentPointerDown = event => {
    const target = event?.target || null;
    const rootElement = rootEl?.value?.getRootElement ? rootEl.value.getRootElement() : null;
    if (!target || !rootElement || !rootElement.contains(target)) {
      closeMenu();
      return;
    }
    if (target.closest(".reader-manage-menu") || target.closest(".reader-manage-icon-button")) return;
    if (target.closest(".reader-manage-row-icon-button")) return;
    closeMenu();
  };

  onMounted(() => {
    document.addEventListener("pointerdown", handleDocumentPointerDown);
    loadRules();
  });

  onBeforeUnmount(() => {
    document.removeEventListener("pointerdown", handleDocumentPointerDown);
  });

  return {
    activeMenu,
    activeRowMenuKey,
    closeDeleteDialog,
    closeGroupDialog,
    closeMenu,
    confirmDeleteRules,
    deleteDialogMessage,
    deleteDialogOpen,
    deleteSubmitting,
    filteredRules,
    groupDialogOpen,
    handleEnabledChange,
    handleMoreAction,
    handleRowMenuAction,
    keyword,
    loading,
    moreActions: replaceRuleMoreActions,
    openDeleteDialog,
    openGroupDialog,
    ruleGroups,
    ruleTotal,
    selectGroup,
    toggleMenu,
    toggleRowMenu,
    ...selection,
    ...replaceRuleImport
  };
};
