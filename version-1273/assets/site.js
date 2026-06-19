(function () {
  "use strict";

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function currentPrefix() {
    return window.location.pathname.indexOf("/movies/") !== -1 ? "../" : "";
  }

  function fixUrl(url) {
    var prefix = currentPrefix();
    if (!url) {
      return prefix + "index.html";
    }
    if (/^(https?:)?\/\//.test(url) || url.indexOf("../") === 0 || url.indexOf("./") === 0) {
      return url;
    }
    return prefix + url;
  }

  function initMenu() {
    var button = qs("[data-menu-toggle]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initPageFilters() {
    qsa("[data-filter-panel]").forEach(function (panel) {
      var grid = panel.parentElement ? qs("[data-card-grid]", panel.parentElement) : null;
      if (!grid) {
        grid = qs("[data-card-grid]");
      }
      if (!grid) {
        return;
      }

      var cards = qsa("[data-card]", grid);
      var keywordInput = qs("[data-page-filter]", panel);
      var yearSelect = qs("[data-year-filter]", panel);
      var regionSelect = qs("[data-region-filter]", panel);
      var resultCount = qs("[data-result-count]", panel);

      var years = [];
      var regions = [];
      cards.forEach(function (card) {
        var year = card.getAttribute("data-year");
        var region = card.getAttribute("data-region");
        if (year && years.indexOf(year) === -1) {
          years.push(year);
        }
        if (region && regions.indexOf(region) === -1) {
          regions.push(region);
        }
      });

      years.sort().reverse().forEach(function (year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });

      regions.sort().forEach(function (region) {
        var option = document.createElement("option");
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
      });

      function applyFilter() {
        var keyword = normalize(keywordInput ? keywordInput.value : "");
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !year || card.getAttribute("data-year") === year;
          var matchesRegion = !region || card.getAttribute("data-region") === region;
          var show = matchesKeyword && matchesYear && matchesRegion;
          card.classList.toggle("hidden-card", !show);
          if (show) {
            visible += 1;
          }
        });

        if (resultCount) {
          resultCount.textContent = "当前显示 " + visible + " / " + cards.length + " 部";
        }
      }

      [keywordInput, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    });
  }

  function createSearchItem(movie) {
    var item = document.createElement("a");
    item.className = "search-result-item";
    item.href = fixUrl(movie.url);
    item.innerHTML = [
      '<img src="' + fixUrl(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" onerror="this.classList.add(\'is-missing\')">',
      '<div>',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine || "暂无简介") + '</p>',
      '<span>' + escapeHtml([movie.year, movie.region, movie.type, movie.genre].filter(Boolean).join(" · ")) + '</span>',
      '</div>'
    ].join("");
    return item;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function runSearch(input, resultBox) {
    var keyword = normalize(input.value);
    resultBox.innerHTML = "";

    if (!keyword) {
      resultBox.innerHTML = '<p class="muted">输入关键词后显示搜索结果。</p>';
      return;
    }

    var movies = window.MOVIES_DATA || [];
    var results = movies.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        (movie.tags || []).join(" "),
        movie.oneLine
      ].join(" "));
      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 60);

    if (!results.length) {
      resultBox.innerHTML = '<p class="muted">没有找到匹配影片。</p>';
      return;
    }

    results.forEach(function (movie) {
      resultBox.appendChild(createSearchItem(movie));
    });
  }

  function initSearch() {
    var panel = qs("[data-search-panel]");
    var openButtons = qsa("[data-open-search]");
    var closeButtons = qsa("[data-close-search]");
    var inputPairs = [];

    qsa("[data-global-search-input]").forEach(function (input) {
      var container = input.closest(".search-dialog") || input.closest(".search-page-section") || document;
      var resultBox = qs("[data-global-search-results]", container) || qs("[data-global-search-results]");
      if (resultBox) {
        inputPairs.push({ input: input, resultBox: resultBox });
        input.addEventListener("input", function () {
          runSearch(input, resultBox);
        });
      }
    });

    function openSearch() {
      if (!panel) {
        window.location.href = fixUrl("search.html");
        return;
      }
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      document.body.classList.add("search-open");
      var input = qs("[data-global-search-input]", panel);
      if (input) {
        setTimeout(function () {
          input.focus();
        }, 30);
      }
    }

    function closeSearch() {
      if (!panel) {
        return;
      }
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      document.body.classList.remove("search-open");
    }

    openButtons.forEach(function (button) {
      button.addEventListener("click", openSearch);
    });

    closeButtons.forEach(function (button) {
      button.addEventListener("click", closeSearch);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeSearch();
      }
    });

    var autofocusInput = qs("[data-autofocus-search]");
    if (autofocusInput) {
      setTimeout(function () {
        autofocusInput.focus();
      }, 80);
    }
  }

  function initPlayers() {
    qsa("[data-player]").forEach(function (player) {
      var video = qs("video", player);
      var button = qs("[data-play-button]", player);
      var status = qs("[data-player-status]", player);
      var src = player.getAttribute("data-video-src");
      var hlsInstance = null;

      if (!video || !button || !src) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      button.addEventListener("click", function () {
        player.classList.add("is-playing");
        setStatus("正在初始化 HLS 播放源...");

        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源加载完成，正在播放。");
            video.play().catch(function () {
              setStatus("浏览器阻止了自动播放，请再次点击视频播放按钮。");
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放源加载失败，请稍后重试。");
            }
          });
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.addEventListener("loadedmetadata", function () {
            setStatus("播放源加载完成，正在播放。");
            video.play().catch(function () {
              setStatus("浏览器阻止了自动播放，请再次点击视频播放按钮。");
            });
          }, { once: true });
          return;
        }

        player.classList.remove("is-playing");
        setStatus("当前浏览器不支持 HLS 播放，请更换支持 HLS 的浏览器或加载 hls.js。 ");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initPageFilters();
    initSearch();
    initPlayers();
  });
})();
