(() => {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const page = document.querySelector("#portfolio");

  if (!gsap || !ScrollTrigger || !page) return;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("gsap-home");

  const projectTabs = gsap.utils.toArray(".project-tab");
  const projectPanels = gsap.utils.toArray(".showcase-panel");
  const reduceProjectMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compactProjectViewport = window.matchMedia("(max-width: 900px)");
  const ambientProjectMotion = window.matchMedia("(min-width: 901px) and (pointer: fine)");
  const projectTablist = document.querySelector(".project-tabs");
  const projectStatus = document.querySelector("#project-status");
  const projectCurrent = document.querySelector("[data-project-current]");
  const projectPrevious = document.querySelector("[data-project-prev]");
  const projectNext = document.querySelector("[data-project-next]");
  const showcaseStage = document.querySelector(".showcase-stage");
  let activeProject = 0;
  let projectTransition;
  let projectAmbient;
  let showcaseVisible = false;
  let hoverIntent;
  let transitioningPanels = [];
  const projectBaseRotations = [-1.6, 0, 3, 5, -3, 2.5];

  const projectName = (index) => {
    const name = projectTabs[index]?.querySelector(".tab-name");
    return name?.childNodes[0]?.textContent?.trim() || `项目 ${index + 1}`;
  };

  const syncProjectOrientation = () => {
    projectTablist?.setAttribute(
      "aria-orientation",
      compactProjectViewport.matches ? "horizontal" : "vertical",
    );
    if (!compactProjectViewport.matches && projectTablist) projectTablist.scrollLeft = 0;
  };

  const keepActiveTabVisible = (index) => {
    if (!compactProjectViewport.matches) return;
    window.requestAnimationFrame(() => {
      projectTabs[index]?.scrollIntoView({
        behavior: reduceProjectMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    });
  };

  const updateProjectStatus = (index) => {
    const current = String(index + 1).padStart(2, "0");
    if (projectCurrent) projectCurrent.textContent = current;
    if (projectStatus) {
      projectStatus.textContent = `当前项目：${projectName(index)}，${index + 1} / ${projectTabs.length}`;
    }
    keepActiveTabVisible(index);
  };

  syncProjectOrientation();
  compactProjectViewport.addEventListener?.("change", syncProjectOrientation);

  /* Keep the first cover immediate, then warm the remaining covers one at a time.
     Decoding every hidden project simultaneously caused a visible hitch on the
     first interaction, especially when the large transparent phone PNG joined
     the compositor. */
  const projectImages = projectPanels.flatMap((panel) =>
    gsap.utils.toArray(panel.querySelectorAll("img")),
  );
  const preparedImages = new WeakMap();

  const prepareImage = (image, priority = "auto") => {
    if (!image) return Promise.resolve();
    image.fetchPriority = priority;
    if (preparedImages.has(image)) return preparedImages.get(image);
    image.loading = "eager";
    const ready = image.decode?.().catch(() => {}) || Promise.resolve();
    preparedImages.set(image, ready);
    return ready;
  };

  const preparePanel = (index) => {
    const panel = projectPanels[index];
    if (!panel) return Promise.resolve();
    return Promise.all(
      gsap.utils.toArray(panel.querySelectorAll("img")).map((image) =>
        prepareImage(image, "high"),
      ),
    );
  };

  const warmRemainingProjectImages = () => {
    const queue = projectImages.slice(1);
    const schedule = (callback) => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(callback, { timeout: 1000 });
      } else {
        window.setTimeout(callback, 120);
      }
    };
    const warmNext = () => {
      const image = queue.shift();
      if (!image) return;
      prepareImage(image, "low").finally(() => {
        if (queue.length) schedule(warmNext);
      });
    };
    schedule(warmNext);
  };

  preparePanel(0);
  if (document.readyState === "complete") {
    warmRemainingProjectImages();
  } else {
    window.addEventListener("load", warmRemainingProjectImages, { once: true });
  }

  const panelMotionTargets = (panel) =>
    panel
      ? gsap.utils.toArray(
          panel.querySelectorAll(
            ".showcase-media, .showcase-caption > *, .showcase-browser, .art-type, .art-orbit, .brand-showcase-world, .brand-showcase-grid, .brand-showcase-mark, .brand-showcase-type, .brand-showcase-nodes i, .yesoul-showcase-device, .sport-hello, .sport-showcase-phone, .sport-ring, .ziniao-showcase-window, .ziniao-domain-rail span, .lightcdn-showcase-browser, .cdn-orb",
          ),
        )
      : [];

  const clearPanelMotion = (panel) => {
    if (!panel) return;
    gsap.set(panelMotionTargets(panel), { clearProps: "all" });
  };

  const tabMotionTargets = () =>
    projectTabs.flatMap((tab) => gsap.utils.toArray(tab.querySelectorAll(".tab-no, .tab-name")));

  const clearTabMotion = () => {
    const targets = tabMotionTargets();
    gsap.killTweensOf(targets);
    gsap.set(targets, { clearProps: "transform,opacity,visibility" });
  };

  const isShowcaseInViewport = () => {
    const showcase = document.querySelector(".project-showcase");
    if (!showcase) return false;
    const bounds = showcase.getBoundingClientRect();
    return bounds.bottom > 0 && bounds.top < window.innerHeight;
  };

  const addProjectReveal = (timeline, panel, index, position = "reveal") => {
    const captionItems = panel.querySelectorAll(".showcase-caption > *");

    timeline.fromTo(
        captionItems,
        { y: 26, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.04, duration: 0.44, ease: "power4.out", immediateRender: false },
        `${position}+=0.1`,
      );

    if (compactProjectViewport.matches) {
      const focalSelectors = [
        ".showcase-browser",
        ".brand-showcase-world",
        ".yesoul-showcase-device",
        ".sport-showcase-phone",
        ".ziniao-showcase-window",
        ".lightcdn-showcase-browser",
      ];
      const focal = panel.querySelector(focalSelectors[index]);
      timeline.fromTo(
        focal,
        { x: 42, y: 16, scale: 0.96, autoAlpha: 0 },
        {
          x: 0,
          y: 0,
          scale: 1,
          rotation: projectBaseRotations[index],
          autoAlpha: 1,
          duration: 0.52,
          ease: "power3.out",
          immediateRender: false,
        },
        `${position}+=0.02`,
      );
      return;
    }

    if (index === 0) {
      timeline
        .fromTo(
          panel.querySelector(".showcase-browser"),
          { x: 120, y: 34, scale: 0.91, rotation: 3 },
          { x: 0, y: 0, scale: 1, rotation: projectBaseRotations[index], duration: 0.76, ease: "expo.out", immediateRender: false },
          `${position}+=0.02`,
        )
        .fromTo(
          panel.querySelector(".art-type"),
          { x: -100, skewX: -9, autoAlpha: 0 },
          { x: 0, skewX: 0, autoAlpha: 1, duration: 0.68, ease: "power4.out", immediateRender: false },
          `${position}+=0.06`,
        );
    } else if (index === 1) {
      timeline
        .fromTo(
          panel.querySelector(".brand-showcase-world"),
          { x: 80, scale: 1.11, autoAlpha: 0 },
          { x: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: "expo.out", immediateRender: false },
          `${position}+=0.01`,
        )
        .fromTo(
          panel.querySelector(".brand-showcase-type"),
          { x: -110, skewX: -10, autoAlpha: 0 },
          { x: 0, skewX: 0, autoAlpha: 1, duration: 0.72, ease: "power4.out", immediateRender: false },
          `${position}+=0.04`,
        )
        .fromTo(
          panel.querySelector(".brand-showcase-mark"),
          { scale: 0.45, rotation: -45, autoAlpha: 0 },
          { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.74, ease: "back.out(1.55)", immediateRender: false },
          `${position}+=0.08`,
        )
        .fromTo(
          panel.querySelectorAll(".brand-showcase-nodes i"),
          { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, stagger: 0.07, duration: 0.5, ease: "back.out(2)", immediateRender: false },
          `${position}+=0.12`,
        );
    } else if (index === 2) {
      timeline
        .fromTo(
          panel.querySelector(".art-type"),
          { x: -90, skewX: 8, autoAlpha: 0 },
          { x: 0, skewX: 0, autoAlpha: 1, duration: 0.66, ease: "power4.out", immediateRender: false },
          `${position}+=0.01`,
        )
        .fromTo(
          panel.querySelector(".yesoul-showcase-device"),
          { x: 125, y: 28, scale: 0.9, rotation: 9 },
          { x: 0, y: 0, scale: 1, rotation: projectBaseRotations[index], duration: 0.78, ease: "expo.out", immediateRender: false },
          `${position}+=0.02`,
        )
        .fromTo(
          panel.querySelector(".art-orbit"),
          { scale: 0.56, rotation: -35, autoAlpha: 0 },
          { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.74, ease: "power3.out", immediateRender: false },
          `${position}+=0.04`,
        );
    } else if (index === 3) {
      timeline
        .fromTo(
          panel.querySelector(".sport-hello"),
          { x: -100, skewX: -12, autoAlpha: 0 },
          { x: 0, skewX: 0, autoAlpha: 1, duration: 0.68, ease: "power4.out", immediateRender: false },
          `${position}+=0.01`,
        )
        .fromTo(
          panel.querySelector(".sport-showcase-phone"),
          { y: 130, scale: 0.84, rotation: 13 },
          { y: 0, scale: 1, rotation: projectBaseRotations[index], duration: 0.8, ease: "expo.out", immediateRender: false },
          `${position}+=0.02`,
        )
        .fromTo(
          panel.querySelectorAll(".sport-ring"),
          { scale: 0.35, rotation: -55, autoAlpha: 0 },
          { scale: 1, rotation: 0, autoAlpha: 1, stagger: 0.06, duration: 0.72, ease: "power3.out", immediateRender: false },
          `${position}+=0.04`,
        );
    } else if (index === 4) {
      timeline
        .fromTo(
          panel.querySelector(".art-type"),
          { x: -95, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.66, ease: "power4.out", immediateRender: false },
          `${position}+=0.01`,
        )
        .fromTo(
          panel.querySelector(".ziniao-showcase-window"),
          { x: 145, y: 32, scale: 0.9, rotation: -9 },
          { x: 0, y: 0, scale: 1, rotation: projectBaseRotations[index], duration: 0.78, ease: "expo.out", immediateRender: false },
          `${position}+=0.02`,
        )
        .fromTo(
          panel.querySelectorAll(".ziniao-domain-rail span"),
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, stagger: 0.045, duration: 0.42, ease: "back.out(1.6)", immediateRender: false },
          `${position}+=0.12`,
        );
    } else {
      timeline
        .fromTo(
          panel.querySelector(".art-type"),
          { x: -90, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.66, ease: "power4.out", immediateRender: false },
          `${position}+=0.01`,
        )
        .fromTo(
          panel.querySelector(".lightcdn-showcase-browser"),
          { x: 135, y: 30, scale: 0.9, rotation: 8 },
          { x: 0, y: 0, scale: 1, rotation: projectBaseRotations[index], duration: 0.78, ease: "expo.out", immediateRender: false },
          `${position}+=0.02`,
        )
        .fromTo(
          panel.querySelectorAll(".cdn-orb"),
          { scale: 0.25, rotation: -40, autoAlpha: 0 },
          { scale: 1, rotation: 0, autoAlpha: 1, stagger: 0.06, duration: 0.7, ease: "back.out(1.35)", immediateRender: false },
          `${position}+=0.04`,
        );
    }
  };

  const startProjectAmbient = (index) => {
    projectAmbient?.kill();
    projectAmbient = null;
    const visibleNow = showcaseVisible || isShowcaseInViewport();
    if (reduceProjectMotion || !ambientProjectMotion.matches || !visibleNow) return;
    showcaseVisible = true;

    const panel = projectPanels[index];
    if (!panel) return;
    projectAmbient = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });

    if (index === 0) {
      projectAmbient.to(panel.querySelector(".showcase-browser"), { y: -11, rotation: -0.8, scale: 1.008, duration: 3.25 });
    } else if (index === 1) {
      projectAmbient
        .to(panel.querySelector(".brand-showcase-world"), { scale: 1.025, x: -8, duration: 5.2 }, 0)
        .to(panel.querySelector(".brand-showcase-mark"), { y: -8, rotation: 2.5, scale: 1.025, duration: 3.7 }, 0)
        .to(panel.querySelectorAll(".brand-showcase-nodes i"), { y: -7, stagger: 0.14, duration: 2.9 }, 0);
    } else if (index === 2) {
      projectAmbient
        .to(panel.querySelector(".yesoul-showcase-device"), { y: -12, rotation: 3.8, scale: 1.008, duration: 3.15 }, 0)
        .to(panel.querySelector(".art-orbit"), { rotation: 9, scale: 1.025, duration: 4.6 }, 0);
    } else if (index === 3) {
      projectAmbient
        .to(panel.querySelector(".sport-showcase-phone"), { y: -13, rotation: 4.1, scale: 1.01, duration: 3.05 }, 0)
        .to(panel.querySelector(".ring-a"), { rotation: 18, scale: 1.035, duration: 4.8 }, 0)
        .to(panel.querySelector(".ring-b"), { rotation: -14, scale: 0.96, duration: 4.2 }, 0);
    } else if (index === 4) {
      projectAmbient
        .to(panel.querySelector(".ziniao-showcase-window"), { y: -11, rotation: -2.2, scale: 1.008, duration: 3.25 }, 0)
        .to(panel.querySelectorAll(".ziniao-domain-rail span"), { y: -3, stagger: 0.08, duration: 2.4 }, 0);
    } else {
      projectAmbient
        .to(panel.querySelector(".lightcdn-showcase-browser"), { y: -10, rotation: 1.8, scale: 1.008, duration: 3.2 }, 0)
        .to(panel.querySelector(".orb-a"), { x: -9, y: 8, scale: 1.04, duration: 4.5 }, 0)
        .to(panel.querySelector(".orb-b"), { x: 8, y: -7, scale: 0.95, duration: 4 }, 0);
    }
  };

  const setActiveProject = (index, animate = !reduceProjectMotion) => {
    if (!projectTabs.length || !projectPanels[index] || index === activeProject) return;
    preparePanel(index);

    if (projectTransition || transitioningPanels.length) {
      projectTransition?.kill();
      projectTransition = null;
      clearTabMotion();
      transitioningPanels.forEach((panel) => {
        const keepActive = panel === projectPanels[activeProject];
        gsap.killTweensOf([panel, ...panelMotionTargets(panel)]);
        clearPanelMotion(panel);
        gsap.set(panel, { clearProps: "all" });
        panel.classList.remove("is-switching");
        panel.classList.toggle("is-active", keepActive);
      });
      transitioningPanels = [];
    }

    projectAmbient?.kill();

    const previous = projectPanels[activeProject];
    const next = projectPanels[index];
    activeProject = index;

    projectTabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    updateProjectStatus(index);
    projectPanels.forEach((panel, panelIndex) => {
      const inactive = panelIndex !== index;
      panel.setAttribute("aria-hidden", String(inactive));
      panel.toggleAttribute("inert", inactive);
      if (panelIndex !== index && panel !== previous) panel.classList.remove("is-active");
    });

    next.classList.add("is-active");
    previous.classList.add("is-switching");
    next.classList.add("is-switching");
    transitioningPanels = [previous, next];
    gsap.killTweensOf([previous, next, ...panelMotionTargets(previous), ...panelMotionTargets(next)]);

    if (!animate) {
      previous?.classList.remove("is-active");
      previous?.classList.remove("is-switching");
      next.classList.remove("is-switching");
      gsap.set(previous, { clearProps: "all" });
      gsap.set(next, { clearProps: "all" });
      clearPanelMotion(previous);
      clearPanelMotion(next);
      transitioningPanels = [];
      startProjectAmbient(index);
      return;
    }

    const activeTab = projectTabs[index];
    projectTransition = gsap
      .timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          previous?.classList.remove("is-active");
          gsap.set(previous, { clearProps: "all" });
          gsap.set(next, { clearProps: "all" });
          clearPanelMotion(previous);
          clearPanelMotion(next);
          previous?.classList.remove("is-switching");
          next.classList.remove("is-switching");
          transitioningPanels = [];
          projectTransition = null;
          clearTabMotion();
          startProjectAmbient(index);
        },
      })
      .addLabel("exit", 0)
      .to(previous.querySelectorAll(".showcase-caption > *"), { y: -12, autoAlpha: 0, stagger: 0.018, duration: 0.22, ease: "power2.in" }, "exit")
      .to(previous, { xPercent: -2, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, "exit")
      .addLabel("reveal", 0.12)
      .fromTo(
        next,
        { xPercent: 3.5, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.44, ease: "power4.out", immediateRender: false },
        "reveal",
      )
      .fromTo(
        activeTab.querySelector(".tab-no"),
        { scale: 0.55, rotation: -70 },
        { scale: 1, rotation: 0, duration: 0.48, ease: "back.out(1.75)", immediateRender: false },
        "reveal+=0.03",
      )
      .fromTo(
        activeTab.querySelector(".tab-name"),
        { x: -15, autoAlpha: 0.3 },
        { x: 0, autoAlpha: 1, duration: 0.38, ease: "power3.out", immediateRender: false },
        "reveal+=0.04",
      );

    addProjectReveal(projectTransition, next, index, "reveal");
  };

  projectTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      hoverIntent?.kill();
      preparePanel(index);
      setActiveProject(index);
    });
    tab.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      hoverIntent?.kill();
      preparePanel(index);
      hoverIntent = gsap.delayedCall(0.14, () => setActiveProject(index));
    });
    tab.addEventListener("pointerleave", () => hoverIntent?.kill());
    tab.addEventListener("focus", () => {
      preparePanel(index);
      setActiveProject(index);
    });
    tab.addEventListener("keydown", (event) => {
      let target = index;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") target = (index + 1) % projectTabs.length;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft") target = (index - 1 + projectTabs.length) % projectTabs.length;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = projectTabs.length - 1;
      else return;
      event.preventDefault();
      setActiveProject(target);
      projectTabs[target].focus();
    });
  });

  projectPrevious?.addEventListener("click", () => {
    setActiveProject((activeProject - 1 + projectTabs.length) % projectTabs.length);
  });
  projectNext?.addEventListener("click", () => {
    setActiveProject((activeProject + 1) % projectTabs.length);
  });

  let swipeStart;
  let suppressStageClick = false;
  showcaseStage?.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      swipeStart = { x: touch.clientX, y: touch.clientY };
    },
    { passive: true },
  );
  showcaseStage?.addEventListener(
    "touchend",
    (event) => {
      if (!swipeStart) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - swipeStart.x;
      const dy = touch.clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) < 52 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
      suppressStageClick = true;
      const direction = dx < 0 ? 1 : -1;
      setActiveProject((activeProject + direction + projectTabs.length) % projectTabs.length);
      window.setTimeout(() => {
        suppressStageClick = false;
      }, 420);
    },
    { passive: true },
  );
  showcaseStage?.addEventListener(
    "click",
    (event) => {
      if (!suppressStageClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressStageClick = false;
    },
    true,
  );

  const media = gsap.matchMedia();

  media.add(
    {
      reduce: "(prefers-reduced-motion: reduce)",
      desktop: "(min-width: 901px)",
      fine: "(pointer: fine)",
    },
    (context) => {
      const { reduce, desktop, fine } = context.conditions;

      if (reduce) {
        document.querySelectorAll("[data-reveal]").forEach((node) => node.classList.add("is-visible"));
        return;
      }

      const intro = gsap.timeline({
        defaults: { ease: "expo.out" },
      });

      intro
        .from(".topbar", { y: -28, autoAlpha: 0, duration: 0.6 })
        .from(".hero-kicker span", { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.5 }, "-=.3")
        .from(
          ".name-slice",
          {
            xPercent: (index) => (index % 2 ? 125 : -125),
            skewX: (index) => (index % 2 ? -12 : 12),
            autoAlpha: 0,
            stagger: 0.075,
            duration: 1.18,
          },
          "-=.24",
        )
        .from(
          ".identity-copy small",
          { y: 25, autoAlpha: 0, duration: 0.55 },
          "-=.72",
        )
        .from(
          ".identity-copy h1 span, .identity-copy h1 em",
          {
            yPercent: 115,
            rotate: 3,
            autoAlpha: 0,
            stagger: 0.11,
            duration: 0.92,
          },
          "-=.58",
        )
        .from(".identity-copy p", { x: 55, autoAlpha: 0, duration: 0.65 }, "-=.48")
        .from(".identity-rail, .identity-meta > *, .hero-enter", { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, "-=.42");

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".hero-identity",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        })
        .to(
          ".name-slice",
          {
            xPercent: (index) => (index % 2 ? -30 - index * 2 : 28 + index * 2),
            yPercent: (index) => (index - 2) * 10,
            skewX: (index) => (index % 2 ? 5 : -5),
            ease: "none",
          },
          0,
        )
        .to(".identity-copy", { yPercent: -34, scale: 0.9, autoAlpha: 0.08, ease: "none" }, 0)
        .to(".identity-rail, .identity-meta, .hero-enter", { y: -34, autoAlpha: 0, ease: "none" }, 0);

      gsap.fromTo(
        ".section-head > *",
        { y: 70, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          stagger: 0.11,
          duration: 0.9,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".section-head",
            start: "top 84%",
            once: true,
          },
        },
      );

      const showcaseIntro = gsap.timeline({
          onComplete: () => startProjectAmbient(activeProject),
          scrollTrigger: {
            trigger: ".project-showcase",
            start: "top 84%",
            once: true,
          },
        });

      showcaseIntro
        .fromTo(
          ".project-tab",
          { x: -34, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.62, stagger: 0.07, ease: "power4.out" },
        )
        .fromTo(
          ".showcase-stage",
          { x: 40, scale: 0.985, autoAlpha: 0 },
          { x: 0, scale: 1, autoAlpha: 1, duration: 0.82, ease: "power4.out" },
          "-=.62",
        );

      showcaseIntro.addLabel("initialPanel", "-=.52");
      addProjectReveal(showcaseIntro, projectPanels[activeProject], activeProject, "initialPanel");

      ScrollTrigger.create({
        trigger: ".project-showcase",
        start: "top 84%",
        end: "bottom top",
        onEnter: () => {
          showcaseVisible = true;
        },
        onEnterBack: () => {
          showcaseVisible = true;
          startProjectAmbient(activeProject);
        },
        onLeave: () => {
          showcaseVisible = false;
          projectAmbient?.kill();
        },
        onLeaveBack: () => {
          showcaseVisible = false;
          projectAmbient?.kill();
        },
      });

      if (fine) {
        const sliceMotion = gsap.utils.toArray(".name-slice").map((slice, index) => ({
          x: gsap.quickTo(slice, "x", { duration: 0.8 + index * 0.06, ease: "power3.out" }),
          y: gsap.quickTo(slice, "y", { duration: 0.8 + index * 0.06, ease: "power3.out" }),
        }));

        const onHeroMove = (event) => {
          const px = event.clientX / window.innerWidth - 0.5;
          const py = event.clientY / window.innerHeight - 0.5;
          sliceMotion.forEach((motion, index) => {
            const depth = 6 + index * 4;
            motion.x(px * depth * (index % 2 ? -1 : 1));
            motion.y(py * depth * 0.42);
          });
        };

        const hero = document.querySelector(".hero-identity");
        hero?.addEventListener("pointermove", onHeroMove);

        const cleanups = [() => hero?.removeEventListener("pointermove", onHeroMove)];

        const showcaseStage = document.querySelector(".showcase-stage");
        const mediaMotion = projectPanels.map((panel) => {
          const mediaNode = panel.querySelector(".showcase-media");
          return mediaNode
            ? {
                x: gsap.quickTo(mediaNode, "x", { duration: 0.7, ease: "power3.out" }),
                y: gsap.quickTo(mediaNode, "y", { duration: 0.7, ease: "power3.out" }),
              }
            : null;
        });

        const onShowcaseMove = (event) => {
          if (!showcaseStage) return;
          const bounds = showcaseStage.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          const motion = mediaMotion[activeProject];
          motion?.x(x * 10);
          motion?.y(y * 7);
        };

        const onShowcaseLeave = () => {
          mediaMotion.forEach((motion) => {
            motion?.x(0);
            motion?.y(0);
          });
        };

        showcaseStage?.addEventListener("pointermove", onShowcaseMove);
        showcaseStage?.addEventListener("pointerleave", onShowcaseLeave);
        cleanups.push(() => {
          showcaseStage?.removeEventListener("pointermove", onShowcaseMove);
          showcaseStage?.removeEventListener("pointerleave", onShowcaseLeave);
        });

        return () => cleanups.forEach((cleanup) => cleanup());
      }
    },
  );

  gsap.fromTo(
    ".about-intro > *, .profile-facts article, .career-path header > *, .career-path li, .scope-grid article",
    { y: 68, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      stagger: 0.09,
      duration: 0.85,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".about-section",
        start: "top 78%",
        once: true,
      },
    },
  );

  gsap.utils.toArray(".proof-strip strong").forEach((number) => {
    gsap.from(number, {
      y: 28,
      autoAlpha: 0,
      duration: 0.65,
      ease: "back.out(1.6)",
      scrollTrigger: {
        trigger: number,
        start: "top 88%",
        once: true,
      },
    });
  });

  gsap.fromTo(
    ".method-list li",
    { x: 80, autoAlpha: 0 },
    {
      x: 0,
      autoAlpha: 1,
      stagger: 0.1,
      duration: 0.82,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".method-list",
        start: "top 80%",
        once: true,
      },
    },
  );

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  } else {
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }
})();
