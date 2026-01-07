// import { waapi } from 'animejs';

// const animation = waapi.animate(targets, parameters);

import { animate, svg, stagger, createTimeline } from "animejs";

export function initGoUpAnimation() {
  console.log("initGoUpAnimation called");
  const goUp = document.getElementById("goUpIcon");
  if (!goUp) return;

  const animation = animate(svg.createDrawable("#goUpIcon path"), {
    draw: "0 1",
    duration: 600,
    delay: stagger(600),
    autoplay: false,
  });

  const tl = createTimeline().sync(animation);

  goUp.addEventListener("mouseenter", () => {
    tl.restart();
  });
}
