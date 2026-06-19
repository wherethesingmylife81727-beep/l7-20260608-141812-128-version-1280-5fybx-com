(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showHero(index) {
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
                showHero(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showHero(current + 1);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function createEmptyState(text) {
        var element = document.createElement('div');
        element.className = 'empty-state';
        element.textContent = text;
        return element;
    }

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
        var input = form.querySelector('[data-filter-input]');
        var reset = form.querySelector('[data-filter-reset]');
        var list = document.querySelector('[data-filter-list]');

        if (!input || !list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.children);
        var empty = createEmptyState('没有匹配的影片');

        function filterCards() {
            var keyword = normalize(input.value);
            var visible = 0;

            cards.forEach(function (card) {
                if (card === empty) {
                    return;
                }

                var haystack = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent);
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle('is-filter-hidden', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (!visible && !empty.parentNode) {
                list.appendChild(empty);
            }

            if (visible && empty.parentNode) {
                empty.parentNode.removeChild(empty);
            }
        }

        input.addEventListener('input', filterCards);

        if (reset) {
            reset.addEventListener('click', function () {
                window.setTimeout(filterCards, 0);
            });
        }
    });

    var searchForm = document.querySelector('[data-search-page-form]');
    var searchInput = document.querySelector('[data-search-page-input]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchDefault = document.querySelector('[data-search-default]');

    function cardFromMovie(movie) {
        return [
            '<a class="wide-card" href="' + movie.url + '">',
            '<span class="wide-thumb"><img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy"></span>',
            '<span class="wide-info">',
            '<em>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</em>',
            '<strong>' + movie.title + '</strong>',
            '<span>' + movie.intro + '</span>',
            '</span>',
            '</a>'
        ].join('');
    }

    function runSearch() {
        if (!searchInput || !searchResults || !window.movieSearchIndex) {
            return;
        }

        var keyword = normalize(searchInput.value);
        var pool = window.movieSearchIndex;
        var matched = keyword ? pool.filter(function (movie) {
            return normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + movie.tags).indexOf(keyword) !== -1;
        }).slice(0, 80) : [];

        searchResults.innerHTML = matched.map(cardFromMovie).join('');

        if (keyword && !matched.length) {
            searchResults.appendChild(createEmptyState('没有匹配的影片'));
        }

        if (searchDefault) {
            searchDefault.style.display = keyword ? 'none' : '';
        }
    }

    if (searchForm && searchInput && searchResults) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        searchInput.value = query;
        window.setTimeout(runSearch, 0);

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            var value = searchInput.value.trim();

            if (value) {
                url.searchParams.set('q', value);
            } else {
                url.searchParams.delete('q');
            }

            window.history.replaceState(null, '', url.toString());
            runSearch();
        });

        searchInput.addEventListener('input', runSearch);
    }
}());
