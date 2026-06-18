(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            navLinks.classList.toggle("is-open");
        });
    }

    var carousel = document.querySelector("[data-carousel]");

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector("[data-prev]");
        var next = carousel.querySelector("[data-next]");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restartTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                restartTimer();
            });
        }

        showSlide(0);
        restartTimer();
    }

    var filters = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));

    filters.forEach(function (input) {
        var scope = document.querySelector(input.getAttribute("data-scope")) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
        var empty = scope.querySelector(".empty-state");

        input.addEventListener("input", function () {
            var value = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        });
    });

    var sorters = Array.prototype.slice.call(document.querySelectorAll(".sort-select"));

    sorters.forEach(function (select) {
        var target = document.querySelector(select.getAttribute("data-target"));

        if (!target) {
            return;
        }

        var original = Array.prototype.slice.call(target.children);

        select.addEventListener("change", function () {
            var value = select.value;
            var items = original.slice();

            if (value === "year-desc") {
                items.sort(function (a, b) {
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                });
            }

            if (value === "year-asc") {
                items.sort(function (a, b) {
                    return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
                });
            }

            if (value === "title") {
                items.sort(function (a, b) {
                    return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                });
            }

            items.forEach(function (item) {
                target.appendChild(item);
            });
        });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll(".player-card"));

    players.forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector(".play-cover");

        if (!video || !button) {
            return;
        }

        var stream = video.getAttribute("data-stream");

        function loadVideo() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    maxBufferLength: 30
                });

                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            video.setAttribute("data-ready", "1");
        }

        function startVideo() {
            loadVideo();
            player.classList.add("is-playing");
            button.setAttribute("hidden", "hidden");

            var promise = video.play();

            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        button.addEventListener("click", startVideo);

        video.addEventListener("click", function () {
            if (video.paused) {
                startVideo();
            }
        });
    });
})();
