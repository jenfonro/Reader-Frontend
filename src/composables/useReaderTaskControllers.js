export const useReaderTaskControllers = ({ onAbortBookInfo, onAbortReader } = {}) => {
  let readerController = null;
  let bookInfoController = null;
  const streamControllers = new Set();
  const streamTasks = new Map();

  const abortBookInfoTask = () => {
    onAbortBookInfo?.();
    if (!bookInfoController) return;
    bookInfoController.abort();
    bookInfoController = null;
  };

  const abortStreamTasks = () => {
    streamControllers.forEach(controller => controller.abort());
    streamControllers.clear();
    streamTasks.clear();
  };

  const abortReaderTask = () => {
    onAbortReader?.();
    abortStreamTasks();
    abortBookInfoTask();
    if (!readerController) return;
    readerController.abort();
    readerController = null;
  };

  const startReaderTask = () => {
    abortReaderTask();
    readerController = new AbortController();
    return readerController;
  };

  const startBookInfoTask = () => {
    abortBookInfoTask();
    bookInfoController = new AbortController();
    return bookInfoController;
  };

  const clearReaderTask = controller => {
    if (readerController === controller) readerController = null;
  };

  const clearBookInfoTask = controller => {
    if (bookInfoController === controller) bookInfoController = null;
  };

  const runStreamTask = (key, executor) => {
    if (streamTasks.has(key)) return streamTasks.get(key);

    const controller = new AbortController();
    streamControllers.add(controller);

    const task = (async () => {
      try {
        return await executor(controller.signal);
      } finally {
        streamControllers.delete(controller);
        streamTasks.delete(key);
      }
    })();

    streamTasks.set(key, task);
    return task;
  };

  return {
    abortReaderTask,
    clearBookInfoTask,
    clearReaderTask,
    runStreamTask,
    startBookInfoTask,
    startReaderTask
  };
};
