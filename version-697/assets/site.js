(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-menu-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var previous = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener("click", function () {
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
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initFilters() {
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        if (!searchInputs.length && !filterButtons.length) {
            return;
        }

        function activeFilter() {
            var active = document.querySelector("[data-filter].active");
            return active ? active.getAttribute("data-filter") : "all";
        }

        function searchTerm() {
            var values = searchInputs.map(function (input) {
                return normalize(input.value);
            }).filter(Boolean);
            return values.join(" ");
        }

        function matchesFilter(card, filter) {
            if (!filter || filter === "all") {
                return true;
            }
            var parts = filter.split(":");
            var key = parts[0];
            var value = parts.slice(1).join(":");
            var actual = card.getAttribute("data-" + key) || "";
            return actual.indexOf(value) !== -1;
        }

        function apply() {
            var term = searchTerm();
            var filter = activeFilter();
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item"));
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search") || card.textContent);
                var ok = (!term || haystack.indexOf(term) !== -1) && matchesFilter(card, filter);
                card.classList.toggle("is-filtered-out", !ok);
                if (ok) {
                    visible += 1;
                }
            });
            Array.prototype.slice.call(document.querySelectorAll("[data-empty-state]")).forEach(function (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            });
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", apply);
        });
        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                filterButtons.forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");
                apply();
            });
        });
        apply();
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();