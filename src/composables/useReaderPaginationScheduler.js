import { nextTick } from "vue";

const scheduleMicrotask = callback => {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback);
    return;
  }

  Promise.resolve().then(callback);
};

export const useReaderPaginationScheduler = ({ applyPagination }) => {
  let paginationScheduled = false;
  let paginationToken = 0;
  let pendingKeepPage = true;
  let waiters = [];

  const resolveWaiters = () => {
    const currentWaiters = waiters;
    waiters = [];
    currentWaiters.forEach(resolve => resolve());
  };

  const runPagination = async token => {
    if (token !== paginationToken) return;

    paginationScheduled = false;
    const shouldKeepPage = pendingKeepPage;
    pendingKeepPage = true;

    try {
      await nextTick();
      if (token === paginationToken) applyPagination({ keepPage: shouldKeepPage });
    } finally {
      resolveWaiters();
    }
  };

  const schedulePagination = ({ keepPage = true } = {}) => {
    const paginationPromise = new Promise(resolve => {
      waiters.push(resolve);
    });

    pendingKeepPage = pendingKeepPage && keepPage;
    if (paginationScheduled) return paginationPromise;

    paginationScheduled = true;
    paginationToken += 1;
    scheduleMicrotask(() => runPagination(paginationToken));

    return paginationPromise;
  };

  const cleanupPaginationScheduler = () => {
    paginationToken += 1;
    paginationScheduled = false;
    pendingKeepPage = true;
    resolveWaiters();
  };

  return {
    cleanupPaginationScheduler,
    schedulePagination
  };
};
