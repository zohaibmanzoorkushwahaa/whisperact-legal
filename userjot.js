// UserJot feedback widget (floating launcher). Shared across all pages.
// Board: https://whisperact.userjot.com/
(function () {
  "use strict";

  var PROJECT_ID = "cms67s6tm1g2e0ipdarcz6pk5D";

  window.$ujq = window.$ujq || [];
  window.uj = window.uj || new Proxy({}, {
    get: function (_, prop) {
      return function () {
        window.$ujq.push([prop].concat(Array.prototype.slice.call(arguments)));
      };
    }
  });

  var loader = document.createElement("script");
  loader.src = "https://cdn.userjot.com/sdk/v2/uj.js";
  loader.type = "module";
  loader.async = true;
  document.head.appendChild(loader);

  window.uj.init(PROJECT_ID, {
    widget: true,
    trigger: "default",
    theme: "dark",
    onError: function (error) {
      console.error("UserJot failed to initialize:", error && error.message);
    }
  });
})();
