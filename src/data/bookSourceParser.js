import { normalizeBookSourceObject, toBookSourceText } from "./bookSourceCore.js";

const extractSourcesFromParsedValue = value => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  if (Array.isArray(value.sources)) return value.sources;
  if (Array.isArray(value.bookSources)) return value.bookSources;
  if (Array.isArray(value.data)) return value.data;
  if (value.bookSourceUrl || value.bookSourceName) return [value];
  return [];
};

const parseJsonSourceText = text => {
  const parsed = JSON.parse(text);
  return extractSourcesFromParsedValue(parsed);
};

const parseBookSourceLine = line => {
  try {
    return extractSourcesFromParsedValue(JSON.parse(line));
  } catch (error) {
    return [];
  }
};

const parseLineDelimitedSourceText = text => {
  const sources = [];
  text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .forEach(line => {
      sources.push(...parseBookSourceLine(line));
    });
  return sources;
};

export const parseBookSourceText = text => {
  const content = toBookSourceText(text).replace(/^\uFEFF/, "").trim();
  if (!content) return [];

  try {
    return parseJsonSourceText(content).map(normalizeBookSourceObject).filter(Boolean);
  } catch (error) {
    const lineDelimitedSources = parseLineDelimitedSourceText(content);
    if (lineDelimitedSources.length) {
      return lineDelimitedSources.map(normalizeBookSourceObject).filter(Boolean);
    }
    throw new Error("无法解析书源文件，请确认内容为 JSON 书源格式");
  }
};

export const readBookSourceFile = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(parseBookSourceText(reader.result));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("读取书源文件失败"));
    reader.readAsText(file, "utf-8");
  });
