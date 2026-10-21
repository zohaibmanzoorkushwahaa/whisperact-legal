// Shared header behaviour for every page: the compact menu and the appearance control.
// Markup contract: <header class="site-header"> holds a .menu-toggle (aria-controls="site-menu"),
// the #site-menu panel, and a .theme-switch fieldset of radios named "theme".
// CSS owns all visuals and the compact breakpoint; this file only flips state.
// The inline <head> script swaps html.no-js for html.js and applies a stored appearance before
// first paint. If this file fails to load or initialise, html.js is removed so CSS falls back to
// the always-visible navigation.
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "wa-theme";
  var THEME_COLORS = { light: "#fbf6ef", dark: "#1f1c1a" };

  function initMenu() {
    var header = document.querySelector(".site-header");
    var toggle = header && header.querySelector(".menu-toggle");
    var menu = document.getElementById("site-menu");
    if (!header || !toggle || !menu) return;

    function isCompact() {
      return window.getComputedStyle(toggle).display !== "none";
    }

    function isOpen() {
      return header.classList.contains("is-open");
    }

    function setOpen(open, returnFocus) {
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open && returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", function () {
      setOpen(!isOpen());
    });

    // Following a link closes the menu, including in-page anchors on the homepage.
    menu.addEventListener("click", function (e) {
      if (isOpen() && e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) setOpen(false, true);
    });

    // A click or tap anywhere outside the header closes it. pointerdown rather than click:
    // iOS Safari does not send click events from non-interactive page areas to document.
    document.addEventListener("pointerdown", function (e) {
      if (isOpen() && !header.contains(e.target)) setOpen(false);
    });

    // Tabbing out of the open menu closes it, so it never covers the focused content.
    header.addEventListener("focusout", function (e) {
      if (isOpen() && e.relatedTarget && !header.contains(e.relatedTarget)) setOpen(false);
    });

    // Leaving the compact layout (resize, rotation, zoom) resets the menu.
    var frame = 0;
    window.addEventListener("resize", function () {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(function () {
        if (isOpen() && !isCompact()) setOpen(false);
      });
    });

    // A page restored from the back/forward cache starts closed.
    window.addEventListener("pageshow", function (e) {
      if (e.persisted && isOpen()) setOpen(false);
    });
  }

  function readTheme() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return value === "light" || value === "dark" ? value : "system";
    } catch (err) {
      return "system";
    }
  }

  function applyTheme(choice) {
    var explicit = choice === "light" || choice === "dark";
    if (explicit) root.setAttribute("data-theme", choice);
    else root.removeAttribute("data-theme");
    // The <head> script also sets color-scheme inline so the canvas matches before CSS loads.
    root.style.colorScheme = explicit ? choice : "";

    // Browser UI colour: an explicit choice wins; in system mode each tag keeps its media query.
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      var own = /dark/.test(metas[i].getAttribute("media") || "") ? THEME_COLORS.dark : THEME_COLORS.light;
      metas[i].setAttribute("content", choice === "system" ? own : THEME_COLORS[choice]);
    }
  }

  function storeTheme(choice) {
    try {
      if (choice === "system") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, choice);
    } catch (err) {
      // Storage can be unavailable (private browsing, blocked site data); the choice then lasts
      // for this page only.
    }
  }

  function initTheme() {
    var radios = document.querySelectorAll('.theme-switch input[name="theme"]');
    if (!radios.length) return;

    function sync(choice) {
      for (var i = 0; i < radios.length; i++) radios[i].checked = radios[i].value === choice;
    }

    var current = readTheme();
    applyTheme(current);
    sync(current);

    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener("change", function (e) {
        var choice = e.target.value;
        applyTheme(choice);
        storeTheme(choice);
      });
    }

    // Keep other open tabs in step with a choice made here.
    window.addEventListener("storage", function (e) {
      if (e.key !== null && e.key !== STORAGE_KEY) return;
      var choice = readTheme();
      applyTheme(choice);
      sync(choice);
    });
  }

  function init() {
    try {
      initMenu();
      initTheme();
    } catch (err) {
      root.classList.remove("js");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
