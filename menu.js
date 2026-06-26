// Mobile / tablet nav menu toggle. Shared across all pages.
// Markup contract: <nav> contains a .nav-toggle button and a .nav-links list (#navMenu).
// CSS owns all visuals; this only flips `aria-expanded` and the `.open` class on <nav>.
(function () {
  "use strict";

  function init() {
    var nav = document.querySelector("nav");
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("navMenu");
    if (!nav || !toggle || !menu) return;

    function setOpen(open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function isOpen() {
      return nav.classList.contains("open");
    }

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!isOpen());
    });

    // Close when a link inside the menu is tapped (lets in-page anchors + navigation feel instant).
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    // Close on Escape.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Close when tapping/clicking outside the nav.
    document.addEventListener("click", function (e) {
      if (isOpen() && !nav.contains(e.target)) setOpen(false);
    });

    // Reset to closed when leaving the mobile breakpoint (e.g. rotate to landscape / resize).
    var mq = window.matchMedia("(max-width: 900px)");
    var onChange = function (ev) { if (!ev.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
