(function () {
  window.mountPlayer = function (options) {
    var video = document.querySelector(options.selector);
    var trigger = document.querySelector(options.triggerSelector);
    var started = false;
    var hlsInstance = null;

    if (!video || !options.source) {
      return;
    }

    function attachSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(options.source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = options.source;
    }

    function begin() {
      if (!started) {
        started = true;
        attachSource();
      }

      if (trigger) {
        trigger.classList.add('is-hidden');
      }

      var playback = video.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (!started) {
        begin();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  };
})();
