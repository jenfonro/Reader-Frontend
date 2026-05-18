export const PAGE_TURN_DRAG_SLOP = 8;
export const PAGE_TURN_DISTANCE_RATIO = 0.18;
export const PAGE_TURN_MIN_DISTANCE = 56;
export const PAGE_TURN_VELOCITY = 0.45;

export const clampProgressRatio = value => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) return 0;
  return Math.min(1, Math.max(0, parsedValue));
};

export const getPageRatio = (page, pageTotal) => {
  const total = Math.max(1, Number(pageTotal) || 1);
  if (total <= 1) return 0;
  return clampProgressRatio((Math.max(1, Number(page) || 1) - 1) / (total - 1));
};

export const getPageByRatio = (ratio, pageTotal) => {
  const total = Math.max(1, Number(pageTotal) || 1);
  if (total <= 1) return 1;
  return Math.min(total, Math.max(1, Math.round(clampProgressRatio(ratio) * (total - 1)) + 1));
};

export const getCommittedPageTurnDirection = ({ delta, velocity, threshold }) => {
  if (delta <= -threshold) return "next";
  if (delta >= threshold) return "previous";
  if (velocity <= -PAGE_TURN_VELOCITY) return "next";
  if (velocity >= PAGE_TURN_VELOCITY) return "previous";
  return "";
};
