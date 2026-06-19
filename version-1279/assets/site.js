(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('[data-menu-toggle]');
    var mobileNav = qs('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = qs('[data-hero]');

    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                restartHero();
            });
        });

        function restartHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        showSlide(0);
        restartHero();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().replace(/\s+/g, '');
    }

    function applySearch(root) {
        var input = qs('[data-site-search]', root);
        var yearSelect = qs('[data-year-filter]', root);
        var categorySelect = qs('[data-category-filter]', root);
        var items = qsa('[data-search-item]', root);
        var noResult = qs('[data-no-result]', root);

        if (!input && !yearSelect && !categorySelect) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && input) {
            input.value = initialQuery;
        }

        function run() {
            var keyword = normalize(input ? input.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            var visibleCount = 0;

            items.forEach(function (item) {
                var haystack = normalize([
                    item.getAttribute('data-title'),
                    item.getAttribute('data-year'),
                    item.getAttribute('data-category'),
                    item.getAttribute('data-tags')
                ].join(' '));
                var itemYear = item.getAttribute('data-year') || '';
                var itemCategory = item.getAttribute('data-category') || '';
                var matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
                    (!year || itemYear === year) &&
                    (!category || itemCategory === category);

                item.classList.toggle('is-hidden', !matched);

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (noResult) {
                noResult.classList.toggle('show', visibleCount === 0);
            }
        }

        if (input) {
            input.addEventListener('input', run);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', run);
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', run);
        }

        run();
    }

    qsa('[data-filter-root]').forEach(function (root) {
        applySearch(root);
    });
})();
