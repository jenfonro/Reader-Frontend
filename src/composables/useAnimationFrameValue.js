export const useAnimationFrameValue = ({ apply }) => {
  let frame = 0;
  let pendingValue;

  const cancel = () => {
    if (!frame) return;
    window.cancelAnimationFrame(frame);
    frame = 0;
  };

  const set = value => {
    cancel();
    pendingValue = value;
    apply(value);
  };

  const schedule = value => {
    pendingValue = value;
    if (frame) return;

    frame = window.requestAnimationFrame(() => {
      frame = 0;
      apply(pendingValue);
    });
  };

  const flush = () => {
    if (!frame) return;
    cancel();
    apply(pendingValue);
  };

  return {
    cancel,
    flush,
    schedule,
    set
  };
};
