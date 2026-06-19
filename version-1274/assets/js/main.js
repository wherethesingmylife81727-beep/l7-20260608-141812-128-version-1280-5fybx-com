(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-broken');
    });
  });

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-target]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === current);
      });
      thumbs.forEach(function (thumb, position) {
        thumb.classList.toggle('is-active', position === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var target = Number(thumb.getAttribute('data-hero-target')) || 0;
        showSlide(target);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var filterable = document.querySelector('[data-filterable]');

  if (filterPanel && filterable) {
    var input = filterPanel.querySelector('.filter-input');
    var yearSelect = filterPanel.querySelector('.filter-year');
    var typeSelect = filterPanel.querySelector('.filter-type');
    var cards = Array.prototype.slice.call(filterable.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function matchCard(card, keyword, year, type) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-category'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.textContent
      ].join(' ').toLowerCase();
      var okKeyword = !keyword || haystack.indexOf(keyword) >= 0;
      var okYear = !year || card.getAttribute('data-year') === year;
      var okType = !type || card.getAttribute('data-type') === type;
      return okKeyword && okYear && okType;
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var visible = matchCard(card, keyword, year, type);
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown > 0;
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      if (input) {
        input.addEventListener(eventName, applyFilter);
      }
      if (yearSelect) {
        yearSelect.addEventListener(eventName, applyFilter);
      }
      if (typeSelect) {
        typeSelect.addEventListener(eventName, applyFilter);
      }
    });

    applyFilter();
  }
})();
