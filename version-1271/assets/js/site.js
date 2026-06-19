(function () {
  var ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
        img.removeAttribute("src");
      }, { once: true });
    });

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = 0;
      var timer;

      var show = function (target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };

      var start = function () {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      };

      var restart = function () {
        window.clearInterval(timer);
        start();
      };

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

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });

      show(0);
      start();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var year = params.get("year") || "";
    var keywordInput = document.querySelector("[data-filter-keyword]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var categorySelect = document.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    if (keywordInput && query) {
      keywordInput.value = query;
    }

    if (yearSelect && year) {
      yearSelect.value = year;
    }

    var filterCards = function () {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var selectedYear = yearSelect ? yearSelect.value : "";
      var selectedType = typeSelect ? typeSelect.value : "";
      var selectedCategory = categorySelect ? categorySelect.value : "";

      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
          card.dataset.keywords
        ].join(" ").toLowerCase();

        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (selectedYear && card.dataset.year !== selectedYear) {
          matched = false;
        }
        if (selectedType && card.dataset.type.indexOf(selectedType) === -1) {
          matched = false;
        }
        if (selectedCategory && card.dataset.category !== selectedCategory) {
          matched = false;
        }
        card.hidden = !matched;
      });
    };

    [keywordInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });

    if (cards.length && (query || year)) {
      filterCards();
    }
  });
})();
