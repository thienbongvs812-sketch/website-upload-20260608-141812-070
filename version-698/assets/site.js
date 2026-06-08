(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    show(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().replace(/\s+/g, '');
  }

  function setupFilters() {
    var input = document.querySelector('[data-local-search]');
    var cards = selectAll('[data-search-card]');
    var empty = document.querySelector('[data-empty]');
    var chips = selectAll('[data-filter-chip]');
    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function activeFilter() {
      var active = chips.find(function (chip) {
        return chip.classList.contains('is-active');
      });
      return active ? active.getAttribute('data-filter-chip') : 'all';
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var filter = activeFilter();
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search-card'));
        var kind = card.getAttribute('data-filter-kind') || '';
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = filter === 'all' || kind.indexOf(filter) !== -1;
        var shouldShow = matchQuery && matchFilter;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        apply();
      });
    });
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
}());
