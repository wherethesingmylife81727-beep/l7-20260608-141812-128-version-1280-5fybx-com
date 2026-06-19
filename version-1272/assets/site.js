(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navigation = document.querySelector('[data-site-nav]');

  if (menuButton && navigation) {
    menuButton.addEventListener('click', function () {
      navigation.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var current = 0;
    var timer = null;

    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
        startTimer();
      });
    });

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('mouseenter', function () {
        setSlide(index);
        startTimer();
      });
    });

    setSlide(0);
    startTimer();
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var targetSelector = form.getAttribute('data-target') || '[data-card]';
    var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
    var keywordInput = form.querySelector('[data-filter-keyword]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var emptyState = document.querySelector('[data-empty-state]');

    function applyFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    form.addEventListener('input', applyFilter);
    form.addEventListener('change', applyFilter);
    form.addEventListener('reset', function () {
      window.setTimeout(applyFilter, 0);
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && keywordInput) {
      keywordInput.value = query;
      applyFilter();
    }
  });
})();
