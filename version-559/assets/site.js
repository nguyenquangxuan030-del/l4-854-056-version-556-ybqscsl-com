(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      toggle.classList.toggle("is-open");
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupLocalFilter() {
    var form = document.querySelector("[data-filter-form]");
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    if (!form || !input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-filter-text]"));
    var empty = document.createElement("div");
    empty.className = "empty-state hidden-card";
    empty.textContent = "未找到相关影片";
    list.insertAdjacentElement("afterend", empty);

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle("hidden-card", !matched);
        if (matched) {
          visible += 1;
        }
      });
      empty.classList.toggle("hidden-card", visible !== 0);
    }

    input.addEventListener("input", apply);
    form.addEventListener("reset", function () {
      window.setTimeout(apply, 0);
    });
    apply();
  }

  function createSearchCard(movie) {
    var card = document.createElement("a");
    card.className = "movie-card";
    card.href = movie.url;
    card.innerHTML = [
      '<span class="poster-frame">',
      '<img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '<span class="score-badge">' + escapeHtml(String(movie.score)) + '</span>',
      '</span>',
      '<span class="movie-card-body">',
      '<strong>' + escapeHtml(movie.title) + '</strong>',
      '<span>' + escapeHtml(movie.oneLine) + '</span>',
      '<em>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</em>',
      '</span>'
    ].join("");
    return card;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupGlobalSearch() {
    var form = document.querySelector("[data-global-search-form]");
    var input = document.querySelector("[data-global-search-input]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var subtitle = document.querySelector("[data-search-subtitle]");
    var data = window.MovieSearchItems || [];
    if (!form || !input || !results || !data.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var matched;
      if (keyword) {
        matched = data.filter(function (movie) {
          return movie.search.indexOf(keyword) !== -1;
        }).slice(0, 120);
      } else {
        matched = data.slice(0, 48);
      }
      results.innerHTML = "";
      if (matched.length === 0) {
        var empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "未找到相关影片";
        results.appendChild(empty);
      } else {
        matched.forEach(function (movie) {
          results.appendChild(createSearchCard(movie));
        });
      }
      if (title) {
        title.textContent = keyword ? "搜索结果" : "热门影片";
      }
      if (subtitle) {
        subtitle.textContent = keyword ? "以下影片与当前关键词相关。" : "输入关键词后将显示匹配结果。";
      }
    }

    input.addEventListener("input", render);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
      window.history.replaceState(null, "", url);
      render();
    });
    render();
  }

  window.setupMoviePlayer = function (streamUrl) {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".play-overlay");
    if (!video || !overlay || !streamUrl) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;

    function showMessage(text) {
      var old = shell.querySelector(".player-message");
      if (old) {
        old.remove();
      }
      var message = document.createElement("div");
      message.className = "player-message";
      message.textContent = text;
      shell.appendChild(message);
    }

    function bind() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("播放加载失败，请稍后再试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
      video.controls = true;
    }

    function play() {
      bind();
      overlay.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("error", function () {
      showMessage("播放加载失败，请稍后再试");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupGlobalSearch();
  });
})();
