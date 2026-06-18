(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-hero-item]"));
    if (items.length < 2) {
      return;
    }
    var index = 0;
    window.setInterval(function () {
      items[index].classList.remove("is-active");
      index = (index + 1) % items.length;
      items[index].classList.add("is-active");
    }, 4200);
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var root = scope.parentElement || document;
      var input = scope.querySelector("[data-card-search]");
      var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-field]"));
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
      function apply() {
        var query = normalize(input ? input.value : "");
        var active = selects.map(function (select) {
          return {
            field: select.getAttribute("data-filter-field"),
            value: normalize(select.value)
          };
        });
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category"),
            card.textContent
          ].join(" "));
          var matchedText = !query || haystack.indexOf(query) !== -1;
          var matchedSelects = active.every(function (item) {
            if (!item.value) {
              return true;
            }
            return normalize(card.getAttribute("data-" + item.field)).indexOf(item.value) !== -1;
          });
          card.classList.toggle("is-hidden", !(matchedText && matchedSelects));
        });
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
    });
  }

  function attachStream(video, url, onReady) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", onReady, { once: true });
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
      return;
    }
    video.src = url;
    video.addEventListener("loadedmetadata", onReady, { once: true });
  }

  window.initMoviePlayer = function (id, url) {
    var video = document.getElementById(id);
    if (!video || !url) {
      return;
    }
    var shell = video.closest(".player-shell");
    var overlay = shell ? shell.querySelector("[data-player-overlay]") : null;
    var trigger = shell ? shell.querySelector("[data-player-trigger]") : null;
    var attached = false;
    function start() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      if (!attached) {
        attached = true;
        attachStream(video, url, function () {
          video.play().catch(function () {});
        });
      }
      video.play().catch(function () {});
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        start();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
