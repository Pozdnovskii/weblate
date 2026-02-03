export function initHoverDirection() {
  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!canHover || reduceMotion) return;

  const getDirection = (e, rect) => {
    const y = e.clientY - rect.top;
    return y < rect.height / 2 ? "top" : "bottom";
  };

  const handlePointerEnter = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.dataset.enter = getDirection(e, rect);
    delete el.dataset.leave;
  };

  const handlePointerLeave = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.dataset.leave = getDirection(e, rect);
    delete el.dataset.enter;
  };

  const elements = document.querySelectorAll("[data-hover-direction]");

  elements.forEach((el) => {
    el.addEventListener("pointerenter", handlePointerEnter);
    el.addEventListener("pointerleave", handlePointerLeave);
  });

  return () => {
    elements.forEach((el) => {
      el.removeEventListener("pointerenter", handlePointerEnter);
      el.removeEventListener("pointerleave", handlePointerLeave);
    });
  };
}
