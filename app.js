/* =========================================================
   COACH ABDELNASSER
   Main Frontend Application
   ========================================================= */


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


/* =========================================================
   THEME
   Compatible with:
   html[data-theme="light"]
   ========================================================= */

const themeButton = $("#theme");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
} else {
    document.documentElement.removeAttribute("data-theme");
}


/* Theme Button */

themeButton?.addEventListener("click", () => {

    const isLight =
        document.documentElement.getAttribute("data-theme") === "light";

    if (isLight) {

        document.documentElement.removeAttribute("data-theme");

        localStorage.setItem(
            "theme",
            "dark"
        );

    } else {

        document.documentElement.setAttribute(
            "data-theme",
            "light"
        );

        localStorage.setItem(
            "theme",
            "light"
        );

    }

});


/* =========================================================
   HEADER SCROLL EFFECT
   ========================================================= */

const header = $(".site-header");


const updateHeader = () => {

    if (!header) return;

    if (window.scrollY > 25) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

};


window.addEventListener(
    "scroll",
    updateHeader,
    {
        passive: true
    }
);


updateHeader();


/* =========================================================
   MOBILE MENU
   ========================================================= */

const mobileMenuButton = $("#mobileMenuButton");

const mobileMenu = $("#mobileMenu");


const closeMobileMenu = () => {

    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.classList.remove("active");

    mobileMenuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    mobileMenu.classList.remove("active");

    mobileMenu.setAttribute(
        "aria-hidden",
        "true"
    );

};


const openMobileMenu = () => {

    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.classList.add("active");

    mobileMenuButton.setAttribute(
        "aria-expanded",
        "true"
    );

    mobileMenu.classList.add("active");

    mobileMenu.setAttribute(
        "aria-hidden",
        "false"
    );

};


mobileMenuButton?.addEventListener(
    "click",
    () => {

        const isOpen =
            mobileMenuButton.classList.contains("active");

        if (isOpen) {

            closeMobileMenu();

        } else {

            openMobileMenu();

        }

    }
);


/* Close mobile menu when a link is clicked */

$$(".mobile-nav-link").forEach((link) => {

    link.addEventListener(
        "click",
        () => {

            closeMobileMenu();

        }
    );

});


/* Close menu when clicking outside */

document.addEventListener(
    "click",
    (event) => {

        if (!mobileMenu || !mobileMenuButton) return;

        const target = event.target;

        if (
            mobileMenu.classList.contains("active") &&
            !mobileMenu.contains(target) &&
            !mobileMenuButton.contains(target)
        ) {

            closeMobileMenu();

        }

    }
);


/* =========================================================
   NAVIGATION ACTIVE SECTION
   ========================================================= */

const navigationLinks = $$(".nav-link, .mobile-nav-link");


const sections = $$(
    "main section[id]"
);


const setActiveNavigation = (id) => {

    navigationLinks.forEach((link) => {

        const sectionName =
            link.dataset.section;

        link.classList.toggle(
            "active",
            sectionName === id
        );

    });

};


if (
    sections.length &&
    "IntersectionObserver" in window
) {

    const sectionObserver =
        new IntersectionObserver(
            (entries) => {

                const visibleEntries =
                    entries
                        .filter(
                            (entry) =>
                                entry.isIntersecting
                        )
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        );

                if (!visibleEntries.length) return;

                setActiveNavigation(
                    visibleEntries[0].target.id
                );

            },
            {
                rootMargin:
                    "-25% 0px -60% 0px",

                threshold: [
                    0.05,
                    0.15,
                    0.3,
                    0.5
                ]
            }
        );


    sections.forEach(
        (section) =>
            sectionObserver.observe(section)
    );

}


/* =========================================================
   SMOOTH INTERNAL LINKS
   ========================================================= */

$$('a[href^="#"]').forEach((link) => {

    link.addEventListener(
        "click",
        (event) => {

            const href =
                link.getAttribute("href");

            if (
                !href ||
                href === "#" ||
                href.length <= 1
            ) {
                return;
            }

            const target =
                document.querySelector(href);

            if (!target) return;

            event.preventDefault();

            const headerHeight =
                header?.offsetHeight || 78;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                10;

            window.scrollTo({
                top: Math.max(
                    0,
                    targetPosition
                ),
                behavior: "smooth"
            });

        }
    );

});


/* =========================================================
   HERO IMAGE
   ========================================================= */

const heroImage = $(".hero-image");


heroImage?.addEventListener(
    "load",
    () => {

        heroImage.classList.remove(
            "image-error"
        );

        heroImage.classList.add(
            "image-loaded"
        );

    }
);


heroImage?.addEventListener(
    "error",
    () => {

        heroImage.classList.add(
            "image-error"
        );

    }
);


/* If image was already cached */

if (
    heroImage &&
    heroImage.complete &&
    heroImage.naturalWidth > 0
) {

    heroImage.classList.add(
        "image-loaded"
    );

}


/* =========================================================
   SPORTS VIDEOS
   ========================================================= */

const videos =
    $$(".sport-media");


const pauseVideo = (video) => {

    try {

        video.pause();

    } catch (error) {

        console.debug(
            "Video pause error:",
            error
        );

    }

};


const playVideo = (video) => {

    try {

        const promise =
            video.play();

        if (
            promise &&
            typeof promise.catch === "function"
        ) {

            promise.catch(
                () => {
                    /* Browser autoplay may be blocked */
                }
            );

        }

    } catch (error) {

        console.debug(
            "Video play error:",
            error
        );

    }

};


/* IntersectionObserver */

if (
    videos.length &&
    "IntersectionObserver" in window
) {

    const videoObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        const video =
                            entry.target;

                        if (
                            entry.isIntersecting &&
                            entry.intersectionRatio >= 0.2
                        ) {

                            playVideo(video);

                        } else {

                            pauseVideo(video);

                        }

                    }
                );

            },
            {
                threshold: [
                    0,
                    0.2,
                    0.5
                ]
            }
        );


    videos.forEach(
        (video) =>
            videoObserver.observe(video)
    );

} else {

    videos.forEach(
        (video) =>
            playVideo(video)
    );

}


/* =========================================================
   SPORTS CARD INTERACTION
   ========================================================= */

$$(".sport-card").forEach((card) => {

    const video =
        $(".sport-media", card);

    card.addEventListener(
        "mouseenter",
        () => {

            if (video) {
                playVideo(video);
            }

        }
    );


    card.addEventListener(
        "mouseleave",
        () => {

            /*
             * We do not always pause here.
             * IntersectionObserver controls playback
             * based on viewport visibility.
             */

        }
    );

});


/* =========================================================
   LIGHTWEIGHT 3D MOUSE EFFECT
   Only for supported pointer devices
   ========================================================= */

const heroVisual =
    $(".hero-visual");


const canUsePointer3D =
    window.matchMedia &&
    window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;


if (
    heroVisual &&
    canUsePointer3D
) {

    let rafId = null;


    heroVisual.addEventListener(
        "pointermove",
        (event) => {

            const rect =
                heroVisual.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) /
                rect.width;

            const y =
                (event.clientY - rect.top) /
                rect.height;


            const rotateY =
                (x - 0.5) * 5;

            const rotateX =
                (0.5 - y) * 5;


            if (rafId) {
                cancelAnimationFrame(rafId);
            }


            rafId =
                requestAnimationFrame(
                    () => {

                        heroVisual.style.setProperty(
                            "--mouse-rx",
                            `${rotateX}deg`
                        );

                        heroVisual.style.setProperty(
                            "--mouse-ry",
                            `${rotateY}deg`
                        );

                    }
                );

        }
    );


    heroVisual.addEventListener(
        "pointerleave",
        () => {

            heroVisual.style.setProperty(
                "--mouse-rx",
                "0deg"
            );

            heroVisual.style.setProperty(
                "--mouse-ry",
                "0deg"
            );

        }
    );

}


/* =========================================================
   CURSOR GLOW
   Optional enhancement.
   Works only if .cursor-glow exists in the HTML/CSS.
   ========================================================= */

const cursorGlow =
    $(".cursor-glow");


if (
    cursorGlow &&
    canUsePointer3D
) {

    let glowFrame = null;


    document.addEventListener(
        "pointermove",
        (event) => {

            if (glowFrame) {
                cancelAnimationFrame(
                    glowFrame
                );
            }


            glowFrame =
                requestAnimationFrame(
                    () => {

                        cursorGlow.style.left =
                            `${event.clientX}px`;

                        cursorGlow.style.top =
                            `${event.clientY}px`;

                    }
                );

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   RESIZE HANDLING
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 900 &&
            mobileMenu?.classList.contains("active")
        ) {

            closeMobileMenu();

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   KEYBOARD ACCESSIBILITY
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeMobileMenu();

        }

    }
);


/* =========================================================
   FINAL INITIALIZATION
   ========================================================= */

document.documentElement.classList.add(
    "js-ready"
);
