(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }
    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
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

  function setupFilters() {
    var bars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
    if (!bars.length) {
      return;
    }
    bars.forEach(function (bar) {
      var textInput = bar.querySelector('[data-page-search]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
      var empty = document.querySelector('[data-empty-state]');
      var filters = {
        type: '',
        region: '',
        keyword: ''
      };
      function apply() {
        var shown = 0;
        cards.forEach(function (card) {
          var search = (card.getAttribute('data-search') || '').toLowerCase();
          var type = card.getAttribute('data-type') || '';
          var region = card.getAttribute('data-region') || '';
          var typeOk = !filters.type || type.indexOf(filters.type) !== -1;
          var regionOk = !filters.region || region.indexOf(filters.region) !== -1;
          var keywordOk = !filters.keyword || search.indexOf(filters.keyword) !== -1;
          var visible = typeOk && regionOk && keywordOk;
          card.classList.toggle('hidden-card', !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', shown === 0);
        }
      }
      bar.addEventListener('click', function (event) {
        var chip = event.target.closest('.filter-chip');
        if (!chip) {
          return;
        }
        var group = chip.parentElement;
        Array.prototype.slice.call(group.querySelectorAll('.filter-chip')).forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        if (chip.hasAttribute('data-type-filter')) {
          filters.type = chip.getAttribute('data-type-filter') || '';
        } else if (group.getAttribute('aria-label') === '按类型筛选') {
          filters.type = '';
        }
        if (chip.hasAttribute('data-region-filter')) {
          filters.region = chip.getAttribute('data-region-filter') || '';
        } else if (group.getAttribute('aria-label') === '按地区筛选') {
          filters.region = '';
        }
        apply();
      });
      if (textInput) {
        textInput.addEventListener('input', function () {
          filters.keyword = textInput.value.trim().toLowerCase();
          apply();
        });
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          textInput.value = q;
          filters.keyword = q.trim().toLowerCase();
        }
      }
      Array.prototype.slice.call(bar.querySelectorAll('.filter-group')).forEach(function (group) {
        var first = group.querySelector('.filter-chip');
        if (first) {
          first.classList.add('active');
        }
      });
      apply();
    });
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player-video]');
    var panel = document.querySelector('[data-player-panel]');
    var button = document.querySelector('[data-player-button]');
    var config = document.getElementById('player-config');
    if (!video || !panel || !config) {
      return;
    }
    var payload = {};
    try {
      payload = JSON.parse(config.textContent || '{}');
    } catch (error) {
      payload = {};
    }
    if (!payload.url) {
      return;
    }
    var prepared = false;
    var pendingPlay = false;
    var manifestReady = false;
    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30
        });
        hls.loadSource(payload.url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          manifestReady = true;
          if (pendingPlay) {
            video.play().catch(function () {});
          }
        });
        hls.on(window.Hls.Events.ERROR, function () {
          video.src = payload.url;
        });
      } else {
        video.src = payload.url;
        manifestReady = true;
      }
    }
    function start() {
      pendingPlay = true;
      prepare();
      panel.classList.add('is-hidden');
      video.controls = true;
      if (manifestReady || !(window.Hls && window.Hls.isSupported())) {
        video.play().catch(function () {});
      }
    }
    prepare();
    panel.addEventListener('click', start);
    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!panel.classList.contains('is-hidden')) {
        start();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
