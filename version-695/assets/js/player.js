(function () {
  function startPlayer(button) {
    var playerId = button.getAttribute("data-player");
    var url = button.getAttribute("data-url");
    var video = document.getElementById(playerId);

    if (!video || !url) {
      return;
    }

    if (!video.dataset.ready) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else {
        video.src = url;
      }
      video.dataset.ready = "1";
    }

    button.classList.add("is-hidden");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  document.querySelectorAll(".play-overlay").forEach(function (button) {
    button.addEventListener("click", function () {
      startPlayer(button);
    });
  });
})();
