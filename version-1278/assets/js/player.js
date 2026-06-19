import { H as Hls } from './hls.js';

document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('[data-video-player]');
    var overlay = player.querySelector('[data-play-overlay]');
    var started = false;
    var hls = null;

    if (!video || !overlay) {
        return;
    }

    function hideOverlay() {
        overlay.classList.add('is-hidden');
    }

    function tryPlay() {
        hideOverlay();
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    function loadAndPlay() {
        var source = video.getAttribute('data-src');

        if (!source) {
            return;
        }

        if (started) {
            tryPlay();
            return;
        }

        started = true;

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MEDIA_ATTACHED, tryPlay);
            hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
            hls.on(Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }

                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }

                hls.destroy();
                started = false;
                overlay.classList.remove('is-hidden');
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', tryPlay, { once: true });
            video.load();
            tryPlay();
        }
    }

    overlay.addEventListener('click', loadAndPlay);
    video.addEventListener('click', function () {
        if (!started || video.paused) {
            loadAndPlay();
        }
    });

    video.addEventListener('play', hideOverlay);
});
