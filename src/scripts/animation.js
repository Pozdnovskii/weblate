import { animate, svg, stagger, createTimeline } from "animejs";

animate("#body__background div", {
  // boxShadow: [
  //   {
  //     to: stagger([1, 0.25], {
  //       modifier: (v) => `0 0 ${v * 10}px ${v * 10}px currentColor`,
  //       from: "center",
  //     }),
  //   },
  //   { to: 0 },
  // ],
  opacity: [
    {
      // to: stagger([1, 0.25], {
      //   modifier: (v) => `${v * 100}%`,
      // }),
      from: 0,
    },
    // { to: 0 },
    // ],
    // borderRadius: [
    //   {
    //     to: stagger([1, 0.25], {
    //       modifier: (v) => `${v * 100}%`,
    //     }),
    //   },
    // { to: 0 },
  ],
  delay: stagger(100, { from: "start" }),
  // loop: true,
  duration: 1000,
});
