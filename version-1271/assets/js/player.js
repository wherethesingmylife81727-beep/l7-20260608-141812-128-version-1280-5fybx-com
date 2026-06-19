(function () {
  var init = function () {
    document.querySelectorAll("[data-hls-player]").forEach(function (video) {
      var src = video.getAttribute("data-hls-src");
      var shell = video.closest(".player-shell");
      var playButton = shell ? shell.querySelector("[data-play-button]") : null;
      var hls;

      if (!src) {
        return;
      }

      var attachSource = function () {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else {
          video.src = src;
        }
      };

      var play = function () {
        if (!video.src && !hls) {
          attachSource();
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      };

      attachSource();

      if (playButton) {
        playButton.addEventListener("click", play);
      }

      video.addEventListener("play", function () {
        if (playButton) {
          playButton.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (playButton) {
          playButton.classList.remove("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  if (document.readyState !== "loading") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
