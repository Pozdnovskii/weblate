export function initAccordions() {
  const section = document.getElementById("projects");
  if (!section) return;

  const buttons = section.querySelectorAll("button[aria-controls]");

  const closeTimeouts = new Map();

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const panelId = button.getAttribute("aria-controls");
      if (!panelId) return;

      const panel = document.getElementById(panelId);
      if (!panel) return;

      const isExpanded = button.getAttribute("aria-expanded") === "true";

      buttons.forEach((otherButton) => {
        if (otherButton === button) return;

        const otherPanelId = otherButton.getAttribute("aria-controls");
        if (!otherPanelId) return;

        const otherPanel = document.getElementById(otherPanelId);
        if (!otherPanel || otherPanel.hidden) return;

        otherButton.setAttribute("aria-expanded", "false");

        const existingTimeout = closeTimeouts.get(otherButton);
        if (existingTimeout) clearTimeout(existingTimeout);

        const timeout = setTimeout(() => {
          otherPanel.hidden = true;
          closeTimeouts.delete(otherButton);
        }, 600);

        closeTimeouts.set(otherButton, timeout);
      });

      if (isExpanded) {
        button.setAttribute("aria-expanded", "false");

        const existingTimeout = closeTimeouts.get(button);
        if (existingTimeout) clearTimeout(existingTimeout);

        const timeout = setTimeout(() => {
          panel.hidden = true;

          if (panel.contains(document.activeElement)) {
            button.focus();
          }

          closeTimeouts.delete(button);
        }, 600);

        closeTimeouts.set(button, timeout);
      } else {
        panel.hidden = false;

        requestAnimationFrame(() => {
          button.setAttribute("aria-expanded", "true");
        });
      }
    });
  });
}
