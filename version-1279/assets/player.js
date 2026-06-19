(function () {
    function initMoviePlayer(sourceUrl) {
        var video = document.getElementById('movie-video');
        var cover = document.getElementById('movie-play-cover');

        if (!video || !cover || !sourceUrl) {
            return;
        }

        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared) {
                return Promise.resolve();
            }

            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);

                return new Promise(function (resolve) {
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                });
            }

            video.src = sourceUrl;
            return Promise.resolve();
        }

        function play() {
            cover.classList.add('is-hidden');
            prepare().then(function () {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            });
        }

        cover.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            cover.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                cover.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
