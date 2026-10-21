// Homepage motion: the pinned "How it works" story, section reveals and scroll-linked transforms.
// Everything here is an enhancement. Without this file every section and story step is visible,
// each step shows its own phone, and nothing moves.
//
// Markup contract:
//   .story[data-active]          – section; .story-step[data-step] items; .story-screen[data-step]
//                                  pictures in the pinned phone; .story-dots li in step order
//   [data-reveal]                – fades in once ("stagger" staggers its children instead)
//   [data-scroll="enter"|"exit"] – receives --p from 0 to 1 while entering / leaving the viewport
// CSS owns every visual; this file only sets classes, attributes and --p.
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var motionOK = !(reduce && reduce.matches);
  var hasIO = "IntersectionObserver" in window;

  function each(list, fn) {
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }

  // The step that crosses the middle of the viewport becomes active. This runs even with reduced
  // motion: switching the pinned phone's screen is content, and CSS drops the transitions.
  function initStory() {
    var story = document.querySelector(".story");
    if (!story || !hasIO) return;
    var steps = story.querySelectorAll(".story-step");
    var screens = story.querySelectorAll(".story-screen");
    var dots = story.querySelectorAll(".story-dots li");
    if (!steps.length) return;

    function activate(n) {
      if (story.getAttribute("data-active") === n && story.classList.contains("story-ready")) return;
      story.setAttribute("data-active", n);
      each(steps, function (el) { el.classList.toggle("is-active", el.getAttribute("data-step") === n); });
      each(screens, function (el) { el.classList.toggle("is-active", el.getAttribute("data-step") === n); });
      each(dots, function (el, i) { el.classList.toggle("is-active", String(i + 1) === n); });
    }

    var observer = new IntersectionObserver(function (entries) {
      each(entries, function (entry) {
        if (entry.isIntersecting) activate(entry.target.getAttribute("data-step"));
      });
    }, { rootMargin: "-48% 0px -48% 0px", threshold: 0 });
    each(steps, function (el) { observer.observe(el); });

    activate(story.getAttribute("data-active") || "1");
    story.classList.add("story-ready");
  }

  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length || !hasIO || !motionOK) return;
    var observer = new IntersectionObserver(function (entries) {
      each(entries, function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
    each(items, function (el) { observer.observe(el); });
    root.classList.add("reveal-ready");
  }

  function initScrollLinked() {
    var items = document.querySelectorAll("[data-scroll]");
    if (!items.length || !motionOK || !window.requestAnimationFrame) return;
    var queued = false;

    function progress(el, rect, vh) {
      var p = el.getAttribute("data-scroll") === "exit"
        ? -rect.top / Math.max(1, rect.height)
        : (vh - rect.top) / (vh * 0.8);
      return Math.min(1, Math.max(0, p));
    }

    // There are only a few of these elements, so every one is updated each frame; a jump such as
    // Home or a fragment link never leaves one at a stale position.
    function update() {
      queued = false;
      var vh = window.innerHeight;
      var values = [];
      // Read every position first, then write, so the browser lays out once per frame.
      each(items, function (el) { values.push(progress(el, el.getBoundingClientRect(), vh).toFixed(3)); });
      each(items, function (el, i) {
        if (el._waP === values[i]) return;
        el._waP = values[i];
        el.style.setProperty("--p", values[i]);
      });
    }

    function schedule() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    root.classList.add("motion-ready");
  }

  // If the visitor turns on Reduce Motion while the page is open, stop moving things.
  function watchPreference() {
    if (!reduce) return;
    var stop = function () {
      if (!reduce.matches) return;
      root.classList.remove("motion-ready", "reveal-ready");
    };
    if (reduce.addEventListener) reduce.addEventListener("change", stop);
    else if (reduce.addListener) reduce.addListener(stop);
  }

  function init() {
    try {
      initStory();
      initReveal();
      initScrollLinked();
      watchPreference();
    } catch (err) {
      root.classList.remove("motion-ready", "reveal-ready");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
