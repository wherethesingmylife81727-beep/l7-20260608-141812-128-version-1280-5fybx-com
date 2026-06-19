(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var list = document.querySelector('[data-filter-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '没有找到匹配的影片';

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var type = card.getAttribute('data-type') || '';
        var year = card.getAttribute('data-year') || '';
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (typeValue && type !== typeValue) {
          matched = false;
        }
        if (yearValue && year !== yearValue) {
          matched = false;
        }

        card.classList.toggle('is-filter-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (list) {
        if (!visible && !empty.parentNode) {
          list.appendChild(empty);
        }
        if (visible && empty.parentNode) {
          empty.parentNode.removeChild(empty);
        }
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.movieSearchData) {
    var searchInput = searchPage.querySelector('[data-site-search]');
    var categorySelect = searchPage.querySelector('[data-search-category]');
    var searchType = searchPage.querySelector('[data-search-type]');
    var resultBox = document.querySelector('[data-search-results]');
    var countBox = document.querySelector('[data-search-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    function safeText(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function renderSearch() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : '';
      var type = searchType ? searchType.value : '';
      var results = window.movieSearchData.filter(function (item) {
        var ok = true;
        if (keyword && item.search.indexOf(keyword) === -1) {
          ok = false;
        }
        if (category && item.category !== category) {
          ok = false;
        }
        if (type && item.type !== type) {
          ok = false;
        }
        return ok;
      }).slice(0, 120);

      if (countBox) {
        countBox.textContent = results.length ? '当前显示 ' + results.length + ' 部' : '暂无匹配影片';
      }

      if (!resultBox) {
        return;
      }

      if (!results.length) {
        resultBox.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
        return;
      }

      resultBox.innerHTML = results.map(function (item) {
        return '<article class="movie-card normal">' +
          '<a href="' + item.href + '" class="movie-cover" aria-label="' + safeText(item.title) + '">' +
          '<img src="' + item.image + '" alt="' + safeText(item.title) + '" loading="lazy">' +
          '<span class="play-mark">▶</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<a class="movie-title" href="' + item.href + '">' + safeText(item.title) + '</a>' +
          '<p class="movie-meta">' + safeText(item.region) + ' · ' + safeText(item.type) + ' · ' + safeText(item.year) + '</p>' +
          '<p class="movie-line">' + safeText(item.line) + '</p>' +
          '<div class="tag-row"><span>' + safeText(item.categoryName) + '</span><span>' + safeText(item.genre) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    [searchInput, categorySelect, searchType].forEach(function (control) {
      if (control) {
        control.addEventListener('input', renderSearch);
        control.addEventListener('change', renderSearch);
      }
    });

    renderSearch();
  }
})();
