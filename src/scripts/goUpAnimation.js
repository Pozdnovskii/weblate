import { animate, svg, stagger, createTimeline } from "animejs";

animate("#stagger div", {
  // boxShadow: [
  //   {
  //     to: stagger([1, 0.25], {
  //       modifier: (v) => `0 0 ${v * 10}px ${v * 10}px currentColor`,
  //       from: "center",
  //     }),
  //   },
  //   { to: 0 },
  // ],
  borderRadius: [
    {
      to: stagger([1, 0.25], {
        modifier: (v) => `${v * 100}%`,
        from: "center",
      }),
    },
    // { to: 0 },
  ],
  delay: stagger(1000, { from: "center" }),
  // loop: true,
  duration: 4000,
});

const goUp = document.getElementById("goUpIcon");

const animation = animate(svg.createDrawable("#goUpIcon path"), {
  draw: "0 1",
  duration: 600,
  delay: stagger(600),
  autoplay: false,
});

const tl = createTimeline()
  // .set("#goUpIcon path", { draw: "1 1" })
  .sync(animation);

goUp.addEventListener("mouseenter", () => {
  tl.restart();
});

// import { animate, svg, utils } from 'animejs';

// const [ $path1, $path2 ] = utils.$('polygon');

// function animateRandomPoints() {
//   // Update the points attribute on #path-2
//   utils.set($path2, { points: generatePoints() });
//   // Morph the points of #path-1 into #path-2
//   animate($path1, {
//     points: svg.morphTo($path2),
//     ease: 'inOutCirc',
//     duration: 500,
//     onComplete: animateRandomPoints
//   });
// }

// // Start the animation

//
animate(["feTurbulence", "feDisplacementMap"], {
  baseFrequency: 0.05,
  scale: 12,
  alternate: true,
  loop: true,
  duration: 4000,
});

// animate("#morph", {
//   d: svg.morphTo("#morph2"), // precision параметр опционален
//   duration: 2000,
//   loop: true,
//   alternate: true,
//   easing: "easeInOutQuart",
// });
