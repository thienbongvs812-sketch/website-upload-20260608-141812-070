(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;
      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      };
      var start = function () {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      show(0);
      start();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    document.querySelectorAll("[data-query-input]").forEach(function (input) {
      if (query && !input.value) {
        input.value = query;
      }
    });

    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var keyword = root.querySelector("[data-query-input]");
      var region = root.querySelector("[data-region-select]");
      var type = root.querySelector("[data-type-select]");
      var genre = root.querySelector("[data-genre-select]");
      var empty = root.querySelector("[data-empty]");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      var normalize = function (value) {
        return String(value || "").toLowerCase().trim();
      };
      var apply = function () {
        var q = normalize(keyword && keyword.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        var g = normalize(genre && genre.value);
        var visible = 0;
        cards.forEach(function (card) {
          var title = normalize(card.getAttribute("data-title"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardGenre = normalize(card.getAttribute("data-genre"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardTags = normalize(card.getAttribute("data-tags"));
          var text = title + " " + cardRegion + " " + cardType + " " + cardGenre + " " + cardYear + " " + cardTags;
          var matched = (!q || text.indexOf(q) !== -1) && (!r || cardRegion.indexOf(r) !== -1) && (!t || cardType.indexOf(t) !== -1) && (!g || cardGenre.indexOf(g) !== -1 || cardTags.indexOf(g) !== -1);
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      [keyword, region, type, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  });

  window.bindMoviePlayer = function (video, cover, source) {
    if (!video || !source) {
      return;
    }
    var loaded = false;
    var pending = false;
    var hls = null;
    var tryPlay = function () {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    };
    var load = function () {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pending) {
            tryPlay();
          }
        });
      } else {
        video.src = source;
      }
    };
    var start = function () {
      pending = true;
      load();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      tryPlay();
    };
    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
}());
