(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupNavSearch() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input) {
          return;
        }
        var value = input.value.trim();
        event.preventDefault();
        if (value) {
          window.location.href = './search.html?q=' + encodeURIComponent(value);
        } else {
          window.location.href = './search.html';
        }
      });
    });
  }

  function setupHero() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function restart(next) {
      if (timer) {
        window.clearInterval(timer);
      }
      show(next);
      start();
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        restart(i);
      });
    });
    start();
  }

  function yearMatched(cardYear, mode) {
    var year = parseInt(cardYear, 10);
    if (!mode) {
      return true;
    }
    if (!year) {
      return false;
    }
    if (mode === '2020') {
      return year >= 2020;
    }
    if (mode === '2010') {
      return year >= 2010 && year <= 2019;
    }
    if (mode === '2000') {
      return year >= 2000 && year <= 2009;
    }
    if (mode === '1990') {
      return year < 1990;
    }
    return true;
  }

  function setupFilters() {
    var area = qs('[data-filter-area]');
    if (!area) {
      return;
    }
    var cards = qsa('[data-movie-card]', area);
    var input = qs('[data-filter-input]');
    var yearSelect = qs('[data-filter-year]');
    var typeSelect = qs('[data-filter-type]');
    var emptyState = qs('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input) {
      input.value = query;
    }
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearMode = yearSelect ? yearSelect.value : '';
      var typeMode = typeSelect ? typeSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var search = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matchedKeyword = !keyword || search.indexOf(keyword) !== -1;
        var matchedYear = yearMatched(cardYear, yearMode);
        var matchedType = !typeMode || cardType.indexOf(typeMode) !== -1 || search.indexOf(typeMode.toLowerCase()) !== -1;
        var show = matchedKeyword && matchedYear && matchedType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }
    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  window.initMoviePlayer = function (videoId, overlayId, buttonId, hlsUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var hls = null;
    if (!video || !overlay || !hlsUrl) {
      return;
    }
    function attach() {
      if (video.dataset.ready === '1') {
        return Promise.resolve();
      }
      video.dataset.ready = '1';
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function () {
            resolve();
          });
        });
      }
      video.src = hlsUrl;
      return Promise.resolve();
    }
    function play() {
      overlay.classList.add('is-hidden');
      attach().then(function () {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      });
    }
    overlay.addEventListener('click', play);
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('click', function () {
      if (!video.dataset.ready) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupNavSearch();
    setupHero();
    setupFilters();
  });
})();
