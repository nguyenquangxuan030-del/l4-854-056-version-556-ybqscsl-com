(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function norm(value) {
    return String(value || '').toLowerCase().trim();
  }

  function closeSearchPanels() {
    selectAll('[data-search-results]').forEach(function (panel) {
      panel.classList.remove('show');
      panel.innerHTML = '';
    });
  }

  function renderResults(input) {
    var form = input.closest('[data-search-form]');
    if (!form) {
      return;
    }
    var panel = form.querySelector('[data-search-results]');
    var query = norm(input.value);
    if (!panel || query.length < 1) {
      closeSearchPanels();
      return;
    }
    var source = window.SITE_SEARCH_INDEX || [];
    var results = source.filter(function (item) {
      return norm(item.text).indexOf(query) > -1;
    }).slice(0, 8);
    if (!results.length) {
      panel.innerHTML = '<div class="search-result-item"><div></div><div><strong>未找到匹配影片</strong><span>换一个关键词试试</span></div></div>';
      panel.classList.add('show');
      return;
    }
    panel.innerHTML = results.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></span>' +
        '</a>';
    }).join('');
    panel.classList.add('show');
  }

  selectAll('[data-menu-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var nav = document.querySelector('[data-mobile-nav]');
      if (nav) {
        nav.classList.toggle('open');
      }
    });
  });

  selectAll('[data-search-input]').forEach(function (input) {
    input.addEventListener('input', function () {
      renderResults(input);
    });
    input.addEventListener('focus', function () {
      renderResults(input);
    });
  });

  selectAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('[data-search-input]');
      var query = norm(input && input.value);
      var source = window.SITE_SEARCH_INDEX || [];
      var first = source.find(function (item) {
        return norm(item.text).indexOf(query) > -1;
      });
      if (first) {
        window.location.href = first.url;
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-search-form]')) {
      closeSearchPanels();
    }
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var current = 0;
    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('active', pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('active', pos === current);
      });
    }
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        show(pos);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
    show(0);
  }

  selectAll('[data-filter-btn]').forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-filter-btn');
      var section = button.closest('.content-section');
      var cards = selectAll('[data-movie-card]', section);
      selectAll('[data-filter-btn]', section).forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      cards.forEach(function (card) {
        var title = card.getAttribute('data-title') || '';
        var genre = card.getAttribute('data-genre') || '';
        var region = card.getAttribute('data-region') || '';
        var tags = card.getAttribute('data-tags') || '';
        var match = key === 'all' || [title, genre, region, tags].join(' ').indexOf(key) > -1;
        card.style.display = match ? '' : 'none';
      });
    });
  });

  selectAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-player-start]');
    var stream = shell.getAttribute('data-stream');
    var attached = false;

    function attach() {
      if (!video || !stream || attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = stream;
      }
      video.controls = true;
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add('hidden');
      }
      var playTask = video.play();
      if (playTask && playTask.catch) {
        playTask.catch(function () {
          if (cover) {
            cover.classList.remove('hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
    }
  });
})();
