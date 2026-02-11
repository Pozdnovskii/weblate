export function initHowToTabs() {
  const container = document.getElementById("how-to");
  if (!container) return;

  const tabButtons = container.querySelectorAll("[data-tab-button]");
  const tabPanels = container.querySelectorAll("[data-tab-panel]");

  if (!tabButtons.length || !tabPanels.length) return;

  function activateTab(newTab) {
    tabButtons.forEach((btn) => {
      btn.setAttribute("aria-selected", "false");
      btn.setAttribute("tabindex", "-1");
    });
    tabPanels.forEach((panel) => {
      panel.hidden = true;
    });

    newTab.setAttribute("aria-selected", "true");
    newTab.setAttribute("tabindex", "0");

    const panelId = newTab.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.hidden = false;
    }
    newTab.focus();
  }

  tabButtons.forEach((button, idx) => {
    button.addEventListener("click", () => activateTab(button));

    button.addEventListener("keydown", (e) => {
      let newIdx = idx;

      if (e.key === "ArrowRight") {
        newIdx = (idx + 1) % tabButtons.length;
      } else if (e.key === "ArrowLeft") {
        newIdx = (idx - 1 + tabButtons.length) % tabButtons.length;
      } else if (e.key === "Home") {
        newIdx = 0;
      } else if (e.key === "End") {
        newIdx = tabButtons.length - 1;
      } else {
        return;
      }

      e.preventDefault();
      activateTab(tabButtons[newIdx]);
    });
  });
}
