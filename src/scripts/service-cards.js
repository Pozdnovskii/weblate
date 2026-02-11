export function initServiceCardAnimations() {
  const container = document.getElementById("services");
  if (!container) return;

  const cards = container.querySelectorAll("[data-service]");
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const svg = entry.target.querySelector(".service-icon");
          if (svg) {
            triggerSvgAnimations(svg);
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 1.0 },
  );

  cards.forEach((card) => observer.observe(card));
}

function triggerSvgAnimations(svg) {
  const animations = svg.querySelectorAll("animate, animateTransform");

  animations.forEach((anim) => {
    const delay = parseFloat(anim.getAttribute("data-delay") || "0") * 1000;

    setTimeout(() => {
      anim.beginElement();
    }, delay);
  });
}
