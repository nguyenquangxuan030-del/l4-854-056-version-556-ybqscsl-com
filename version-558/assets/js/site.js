(function () {
  'use strict';

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    var mobileCategories = document.querySelector('[data-mobile-categories]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      if (mobileCategories) {
        mobileCategories.classList.toggle('is-open');
      }
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearchPanels() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));

    panels.forEach(function (panel) {
      var form = panel.querySelector('[data-search-form]');
      var input = panel.querySelector('[data-search-input]');
      var reset = panel.querySelector('[data-search-reset]');
      var result = panel.querySelector('[data-search-result]');
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card="movie"]'));
      var filterButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));

      function apply(keyword) {
        var query = normalize(keyword);
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var matched = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            shown += 1;
          }
        });

        if (result) {
          result.innerHTML = '已显示 <strong>' + shown + '</strong> 部影片。';
        }
      }

      if (input) {
        input.addEventListener('input', function () {
          apply(input.value);
        });
      }

      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          apply(input ? input.value : '');
        });
      }

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          apply('');
        });
      }

      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var value = button.getAttribute('data-filter') || '';
          if (input) {
            input.value = value;
          }
          apply(value);
        });
      });
    });
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-button]');
      var status = player.querySelector('[data-player-status]');
      var hlsInstance = null;
      var loaded = false;

      if (!video) {
        return;
      }

      function setStatus(message, isError) {
        if (status) {
          status.textContent = message;
        }
        player.classList.toggle('is-error', Boolean(isError));
      }

      function attachSource(callback) {
        var source = video.getAttribute('data-src');
        if (!source) {
          setStatus('未找到播放源。', true);
          return;
        }

        if (loaded) {
          callback();
          return;
        }

        setStatus('正在初始化 HLS 播放源...', false);

        function bindWithHls() {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              loaded = true;
              player.classList.add('is-loaded');
              setStatus('播放源就绪。', false);
              callback();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
              if (data && data.fatal) {
                setStatus('视频加载失败，请刷新页面或稍后重试。', true);
              }
            });
            return;
          }

          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
              loaded = true;
              player.classList.add('is-loaded');
              setStatus('播放源就绪。', false);
              callback();
            }, { once: true });
            video.addEventListener('error', function () {
              setStatus('视频加载失败，请刷新页面或稍后重试。', true);
            }, { once: true });
            return;
          }

          setStatus('当前浏览器不支持 HLS 播放。', true);
        }

        if (window.Hls || video.canPlayType('application/vnd.apple.mpegurl')) {
          bindWithHls();
        } else {
          loadHlsLibrary(bindWithHls);
        }
      }

      function playVideo() {
        attachSource(function () {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              setStatus('浏览器阻止了自动播放，请再次点击播放按钮。', true);
            });
          }
        });
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        setStatus('正在播放。', false);
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
        setStatus('播放结束。', false);
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupSearchPanels();
    setupPlayers();
  });
})();
