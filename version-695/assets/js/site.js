(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-site-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var target =
        "search.html" + (value ? "?q=" + encodeURIComponent(value) : "");
      window.location.href = target;
    });
  });

  var slides = Array.prototype.slice.call(
    document.querySelectorAll("[data-hero-slide]"),
  );
  var dotsWrap = document.querySelector("[data-hero-dots]");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    if (dotsWrap) {
      Array.prototype.slice
        .call(dotsWrap.children)
        .forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
    }
  }

  function nextSlide() {
    showSlide(current + 1);
  }

  if (slides.length) {
    if (dotsWrap) {
      slides.forEach(function (_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换焦点 " + (index + 1));
        dot.addEventListener("click", function () {
          showSlide(index);
          restartTimer();
        });
        dotsWrap.appendChild(dot);
      });
    }

    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        nextSlide();
        restartTimer();
      });
    }

    function restartTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(nextSlide, 5200);
    }

    showSlide(0);
    restartTimer();
  }

  var cardFilter = document.querySelector("[data-card-filter]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var cardList = document.querySelector("[data-card-list]");

  function filterCards() {
    if (!cardList) {
      return;
    }
    var query = cardFilter ? cardFilter.value.trim().toLowerCase() : "";
    var year = yearFilter ? yearFilter.value : "";
    Array.prototype.slice
      .call(cardList.querySelectorAll(".movie-card"))
      .forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
        ]
          .join(" ")
          .toLowerCase();
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedYear = !year || card.getAttribute("data-year") === year;
        card.classList.toggle(
          "is-filtered-out",
          !(matchedQuery && matchedYear),
        );
      });
  }

  if (cardFilter) {
    cardFilter.addEventListener("input", filterCards);
  }

  if (yearFilter) {
    yearFilter.addEventListener("change", filterCards);
  }
})();
