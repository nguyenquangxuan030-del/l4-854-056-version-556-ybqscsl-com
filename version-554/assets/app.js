(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var inputs = document.querySelectorAll(".filter-input");

    inputs.forEach(function (input) {
      var section = input.closest("main") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      var empty = section.querySelector(".empty-state");

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      });
    });

    var player = document.getElementById("moviePlayer");
    var overlay = document.querySelector(".player-overlay");

    if (player) {
      var source = player.getAttribute("src");
      var hlsInstance = null;

      if (source && window.Hls && window.Hls.isSupported()) {
        player.removeAttribute("src");
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(player);
      } else if (source && player.canPlayType("application/vnd.apple.mpegurl")) {
        player.src = source;
      }

      var startPlayback = function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var playAttempt = player.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(function () {});
        }
      };

      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }

      player.addEventListener("click", function () {
        if (player.paused) {
          startPlayback();
        }
      });

      player.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      player.addEventListener("ended", function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
