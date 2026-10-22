// Homepage motion: the pinned "How it works" story, section reveals and scroll-linked transforms.
// Everything here is an enhancement. Without this file every section and story step is visible,
// each step shows its own phone, and nothing moves.
//
// Markup contract:
//   .story[data-active]          – section; .story-step[data-step] items; .story-screen[data-step]
//                                  pictures in the pinned phone; .story-dots li in step order
//   [data-reveal]                – fades in once ("stagger" staggers its children instead)
//   [data-scroll="enter"|"exit"|"through"] – receives --p from 0 to 1 while entering / leaving the
//                                  viewport, or while the viewport's upper half passes through it
//   video.clip                   – a screen recording over a still of its first frame, inside
//                                  .iphone-screen; plays while on screen (in the pinned story, while
//                                  its step is active) and gets a Pause/Play button beside its phone
// CSS owns every visual; this file only sets classes, attributes, --p and video playback.
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var motionOK = !(reduce && reduce.matches);
  var hasIO = "IntersectionObserver" in window;

  function each(list, fn) {
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }

  // Set by initClips; the story calls it when the active step changes.
  var onStoryStep = null;

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
      if (onStoryStep) onStoryStep();
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
      var mode = el.getAttribute("data-scroll");
      var p;
      if (mode === "exit") p = -rect.top / Math.max(1, rect.height);
      else if (mode === "through") p = (vh * 0.55 - rect.top) / Math.max(1, rect.height);
      else p = (vh - rect.top) / (vh * 0.8);
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

  // Screen recordings play only while their phone is on screen, and in the pinned story only the
  // active step's, restarting from its first frame each time that step comes back. They stay stills
  // under Reduce Motion or Save-Data until the visitor presses Play; Pause stops every recording on
  // the page. Until a recording is actually playing, the still underneath is what shows.
  function initClips() {
    var clips = document.querySelectorAll("video.clip");
    if (!clips.length || !hasIO) return;
    var conn = navigator.connection;
    var paused = !motionOK || !!(conn && conn.saveData);
    var toggles = [];

    function wanted(video) {
      if (paused || !video._waVisible) return false;
      var screen = video.closest(".story-screen");
      return !screen || screen.classList.contains("is-active");
    }

    function sync() {
      each(clips, function (video) {
        if (wanted(video)) {
          if (video.paused) {
            var started = video.play();
            if (started && started.catch) started.catch(function () {});
          }
        } else if (!video.paused) {
          video.pause();
        }
      });
    }

    function label() {
      each(toggles, function (button) {
        button.setAttribute("data-state", paused ? "paused" : "playing");
        button.setAttribute("aria-label", paused ? "Play the app recordings" : "Pause the app recordings");
      });
    }

    function setPaused(value) {
      paused = value;
      label();
      sync();
    }

    each(clips, function (video) {
      video.muted = true;
      video.addEventListener("playing", function () { video.classList.add("is-ready"); });
      video.addEventListener("error", function () { video.classList.remove("is-ready"); });
    });

    var phones = [];
    each(clips, function (video) {
      var phone = video.closest(".iphone");
      if (phone && phones.indexOf(phone) === -1) phones.push(phone);
    });
    each(phones, function (phone) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "clip-toggle";
      button.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true">' +
        '<path class="clip-icon-pause" d="M4 2.5h2.75v11H4zM9.25 2.5H12v11H9.25z"/>' +
        '<path class="clip-icon-play" d="M4.5 2.25 13.5 8l-9 5.75z"/></svg>';
      button.addEventListener("click", function () { setPaused(!paused); });
      phone.appendChild(button);
      toggles.push(button);
    });

    var observer = new IntersectionObserver(function (entries) {
      each(entries, function (entry) {
        entry.target._waVisible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      });
      sync();
    }, { threshold: [0, 0.25, 0.5] });
    each(clips, function (video) { observer.observe(video); });

    var story = document.querySelector(".story");
    var current = story ? story.getAttribute("data-active") : null;
    onStoryStep = function () {
      var step = story.getAttribute("data-active");
      if (step === current) return;
      current = step;
      var video = story.querySelector(".story-screen.is-active video.clip");
      if (video && video.readyState > 0) video.currentTime = 0;
      sync();
    };

    if (reduce) {
      var onChange = function () { if (reduce.matches) setPaused(true); };
      if (reduce.addEventListener) reduce.addEventListener("change", onChange);
      else if (reduce.addListener) reduce.addListener(onChange);
    }
    label();
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
      initClips();
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
