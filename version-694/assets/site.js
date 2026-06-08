(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
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

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 1) {
      var index = 0;
      var activate = function (next) {
        index = next % slides.length;
        if (index < 0) index = slides.length - 1;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      };
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          activate(dotIndex);
        });
      });
      window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterGenre = document.querySelector("[data-filter-genre]");
    var filterYear = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var empty = document.querySelector("[data-empty]");
    if ((filterInput || filterGenre || filterYear) && cards.length) {
      var applyFilter = function () {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var genre = filterGenre ? filterGenre.value : "";
        var year = filterYear ? filterYear.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region")
          ].join(" ").toLowerCase();
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) matched = false;
          if (genre && (card.getAttribute("data-genre") || "").indexOf(genre) === -1) matched = false;
          if (year && card.getAttribute("data-year") !== year) matched = false;
          card.style.display = matched ? "" : "none";
          if (matched) visible += 1;
        });
        if (empty) empty.classList.toggle("is-visible", visible === 0);
      };
      [filterInput, filterGenre, filterYear].forEach(function (control) {
        if (control) control.addEventListener("input", applyFilter);
      });
      applyFilter();
    }

    var searchRoot = document.querySelector("[data-search-results]");
    if (searchRoot && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var queryInput = document.querySelector("[data-search-page-input]");
      var initial = params.get("q") || "";
      if (queryInput) queryInput.value = initial;
      var render = function () {
        var keyword = queryInput ? queryInput.value.trim().toLowerCase() : initial.trim().toLowerCase();
        var list = window.SEARCH_MOVIES.filter(function (movie) {
          if (!keyword) return true;
          return [movie.title, movie.year, movie.genre, movie.region, movie.category, movie.brief].join(" ").toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 120);
        searchRoot.innerHTML = list.map(function (movie) {
          return [
            '<article class="movie-card">',
            '<a class="movie-card-link" href="' + movie.url + '">',
            '<div class="poster-wrap"><img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="play-dot">▶</span><span class="heat-badge">热度 ' + movie.heat + '</span></div>',
            '<div class="movie-card-body">',
            '<div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
            '<h2>' + escapeHtml(movie.title) + '</h2>',
            '<p>' + escapeHtml(movie.brief) + '</p>',
            '<div class="tag-row"><span>' + escapeHtml(movie.genre.split(/[，,、/]/)[0] || movie.genre) + '</span></div>',
            '</div></a></article>'
          ].join("");
        }).join("");
        if (!list.length) {
          searchRoot.innerHTML = '<div class="empty-state is-visible">没有找到匹配影片</div>';
        }
        searchRoot.querySelectorAll("img").forEach(function (image) {
          image.addEventListener("error", function () {
            image.classList.add("is-missing");
          }, { once: true });
        });
      };
      var form = document.querySelector("[data-search-page-form]");
      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          render();
        });
      }
      if (queryInput) queryInput.addEventListener("input", render);
      render();
    }
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
