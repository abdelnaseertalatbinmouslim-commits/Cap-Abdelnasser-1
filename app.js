/* =========================================================
   COACH — HOME PAGE APP
   Safe startup + loader fix + mobile menu + theme + motion + videos
   ========================================================= */
(function () {
  "use strict";

  function hideLoader() {
    const loader = document.getElementById("pageLoader");
    if (!loader) return;
    loader.classList.add("is-hidden");
    loader.setAttribute("aria-hidden", "true");
    // Keep it out of the way even if an old CSS file is cached.
    setTimeout(function () {
      loader.style.display = "none";
    }, 650);
  }

  function setupTheme() {
    const themeButton = document.getElementById("theme");
    const savedTheme = localStorage.getItem("coach_theme");

    if (savedTheme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      document.body.classList.add("light");
    }

    if (!themeButton) return;
    themeButton.addEventListener("click", function () {
      const isLight = document.documentElement.getAttribute("data-theme") === "light" || document.body.classList.contains("light");
      if (isLight) {
        document.documentElement.removeAttribute("data-theme");
        document.body.classList.remove("light");
        localStorage.setItem("coach_theme", "dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        document.body.classList.add("light");
        localStorage.setItem("coach_theme", "light");
      }
    });
  }

  function setupMobileMenu() {
    const button = document.getElementById("mobileMenuButton");
    const menu = document.getElementById("mobileMenu");
    if (!button || !menu) return;

    function closeMenu() {
      menu.classList.remove("open", "active");
      button.setAttribute("aria-expanded", "false");
    }

    button.addEventListener("click", function () {
      const open = menu.classList.toggle("open");
      menu.classList.toggle("active", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target) && !button.contains(event.target)) {
        closeMenu();
      }
    });
  }

  function setupCursorGlow() {
    const glow = document.querySelector(".cursor-glow");
    if (!glow || !window.matchMedia("(pointer:fine)").matches) return;

    document.addEventListener("pointermove", function (event) {
      glow.style.left = event.clientX + "px";
      glow.style.top = event.clientY + "px";
    }, { passive: true });
  }

  function setupReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (element) { element.classList.add("visible", "active"); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible", "active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach(function (element) { observer.observe(element); });
  }

  function setupSportsVideos() {
    const videos = Array.from(document.querySelectorAll(".sport-media"));
    if (!videos.length) return;

    videos.forEach(function (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("loop", "");

      // Never let a card navigate to another site.
      const card = video.closest(".sport-card");
      if (card && card.tagName === "A") {
        card.removeAttribute("href");
        card.removeAttribute("target");
        card.removeAttribute("rel");
      }
    });

    function play(video) {
      video.muted = true;
      const promise = video.play();
      if (promise && typeof promise.catch === "function") promise.catch(function () {});
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
            play(entry.target);
          } else {
            entry.target.pause();
          }
        });
      }, { threshold: [0, 0.15, 0.5] });
      videos.forEach(function (video) { observer.observe(video); });
    } else {
      videos.forEach(play);
    }

    // Some mobile browsers need one extra attempt after the page becomes visible.
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) videos.forEach(function (video) {
        const rect = video.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) play(video);
      });
    });
  }

  function setupImageFallback() {
    const image = document.querySelector(".hero-image");
    if (!image) return;

    image.addEventListener("error", function () {
      image.classList.add("image-missing");
      image.removeAttribute("src");
      image.setAttribute("alt", "Coach AbdelNasser");
    }, { once: true });
  }

  function setupSmoothNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function start() {
    hideLoader();
    setupTheme();
    setupMobileMenu();
    setupCursorGlow();
    setupReveal();
    setupSportsVideos();
    setupImageFallback();
    setupSmoothNavigation();
  }

  // Hide the loader no matter what; it must never trap the page on the splash screen.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  // Final safety net for slow/blocked resources.
  setTimeout(hideLoader, 2500);
})();
