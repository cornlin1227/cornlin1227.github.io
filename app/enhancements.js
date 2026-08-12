(() => {
  const main = document.querySelector("main");
  if (main) {
    if (!main.id) main.id = "main-content";
    if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
    if (!document.querySelector(".skip-link")) {
      const skip = document.createElement("a");
      skip.className = "skip-link";
      skip.href = `#${main.id}`;
      skip.textContent = "跳到主要内容";
      document.body.prepend(skip);
    }
  }

  const zoomSelectors = [
    ".swap-hero-primary img",
    ".product-solution figure img",
    ".yesoul-result-gallery figure img",
    ".global-product figure img",
    ".global-system figure img",
    ".ziniao-product figure img",
    ".ziniao-result-wall figure img",
    ".ziniao-client figure img",
    ".swap-result figure img",
    ".swap-iteration figure img",
    ".swap-system figure img",
    "#onnexus-brand-case .brand-visual-world figure img",
    "#onnexus-brand-case .brand-mascot-hero figure img",
    "#onnexus-brand-case .brand-mascot-states figure img",
    "#onnexus-brand-case .brand-merch-grid figure img",
    ".light-case .l-direction-canvas figure img",
    ".l-route-browser figure img",
  ];

  const zoomableImages = [...document.querySelectorAll(zoomSelectors.join(","))];
  if (zoomableImages.length) {
    const dialog = document.createElement("dialog");
    dialog.className = "image-lightbox";
    dialog.setAttribute("aria-label", "产品页面大图预览");
    dialog.innerHTML = `
      <div class="image-lightbox-actions">
        <button type="button" class="image-lightbox-scale" aria-pressed="false">1:1 / 原始尺寸</button>
        <button type="button" class="image-lightbox-close" aria-label="关闭大图预览">CLOSE ×</button>
      </div>
      <figure>
        <img alt="" />
        <figcaption></figcaption>
      </figure>
    `;
    document.body.appendChild(dialog);

    const preview = dialog.querySelector("img");
    const caption = dialog.querySelector("figcaption");
    const close = dialog.querySelector(".image-lightbox-close");
    const scale = dialog.querySelector(".image-lightbox-scale");
    const viewport = dialog.querySelector("figure");
    let lastTrigger = null;

    const setActualSize = (enabled) => {
      preview.classList.toggle("is-full-size", enabled);
      scale.setAttribute("aria-pressed", String(enabled));
      scale.textContent = enabled ? "FIT / 适应屏幕" : "1:1 / 原始尺寸";
      if (!enabled) viewport.scrollTo({ left: 0, top: 0 });
    };

    const openPreview = (image) => {
      lastTrigger = image;
      setActualSize(false);
      preview.src = image.dataset.fullSrc || image.currentSrc || image.src;
      preview.alt = image.alt;
      caption.textContent =
        image.closest("figure")?.querySelector("figcaption, :scope > span")?.textContent?.trim() ||
        image.alt;
      dialog.showModal();
      close.focus();
    };

    zoomableImages.forEach((image) => {
      const figure = image.closest("figure");
      figure?.classList.add("is-zoomable");
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", `${image.alt}，打开高清大图`);
      image.addEventListener("click", () => openPreview(image));
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPreview(image);
        }
      });
    });

    scale.addEventListener("click", () => setActualSize(!preview.classList.contains("is-full-size")));
    preview.addEventListener("click", () => setActualSize(!preview.classList.contains("is-full-size")));
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      setActualSize(false);
      lastTrigger?.focus();
    });
  }

  const mobileChapterMaps = {
    "swap-case": [
      ["swap-top", "首页"], ["swap-problem", "问题"], ["swap-strategy", "策略"],
      ["swap-iteration", "迭代"], ["swap-result", "成果"], ["swap-system", "系统"],
      ["swap-reflection", "复盘"],
    ],
    "yesoul-case": [
      ["context", "首页"], ["chapter-01", "背景"], ["chapter-02", "研究"],
      ["chapter-03", "洞察"], ["chapter-04", "策略"], ["chapter-05", "方案"],
      ["chapter-06", "复盘"],
    ],
    "global-case": [
      ["global-top", "首页"], ["global-context", "背景"], ["global-users", "用户"],
      ["chapter-03", "机会"], ["chapter-04", "方向"], ["global-system", "系统"],
      ["chapter-06", "成果"], ["global-end", "复盘"],
    ],
    "ziniao-case": [
      ["ziniao-top", "首页"], ["ziniao-context", "背景"], ["ziniao-structure", "架构"],
      ["ziniao-system", "规范"], ["ziniao-product", "成果"], ["ziniao-client", "客户端"],
      ["ziniao-end", "复盘"],
    ],
    "light-case": [
      ["top", "首页"], ["brief", "命题"], ["light-strategy", "方向"],
      ["light-exploration", "探索"], ["light-system", "系统"], ["light-pages", "页面"],
      ["light-result", "输出"],
    ],
  };

  const root =
    document.querySelector("#swap-case, #yesoul-case, #global-case, #ziniao-case") ||
    (document.body.classList.contains("light-case") ? document.body : null);
  const rootKey = root?.id || (root === document.body ? "light-case" : "");
  const generatedTargets = {
    "global-top": ".global-hero",
    "global-users": ".global-users",
    "global-system": ".global-system",
    "global-end": ".global-end",
    "ziniao-top": ".ziniao-hero",
    "ziniao-end": ".ziniao-end",
  };
  Object.entries(generatedTargets).forEach(([id, selector]) => {
    const target = document.querySelector(selector);
    if (target && !target.id) target.id = id;
  });
  const chapters = (mobileChapterMaps[rootKey] || []).filter(([id]) => document.getElementById(id));

  if (chapters.length) {
    const nav = document.createElement("nav");
    nav.className = "mobile-case-nav";
    nav.setAttribute("aria-label", "案例章节快捷导航");
    nav.innerHTML = chapters
      .map(
        ([id, label], index) =>
          `<a href="#${id}"${index === 0 ? ' class="is-active" aria-current="location"' : ""}>${String(index + 1).padStart(2, "0")} ${label}</a>`
      )
      .join("");
    document.body.appendChild(nav);

    const links = [...nav.querySelectorAll("a")];
    const setActive = (id) => {
      links.forEach((link) => {
        const active = link.hash === `#${id}`;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "location");
          nav.scrollTo({
            left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2,
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          });
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const chapterObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -64% 0px", threshold: [0, 0.08, 0.25] }
    );
    chapters.forEach(([id]) => chapterObserver.observe(document.getElementById(id)));
  }
})();
