(function () {
  var input = document.querySelector("[data-search-input]");
  var submit = document.querySelector("[data-search-submit]");
  var results = document.querySelector("[data-search-results]");
  var summary = document.querySelector("[data-search-summary]");
  var categoryButtons = Array.prototype.slice.call(
    document.querySelectorAll("[data-search-category]"),
  );
  var data = window.MOVIE_SEARCH_DATA || [];
  var activeCategory = "";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function card(movie) {
    var tags = (movie.tags || [])
      .slice(0, 3)
      .map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      })
      .join("");
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' +
        escapeHtml(movie.url) +
        '" aria-label="' +
        escapeHtml(movie.title) +
        '">',
      '<img src="' +
        escapeHtml(movie.cover) +
        '" alt="' +
        escapeHtml(movie.title) +
        '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="card-badge">' + escapeHtml(movie.categoryName) + "</span>",
      '<span class="play-mark">▶</span>',
      "</a>",
      '<div class="card-content">',
      '<div class="card-meta"><span>' +
        escapeHtml(movie.year) +
        "</span><span>" +
        escapeHtml(movie.region) +
        "</span></div>",
      '<h3><a href="' +
        escapeHtml(movie.url) +
        '">' +
        escapeHtml(movie.title) +
        "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      '<div class="tag-row">' + tags + "</div>",
      "</div>",
      "</article>",
    ].join("");
  }

  function render() {
    if (!results || !summary) {
      return;
    }
    var query = input ? input.value.trim().toLowerCase() : "";
    var matched = data.filter(function (movie) {
      var text = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.categoryName,
        movie.oneLine,
        (movie.tags || []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      var okQuery = !query || text.indexOf(query) !== -1;
      var okCategory = !activeCategory || movie.category === activeCategory;
      return okQuery && okCategory;
    });
    matched.sort(function (a, b) {
      return b.hot - a.hot;
    });
    summary.textContent = matched.length
      ? "找到 " + matched.length + " 部相关内容"
      : "没有找到匹配内容";
    results.innerHTML = matched.slice(0, 120).map(card).join("");
  }

  function setCategory(value) {
    activeCategory = value;
    categoryButtons.forEach(function (button) {
      button.classList.toggle(
        "is-active",
        button.getAttribute("data-search-category") === value,
      );
    });
    render();
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get("q") || "";
  var category = params.get("category") || "";

  if (input) {
    input.value = q;
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        render();
      }
    });
  }

  if (submit) {
    submit.addEventListener("click", render);
  }

  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setCategory(button.getAttribute("data-search-category") || "");
    });
  });

  setCategory(category);
})();
