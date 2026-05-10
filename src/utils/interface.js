export const getMiniInterface = () =>
  typeof window !== "undefined" && window.innerWidth <= 750;

export const getWindowSize = () => ({
  width: typeof window === "undefined" ? 1024 : window.innerWidth,
  height: typeof window === "undefined" ? 768 : window.innerHeight
});
