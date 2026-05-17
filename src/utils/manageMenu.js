const getRootElement = rootEl =>
  rootEl?.value?.getRootElement ? rootEl.value.getRootElement() : null;

export const shouldCloseManageMenu = (event, rootEl) => {
  const target = event?.target || null;
  const rootElement = getRootElement(rootEl);

  if (!target || !rootElement || !rootElement.contains(target)) return true;
  if (target.closest(".reader-manage-menu") || target.closest(".reader-manage-icon-button")) return false;
  if (target.closest(".reader-manage-row-icon-button")) return false;
  return true;
};
