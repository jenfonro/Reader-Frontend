export const INTRO_STREAM_INDEX = -1;
export const INTRO_STREAM_KEY = "reader-intro-page";
export const INTRO_STREAM_TYPE = "intro";

export const isIntroStreamItem = item =>
  item?.type === INTRO_STREAM_TYPE || item?.key === INTRO_STREAM_KEY;
