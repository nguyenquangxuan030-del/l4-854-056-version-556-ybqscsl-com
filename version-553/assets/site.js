(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var mobileNav = document.getElementById("mobileNav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        mobileNav.classList.toggle("is-open", !expanded);
      });
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll(".hero-panel"));
    if (panels.length > 1) {
      var current = 0;
      window.setInterval(function () {
        panels[current].classList.remove("is-active");
        current = (current + 1) % panels.length;
        panels[current].classList.add("is-active");
      }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    filterInputs.forEach(function (input) {
      var scope = input.closest("section") || document;
      var items = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          var haystack = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
          item.classList.toggle("is-filtered-out", keyword.length > 0 && haystack.indexOf(keyword) === -1);
        });
      });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll(".player-box"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      var stream = player.getAttribute("data-stream");
      var hlsInstance = null;

      function attach() {
        if (!video || !stream || video.getAttribute("data-ready") === "1") {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          player.hlsInstance = hlsInstance;
        } else {
          video.src = stream;
        }

        video.setAttribute("data-ready", "1");
      }

      function play() {
        attach();
        if (button) {
          button.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      if (button && video) {
        button.addEventListener("click", play);
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
      }
    });
  });
})();
