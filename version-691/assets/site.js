(function () {
    function rootPrefix() {
        var path = window.location.pathname.replace(/\\/g, "/");
        if (path.indexOf("/movie/") !== -1 || path.indexOf("/categories/") !== -1 || path.indexOf("/videos/") !== -1) {
            return "../";
        }
        return "./";
    }

    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-button");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
    }

    function setupImageFallback() {
        document.querySelectorAll(".poster-img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        start();
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search-input"));
        if (!inputs.length || typeof SiteSearchData === "undefined") {
            return;
        }
        var prefix = rootPrefix();

        inputs.forEach(function (input) {
            var box = input.parentElement.querySelector(".site-search-results");
            if (!box) {
                return;
            }

            function close() {
                box.classList.remove("open");
                box.innerHTML = "";
            }

            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                if (keyword.length < 1) {
                    close();
                    return;
                }

                var matched = SiteSearchData.filter(function (item) {
                    var text = [item.title, item.region, item.type, item.year, item.genre, item.tags].join(" ").toLowerCase();
                    return text.indexOf(keyword) !== -1;
                }).slice(0, 10);

                if (!matched.length) {
                    box.innerHTML = '<div class="search-result-item"><strong>暂无匹配</strong><span>换个关键词试试</span></div>';
                    box.classList.add("open");
                    return;
                }

                box.innerHTML = matched.map(function (item) {
                    var label = escapeHtml(item.title);
                    var meta = escapeHtml(item.year + " · " + item.region + " · " + item.genre);
                    var url = encodeURI(prefix + item.url);
                    return '<a class="search-result-item" href="' + url + '"><strong>' + label + '</strong><span>' + meta + '</span></a>';
                }).join("");
                box.classList.add("open");
            });

            document.addEventListener("click", function (event) {
                if (!input.parentElement.contains(event.target)) {
                    close();
                }
            });
        });
    }

    function setupFilters() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
        if (!buttons.length) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var filter = button.getAttribute("data-filter") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || ""
                    ].join(" ");
                    card.classList.toggle("hidden-by-filter", filter !== "all" && text.indexOf(filter) === -1);
                });
            });
        });
    }

    function loadVideo(video) {
        var source = video.getAttribute("data-src") || "";
        var sourceNode = video.querySelector("source");
        if (!source && sourceNode) {
            source = sourceNode.getAttribute("src") || "";
        }
        if (!source) {
            return;
        }
        if (video.dataset.ready === "true") {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hls = hls;
        } else {
            video.src = source;
        }
        video.dataset.ready = "true";
    }

    function setupPlayer() {
        var video = document.querySelector(".movie-player");
        var trigger = document.querySelector(".play-trigger");
        if (!video) {
            return;
        }

        function play() {
            loadVideo(video);
            var promise = video.play();
            if (promise && typeof promise.then === "function") {
                promise.then(function () {
                    if (trigger) {
                        trigger.classList.add("is-hidden");
                    }
                }).catch(function () {
                    if (trigger) {
                        trigger.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (trigger) {
            trigger.addEventListener("click", play);
        }
        video.addEventListener("play", function () {
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (trigger && video.currentTime < 1) {
                trigger.classList.remove("is-hidden");
            }
        });
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupImageFallback();
        setupHero();
        setupSearch();
        setupFilters();
        setupPlayer();
    });
})();
