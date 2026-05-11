import { computed, ref } from "vue";

export const useReplaceRuleSelection = ({ ruleItems, filteredRules }) => {
  const selectedRules = ref([]);

  const selectedRuleItems = computed(() => {
    const selectedKeys = new Set(selectedRules.value);
    return ruleItems.value.filter(rule => selectedKeys.has(rule.key));
  });

  const selectedRuleCount = computed(() => selectedRuleItems.value.length);

  const allChecked = computed({
    get() {
      return filteredRules.value.length > 0 && filteredRules.value.every(rule =>
        selectedRules.value.includes(rule.key)
      );
    },
    set(checked) {
      selectedRules.value = checked ? filteredRules.value.map(rule => rule.key) : [];
    }
  });

  const pruneSelection = () => {
    selectedRules.value = selectedRules.value.filter(key =>
      ruleItems.value.some(rule => rule.key === key)
    );
  };

  const clearSelection = () => {
    selectedRules.value = [];
  };

  const invertSelection = () => {
    const visibleKeys = filteredRules.value.map(rule => rule.key);
    const selectedKeys = new Set(selectedRules.value);
    const nextSelected = selectedRules.value.filter(key => !visibleKeys.includes(key));
    visibleKeys.forEach(key => {
      if (!selectedKeys.has(key)) nextSelected.push(key);
    });
    selectedRules.value = nextSelected;
  };

  return {
    allChecked,
    clearSelection,
    invertSelection,
    pruneSelection,
    selectedRuleCount,
    selectedRuleItems,
    selectedRules
  };
};
