/* =========================================================
   COACH — HOMEPAGE INTERACTION CONTROLLER
   Version: 2026-09-08-2
   Compatible with index.html + index.css in this package.
   No secrets, Firebase credentials, or Telegram bot tokens live here.
========================================================= */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const html = document.documentElement;
  const body = document.body;

  /* -------------------------
     THEME
  ------------------------- */
  const THEME_KEY = "coach-theme";
  const themeButton = $("#theme");

  function applyTheme(theme) {
    const safeTheme = theme === "light" ? "light" : "dark";
    html.setAttribute("data-theme", safeTheme);
    body.classList.toggle("light", safeTheme === "light");

    if (themeButton) {
      themeButton.setAttribute(
        "aria-label",
        safeTheme === "light" ? "تفعيل الوضع الداكن" : "تفعيل الوضع الفاتح"
      );
    }
  }

  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem("theme") || "dark";
  } catch (_) {}

  applyTheme(savedTheme);

  themeButton?.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
      localStorage.setItem("theme", next);
    } catch (_) {}
  });

  /* -------------------------
     MOBILE MENU
  ------------------------- */
  const mobileButton = $("#mobileMenuButton");
  const mobileMenu = $("#mobileMenu");

  function closeMobileMenu() {
    if (!mobileButton || !mobileMenu) return;
    mobileButton.classList.remove("active");
    mobileButton.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("open");
  }

  mobileButton?.addEventListener("click", () => {
    const willOpen = !mobileMenu?.classList.contains("open");
    if (!mobileMenu) return;
    mobileMenu.classList.toggle("open", willOpen);
    mobileButton.classList.toggle("active", willOpen);
    mobileButton.setAttribute("aria-expanded", String(willOpen));
  });

  $$(".mobile-nav-link", mobileMenu || document).forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMobileMenu();
  }, { passive: true });

  /* -------------------------
     PAGE LOADER
  ------------------------- */
  const loader = $("#pageLoader");
  const finishLoading = () => loader?.classList.add("loaded");

  if (document.readyState === "complete") {
    window.setTimeout(finishLoading, 120);
  } else {
    window.addEventListener("load", () => window.setTimeout(finishLoading, 120), { once: true });
  }

  /* -------------------------
     CURSOR GLOW
  ------------------------- */
  const glow = $(".cursor-glow");
  let glowFrame = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;

  document.addEventListener("pointermove", (event) => {
    if (!glow || event.pointerType === "touch") return;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

    if (glowFrame) return;
    glowFrame = requestAnimationFrame(() => {
      glow.style.left = `${lastPointerX}px`;
      glow.style.top = `${lastPointerY}px`;
      glowFrame = 0;
    });
  }, { passive: true });

  /* -------------------------
     HERO 3D TILT
     Disabled for touch/reduced-motion.
  ------------------------- */
  const heroVisual = $(".hero-visual");
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  if (heroVisual && !reduceMotion) {
    heroVisual.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const rect = heroVisual.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      heroVisual.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
      heroVisual.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
    }, { passive: true });

    heroVisual.addEventListener("pointerleave", () => {
      heroVisual.style.setProperty("--tilt-x", "0deg");
      heroVisual.style.setProperty("--tilt-y", "0deg");
    }, { passive: true });
  }

  /* -------------------------
     REVEAL ON SCROLL
  ------------------------- */
  const revealItems = $$(".feature-card, .about-content, .about-card-wrap, .access-card, .sport-card, .support-panel, .install-card, .final-cta");
  if (revealItems.length && "IntersectionObserver" in window && !reduceMotion) {
    revealItems.forEach((element) => element.classList.add("reveal"));
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((element) => revealObserver.observe(element));
  }

  /* -------------------------
     ACTIVE NAVIGATION
  ------------------------- */
  const navLinks = $$(".nav-link");
  const sections = navLinks
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    }, { threshold: [0.15, 0.35, 0.6], rootMargin: "-18% 0px -58% 0px" });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* -------------------------
     SPORTS VIDEOS
     IMPORTANT:
     - Cards are <article>, not <a>.
     - Videos are muted + autoplay + loop + playsinline.
     - Visible videos play automatically.
     - Off-screen videos pause to save bandwidth/battery.
     - No click sends the visitor to Pexels.
  ------------------------- */
  const sportVideos = $$(".sport-media");

  function prepareVideo(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("loop", "");
    video.setAttribute("aria-hidden", "true");
  }

  async function playVideo(video) {
    prepareVideo(video);
    try {
      await video.play();
      video.removeAttribute("data-autoplay-blocked");
    } catch (_) {
      // Some mobile browsers delay autoplay until the first user gesture.
      video.setAttribute("data-autoplay-blocked", "true");
    }
  }

  function pauseVideo(video) {
    try { video.pause(); } catch (_) {}
  }

  sportVideos.forEach((video) => {
    prepareVideo(video);

    video.addEventListener("loadedmetadata", () => {
      if (video.closest(".sport-card")?.getBoundingClientRect().top < window.innerHeight) {
        playVideo(video);
      }
    }, { once: true });

    video.addEventListener("error", () => {
      video.setAttribute("data-video-error", "true");
    }, { passive: true });
  });

  if (sportVideos.length && "IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          playVideo(video);
        } else {
          pauseVideo(video);
        }
      });
    }, { threshold: [0, 0.15, 0.35] });

    sportVideos.forEach((video) => videoObserver.observe(video));
  } else {
    sportVideos.forEach(playVideo);
  }

  // One-time fallback for browsers that postpone even muted autoplay.
  const resumeSports = () => {
    sportVideos.forEach((video) => {
      if (video.hasAttribute("data-autoplay-blocked")) playVideo(video);
    });
  };
  ["pointerdown", "touchstart", "keydown"].forEach((eventName) => {
    window.addEventListener(eventName, resumeSports, { passive: true, once: true });
  });

  /* -------------------------
     LOCAL IMAGE FALLBACK
     Keeps the requested filename/path. If the image file is missing,
     the visual area stays styled instead of showing a broken icon.
  ------------------------- */
  const heroImage = $(".hero-image");
  heroImage?.addEventListener("error", () => {
    heroImage.classList.add("image-missing");
    heroImage.removeAttribute("src");
    heroImage.setAttribute("alt", "Coach AbdelNasser");
  }, { once: true });
})();
