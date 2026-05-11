const emptyFunction = () => undefined;

const createJavaBridge = context => ({
  ajax: () => "",
  get: key => context.variables.get(key) || "",
  put: (key, value) => {
    const text = value === null || value === undefined ? "" : String(value);
    context.variables.set(key, text);
    return text;
  },
  getString: rule => context.getString(rule),
  getElement: rule => context.getElements(rule),
  setContent: content => {
    context.content = content;
    return content;
  },
  toast: emptyFunction,
  longToast: emptyFunction,
  log: emptyFunction,
  startBrowserAwait: emptyFunction
});

export const evaluateLegadoScript = (script, context = {}, initialResult = "") => {
  const rawSource = context.source || {};
  const source = {
    ...rawSource,
    getKey: () => rawSource.bookSourceUrl || rawSource.bookSourceName || ""
  };
  const book = context.book || {
    origin: source.bookSourceUrl || "",
    originName: source.bookSourceName || ""
  };
  const chapter = context.chapter || {};
  const runtime = {
    variables: context.variables || new Map(),
    content: context.content,
    source,
    book,
    chapter,
    key: context.key || "",
    page: context.page || 1,
    baseUrl: context.baseUrl || source.bookSourceUrl || "",
    getString: context.getString || (() => ""),
    getElements: context.getElements || (() => [])
  };
  const java = createJavaBridge(runtime);
  const body = `
    let result = initialResult;
    let url, a, c, d, path, r, u;
    const cookie = { removeCookie: function () {} };
    const cache = {};
    const source = runtime.source;
    const book = runtime.book;
    const chapter = runtime.chapter;
    const baseUrl = runtime.baseUrl;
    const key = runtime.key;
    const page = runtime.page;
    const java = runtime.java;
    const value = eval(script);
    return value === undefined ? result : value;
  `;

  try {
    const fn = new Function("runtime", "script", "initialResult", body);
    const value = fn({ ...runtime, java }, script, initialResult);
    if (value === null || value === undefined) return "";
    return value;
  } catch (error) {
    return initialResult === null || initialResult === undefined ? "" : initialResult;
  }
};
