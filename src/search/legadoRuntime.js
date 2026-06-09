import { removeSourceCookieJar } from "../data/cookieJar.js";
import { normalizeBaseUrl, toText } from "./legadoCommon.js";
import { runEdgeOneVerification } from "./edgeOneVerify.js";
import { buildLegadoRequest, fetchLegadoResponse } from "./legadoUrl.js";

export const createLegadoRuntimeHelpers = ({
  source,
  variables,
  signal,
  keyword = "",
  page = 1,
  baseUrl = "",
  book = {},
  chapter = {}
}) => {
  const helpers = {
    ajax: async (ruleUrl, runtimeContext = {}) => {
      const request = await buildLegadoRequest({
        source: runtimeContext.source || source,
        ruleUrl,
        keyword: runtimeContext.key || keyword,
        page: runtimeContext.page || page,
        baseUrl: runtimeContext.baseUrl || baseUrl,
        variables: runtimeContext.variables || variables || new Map(),
        book: runtimeContext.book || book,
        chapter: runtimeContext.chapter || chapter,
        ajax: helpers.ajax,
        removeCookie: helpers.removeCookie,
        startBrowserAwait: helpers.startBrowserAwait
      });
      return fetchLegadoResponse(request, signal);
    },
    removeCookie: (key, runtimeContext = {}) => {
      const cookieKey = toText(key).trim();
      removeSourceCookieJar(cookieKey || runtimeContext.source || source);
    },
    startBrowserAwait: async (url, runtimeContext = {}, title = "书源验证") => {
      const runtimeSource = runtimeContext.source || source;
      const targetUrl = toText(url).trim() || normalizeBaseUrl(runtimeSource?.bookSourceUrl);
      await runEdgeOneVerification({
        source: runtimeSource,
        url: targetUrl,
        signal,
        title
      });
      return "";
    }
  };

  return helpers;
};
