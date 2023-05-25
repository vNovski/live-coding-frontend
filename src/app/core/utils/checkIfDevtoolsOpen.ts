export const isDevtoolsOpen = () => {
  const threshold = 170;
  const isOpen =
    globalThis.outerWidth - globalThis.innerWidth > threshold ||
    globalThis.outerHeight - globalThis.innerHeight > threshold;

  return (
    ((globalThis as any).Firebug &&
      (globalThis as any).Firebug.chrome &&
      (globalThis as any).Firebug.chrome.isInitialized) ||
    isOpen
  );
};
