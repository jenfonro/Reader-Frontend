const emptyFunction = () => undefined;

const asyncJavaCallPattern = /\bjava\.(?:ajax|getElement|getString|startBrowserAwait)\s*\(/g;

const createJavaBridge = context => ({
  ajax: async ruleUrl => {
    if (typeof context.ajax !== "function") return "";
    return context.ajax(ruleUrl, context);
  },
  get: key => context.variables.get(key) || "",
  put: (key, value) => {
    const text = value === null || value === undefined ? "" : String(value);
    context.variables.set(key, text);
    return text;
  },
  getString: async rule => {
    const value = await context.getString(rule, context.content);
    context.lastValue = value;
    return value;
  },
  getElement: async rule => {
    const value = await context.getElements(rule, context.content);
    context.lastValue = value;
    return value;
  },
  setContent: content => {
    context.content = content === null || content === undefined ? "" : String(content);
    return context.content;
  },
  toast: emptyFunction,
  longToast: emptyFunction,
  log: emptyFunction,
  startBrowserAwait: async (url, title) => {
    if (typeof context.startBrowserAwait === "function") {
      return context.startBrowserAwait(url, context, title);
    }
    return undefined;
  }
});

const transformAsyncJavaCalls = script => script.replace(asyncJavaCallPattern, (match, offset, source) => {
  const before = source.slice(Math.max(0, offset - 16), offset);
  return /await\s*$/.test(before) ? match : `await ${match}`;
});

const createScriptScope = (context = {}) => {
  const rawSource = context.source || {};
  const source = {
    ...rawSource,
    getKey: () => rawSource.__sourceKey || rawSource.bookSourceUrl || rawSource.bookSourceName || ""
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
    getString: context.getString || (async () => ""),
    getElements: context.getElements || (async () => []),
    ajax: context.ajax,
    startBrowserAwait: context.startBrowserAwait,
    lastValue: undefined
  };
  const java = createJavaBridge(runtime);
  const cookie = {
    removeCookie: key => {
      if (typeof context.removeCookie === "function") {
        return context.removeCookie(key, runtime);
      }
      return undefined;
    }
  };

  return { runtime, java, cookie, source, book, chapter };
};

const createScriptPreamble = () => `
  let result = initialResult;
  let url, a, c, d, path, r, u;
  const cache = {};
  const runtime = scope.runtime;
  const source = scope.source;
  const book = scope.book;
  const chapter = scope.chapter;
  const baseUrl = runtime.baseUrl;
  const key = runtime.key;
  const page = runtime.page;
  const java = scope.java;
  const cookie = scope.cookie;
`;

const compileExpressionScript = script => new Function(
  "scope",
  "initialResult",
  `${createScriptPreamble()}
  return (async () => {
    const value = await (${script});
    return value === undefined ? result : value;
  })();`
);

const compileStatementScript = script => new Function(
  "scope",
  "initialResult",
  `${createScriptPreamble()}
  return (async () => {
    runtime.lastValue = undefined;
    ${script}
    return runtime.lastValue === undefined ? result : runtime.lastValue;
  })();`
);

const createScriptFunction = script => {
  try {
    return compileExpressionScript(script);
  } catch (error) {
    return compileStatementScript(script);
  }
};

export const evaluateLegadoScript = async (script, context = {}, initialResult = "") => {
  const transformedScript = transformAsyncJavaCalls(String(script || ""));
  const scope = createScriptScope(context);

  try {
    const fn = createScriptFunction(transformedScript);
    const value = await fn(scope, initialResult);
    if (value === null || value === undefined) return "";
    return value;
  } catch (error) {
    return initialResult === null || initialResult === undefined ? "" : initialResult;
  }
};
