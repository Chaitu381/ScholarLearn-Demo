type ScrollToPageTopOptions = {
  behavior?: ScrollBehavior;
};

export function scrollToPageTop({
  behavior = "smooth",
}: ScrollToPageTopOptions = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.scrollTo({
    behavior,
    left: 0,
    top: 0,
  });
}
