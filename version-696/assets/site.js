(function () {
  const qs = new URLSearchParams(window.location.search);

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMobileNav() {
    const toggle = document.querySelector('.mobile-toggle');
    const panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    let current = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(current);
    start();
  }

  function setupFiltering() {
    const containers = Array.from(document.querySelectorAll('[data-card-container]'));
    const search = document.querySelector('.filter-search');
    const resetButtons = Array.from(document.querySelectorAll('[data-filter-reset]'));
    const filterButtons = Array.from(document.querySelectorAll('[data-filter-key]'));
    const empty = document.querySelector('.empty-state');
    const filters = {};

    if (!containers.length) {
      return;
    }

    const initialQuery = qs.get('q');
    if (search && initialQuery) {
      search.value = initialQuery;
    }

    function cards() {
      return containers.flatMap((container) => Array.from(container.children));
    }

    function matchesFilter(card, key, value) {
      const dataValue = normalize(card.dataset[key]);
      return dataValue.includes(normalize(value));
    }

    function apply() {
      const term = normalize(search ? search.value : '');
      let visible = 0;
      cards().forEach((card) => {
        const text = normalize(card.dataset.search || card.textContent);
        let ok = !term || text.includes(term);
        Object.keys(filters).forEach((key) => {
          if (filters[key]) {
            ok = ok && matchesFilter(card, key, filters[key]);
          }
        });
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (search) {
      search.addEventListener('input', apply);
    }

    filterButtons.forEach((button) => {
      button.addEventListener('click', function () {
        const key = button.dataset.filterKey;
        const value = button.dataset.filterValue;
        const active = button.classList.contains('is-active');
        filterButtons
          .filter((other) => other.dataset.filterKey === key)
          .forEach((other) => other.classList.remove('is-active'));
        if (active) {
          delete filters[key];
        } else {
          filters[key] = value;
          button.classList.add('is-active');
        }
        resetButtons.forEach((reset) => reset.classList.remove('is-active'));
        apply();
      });
    });

    resetButtons.forEach((button) => {
      button.addEventListener('click', function () {
        Object.keys(filters).forEach((key) => delete filters[key]);
        filterButtons.forEach((other) => other.classList.remove('is-active'));
        resetButtons.forEach((reset) => reset.classList.add('is-active'));
        if (search) {
          search.value = '';
        }
        apply();
      });
    });

    apply();
  }

  function setupPlayers() {
    const shells = Array.from(document.querySelectorAll('.player-shell'));
    shells.forEach((shell) => {
      const video = shell.querySelector('video');
      const button = shell.querySelector('.play-trigger');
      if (!video) {
        return;
      }
      const source = video.dataset.m3u8;
      let hls = null;
      let attached = false;

      function attach() {
        if (attached || !source) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function play() {
        attach();
        const result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
      shell.addEventListener('dblclick', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFiltering();
    setupPlayers();
  });
})();
