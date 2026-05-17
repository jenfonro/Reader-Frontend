const DB_NAME = "reader-frontend-user-data";
const DB_VERSION = 1;
const STORE_NAME = "keyValue";

const memoryStore = new Map();
let dbPromise = null;

const cloneJsonValue = value => {
  if (value === undefined) return value;

  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
    }
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const requestStoragePersistence = async () => {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return;

  try {
    const persisted = await navigator.storage.persisted?.();
    if (!persisted) await navigator.storage.persist();
  } catch {
  }
};

const openDatabase = () => {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise(resolve => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });

  return dbPromise;
};

const readIndexedValue = async key => {
  const database = await openDatabase();
  if (!database) return undefined;

  return new Promise(resolve => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(key);

    request.onsuccess = () => resolve(request.result?.value);
    request.onerror = () => resolve(undefined);
    transaction.onerror = () => resolve(undefined);
    transaction.onabort = () => resolve(undefined);
  });
};

const writeIndexedValue = async (key, value) => {
  const database = await openDatabase();
  if (!database) return;

  await new Promise(resolve => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ key, value: cloneJsonValue(value) });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => resolve();
    transaction.onabort = () => resolve();
  });
};

export const readPersistentJson = (key, defaultValue = null) => {
  if (!memoryStore.has(key)) return cloneJsonValue(defaultValue);
  return cloneJsonValue(memoryStore.get(key));
};

export const writePersistentJson = (key, value) => {
  const nextValue = cloneJsonValue(value);
  memoryStore.set(key, nextValue);
  void writeIndexedValue(key, nextValue);
  return cloneJsonValue(nextValue);
};

export const hydratePersistentStorage = async keys => {
  if (!Array.isArray(keys) || !keys.length) return;

  await requestStoragePersistence();
  await Promise.all(keys.map(async key => {
    const value = await readIndexedValue(key);
    if (value !== undefined) memoryStore.set(key, cloneJsonValue(value));
  }));
};
