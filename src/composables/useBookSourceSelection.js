import { computed, ref } from "vue";

export const useBookSourceSelection = ({ sourceItems, filteredSources }) => {
  const selectedSources = ref([]);

  const selectedSourceItems = computed(() => {
    const selectedKeys = new Set(selectedSources.value);
    return sourceItems.value.filter(source => selectedKeys.has(source.key));
  });

  const selectedSourceCount = computed(() => selectedSourceItems.value.length);

  const allChecked = computed({
    get() {
      return filteredSources.value.length > 0 && filteredSources.value.every(source =>
        selectedSources.value.includes(source.key)
      );
    },
    set(checked) {
      selectedSources.value = checked ? filteredSources.value.map(source => source.key) : [];
    }
  });

  const pruneSelection = () => {
    selectedSources.value = selectedSources.value.filter(key =>
      sourceItems.value.some(source => source.key === key)
    );
  };

  const clearSelection = () => {
    selectedSources.value = [];
  };

  const invertSelection = () => {
    const visibleKeys = filteredSources.value.map(source => source.key);
    const selectedKeys = new Set(selectedSources.value);
    const nextSelected = selectedSources.value.filter(key => !visibleKeys.includes(key));
    visibleKeys.forEach(key => {
      if (!selectedKeys.has(key)) nextSelected.push(key);
    });
    selectedSources.value = nextSelected;
  };

  return {
    allChecked,
    clearSelection,
    invertSelection,
    pruneSelection,
    selectedSourceCount,
    selectedSourceItems,
    selectedSources
  };
};
