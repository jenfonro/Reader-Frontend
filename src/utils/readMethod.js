export const READ_METHODS = Object.freeze(["覆盖", "平移", "上下", "无动画"]);

export const normalizeReadMethod = method =>
  READ_METHODS.includes(method) ? method : "上下";

export const isVerticalReadMethod = method => normalizeReadMethod(method) === "上下";

export const isHorizontalReadMethod = method => !isVerticalReadMethod(method);
