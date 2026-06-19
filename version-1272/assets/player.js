(function () {
  var video = document.querySelector('[data-video-player]');
  var startButton = document.querySelector('[data-player-start]');
  var configNode = document.getElementById('player-config');

  if (!video || !configNode) {
    return;
  }

  var config = {};
  try {
    config = JSON.parse(configNode.textContent || '{}');
  } catch (error) {
    config = {};
  }

  var streamUrl = config.url || '';
  var hasStarted = false;
  var hlsInstance = null;

  function attachMedia() {
    if (!streamUrl || hasStarted) {
      return;
    }

    hasStarted = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function beginPlayback() {
    attachMedia();

    if (startButton) {
      startButton.classList.add('is-hidden');
    }

    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        if (startButton) {
          startButton.classList.remove('is-hidden');
        }
      });
    }
  }

  if (startButton) {
    startButton.addEventListener('click', beginPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      beginPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (startButton) {
      startButton.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
