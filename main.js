/* ============================================================
   Maaz. — cinematic storybook portfolio
   GSAP + ScrollTrigger + Lenis smooth scroll
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 760px)").matches;

  /* ---------------------------------------------------------
     CINEMATIC PRELOADER — name + progress line, then curtain up
  --------------------------------------------------------- */
  (function () {
    var pre = document.getElementById("preloader");
    if (!pre) return;
    function remove() { if (pre.parentNode) pre.parentNode.removeChild(pre); }
    if (reduce) { remove(); return; }
    var bar = pre.querySelector(".preloader__bar span");
    var cnt = pre.querySelector(".preloader__count");
    var v = 0;
    var iv = setInterval(function () {
      v += Math.random() * 12 + 6;
      if (v >= 100) {
        v = 100; clearInterval(iv);
        setTimeout(function () { pre.classList.add("done"); setTimeout(remove, 950); }, 300);
      }
      if (bar) bar.style.width = v + "%";
      if (cnt) cnt.textContent = Math.floor(v) + "%";
    }, 105);
    /* hard fallback so content is never hidden */
    setTimeout(function () {
      if (pre.parentNode) { clearInterval(iv); pre.classList.add("done"); setTimeout(remove, 950); }
    }, 4500);
  })();

  /* ---------------------------------------------------------
     NAV: scrolled state, active link, mobile menu
  --------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll(".nav__links a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("is-open"); });
  });

  /* ---------------------------------------------------------
     Ambient canvases: fireflies (hero) + starfields
  --------------------------------------------------------- */
  function ambientCanvas(canvas, opts) {
    if (!canvas || reduce) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w, h, parts = [];
    function resize() {
      var r = canvas.getBoundingClientRect();
      w = canvas.width = r.width * dpr;
      h = canvas.height = r.height * dpr;
      build();
    }
    function build() {
      parts = [];
      var n = Math.round((w * h) / (opts.density || 26000));
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * w, y: Math.random() * h,
          r: (Math.random() * opts.size + 0.4) * dpr,
          a: Math.random() * 6.28,
          sp: Math.random() * opts.speed + 0.05,
          tw: Math.random() * 0.04 + 0.005
        });
      }
    }
    var streaks = [], shootTimer = 120 + Math.random() * 200, running = false;
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.a += p.tw;
        if (opts.drift) { p.x += Math.cos(p.a) * p.sp; p.y += Math.sin(p.a * 0.6) * p.sp * 0.6; }
        if (p.x < 0) p.x += w; if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h; if (p.y > h) p.y -= h;
        var glow = (Math.sin(p.a) * 0.5 + 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (opts.drift ? (0.6 + glow * 0.8) : 1), 0, 6.283);
        ctx.fillStyle = opts.color.replace("ALPHA", (opts.drift ? glow : (0.3 + glow * 0.7)).toFixed(2));
        ctx.fill();
      }
      /* shooting stars */
      if (opts.shooting) {
        if (--shootTimer <= 0) {
          shootTimer = 160 + Math.random() * 320;
          streaks.push({ x: Math.random() * w * 0.7, y: Math.random() * h * 0.35,
            vx: (5 + Math.random() * 4) * dpr, vy: (2 + Math.random() * 2) * dpr, life: 1 });
        }
        for (var s = streaks.length - 1; s >= 0; s--) {
          var st = streaks[s];
          st.x += st.vx; st.y += st.vy; st.life -= 0.012;
          if (st.life <= 0) { streaks.splice(s, 1); continue; }
          var tx = st.x - st.vx * 9, ty = st.y - st.vy * 9;
          var g = ctx.createLinearGradient(st.x, st.y, tx, ty);
          g.addColorStop(0, "rgba(255,246,220," + st.life.toFixed(2) + ")");
          g.addColorStop(1, "rgba(255,246,220,0)");
          ctx.strokeStyle = g; ctx.lineWidth = 2 * dpr; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(st.x, st.y); ctx.lineTo(tx, ty); ctx.stroke();
        }
      }
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    /* only animate while this canvas's scene is on (or near) screen */
    var io = new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis && !running) { running = true; frame(); }
      else if (!vis) { running = false; }
    }, { rootMargin: "120px" });
    io.observe(canvas);
  }
  ambientCanvas(document.getElementById("fireflies"), { color: "rgba(255,205,130,ALPHA)", size: 1.6, speed: 0.5, drift: true, density: 20000 });
  ambientCanvas(document.getElementById("fireflies2"), { color: "rgba(200,222,255,ALPHA)", size: 1.5, speed: 0.4, drift: true, density: 22000 });
  ambientCanvas(document.getElementById("stars"), { color: "rgba(210,225,255,ALPHA)", size: 1.1, speed: 0.1, drift: false, density: 14000, shooting: true });
  ambientCanvas(document.getElementById("stars2"), { color: "rgba(200,240,220,ALPHA)", size: 1.1, speed: 0.1, drift: false, density: 14000, shooting: true });
  /* one continuous dust/ember layer spanning the whole page — ties scenes together */
  ambientCanvas(document.getElementById("ambient-global"), { color: "rgba(255,226,184,ALPHA)", size: 1.4, speed: 0.32, drift: true, density: 62000 });

  /* ---------------------------------------------------------
     If GSAP failed to load, ensure content is visible
  --------------------------------------------------------- */
  if (typeof gsap === "undefined") {
    document.querySelectorAll(".reveal").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* Reduced motion: simple fade-ins, no smoothing/pinning */
  if (reduce) {
    gsap.utils.toArray(".reveal").forEach(function (el) {
      gsap.to(el, { opacity: 1, y: 0, scaleX: 1, duration: 0.6,
        scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    setActiveNav();
    return;
  }

  /* ---------------------------------------------------------
     LENIS smooth scroll, wired into ScrollTrigger
  --------------------------------------------------------- */
  var lenis;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.4 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis");
  }

  /* ---------------------------------------------------------
     CINEMATIC CROSS-DISSOLVE between scenes.
     Each scene is briefly pinned while the next one rises up and
     FADES in over it — so scenes melt together like film cross-
     fades instead of hard-cutting like slides. (Desktop only;
     mobile keeps a simple scroll with softened seam blends.)
  --------------------------------------------------------- */
  var scenes = gsap.utils.toArray(".scene");

  if (!isMobile) {
    scenes.forEach(function (scene, i) {
      /* pin every scene except the last so the next washes over it */
      if (i < scenes.length - 1) {
        ScrollTrigger.create({
          trigger: scene, start: "top top", end: "bottom top",
          pin: true, pinSpacing: false, anticipatePin: 1
        });
        /* camera slowly pushes INTO the outgoing scene as the next covers
           it — makes the change read as one continuous dolly, not a swap */
        gsap.fromTo(scene, { scale: 1 },
          { scale: 1.14, ease: "none", transformOrigin: "50% 45%",
            scrollTrigger: { trigger: scene, start: "top top", end: "bottom top", scrub: true } });
      }
      /* fade each scene (after the first) in over the one it covers */
      if (i > 0) {
        gsap.fromTo(scene, { autoAlpha: 0 },
          { autoAlpha: 1, ease: "none",
            scrollTrigger: { trigger: scene, start: "top 92%", end: "top 20%", scrub: true } });
      }
    });
  }

  /* Gentle content drift: headline group eases up a touch as the
     scene travels through the viewport (parallax on the text too). */
  scenes.forEach(function (scene) {
    var content = scene.querySelector(".scene__content");
    if (!content) return;
    gsap.to(content, {
      yPercent: -6, ease: "none",
      scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* ---------------------------------------------------------
     PARALLAX: layers move at depth-based speeds within a scene
  --------------------------------------------------------- */
  scenes.forEach(function (scene) {
    var layers = scene.querySelectorAll(".layer[data-depth]");
    var strength = isMobile ? 70 : 150;
    layers.forEach(function (layer) {
      var depth = parseFloat(layer.getAttribute("data-depth")) || 0;
      gsap.to(layer, {
        yPercent: -depth * 12 * (strength / 150),
        ease: "none",
        scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  });

  /* ---------------------------------------------------------
     REVEALS: elements rise smoothly from below and pitch up in
     3D (rotateX + depth) as each scene enters — settling flat.
  --------------------------------------------------------- */
  var PERSP = isMobile ? 1400 : 900;

  /* split a headline into per-character spans (keeps it accessible) */
  function splitChars(el) {
    var text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    var frag = document.createDocumentFragment();
    text.split("").forEach(function (ch) {
      var s = document.createElement("span");
      s.className = "char" + (ch === " " ? " space" : "");
      s.setAttribute("aria-hidden", "true");
      s.textContent = ch === " " ? " " : ch;
      frag.appendChild(s);
    });
    el.appendChild(frag);
    return el.querySelectorAll(".char");
  }

  scenes.forEach(function (scene) {
    var items = scene.querySelectorAll(".reveal");
    if (!items.length) return;
    var tl = gsap.timeline({
      scrollTrigger: { trigger: scene, start: isMobile ? "top 80%" : "top 62%" }
    });
    items.forEach(function (el, i) {
      if (el.classList.contains("divider")) {
        tl.fromTo(el, { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.7, ease: "power3.out" }, i ? "-=0.5" : 0);
      } else {
        /* headline rises as one whole word (perfect kerning), bigger + slower */
        var head = el.classList.contains("headline");
        tl.fromTo(el,
          { opacity: 0, y: head ? (isMobile ? 80 : 120) : (isMobile ? 55 : 85),
            rotationX: head ? -52 : -42, z: head ? -180 : -130, transformOrigin: "50% 100%" },
          { opacity: 1, y: 0, rotationX: 0, z: 0, duration: head ? 1.2 : 1.0,
            ease: "power4.out", transformPerspective: PERSP },
          i ? "-=0.72" : 0);
      }
    });
  });

  /* Grouped items (cards, chips, timeline) lift in 3D with a stagger */
  function staggerIn(selector, trigger, opts) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.fromTo(els,
      { opacity: 0, y: opts.y || 80, rotationX: -38, z: -120, transformOrigin: "50% 100%" },
      {
        opacity: 1, y: 0, rotationX: 0, z: 0, duration: 0.95, ease: "power3.out",
        transformPerspective: 1000, stagger: opts.stagger || 0.1,
        scrollTrigger: { trigger: trigger, start: isMobile ? "top 78%" : "top 62%" }
      });
  }
  staggerIn(".card", "#work", { stagger: 0.13, y: 90 });
  staggerIn(".chip", "#skills", { stagger: 0.07, y: 40 });
  staggerIn(".timeline li", "#about", { stagger: 0.13, y: 40 });

  /* ---------------------------------------------------------
     3D HOVER TILT on project cards (desktop) — pointer parallax
  --------------------------------------------------------- */
  if (!isMobile) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.style.transformStyle = "preserve-3d";
      card.style.transition = "box-shadow .4s var(--ease), border-color .4s var(--ease)";
      gsap.set(card, { transformPerspective: 700, transformOrigin: "center" });
      /* reusable setters — no per-event tween allocation */
      var qrx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power2" });
      var qry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power2" });
      var qcy = gsap.quickTo(card, "y", { duration: 0.5, ease: "power2" });
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        qry(((e.clientX - r.left) / r.width - 0.5) * 14);
        qrx(-((e.clientY - r.top) / r.height - 0.5) * 14);
        qcy(-10);
      });
      card.addEventListener("mouseleave", function () { qrx(0); qry(0); qcy(0); });
    });
  }

  /* ---------------------------------------------------------
     MAGNETIC BUTTONS (desktop) — native cursor is used
  --------------------------------------------------------- */
  if (!isMobile && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".btn, .nav__resume").forEach(function (b) {
      b.style.transition = "box-shadow .35s var(--ease), background .35s, color .35s, border-color .35s";
      var bqx = gsap.quickTo(b, "x", { duration: 0.4, ease: "power2" });
      var bqy = gsap.quickTo(b, "y", { duration: 0.4, ease: "power2" });
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        bqx((e.clientX - r.left - r.width / 2) * 0.4);
        bqy((e.clientY - r.top - r.height / 2) * 0.5);
      });
      b.addEventListener("mouseleave", function () { bqx(0); bqy(0); });
    });
  }

  /* ---------------------------------------------------------
     HERO DIORAMA: layers shift with the mouse for real depth
  --------------------------------------------------------- */
  if (!isMobile && window.matchMedia("(pointer:fine)").matches) {
    var heroLayers = [];
    document.querySelectorAll("#hero .layer[data-depth]").forEach(function (layer) {
      var depth = parseFloat(layer.getAttribute("data-depth")) || 0;
      heroLayers.push({
        d: depth,
        qx: gsap.quickTo(layer, "x", { duration: 0.7, ease: "power3" }),
        qy: gsap.quickTo(layer, "y", { duration: 0.7, ease: "power3" })
      });
    });
    var hMX = 0, hMY = 0;
    window.addEventListener("mousemove", function (e) {
      hMX = e.clientX / innerWidth - 0.5; hMY = e.clientY / innerHeight - 0.5;
    });
    /* apply once per frame, and only while the hero is on screen */
    gsap.ticker.add(function () {
      if (window.scrollY > innerHeight) return;
      for (var i = 0; i < heroLayers.length; i++) {
        heroLayers[i].qx(-hMX * heroLayers[i].d * 70);
        heroLayers[i].qy(-hMY * heroLayers[i].d * 34);
      }
    });
  }

  /* ---------------------------------------------------------
     SCENE PROGRESS RAIL (right side)
  --------------------------------------------------------- */
  (function () {
    var labels = ["Home", "Work", "About", "Skills", "Contact"];
    var rail = document.createElement("nav");
    rail.className = "scene-nav";
    rail.setAttribute("aria-label", "Scene navigation");
    scenes.forEach(function (scene, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-label", labels[i] || ("0" + (i + 1)));
      b.setAttribute("aria-label", "Go to " + (labels[i] || "scene " + (i + 1)));
      b.addEventListener("click", function () {
        if (lenis) lenis.scrollTo(scene, { duration: 1.4 });
        else scene.scrollIntoView({ behavior: "smooth" });
      });
      rail.appendChild(b);
    });
    document.body.appendChild(rail);
    var dots = rail.querySelectorAll("button");
    scenes.forEach(function (scene, i) {
      ScrollTrigger.create({
        trigger: scene, start: "top center", end: "bottom center",
        onToggle: function (self) {
          if (self.isActive) {
            dots.forEach(function (d) { d.classList.remove("is-active"); });
            dots[i].classList.add("is-active");
          }
        }
      });
    });
  })();

  /* ---------------------------------------------------------
     SCENE SNAP: after you scroll part-way into a scene and pause,
     glide to the next scene automatically (full-page snapping).
     Advances once you've scrolled ~a third of the way in.
  --------------------------------------------------------- */
  if (!isMobile && !reduce && lenis) {
    var snapping = false, idleTimer = null;
    function sceneSnap() {
      if (snapping) return;
      var vh = window.innerHeight;
      var maxY = document.documentElement.scrollHeight - vh;
      var y = window.scrollY;
      var frac = y / vh, base = Math.floor(frac), part = frac - base;
      var idx = part > 0.32 ? base + 1 : base;         // advance after ~1/3 in
      if (idx < 0) idx = 0;
      if (idx > scenes.length - 1) idx = scenes.length - 1;
      var target = Math.min(idx * vh, maxY);
      if (Math.abs(target - y) < vh * 0.03) return;    // already settled
      snapping = true;
      lenis.scrollTo(target, {
        duration: 0.9,
        easing: function (t) { return 1 - Math.pow(1 - t, 3); },
        onComplete: function () { snapping = false; }
      });
      setTimeout(function () { snapping = false; }, 1300); // safety unlock
    }
    lenis.on("scroll", function () {
      if (snapping) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(sceneSnap, 150);            // snap once scrolling pauses
    });
  }

  /* ---------------------------------------------------------
     NAV active-link highlighting
  --------------------------------------------------------- */
  function setActiveNav() {
    var ids = ["work", "about", "skills", "contact"];
    ids.forEach(function (id) {
      var sec = document.getElementById(id);
      var link = nav.querySelector('.nav__links a[href="#' + id + '"]');
      if (!sec || !link) return;
      ScrollTrigger.create({
        trigger: sec, start: "top center", end: "bottom center",
        onToggle: function (self) {
          if (self.isActive) {
            nav.querySelectorAll(".nav__links a").forEach(function (a) { a.classList.remove("is-active"); });
            link.classList.add("is-active");
          }
        }
      });
    });
  }
  setActiveNav();

  /* Nav background after leaving hero */
  ScrollTrigger.create({
    trigger: "#hero", start: "bottom 90%",
    onEnter: function () { nav.classList.add("is-scrolled"); },
    onLeaveBack: function () { nav.classList.remove("is-scrolled"); }
  });

  /* Smooth-scroll nav clicks through Lenis */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
