(() => {
  "use strict";

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const page = document.querySelector(
    "#swap-case, #yesoul-case, #global-case, #ziniao-case, #onnexus-brand-case, body.light-case"
  );

  if (!page || !gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const one = (selector, scope = document) => scope.querySelector(selector);
  const all = (selector, scope = document) => gsap.utils.toArray(selector, scope);

  const reveal = (trigger, targets, fromVars = {}, options = {}) => {
    const triggerNode = typeof trigger === "string" ? one(trigger) : trigger;
    const nodes = typeof targets === "string" ? all(targets) : gsap.utils.toArray(targets);
    if (!triggerNode || !nodes.length) return null;

    return gsap.fromTo(
      nodes,
      { autoAlpha: 0, y: 28, ...fromVars },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        rotationX: 0,
        rotationY: 0,
        skewX: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        duration: options.duration || 0.9,
        stagger: options.stagger ?? 0.08,
        ease: options.ease || "power3.out",
        clearProps: "opacity,visibility,transform",
        scrollTrigger: {
          trigger: triggerNode,
          start: options.start || "top 82%",
          once: true,
        },
      }
    );
  };

  const parallax = (trigger, targets, distance = -6, options = {}) => {
    const triggerNode = typeof trigger === "string" ? one(trigger) : trigger;
    const nodes = typeof targets === "string" ? all(targets) : gsap.utils.toArray(targets);
    if (!triggerNode || !nodes.length) return null;

    return gsap.to(nodes, {
      yPercent: distance,
      ease: "none",
      stagger: options.stagger || 0,
      scrollTrigger: {
        trigger: triggerNode,
        start: options.start || "top bottom",
        end: options.end || "bottom top",
        scrub: options.scrub || 0.8,
      },
    });
  };

  const addMagnet = (stageSelector, targetSelector, strength = 12) => {
    const stage = one(stageSelector);
    const target = one(targetSelector);
    if (!stage || !target || !matchMedia("(pointer:fine)").matches) return;

    const moveX = gsap.quickTo(target, "x", { duration: 0.7, ease: "power3.out" });
    const moveY = gsap.quickTo(target, "y", { duration: 0.7, ease: "power3.out" });

    stage.addEventListener("pointermove", (event) => {
      const bounds = stage.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      moveX(x * strength);
      moveY(y * strength);
    });

    stage.addEventListener("pointerleave", () => {
      moveX(0);
      moveY(0);
    });
  };

  const initSwap = () => {
    gsap.timeline({ defaults: { ease: "power4.out" } })
      .from(".swap-hero-meta span", { y: -18, autoAlpha: 0, stagger: 0.08, duration: 0.65 })
      .from(".swap-hero-title small", { x: -44, autoAlpha: 0, duration: 0.7 }, "-=.35")
      .from(".swap-hero-title h1 > *", { yPercent: 115, rotation: 2, autoAlpha: 0, stagger: 0.08, duration: 0.9 }, "-=.45")
      .from(".swap-hero-title p", { y: 24, autoAlpha: 0, duration: 0.65 }, "-=.45")
      .from(".swap-hero-primary", { xPercent: 24, rotationY: -18, rotationZ: 5, scale: 0.92, autoAlpha: 0, duration: 1.25 }, "-=.95")
      .from(".swap-route i", { scaleX: 0, transformOrigin: "left center", stagger: 0.08, duration: 0.45 }, "-=.65")
      .from(".swap-hero-foot span", { y: 18, autoAlpha: 0, stagger: 0.09, duration: 0.6 }, "-=.35");

    addMagnet(".swap-hero-screens", ".swap-hero-primary", 14);
    parallax(".swap-hero", ".swap-product-viewport img", -4, { scrub: 1 });

    const heroAmbientTweens = all(".swap-ambient-field i").map((cloud, index) => gsap.to(cloud, {
      xPercent: index % 2 ? -18 : 22,
      yPercent: index % 3 ? 16 : -20,
      scale: 1.08 + index * 0.035,
      rotation: index % 2 ? -7 : 9,
      duration: 10 + index * 2.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    }));
    if (heroAmbientTweens.length) {
      ScrollTrigger.create({
        trigger: ".swap-hero",
        start: "top bottom",
        end: "bottom top",
        onToggle: ({ isActive }) => heroAmbientTweens.forEach((tween) => isActive ? tween.resume() : tween.pause())
      });
    }

    reveal(".swap-verb-grid", ".swap-verb-grid article", { x: -52, y: 0 }, { stagger: 0.12 });
    reveal(".swap-paths", ".swap-paths > div", { x: (index) => index ? 65 : -65, y: 0 }, { stagger: 0.12 });
    reveal(".swap-route-audit-grid", ".swap-route-audit-grid article", { y: 34, scale: 0.97 }, { stagger: 0.07 });
    reveal(".swap-iteration-grid", ".swap-iteration-grid figure", { y: 52, rotation: (index) => index % 2 ? 1.4 : -1.4 }, { stagger: 0.12 });
    all(".swap-real-compare").forEach((group) => {
      reveal(group, all("figure", group), { x: (index) => index ? 62 : -62, y: 0 }, { stagger: 0.1 });
    });
    reveal(".swap-outcomes", ".swap-outcomes article", { y: 0, scale: 0.9 }, { stagger: 0.08, ease: "back.out(1.45)" });
    reveal(".swap-related-brand", ".swap-related-brand > *", { y: 24 }, { stagger: 0.08 });
    reveal(".swap-motion-system", ".swap-motion-copy > *", { y: 34 }, { stagger: 0.085, start: "top 76%" });
    reveal(".swap-system-gallery", ".swap-system-gallery figure", { y: 42, scale: 0.975 }, { stagger: 0.1 });

    const motionStageTweens = all(".swap-motion-cloud").map((cloud, index) => gsap.to(cloud, {
      xPercent: index === 1 ? -26 : 24,
      yPercent: index === 2 ? -22 : 18,
      scale: 1.12 + index * 0.06,
      rotation: index % 2 ? -9 : 8,
      duration: 8.5 + index * 2.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      paused: true
    }));
    const motionScan = gsap.to(".swap-motion-scan", {
      xPercent: 345,
      duration: 8,
      repeat: -1,
      ease: "none",
      paused: true
    });
    const motionPanel = gsap.to(".swap-motion-panel", {
      y: -8,
      rotationX: 1.2,
      scale: 1.006,
      duration: 5.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      paused: true
    });
    const stageMotion = [...motionStageTweens, motionScan, motionPanel].filter(Boolean);
    if (stageMotion.length) {
      ScrollTrigger.create({
        trigger: ".swap-motion-stage",
        start: "top bottom",
        end: "bottom top",
        onToggle: ({ isActive }) => stageMotion.forEach((tween) => isActive ? tween.resume() : tween.pause())
      });
    }

    all(".swap-stage img, .swap-system-gallery img").forEach((image) => {
      parallax(image.closest("figure"), image, -3.5, { scrub: 1.1 });
    });

  };

  const initBrand = () => {
    const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
    intro
      .from(".brand-case-hero-meta span", { y: -18, autoAlpha: 0, stagger: 0.08, duration: 0.62 })
      .from(".brand-case-hero-title small", { x: -42, autoAlpha: 0, duration: 0.64 }, "-=.3")
      .from(".brand-case-hero-title h1 > *", { yPercent: 112, rotation: 1.5, autoAlpha: 0, stagger: 0.08, duration: 0.88 }, "-=.42")
      .from(".brand-case-hero-mark", { x: 46, autoAlpha: 0, duration: 0.72 }, "-=.58")
      .from(".brand-case-hero-foot > *", { y: 18, autoAlpha: 0, stagger: 0.06, duration: 0.5 }, "-=.42")
      .from(".brand-case-hero-pattern span", { y: 54, autoAlpha: 0, stagger: { amount: 0.45, from: "random" }, duration: 0.7 }, "-=.78");

    const heroPattern = gsap.to(".brand-case-hero-pattern", {
      xPercent: -4,
      yPercent: 3,
      rotation: -5,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    ScrollTrigger.create({
      trigger: ".brand-case-hero",
      start: "top bottom",
      end: "bottom top",
      onToggle: ({ isActive }) => isActive ? heroPattern.resume() : heroPattern.pause(),
    });

    reveal(".brand-case-brief-grid", ".brand-case-brief-grid > *", { y: 44 }, { stagger: 0.12 });
    reveal(".brand-case-brief-facts", ".brand-case-brief-facts article", { y: 34, scale: 0.97 }, { stagger: 0.08 });
    reveal(".brand-strategy-intro", ".brand-strategy-intro > *", { y: 46 }, { stagger: 0.12 });
    reveal(".brand-trait-grid", ".brand-trait-grid article", { y: 38, scale: 0.97 }, { stagger: 0.08 });
    reveal(".brand-audience-system", ".brand-audience-system > header, .brand-audience-system article", { y: 38, scale: 0.98 }, { stagger: 0.08 });
    reveal(".brand-architecture", ".brand-architecture header, .brand-architecture li", { x: (index) => index ? 48 : -48, y: 0 }, { stagger: 0.09 });
    reveal(".swap-brand-logo", ".brand-logo-copy > *, .brand-logo-stage", { y: 42 }, { stagger: 0.08, start: "top 76%" });
    reveal(".swap-brand-specs", ".swap-brand-specs article", { y: 46, rotation: (index) => index ? 1.2 : -1.2 }, { stagger: 0.12 });
    reveal(".brand-foundation-detail", ".brand-foundation-detail > header, .brand-type-scale, .brand-functional-colors", { y: 42 }, { stagger: 0.1 });
    reveal(".brand-composition-system", ".brand-system-heading > *, .brand-layout-stage, .brand-layout-rules article", { y: 48, scale: 0.98 }, { stagger: 0.075, start: "top 78%" });
    reveal(".brand-visual-world", ".brand-visual-world > figure, .brand-visual-copy, .brand-image-boundaries article", { y: 46, scale: 0.985 }, { stagger: 0.09 });
    reveal(".brand-mascot-system", ".brand-system-heading > *, .brand-mascot-hero, .brand-mascot-states, .brand-mascot-rules article", { y: 52, scale: 0.985 }, { stagger: 0.075, start: "top 78%" });
    reveal(".brand-symbol-data-system", ".brand-system-heading > *, .brand-icon-family article, .brand-data-world article", { y: 42, scale: 0.975 }, { stagger: 0.065, start: "top 78%" });
    reveal(".brand-language-head", ".brand-language-head > *", { y: 46 }, { stagger: 0.12 });
    reveal(".brand-tone-grid", ".brand-tone-grid article", { y: 38, scale: 0.97 }, { stagger: 0.08 });
    reveal(".brand-copy-compare", ".brand-copy-compare article", { x: (index) => index ? 54 : -54, y: 0 }, { stagger: 0.1 });
    reveal(".swap-brand-rules", ".swap-brand-rules li", { x: 44, y: 0 }, { stagger: 0.09 });
    reveal(".brand-digital-rules", ".brand-digital-rules > header, .brand-contrast-grid article, .brand-token-list > span", { y: 38, scale: 0.98 }, { stagger: 0.075 });
    reveal(".brand-motion-language", ".brand-motion-language > header, .brand-motion-card", { y: 42, scale: 0.975 }, { stagger: 0.1 });
    reveal(".brand-product-behavior", ".brand-product-behavior > header, .brand-state-card, .brand-sensory-system", { y: 46, scale: 0.98 }, { stagger: 0.085 });
    reveal(
      ".swap-brand-applications",
      ".brand-app-copy, .brand-social-card, .brand-content-system, .brand-campaign-card, .brand-cobrand-card, .brand-asset-matrix",
      { y: 52, scale: 0.975 },
      { stagger: 0.1 }
    );
    reveal(".brand-merch-suite", ".brand-merch-suite > header, .brand-merch-grid figure", { y: 46, scale: 0.98 }, { stagger: 0.085, start: "top 76%" });
    reveal(".brand-case-delivery-copy", ".brand-case-delivery-copy > *", { y: 38 }, { stagger: 0.09 });
    reveal(".brand-case-delivery-strip", ".brand-case-delivery-strip > *", { x: -22, y: 0 }, { stagger: 0.06 });
    reveal(".brand-governance", ".brand-governance > header, .brand-governance > ol, .brand-package", { y: 42 }, { stagger: 0.1 });
    reveal(".brand-case-related", ".brand-case-related > *", { y: 46 }, { stagger: 0.12 });

    gsap.fromTo(
      ".brand-safe-area",
      { scale: 0.72, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".brand-logo-stage", start: "top 70%", once: true },
      }
    );
    gsap.fromTo(
      ".brand-lockup",
      { scale: 0.9, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: ".brand-logo-stage", start: "top 66%", once: true },
      }
    );

    all(".brand-pattern-line").forEach((line, index) => {
      gsap.fromTo(
        line,
        { xPercent: index % 2 ? -10 : 0 },
        {
          xPercent: index % 2 ? 0 : -10,
          ease: "none",
          scrollTrigger: {
            trigger: ".swap-brand-pattern",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    });

    parallax(".brand-social-card", ".brand-social-pattern", -12, { scrub: 1 });
    parallax(".brand-visual-world", ".brand-visual-world > figure img", -4, { scrub: 1 });
    parallax(".brand-mascot-hero", ".brand-mascot-hero img", -3.5, { scrub: 1 });
    parallax(".brand-mascot-states", ".brand-mascot-states img", -2.4, { scrub: 1 });
    all(".brand-merch-grid img").forEach((image, index) => {
      parallax(image.closest("figure"), image, index % 2 ? 3.5 : -3.5, { scrub: 1 });
    });

    gsap.timeline({
      scrollTrigger: {
        trigger: ".brand-layout-stage",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      }
    })
      .fromTo(".layout-bracket.is-left", { xPercent: -18 }, { xPercent: 10, ease: "none" }, 0)
      .fromTo(".layout-bracket.is-right", { xPercent: 18 }, { xPercent: -10, ease: "none" }, 0)
      .fromTo(".layout-window", { yPercent: 16 }, { yPercent: -12, ease: "none" }, 0)
      .fromTo(".layout-node.node-a", { x: -24, y: 18 }, { x: 26, y: -22, ease: "none" }, 0)
      .fromTo(".layout-node.node-b", { x: 32, y: -16 }, { x: -20, y: 24, ease: "none" }, 0);

    const networkMotion = gsap.timeline({ repeat: -1, repeatDelay: 0.55, paused: true })
      .fromTo(".network-map-stage i", { scale: 0.6, opacity: 0.38 }, { scale: 1, opacity: 1, stagger: 0.12, duration: 0.48, ease: "back.out(1.6)" })
      .to(".network-map-stage i.is-key", { scale: 1.38, duration: 0.34, ease: "power2.out" })
      .to(".network-map-stage i.is-key", { scale: 1, duration: 0.55, ease: "power2.inOut" });

    const dataMotion = gsap.timeline({ repeat: -1, repeatDelay: 0.65, paused: true })
      .fromTo(".brand-data-chart svg", { opacity: 0.35, xPercent: -4 }, { opacity: 1, xPercent: 0, duration: 0.8, ease: "power2.out" })
      .fromTo(".brand-data-chart i", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.48, ease: "back.out(1.7)" }, "-=.25")
      .to(".brand-data-chart i", { scale: 1.3, duration: 0.35, yoyo: true, repeat: 1, ease: "power2.inOut" });

    const dataTimelines = [networkMotion, dataMotion];
    ScrollTrigger.create({
      trigger: ".brand-data-world",
      start: "top bottom",
      end: "bottom top",
      onToggle: ({ isActive }) => dataTimelines.forEach((timeline) => isActive ? timeline.resume() : timeline.pause()),
    });

    const connectMotion = gsap.timeline({ repeat: -1, repeatDelay: 0.35, paused: true })
      .to(".is-connect .brand-motion-demo i:first-child", { x: 72, scale: 0.78, duration: 1.05, ease: "power2.inOut" }, 0)
      .to(".is-connect .brand-motion-demo i:nth-child(2)", { x: -72, scale: 0.78, duration: 1.05, ease: "power2.inOut" }, 0)
      .to(".is-connect .brand-motion-demo b", { scale: 1.12, color: "#f0f2f5", duration: 0.42, ease: "power2.out" }, 0.78)
      .to(".is-connect .brand-motion-demo i", { opacity: 0.25, duration: 0.3 }, 0.78)
      .to(".is-connect .brand-motion-demo i:first-child", { x: 0, scale: 1, opacity: 1, duration: 0.85, ease: "power2.inOut" }, 1.38)
      .to(".is-connect .brand-motion-demo i:nth-child(2)", { x: 0, scale: 1, opacity: 1, duration: 0.85, ease: "power2.inOut" }, 1.38)
      .to(".is-connect .brand-motion-demo b", { scale: 1, color: "#f7931a", duration: 0.65, ease: "power2.inOut" }, 1.38);

    const revealMotion = gsap.timeline({ repeat: -1, repeatDelay: 0.35, paused: true })
      .fromTo(".is-reveal .brand-motion-demo i:first-child", { x: 44 }, { x: -14, duration: 0.85, ease: "power3.inOut" }, 0)
      .fromTo(".is-reveal .brand-motion-demo i:last-child", { x: -44 }, { x: 14, duration: 0.85, ease: "power3.inOut" }, 0)
      .fromTo(".is-reveal .brand-motion-demo b", { scaleX: 0.35, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.72, ease: "power3.out" }, 0.28)
      .to(".is-reveal .brand-motion-demo", { scale: 1.025, duration: 0.28, ease: "power2.out" }, 1.1)
      .to(".is-reveal .brand-motion-demo", { scale: 1, duration: 0.45, ease: "power2.inOut" });

    const settleMotion = gsap.timeline({ repeat: -1, repeatDelay: 0.45, paused: true })
      .fromTo(".is-settle .brand-motion-demo i:first-child", { scale: 0.45, opacity: 0.9 }, { scale: 1.8, opacity: 0, duration: 1.35, ease: "power2.out" }, 0)
      .fromTo(".is-settle .brand-motion-demo i:nth-child(2)", { scale: 0.55, opacity: 0.65 }, { scale: 1.5, opacity: 0, duration: 1.35, ease: "power2.out" }, 0.16)
      .fromTo(".is-settle .brand-motion-demo b", { scale: 0.86, opacity: 0.35 }, { scale: 1, opacity: 1, duration: 0.72, ease: "back.out(1.45)" }, 0.32)
      .to(".is-settle .brand-motion-demo b", { color: "#f7931a", duration: 0.35 }, 1.12)
      .to(".is-settle .brand-motion-demo b", { color: "#f0f2f5", duration: 0.55 });

    const brandMotionTimelines = [connectMotion, revealMotion, settleMotion];
    ScrollTrigger.create({
      trigger: ".brand-motion-language",
      start: "top bottom",
      end: "bottom top",
      onToggle: ({ isActive }) => brandMotionTimelines.forEach((timeline) => isActive ? timeline.resume() : timeline.pause()),
    });

    const stateConnect = gsap.timeline({ repeat: -1, repeatDelay: 0.45, paused: true })
      .to(".brand-state-card.is-connecting i:first-child", { x: 58, duration: 0.92, ease: "power2.inOut" }, 0)
      .to(".brand-state-card.is-connecting i:nth-child(2)", { x: -58, duration: 0.92, ease: "power2.inOut" }, 0)
      .to(".brand-state-card.is-connecting b", { scale: 1.16, duration: 0.32, yoyo: true, repeat: 1 }, 0.7)
      .to(".brand-state-card.is-connecting i", { x: 0, duration: 0.72, ease: "power2.inOut" }, 1.35);

    const stateProcess = gsap.timeline({ repeat: -1, paused: true })
      .to(".brand-state-card.is-processing i:first-child", { rotation: 360, duration: 4.2, ease: "none" }, 0)
      .to(".brand-state-card.is-processing i:nth-child(2)", { rotation: -360, duration: 4.2, ease: "none" }, 0);

    const stateComplete = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true })
      .fromTo(".brand-state-card.is-complete i:first-child", { scale: 0.55, opacity: 0.8 }, { scale: 1.7, opacity: 0, duration: 1.1, ease: "power2.out" }, 0)
      .fromTo(".brand-state-card.is-complete i:nth-child(2)", { scale: 0.55, opacity: 0.5 }, { scale: 1.45, opacity: 0, duration: 1.1, ease: "power2.out" }, 0.16)
      .fromTo(".brand-state-card.is-complete b", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.7)" }, 0.24);

    const stateProtect = gsap.timeline({ repeat: -1, repeatDelay: 0.5, paused: true })
      .fromTo(".brand-state-card.is-protected i:first-child", { x: 28 }, { x: 4, duration: 0.75, ease: "power3.inOut" }, 0)
      .fromTo(".brand-state-card.is-protected i:last-child", { x: -28 }, { x: -4, duration: 0.75, ease: "power3.inOut" }, 0)
      .to(".brand-state-card.is-protected b", { scale: 1.18, duration: 0.28, yoyo: true, repeat: 1 }, 0.55)
      .to(".brand-state-card.is-protected i:first-child", { x: 28, duration: 0.7, ease: "power2.inOut" }, 1.3)
      .to(".brand-state-card.is-protected i:last-child", { x: -28, duration: 0.7, ease: "power2.inOut" }, 1.3);

    const stateTimelines = [stateConnect, stateProcess, stateComplete, stateProtect];
    ScrollTrigger.create({
      trigger: ".brand-state-grid",
      start: "top bottom",
      end: "bottom top",
      onToggle: ({ isActive }) => stateTimelines.forEach((timeline) => isActive ? timeline.resume() : timeline.pause()),
    });
  };

  const initYesoul = () => {
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".case-editorial-aside", { x: -60, autoAlpha: 0, duration: 0.8 })
      .from(".case-eyebrow span", { y: -16, autoAlpha: 0, stagger: 0.08, duration: 0.55 }, "-=.35")
      .from(".case-editorial-kicker", { y: 26, autoAlpha: 0, duration: 0.7 }, "-=.3")
      .from(".case-editorial-story h1 > *", { yPercent: 105, autoAlpha: 0, stagger: 0.1, duration: 0.95 }, "-=.45")
      .from(".case-editorial-intro", { y: 24, autoAlpha: 0, duration: 0.65 }, "-=.45")
      .from(".case-phone-dossier", { y: 70, rotation: 1.6, scale: 0.94, autoAlpha: 0, duration: 1.15 }, "-=.95")
      .from(".case-editorial-facts span", { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.55 }, "-=.5");

    parallax(".case-hero", ".case-phone-art", -4.5, { scrub: 1.15 });
    reveal(".native-process", ".native-process li", { y: 26 }, { stagger: 0.09 });
    reveal(".research-native", ".research-scope li", { x: -34, y: 0 }, { stagger: 0.065 });
    reveal(".research-native", ".research-path li", { x: 28, y: 0 }, { stagger: 0.08 });
    reveal(".insight-grid", ".insight-grid article", { y: 44, rotation: (index) => (index - 1) * 0.7 }, { stagger: 0.1 });
    reveal(".opportunity-grid", ".opportunity-grid article", { y: 30 }, { stagger: 0.07 });
    reveal(".benchmark-native", ".benchmark-native article", { x: 34, y: 0 }, { stagger: 0.09 });
    reveal(".strategy-flow", ".strategy-flow article", { y: 48 }, { stagger: 0.12, start: "top 76%" });
    reveal(".yesoul-ui-language", ".yesoul-ui-language-grid article", { y: 28, scale: 0.98 }, { stagger: 0.08 });
    reveal(".coach-architecture", ".coach-architecture article", { y: 32 }, { stagger: 0.08 });
    reveal(".yesoul-result-gallery", ".yesoul-result-gallery figure", { y: 62, rotation: (index) => (index - 1) * 1.1 }, { stagger: 0.12, start: "top 76%" });
    reveal(".design-principles", ".design-principles span", { y: 0, scale: 0.88 }, { stagger: 0.1, ease: "back.out(1.4)" });

    all(".phone-compare figure, .course-detail-pair figure, .coach-ui-pair figure").forEach((figure, index) => {
      gsap.fromTo(
        figure,
        { y: index % 2 ? 36 : 66 },
        {
          y: index % 2 ? -14 : -28,
          ease: "none",
          scrollTrigger: {
            trigger: figure.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.1,
          },
        }
      );
    });
  };

  const initGlobal = () => {
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .from(".global-kicker span", { x: (index) => index ? 60 : -60, autoAlpha: 0, stagger: 0.08, duration: 0.75 })
      .from(".global-poster-copy small", { x: -55, autoAlpha: 0, duration: 0.65 }, "-=.45")
      .from(".global-poster-copy h1 > *", { xPercent: -115, skewX: -9, autoAlpha: 0, stagger: 0.09, duration: 0.95 }, "-=.35")
      .from(".global-poster-copy p", { x: -44, autoAlpha: 0, duration: 0.65 }, "-=.45")
      .from(".global-sport-stage", { xPercent: 38, rotation: 7, scale: 0.88, autoAlpha: 0, duration: 1.15 }, "-=1")
      .from(".global-performance span", { y: 22, autoAlpha: 0, stagger: 0.06, duration: 0.55 }, "-=.5")
      .from(".global-speed-lines i", { scaleX: 0, transformOrigin: "left center", stagger: 0.04, duration: 0.38 }, "-=.75");

    addMagnet(".global-arena-hero", ".global-sport-stage", 18);
    parallax(".global-arena-hero", ".sport-phone-screen img", -7, { scrub: 0.75 });
    reveal(".region-board", ".region-board article", { x: -46, y: 0 }, { stagger: 0.08, ease: "power4.out" });
    reveal(".app-ecosystem", ".app-ecosystem li", { x: 46, y: 0 }, { stagger: 0.07 });

    const characterLab = one(".character-lab");
    if (characterLab) {
      const characterTimeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: characterLab, start: "top 76%", once: true },
      });

      characterTimeline
        .from(".character-stream", { x: (index) => index % 2 ? 52 : -52, autoAlpha: 0, stagger: 0.13, duration: 0.72 })
        .from(".stream-keywords span", { x: -22, scale: 0.88, autoAlpha: 0, stagger: 0.035, duration: 0.42 }, "-=.48")
        .from(".stream-meaning", { x: 28, autoAlpha: 0, stagger: 0.08, duration: 0.52 }, "-=.52")
        .from(".stream-output", { x: 38, autoAlpha: 0, stagger: 0.09, duration: 0.58 }, "-=.62")
        .from(".character-conclusion", { y: 44, autoAlpha: 0, duration: 0.72 }, "-=.12")
        .from(".character-formula h3 > *", { y: 34, skewX: -7, autoAlpha: 0, stagger: 0.055, duration: 0.55 }, "-=.42")
        .from(".character-pillars article", { y: 28, autoAlpha: 0, stagger: 0.09, duration: 0.55 }, "-=.28")
        .from(".character-bridge", { y: 22, autoAlpha: 0, duration: 0.5 }, "-=.2");
    }

    reveal(".direction-gallery", ".direction-card", { x: (index) => index % 2 ? 48 : -48, y: 22, rotation: (index) => index % 2 ? 1.5 : -1.5 }, { stagger: 0.055, duration: 0.78 });
    reveal(".system-color", ".system-color i", { y: 0, scaleY: 0.1 }, { stagger: 0.045, ease: "back.out(1.5)" });
    reveal(".form-keys", ".form-keys span", { y: 20, scale: 0.88 }, { stagger: 0.06, ease: "back.out(1.4)" });
    reveal(".emotion-gallery", ".emotion-gallery > div", { y: 38, rotation: (index) => (index - 1) * 2 }, { stagger: 0.1 });

    all(".global-product-block").forEach((block, blockIndex) => {
      const figures = all(".global-ui-spread figure", block);
      const images = all(".global-ui-spread img", block);
      if (!figures.length) return;
      gsap.from(figures, {
        y: (index) => 70 + index * 25,
        rotation: (index) => (index - (figures.length - 1) / 2) * 1.7,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: block, start: "top 74%", once: true },
      });
      parallax(block, images, blockIndex % 2 ? -7 : -4.5, { stagger: 0.04, scrub: 0.8 });
    });
  };

  const initZiniao = () => {
    gsap.timeline({ defaults: { ease: "power4.out" } })
      .from(".ziniao-hero-meta span", { y: -20, autoAlpha: 0, stagger: 0.08, duration: 0.6 })
      .from(".z-os-copy h1 > *", { xPercent: -105, autoAlpha: 0, stagger: 0.08, duration: 0.85 }, "-=.35")
      .from(".z-os-copy > small, .z-os-copy > p, .z-os-copy > div", { y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.6 }, "-=.35")
      .from(".ziniao-hero-browser", { xPercent: 35, rotationY: -20, scale: 0.9, autoAlpha: 0, duration: 1.1 }, "-=.85")
      .from(".z-os-console span", { x: 28, autoAlpha: 0, stagger: 0.065, duration: 0.5 }, "-=.55")
      .from(".z-os-role b", { y: 16, autoAlpha: 0, stagger: 0.06, duration: 0.45 }, "-=.35");

    addMagnet(".ziniao-os-hero", ".ziniao-hero-browser", 10);
    reveal(".ziniao-goals", ".ziniao-goals article", { y: 28, scale: 0.975 }, { stagger: 0.1 });
    reveal(".ziniao-map", ".ziniao-map ol li", { x: -32, y: 0 }, { stagger: 0.055, duration: 0.7 });
    reveal(".ziniao-layer-model", ".layer-stack span", { x: 62, y: 0 }, { stagger: 0.11, ease: "power4.out" });
    reveal(".ziniao-system-grid", ".ziniao-system-grid > article", { y: 38, scale: 0.975 }, { stagger: 0.09 });
    reveal(".spacing-ruler", ".spacing-ruler span", { y: 0, scaleX: 0.05 }, { stagger: 0.055, ease: "back.out(1.4)" });
    reveal(".ziniao-task-flow", ".ziniao-task-flow li", { x: -34, y: 0 }, { stagger: 0.08 });
    reveal(".ziniao-result-wall-grid", ".ziniao-result-wall-grid figure", { y: 46, scale: 0.975 }, { stagger: 0.11, start: "top 78%" });
    reveal(".ziniao-client-grid", ".ziniao-client-grid > article", { y: 46 }, { stagger: 0.14 });
    parallax(".ziniao-home-stage", ".ziniao-home-stage .z-screen-shell img", -4.5, { scrub: 1 });

    all("[data-z-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        const view = one(".z-workspace-view");
        if (!view) return;
        gsap.killTweensOf(view);
        gsap.fromTo(
          view,
          { x: 16, autoAlpha: 0.55, scale: 0.992 },
          { x: 0, autoAlpha: 1, scale: 1, duration: 0.55, delay: 0.2, ease: "power3.out", clearProps: "opacity,visibility,transform" }
        );
      });
    });
  };

  const initLight = () => {
    all(".l-hero [data-l-reveal]").forEach((node) => node.classList.add("is-visible"));
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".l-case-mark", { x: -42, autoAlpha: 0, duration: 0.65 })
      .from(".l-eyebrow", { x: -28, autoAlpha: 0, duration: 0.55 }, "-=.3")
      .from(".l-hero-copy h1 > *", { yPercent: 110, rotation: 3, autoAlpha: 0, stagger: 0.08, duration: 0.85 }, "-=.3")
      .from(".l-hero-copy h2, .l-lead", { y: 24, autoAlpha: 0, stagger: 0.1, duration: 0.65 }, "-=.4")
      .from(".l-browser-main", { xPercent: 28, y: 40, rotation: 2.5, scale: 0.92, autoAlpha: 0, duration: 1.1 }, "-=.9")
      .from(".l-packet", { y: 32, scale: 0.5, autoAlpha: 0, stagger: 0.08, duration: 0.55, ease: "back.out(1.7)" }, "-=.55")
      .from(".l-hero-facts article", { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.55 }, "-=.35");

    addMagnet(".l-hero-product", ".l-browser-main", 10);
    gsap.to(".l-packet", {
      y: (index) => index % 2 ? -10 : 12,
      x: (index) => (index - 1) * 5,
      duration: (index) => 2.1 + index * 0.35,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.14,
    });
    reveal(".l-brief-grid", ".l-brief-grid article", { y: 38, rotation: (index) => (index - 1) * 0.7 }, { stagger: 0.1 });
    reveal(".l-strategy-list", ".l-strategy-list article", { x: -52, y: 0 }, { stagger: 0.12 });
    reveal(".l-direction-canvas", ".l-direction-canvas > *", { y: 44, scale: 0.97 }, { stagger: 0.12 });
    parallax(".l-direction-canvas", ".l-direction-main img", -5, { scrub: 1 });
    parallax(".l-direction-canvas", ".l-direction-crop img", 4, { scrub: 1 });
    parallax(".l-direction-canvas", ".l-direction-detail img", -3, { scrub: 1 });
    reveal(".l-system-board", ".l-system-board article", { y: 36, scale: 0.96 }, { stagger: 0.09, ease: "back.out(1.25)" });
    reveal(".l-result-grid", ".l-result-grid article", { y: 42 }, { stagger: 0.1 });

    all(".l-page-showcase").forEach((showcase, index) => {
      const copy = one(".l-page-copy", showcase);
      const browser = one(".l-page-browser", showcase);
      const image = one(".l-page-browser img", showcase);
      if (!copy || !browser) return;
      gsap.from(copy, {
        x: index % 2 ? 56 : -56,
        autoAlpha: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: showcase, start: "top 76%", once: true },
      });
      gsap.from(browser, {
        x: index % 2 ? -56 : 56,
        y: 24,
        rotation: index % 2 ? -1.2 : 1.2,
        autoAlpha: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: { trigger: showcase, start: "top 76%", once: true },
      });
      if (image) parallax(showcase, image, index % 2 ? 3.5 : -3.5, { scrub: 1 });
    });

    all("[data-route-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        requestAnimationFrame(() => {
          const panel = one("[data-route-panel].is-active");
          if (!panel) return;
          gsap.fromTo(
            panel,
            { y: 24, autoAlpha: 0, scale: 0.988 },
            { y: 0, autoAlpha: 1, scale: 1, duration: 0.62, ease: "power3.out", clearProps: "opacity,visibility,transform" }
          );
        });
      });
    });
  };

  const mm = gsap.matchMedia();
  mm.add(
    {
      reduce: "(prefers-reduced-motion: reduce)",
      full: "(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      compact: "(max-width: 900px) and (prefers-reduced-motion: no-preference), (pointer: coarse) and (prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const motionClasses = ["case-motion-reduced", "case-motion-compact", "has-case-motion"];
      const resetMotionClasses = () => document.documentElement.classList.remove(...motionClasses);
      resetMotionClasses();

      if (context.conditions.reduce) {
        document.documentElement.classList.add("case-motion-reduced");
        return resetMotionClasses;
      }

      if (!context.conditions.full) {
        document.documentElement.classList.add("case-motion-compact");
        return resetMotionClasses;
      }

      document.documentElement.classList.add("has-case-motion");

      if (one("#swap-case")) initSwap();
      else if (one("#onnexus-brand-case")) initBrand();
      else if (one("#yesoul-case")) initYesoul();
      else if (one("#global-case")) initGlobal();
      else if (one("#ziniao-case")) initZiniao();
      else if (document.body.classList.contains("light-case")) initLight();

      return resetMotionClasses;
    }
  );

  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts?.ready) document.fonts.ready.then(refresh);
  addEventListener("load", refresh, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) gsap.ticker.sleep();
    else gsap.ticker.wake();
  });
})();
