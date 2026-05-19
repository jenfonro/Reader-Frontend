import { nextTick } from "vue";

const scheduleMicrotask = callback => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback);
    return;
  }

  Promise.resolve().then(callback);
};

export const useReaderLayoutScheduler = ({ applyLayout }) => {
  let layoutScheduled = false;
  let layoutToken = 0;
  let pendingKeepPosition = true;
  let waiters = [];

  const resolveWaiters = () => {
    const currentWaiters = waiters;
    waiters = [];
    currentWaiters.forEach(resolve => resolve());
  };

  const runLayout = async token => {
    if (token !== layoutToken) return;

    layoutScheduled = false;
    const shouldKeepPosition = pendingKeepPosition;
    pendingKeepPosition = true;

    try {
      await nextTick();
      if (token === layoutToken) await applyLayout({ keepPosition: shouldKeepPosition });
    } finally {
      resolveWaiters();
    }
  };

  const scheduleLayout = ({ keepPosition = true } = {}) => {
    const layoutPromise = new Promise(resolve => {
      waiters.push(resolve);
    });

    pendingKeepPosition = pendingKeepPosition && keepPosition;
    if (layoutScheduled) return layoutPromise;

    layoutScheduled = true;
    layoutToken += 1;
    scheduleMicrotask(() => runLayout(layoutToken));

    return layoutPromise;
  };

  const cleanupLayoutScheduler = () => {
    layoutToken += 1;
    layoutScheduled = false;
    pendingKeepPosition = true;
    resolveWaiters();
  };

  return {
    cleanupLayoutScheduler,
    scheduleLayout
  };
};
