export function initHeader() {
  const header = document.getElementById("header");
  const burger = document.getElementById("header-btn");
  const nav = document.getElementById("header-nav");
  const headerContent = document.getElementById("header-content");

  if (!header) return;

  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
    header.classList.toggle("header--open", isOpen);
    burger.setAttribute("aria-expanded", isOpen);

    if (isOpen) {
      nav.removeAttribute("inert");
      setTimeout(() => nav?.querySelector("a")?.focus(), 150);
    } else {
      nav.setAttribute("inert", "");
    }
  }

  burger.addEventListener("click", toggleMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      toggleMenu();
      burger.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (isOpen && !headerContent.contains(e.target)) {
      toggleMenu();
    }
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (isOpen) {
        toggleMenu();
      }
    });
  });
}

export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const id = anchor.getAttribute("href").substring(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}
