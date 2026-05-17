export const CLICK_AREA_MODE_THREE_ZONE = "three-zone";
export const CLICK_AREA_MODE_NINE_GRID = "nine-grid";

export const CLICK_AREA_ACTION_PREVIOUS = "previous-page";
export const CLICK_AREA_ACTION_MENU = "toggle-menu";
export const CLICK_AREA_ACTION_NEXT = "next-page";
export const CLICK_AREA_ACTION_NONE = "none";

export const clickAreaModes = [
  { label: "三段式", value: CLICK_AREA_MODE_THREE_ZONE },
  { label: "九宫格", value: CLICK_AREA_MODE_NINE_GRID }
];

export const clickAreaActionOptions = [
  { label: "上一页", value: CLICK_AREA_ACTION_PREVIOUS },
  { label: "显示菜单", value: CLICK_AREA_ACTION_MENU },
  { label: "下一页", value: CLICK_AREA_ACTION_NEXT },
  { label: "无操作", value: CLICK_AREA_ACTION_NONE }
];

const clickAreaZoneMap = {
  [CLICK_AREA_MODE_THREE_ZONE]: [
    { key: "top", label: "上方" },
    { key: "middle", label: "中间" },
    { key: "bottom", label: "下方" }
  ],
  [CLICK_AREA_MODE_NINE_GRID]: [
    { key: "top-left", label: "左上" },
    { key: "top", label: "上方" },
    { key: "top-right", label: "右上" },
    { key: "middle-left", label: "左侧" },
    { key: "middle", label: "中间" },
    { key: "middle-right", label: "右侧" },
    { key: "bottom-left", label: "左下" },
    { key: "bottom", label: "下方" },
    { key: "bottom-right", label: "右下" }
  ]
};

const defaultClickAreaActions = {
  [CLICK_AREA_MODE_THREE_ZONE]: {
    top: CLICK_AREA_ACTION_PREVIOUS,
    middle: CLICK_AREA_ACTION_MENU,
    bottom: CLICK_AREA_ACTION_NEXT
  },
  [CLICK_AREA_MODE_NINE_GRID]: {
    "top-left": CLICK_AREA_ACTION_PREVIOUS,
    top: CLICK_AREA_ACTION_PREVIOUS,
    "top-right": CLICK_AREA_ACTION_PREVIOUS,
    "middle-left": CLICK_AREA_ACTION_PREVIOUS,
    middle: CLICK_AREA_ACTION_MENU,
    "middle-right": CLICK_AREA_ACTION_NEXT,
    "bottom-left": CLICK_AREA_ACTION_NEXT,
    bottom: CLICK_AREA_ACTION_NEXT,
    "bottom-right": CLICK_AREA_ACTION_NEXT
  }
};

export const createDefaultClickAreaActions = () =>
  Object.fromEntries(
    Object.entries(defaultClickAreaActions).map(([mode, actions]) => [
      mode,
      { ...actions }
    ])
  );

export const getClickAreaZones = mode =>
  clickAreaZoneMap[mode] || clickAreaZoneMap[CLICK_AREA_MODE_THREE_ZONE];

export const getClickAreaModeLabel = mode =>
  clickAreaModes.find(item => item.value === mode)?.label || clickAreaModes[0].label;

export const getClickAreaActionLabel = action =>
  clickAreaActionOptions.find(item => item.value === action)?.label || "无操作";

export const normalizeClickAreaActions = actions => {
  const defaults = createDefaultClickAreaActions();
  if (!actions || typeof actions !== "object") return defaults;
  return Object.fromEntries(
    Object.entries(defaults).map(([mode, modeDefaults]) => [
      mode,
      { ...modeDefaults, ...(actions[mode] || {}) }
    ])
  );
};

export const getModeClickAreaActions = (mode, actions) => {
  const normalized = normalizeClickAreaActions(actions);
  return normalized[mode] || normalized[CLICK_AREA_MODE_THREE_ZONE];
};

const resolveThreeZoneKey = (point, size) => {
  if (point.y < size.height / 3) return "top";
  if (point.y < (size.height * 2) / 3) return "middle";
  return "bottom";
};

const resolveNineGridKey = (point, size) => {
  const row = point.y < size.height / 3
    ? "top"
    : point.y < (size.height * 2) / 3
      ? "middle"
      : "bottom";
  const column = point.x < size.width / 3
    ? "left"
    : point.x < (size.width * 2) / 3
      ? "center"
      : "right";
  if (row === "middle" && column === "center") return "middle";
  if (column === "center") return row;
  return `${row}-${column}`;
};

export const resolveClickAreaAction = ({ mode, actions, point, size }) => {
  const areaMode = mode || CLICK_AREA_MODE_THREE_ZONE;
  const zoneKey = areaMode === CLICK_AREA_MODE_NINE_GRID
    ? resolveNineGridKey(point, size)
    : resolveThreeZoneKey(point, size);
  const modeActions = getModeClickAreaActions(areaMode, actions);
  return modeActions[zoneKey] || CLICK_AREA_ACTION_NONE;
};
