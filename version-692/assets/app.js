(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="search"]');
            if (!input || !input.value.trim()) {
                return;
            }
            event.preventDefault();
            window.location.href = 'videos.html?search=' + encodeURIComponent(input.value.trim());
        });
    });

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-to]'));
        var index = 0;
        var timer = null;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('hero-slide-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startSlider() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-slide-to')) || 0);
                startSlider();
            });
        });

        slider.addEventListener('mouseenter', function () {
            window.clearInterval(timer);
        });

        slider.addEventListener('mouseleave', function () {
            window.clearInterval(timer);
            startSlider();
        });

        showSlide(0);
        startSlider();
    }

    var panel = document.querySelector('[data-filter-panel]');
    if (panel) {
        var searchInput = panel.querySelector('[data-filter-search]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);

        if (searchInput && params.get('search')) {
            searchInput.value = params.get('search');
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function filterCards() {
            var keyword = normalize(searchInput ? searchInput.value : '');
            var type = typeSelect ? typeSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute('data-search'));
                var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
                var matchesType = !type || card.getAttribute('data-type') === type;
                var matchesRegion = !region || card.getAttribute('data-region') === region;
                var matchesYear = !year || card.getAttribute('data-year') === year;
                var shouldShow = matchesKeyword && matchesType && matchesRegion && matchesYear;

                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (field) {
            if (!field) {
                return;
            }
            field.addEventListener('input', filterCards);
            field.addEventListener('change', filterCards);
        });

        filterCards();
    }

    var playerShell = document.querySelector('.player-shell');
    if (playerShell) {
        var video = playerShell.querySelector('video');
        var playButton = playerShell.querySelector('.play-cover');
        var videoUrl = playerShell.getAttribute('data-video-url');
        var attached = false;
        var hlsInstance = null;

        function attachVideo() {
            if (!video || !videoUrl || attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }
        }

        function playVideo() {
            attachVideo();
            playerShell.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (playButton) {
            playButton.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });

            video.addEventListener('play', function () {
                playerShell.classList.add('is-playing');
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
