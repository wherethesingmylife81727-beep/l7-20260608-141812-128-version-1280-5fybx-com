(function () {
    var doc = document;

    function ready(callback) {
        if (doc.readyState === 'loading') {
            doc.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initNav() {
        var toggle = doc.querySelector('[data-nav-toggle]');
        var nav = doc.querySelector('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = doc.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function filterCards(input, list) {
        var query = normalize(input.value);
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-search'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));
            card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
        });
    }

    function initFilters() {
        var lists = Array.prototype.slice.call(doc.querySelectorAll('[data-filter-list]'));
        var inputs = Array.prototype.slice.call(doc.querySelectorAll('[data-filter-input]'));
        if (!lists.length || !inputs.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        inputs.forEach(function (input) {
            if (query && !input.value) {
                input.value = query;
            }
            input.addEventListener('input', function () {
                lists.forEach(function (list) {
                    filterCards(input, list);
                });
            });
            input.dispatchEvent(new Event('input'));
        });
        Array.prototype.slice.call(doc.querySelectorAll('[data-local-filter], [data-search-page-form]')).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('[data-filter-input]');
                if (input) {
                    event.preventDefault();
                    lists.forEach(function (list) {
                        filterCards(input, list);
                    });
                }
            });
        });
    }

    function loadVideo(video, source, onReady) {
        if (!video || !source) {
            return;
        }
        if (video.getAttribute('data-loaded') === source) {
            onReady();
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.setAttribute('data-loaded', source);
            onReady();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (video.hlsPlayer) {
                video.hlsPlayer.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            video.hlsPlayer = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.setAttribute('data-loaded', source);
                onReady();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    video.src = source;
                    video.setAttribute('data-loaded', source);
                }
            });
            return;
        }
        video.src = source;
        video.setAttribute('data-loaded', source);
        onReady();
    }

    function initPlayers() {
        var buttons = Array.prototype.slice.call(doc.querySelectorAll('.player-start'));
        buttons.forEach(function (button) {
            var targetId = button.getAttribute('data-player-target');
            var source = button.getAttribute('data-src');
            var video = doc.getElementById(targetId);
            var frame = button.closest('.player-frame');

            function start() {
                if (frame) {
                    frame.classList.add('is-playing');
                }
                button.classList.add('is-hidden');
                loadVideo(video, source, function () {
                    var playPromise = video.play();
                    if (playPromise && playPromise.catch) {
                        playPromise.catch(function () {});
                    }
                });
            }

            button.addEventListener('click', start);
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        start();
                    }
                });
                video.addEventListener('play', function () {
                    if (frame) {
                        frame.classList.add('is-playing');
                    }
                    button.classList.add('is-hidden');
                });
            }
        });
    }

    ready(function () {
        initNav();
        initHero();
        initFilters();
        initPlayers();
    });
}());
