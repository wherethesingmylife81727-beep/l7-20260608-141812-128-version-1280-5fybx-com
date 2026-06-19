import { H as Hls } from './hls-dru42stk.js';

(function () {
  var shell = document.querySelector('[data-player]');
  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play-button]');
  var message = shell.querySelector('[data-player-message]');
  var url = video ? video.getAttribute('data-m3u8') : '';
  var prepared = false;
  var hlsInstance = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function preparePlayer() {
    if (prepared || !video || !url) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setMessage('播放暂时不可用，请稍后重试');
        }
      });
      return;
    }

    setMessage('播放暂时不可用，请更换浏览器重试');
  }

  function playVideo() {
    preparePlayer();
    if (!video) {
      return;
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        setMessage('');
      }).catch(function () {
        setMessage('点击视频控件继续播放');
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });
  }
})();
