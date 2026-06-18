(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function yearMatches(value, rawYear) {
    if (!value) {
      return true;
    }
    var match = String(rawYear || "").match(/\d{4}/);
    var year = match ? Number(match[0]) : 0;
    if (value === "2026") {
      return year >= 2026;
    }
    if (value === "2025") {
      return year === 2025;
    }
    if (value === "2024") {
      return year === 2024;
    }
    if (value === "2020") {
      return year >= 2020 && year <= 2023;
    }
    if (value === "2010") {
      return year >= 2010 && year <= 2019;
    }
    if (value === "2000") {
      return year >= 2000 && year <= 2009;
    }
    if (value === "1999") {
      return year > 0 && year <= 1999;
    }
    return true;
  }

  function initFilters() {
    var groups = Array.prototype.slice.call(document.querySelectorAll(".content-section"));
    groups.forEach(function (section) {
      var input = section.querySelector("[data-filter-input]");
      var type = section.querySelector("[data-filter-type]");
      var year = section.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-filter-card]"));
      var empty = section.querySelector("[data-empty-state]");
      if (!cards.length || (!input && !type && !year)) {
        return;
      }

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" ").toLowerCase();
          var okQuery = !q || text.indexOf(q) !== -1;
          var okType = !t || String(card.dataset.type || "").indexOf(t) !== -1 || String(card.dataset.genre || "").indexOf(t) !== -1;
          var okYear = yearMatches(y, card.dataset.year);
          var show = okQuery && okType && okYear;
          card.classList.toggle("card-hidden", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video[data-stream]");
      var trigger = shell.querySelector("[data-play-trigger]");
      if (!video || !trigger) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var attached = false;
      var hls = null;

      function setError() {
        shell.classList.remove("loading");
        trigger.hidden = false;
        var label = trigger.querySelector("strong");
        if (label) {
          label.textContent = "播放暂时不可用";
        }
      }

      function attachStream() {
        return new Promise(function (resolve, reject) {
          if (attached) {
            resolve();
            return;
          }
          attached = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.addEventListener("loadedmetadata", resolve, { once: true });
            video.addEventListener("error", reject, { once: true });
            return;
          }
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            hls.on(window.Hls.Events.ERROR, function (_, data) {
              if (data && data.fatal) {
                reject();
              }
            });
            return;
          }
          reject();
        });
      }

      function start() {
        shell.classList.add("loading");
        attachStream()
          .then(function () {
            return video.play();
          })
          .then(function () {
            shell.classList.remove("loading");
            trigger.hidden = true;
          })
          .catch(function () {
            setError();
          });
      }

      trigger.addEventListener("click", start);
      video.addEventListener("play", function () {
        trigger.hidden = true;
      });
      video.addEventListener("pause", function () {
        if (!video.ended && video.currentTime > 0) {
          return;
        }
        trigger.hidden = false;
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
