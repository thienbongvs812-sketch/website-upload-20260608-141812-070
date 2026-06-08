(function () {
    function attachMoviePlayer(player, source) {
        if (!player || !source) {
            return;
        }
        var video = player.querySelector("video");
        var overlay = player.querySelector("[data-play-overlay]");
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded || !video) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function play() {
            load();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("error", function () {
            if (hls && hls.recoverMediaError) {
                hls.recoverMediaError();
            }
        });
    }

    window.attachMoviePlayer = attachMoviePlayer;
})();