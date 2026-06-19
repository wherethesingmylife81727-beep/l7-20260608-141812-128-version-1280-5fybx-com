(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mainNav = document.querySelector('.main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('.js-filter-area'));

    filterForms.forEach(function (area) {
        var input = area.querySelector('.js-search-input');
        var yearSelect = area.querySelector('.js-year-filter');
        var regionSelect = area.querySelector('.js-region-filter');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = yearSelect ? yearSelect.value : '';
            var regionValue = regionSelect ? regionSelect.value : '';

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type')
                ].join(' ').toLowerCase();
                var year = card.getAttribute('data-year') || '';
                var region = card.getAttribute('data-region') || '';
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !yearValue || year === yearValue;
                var matchedRegion = !regionValue || region === regionValue;

                card.classList.toggle('hidden-card', !(matchedKeyword && matchedYear && matchedRegion));
            });
        }

        [input, yearSelect, regionSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    });

    Array.prototype.slice.call(document.querySelectorAll('.js-play-button')).forEach(function (button) {
        var stage = button.closest('.player-stage');
        var video = stage ? stage.querySelector('video') : null;
        var url = button.getAttribute('data-url');
        var started = false;
        var hlsInstance = null;

        function begin() {
            if (!video || !url) {
                return;
            }

            button.classList.add('is-hidden');

            if (started) {
                video.play();
                return;
            }

            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.play();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                return;
            }

            video.src = url;
            video.play();
        }

        button.addEventListener('click', begin);
        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    begin();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
