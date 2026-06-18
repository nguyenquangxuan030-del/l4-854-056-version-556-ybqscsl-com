(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
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
        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-index")) || 0);
                schedule();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                schedule();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                schedule();
            });
        }
        schedule();
    }

    function setupCatalogFilters() {
        var sections = Array.prototype.slice.call(document.querySelectorAll(".catalog-section"));
        sections.forEach(function (section) {
            var input = section.querySelector(".js-card-search");
            var region = section.querySelector(".js-region-filter");
            var type = section.querySelector(".js-type-filter");
            var category = section.querySelector(".js-category-filter");
            var cards = Array.prototype.slice.call(section.querySelectorAll(".searchable-card"));
            var empty = section.querySelector(".empty-state");
            if (!cards.length) {
                return;
            }
            function apply() {
                var q = input ? input.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                var categoryValue = category ? category.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre")
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (regionValue && card.getAttribute("data-region") !== regionValue) {
                        ok = false;
                    }
                    if (typeValue && card.getAttribute("data-type") !== typeValue) {
                        ok = false;
                    }
                    if (categoryValue && card.getAttribute("data-category") !== categoryValue) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            [input, region, type, category].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupCatalogFilters();
    });
})();
