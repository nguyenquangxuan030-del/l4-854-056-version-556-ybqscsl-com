(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function bindNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function bindHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function advance(step) {
      show(index + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        advance(1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        advance(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        advance(1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function bindSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-movie-search]"));
    inputs.forEach(function (input) {
      var scope = input.closest("main") || document;
      var clear = input.parentElement ? input.parentElement.querySelector("[data-search-clear]") : null;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      function filterCards() {
        var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-year") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var matched = words.every(function (word) {
            return haystack.indexOf(word) !== -1;
          });
          card.classList.toggle("is-hidden", !matched);
        });
      }

      input.addEventListener("input", filterCards);
      if (clear) {
        clear.addEventListener("click", function () {
          input.value = "";
          filterCards();
          input.focus();
        });
      }
    });
  }

  ready(function () {
    bindNavigation();
    bindHero();
    bindSearch();
  });
})();

function initMoviePlayer(videoId, coverId, playUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  if (!video || !cover || !playUrl) {
    return;
  }

  var loaded = false;
  var hlsInstance = null;

  function load() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(playUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = playUrl;
    }
  }

  function play() {
    load();
    cover.classList.add("is-hidden");
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  cover.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
