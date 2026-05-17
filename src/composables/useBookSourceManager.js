import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { shouldCloseManageMenu } from "../utils/manageMenu";
import {
  bookSourceMoreActions,
  bookSourceSortItems,
  filterBookSources,
  sortBookSources,
  splitBookSourceGroups
} from "../data/bookSourceUi";
import {
  deleteBookSourcesByKeys,
  moveBookSourceToBottom,
  moveBookSourceToTop,
  readBookSourceList,
  setBookSourceExploreEnabled,
  setBookSourceEnabled
} from "../data/bookSources";
import { useBookSourceImport } from "./useBookSourceImport";
import { useBookSourceSelection } from "./useBookSourceSelection";

export const useBookSourceManager = ({ rootEl, localImportInput } = {}) => {
  const keyword = ref("");
  const activeMenu = ref("");
  const activeRowMenuKey = ref("");
  const reverseSort = ref(false);
  const sortMode = ref("manual");
  const groupDialogOpen = ref(false);
  const deleteDialogOpen = ref(false);
  const sourceItems = ref([]);
  const loading = ref(false);
  const deleteSubmitting = ref(false);
  const deleteDialogMessage = ref("");

  const sortedSources = computed(() =>
    sortBookSources(sourceItems.value, sortMode.value, reverseSort.value)
  );
  const filteredSources = computed(() => filterBookSources(sortedSources.value, keyword.value));
  const sourceTotal = computed(() => sourceItems.value.length);

  const selection = useBookSourceSelection({ sourceItems, filteredSources });

  const loadSources = () => {
    loading.value = true;
    sourceItems.value = readBookSourceList();
    selection.pruneSelection();
    loading.value = false;
  };

  const sourceImport = useBookSourceImport({
    localImportInput,
    loadSources
  });

  const groupNames = computed(() => {
    const names = new Set();
    sourceItems.value.forEach(source =>
      splitBookSourceGroups(source.group).forEach(group => names.add(group))
    );
    return [...names].sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  });

  const groupFilters = computed(() => [
    "已启用",
    "已禁用",
    "已启用发现",
    "已禁用发现",
    ...groupNames.value
  ]);

  const closeMenu = () => {
    activeMenu.value = "";
    activeRowMenuKey.value = "";
  };

  const toggleMenu = name => {
    activeRowMenuKey.value = "";
    activeMenu.value = activeMenu.value === name ? "" : name;
  };

  const toggleRowMenu = source => {
    activeMenu.value = "";
    activeRowMenuKey.value = activeRowMenuKey.value === source?.key ? "" : source?.key || "";
  };

  const handleEnabledChange = (source, enabled) => {
    const updatedSource = setBookSourceEnabled(source.key, enabled);
    if (!updatedSource) return;
    Object.assign(source, updatedSource);
  };

  const openDeleteDialog = () => {
    if (!selection.selectedSourceCount.value) return;
    closeMenu();
    deleteDialogMessage.value = "";
    deleteDialogOpen.value = true;
  };

  const openSingleDeleteDialog = source => {
    if (!source?.key) return;
    selection.selectedSources.value = [source.key];
    openDeleteDialog();
  };

  const closeDeleteDialog = () => {
    if (deleteSubmitting.value) return;
    deleteDialogOpen.value = false;
  };

  const confirmDeleteSources = () => {
    if (deleteSubmitting.value) return;
    if (!selection.selectedSources.value.length) {
      deleteDialogMessage.value = "请选择要删除的书源";
      return;
    }

    deleteSubmitting.value = true;
    deleteDialogMessage.value = "";
    deleteBookSourcesByKeys(selection.selectedSources.value);
    selection.clearSelection();
    deleteDialogOpen.value = false;
    loadSources();
    deleteSubmitting.value = false;
  };

  const openGroupDialog = () => {
    closeMenu();
    groupDialogOpen.value = true;
  };

  const closeGroupDialog = () => {
    groupDialogOpen.value = false;
  };

  const handleMoreAction = item => {
    closeMenu();
    if (!item) return "";
    if (item.action === "local-import") {
      sourceImport.openLocalImport();
      return "";
    }
    if (item.action === "network-import") {
      sourceImport.openNetworkDialog();
      return "";
    }
    return item.action;
  };

  const handleRowMenuAction = (source, action) => {
    closeMenu();
    if (!source?.key) return;
    if (action === "top") {
      moveBookSourceToTop(source.key);
      loadSources();
      return;
    }
    if (action === "bottom") {
      moveBookSourceToBottom(source.key);
      loadSources();
      return;
    }
    if (action === "toggle-explore") {
      setBookSourceExploreEnabled(source.key, !source.enabledExplore);
      loadSources();
      return;
    }
    if (action === "delete") {
      openSingleDeleteDialog(source);
    }
  };

  const handleDocumentPointerDown = event => {
    if (shouldCloseManageMenu(event, rootEl)) closeMenu();
  };

  onMounted(() => {
    document.addEventListener("pointerdown", handleDocumentPointerDown);
    loadSources();
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
    confirmDeleteSources,
    deleteDialogMessage,
    deleteDialogOpen,
    deleteSubmitting,
    filteredSources,
    groupDialogOpen,
    groupFilters,
    handleEnabledChange,
    handleMoreAction,
    handleRowMenuAction,
    keyword,
    loading,
    managedGroups: groupNames,
    moreActions: bookSourceMoreActions,
    openDeleteDialog,
    openGroupDialog,
    reverseSort,
    sortItems: bookSourceSortItems,
    sortMode,
    sourceTotal,
    toggleMenu,
    toggleRowMenu,
    ...selection,
    ...sourceImport
  };
};
