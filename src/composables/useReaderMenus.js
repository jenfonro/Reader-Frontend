import { ref } from "vue";

export const useReaderMenus = () => {
  const popBookSourceVisible = ref(false);
  const catalogPanelVisible = ref(false);
  const readSettingsVisible = ref(false);
  const readerMoreVisible = ref(false);
  const clickAreaEditorVisible = ref(false);
  const bookIntroVisible = ref(false);
  const showToolBar = ref(false);
  const showCacheContentZone = ref(false);

  const closeReaderSubPanels = () => {
    popBookSourceVisible.value = false;
    catalogPanelVisible.value = false;
    readSettingsVisible.value = false;
    readerMoreVisible.value = false;
    showCacheContentZone.value = false;
  };

  const toggleBookSourcePanel = () => {
    const nextVisible = !popBookSourceVisible.value;
    closeReaderSubPanels();
    popBookSourceVisible.value = nextVisible;
  };

  const toggleCacheContent = () => {
    const nextVisible = !showCacheContentZone.value;
    closeReaderSubPanels();
    showCacheContentZone.value = nextVisible;
  };

  const toggleCatalogPanel = () => {
    const nextVisible = !catalogPanelVisible.value;
    closeReaderSubPanels();
    catalogPanelVisible.value = nextVisible;
  };

  const toggleReadSettings = () => {
    const nextVisible = !readSettingsVisible.value;
    closeReaderSubPanels();
    readSettingsVisible.value = nextVisible;
  };

  const closeReaderMenus = () => {
    closeReaderSubPanels();
    showToolBar.value = false;
  };

  const hasVisibleReaderMenu = () =>
    showToolBar.value ||
    popBookSourceVisible.value ||
    catalogPanelVisible.value ||
    readSettingsVisible.value ||
    readerMoreVisible.value ||
    showCacheContentZone.value;

  return {
    popBookSourceVisible,
    catalogPanelVisible,
    readSettingsVisible,
    readerMoreVisible,
    clickAreaEditorVisible,
    bookIntroVisible,
    showToolBar,
    showCacheContentZone,
    closeReaderMenus,
    hasVisibleReaderMenu,
    toggleBookSourcePanel,
    toggleCacheContent,
    toggleCatalogPanel,
    toggleReadSettings
  };
};
