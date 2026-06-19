(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function hideBrokenImages() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-hidden');
      }, { once: true });
    });
  }

  function setupMobileNav() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('.hero');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-arrow.prev');
    var next = hero.querySelector('.hero-arrow.next');
    var active = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }
    show(0);
  }

  function setupFilters() {
    var form = document.querySelector('.filter-panel');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    if (!form || !cards.length) {
      return;
    }
    var input = form.querySelector('[name="q"]');
    var year = form.querySelector('[name="year"]');
    var region = form.querySelector('[name="region"]');
    var noResult = document.querySelector('.no-result');
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var q = normalize(input ? input.value : '');
      var y = year ? year.value : '';
      var r = region ? region.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags,
          card.dataset.year
        ].join(' '));
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && card.dataset.year !== y) {
          ok = false;
        }
        if (r && card.dataset.region !== r) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (noResult) {
        noResult.classList.toggle('visible', visible === 0);
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, apply);
    });
    apply();
  }

  function setupPlayer() {
    var video = document.querySelector('.main-player');
    var start = document.querySelector('.player-start');
    if (!video || !start) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var attached = false;

    function attach() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      start.classList.add('hidden');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          start.classList.remove('hidden');
        });
      }
    }

    start.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      start.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        start.classList.remove('hidden');
      }
    });
  }

  ready(function () {
    hideBrokenImages();
    setupMobileNav();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
