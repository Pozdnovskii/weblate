let headerState = { isOpen: false, toggleMenu: null };
let documentListenersAdded = false;

export function initHeader() {
  const header = document.getElementById("header");
  const burger = document.getElementById("header-btn");
  const nav = document.getElementById("header-nav");
  const headerContent = document.getElementById("header-content");

  if (!header || !burger || !nav) return;

  headerState.isOpen = false;
  header.classList.remove("header--open");
  burger.setAttribute("aria-expanded", "false");
  nav.setAttribute("inert", "");

  if (header.hasAttribute("data-fade-animation")) {
    header.addEventListener("animationend", () => {
      header.removeAttribute("data-fade-animation");
    }, { once: true });
  }

  headerState.toggleMenu = function() {
    headerState.isOpen = !headerState.isOpen;
    header.classList.toggle("header--open", headerState.isOpen);
    burger.setAttribute("aria-expanded", headerState.isOpen);

    if (headerState.isOpen) {
      nav.removeAttribute("inert");
      setTimeout(() => nav?.querySelector("a")?.focus(), 150);
    } else {
      nav.setAttribute("inert", "");
    }
  };

  burger.onclick = headerState.toggleMenu;

  nav.querySelectorAll("a").forEach((link) => {
    link.onclick = () => {
      if (headerState.isOpen) {
        headerState.toggleMenu();
      }
    };
  });

  if (!documentListenersAdded) {
    documentListenersAdded = true;

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && headerState.isOpen && headerState.toggleMenu) {
        headerState.toggleMenu();
        document.getElementById("header-btn")?.focus();
      }
    });

    document.addEventListener("click", (e) => {
      const headerContent = document.getElementById("header-content");
      if (headerState.isOpen && headerContent && !headerContent.contains(e.target)) {
        headerState.toggleMenu();
      }
    });
  }
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
