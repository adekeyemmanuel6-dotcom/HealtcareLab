/* ==========================================================================
   HealthcareLab — Landing Page Behavior
   Nav toggle, sticky header, reveal animations, form validation/submission,
   and lightweight conversion-tracking hooks ready for Google Ads / GA4.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
   * Config — replace with your real form endpoint before going live.
   * Create a free form at https://formspree.io (or any form-to-email
   * service) pointed at adekeyemmanuel6@gmail.com and paste its endpoint
   * URL below. See README.md for full setup steps.
   * ------------------------------------------------------------------- */
  var FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
  var LEAD_EMAIL = "adekeyemmanuel6@gmail.com";

  /* ---------------- Tracking helper (Google Ads / GA4 ready) ---------- */
  function trackEvent(name, params) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, params || {}));
      if (typeof window.gtag === "function") {
        window.gtag("event", name, params || {});
      }
    } catch (e) {
      /* tracking must never break the page */
    }
  }
  window.hclTrackEvent = trackEvent;

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initMobileNav();
    initReveal();
    initHeroEntrance();
    initCountUp();
    initCarousels();
    initCtaTracking();
    initScrollDepth();
    initStickyCta();
    initContactForm();
    initBackToTop();
  });

  /* ---------------- Carousels ---------------------------------------------
     Native scroll-snap does the actual scrolling/swiping; this just adds
     arrow buttons, dot pagination, and keyboard support on top, and hides
     controls entirely when there's nothing to page through (e.g. the
     testimonials carousel before real reviews are added). */
  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (root) {
      var track = root.querySelector("[data-carousel-track]");
      var slides = track ? Array.prototype.slice.call(track.children) : [];
      var prevBtn = root.querySelector("[data-carousel-prev]");
      var nextBtn = root.querySelector("[data-carousel-next]");
      var dotsWrap = root.querySelector("[data-carousel-dots]");
      var controls = root.querySelector("[data-carousel-controls]") ||
        (prevBtn && prevBtn.closest(".carousel-controls"));
      if (!track || slides.length === 0) return;

      if (slides.length <= 1) {
        if (controls) controls.hidden = true;
        return;
      }

      var dots = [];
      if (dotsWrap) {
        slides.forEach(function (_, i) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.setAttribute("aria-label", "Go to slide " + (i + 1));
          dot.addEventListener("click", function () { scrollToSlide(i); });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        });
      }

      function currentIndex() {
        var trackLeft = track.getBoundingClientRect().left;
        var closest = 0;
        var closestDist = Infinity;
        slides.forEach(function (slide, i) {
          var dist = Math.abs(slide.getBoundingClientRect().left - trackLeft);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        return closest;
      }

      function updateUI() {
        var index = currentIndex();
        dots.forEach(function (dot, i) { dot.classList.toggle("is-active", i === index); });
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === slides.length - 1;
      }

      function scrollToSlide(i) {
        i = Math.max(0, Math.min(i, slides.length - 1));
        slides[i].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      }

      if (prevBtn) prevBtn.addEventListener("click", function () { scrollToSlide(currentIndex() - 1); });
      if (nextBtn) nextBtn.addEventListener("click", function () { scrollToSlide(currentIndex() + 1); });

      track.setAttribute("tabindex", "0");
      track.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { scrollToSlide(currentIndex() + 1); }
        else if (e.key === "ArrowLeft") { scrollToSlide(currentIndex() - 1); }
      });

      var ticking = false;
      track.addEventListener("scroll", function () {
        if (!ticking) {
          window.requestAnimationFrame(function () { updateUI(); ticking = false; });
          ticking = true;
        }
      }, { passive: true });

      updateUI();
    });
  }

  /* ---------------- Count-up stat numbers --------------------------------- */
  function initCountUp() {
    var items = document.querySelectorAll("[data-count-to]");
    if (!items.length) return;

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setValue(el, value) {
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      el.textContent = prefix + value + suffix;
    }

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-count-to"), 10);
      if (reduceMotion || isNaN(target)) {
        setValue(el, target);
        return;
      }
      var duration = 1400;
      var start = null;
      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        setValue(el, Math.round(target * eased));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setValue(el, target);
        }
      }
      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      items.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- Hero entrance ----------------------------------------
     Hero content sits right at the fold on many viewports, where the
     scroll-reveal observer's rootMargin can miss it on initial load,
     leaving it to wait on the multi-second safety-net timeout. The hero
     should always animate in immediately on page load instead, so this
     triggers it directly rather than waiting on scroll/intersection. */
  function initHeroEntrance() {
    var items = document.querySelectorAll(".hero-copy-center .reveal");
    if (!items.length) return;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        items.forEach(function (el) { el.classList.add("is-visible"); });
      });
    });
  }

  /* ---------------- Sticky header shadow on scroll --------------------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Mobile nav toggle ----------------------------------- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) return;

    function closeNav() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    function openNav() {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.contains("is-open");
      if (isOpen) { closeNav(); } else { openNav(); }
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------------- Scroll-reveal animation ------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) { observer.observe(el); });

    // Safety net: guarantee every section becomes visible even if the
    // observer never fires for it (e.g. a screenshot tool that renders
    // the full page without dispatching real scroll/resize events).
    window.setTimeout(function () {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    }, 2500);
  }

  /* ---------------- CTA click tracking ----------------------------------- */
  function initCtaTracking() {
    document.querySelectorAll("[data-cta]").forEach(function (el) {
      el.addEventListener("click", function () {
        trackEvent("cta_click", { cta_label: el.getAttribute("data-cta") });
      });
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (el) {
      el.addEventListener("click", function () { trackEvent("email_click", {}); });
    });
    document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
      el.addEventListener("click", function () { trackEvent("phone_click", {}); });
    });
  }

  /* ---------------- Scroll depth tracking --------------------------------- */
  function initScrollDepth() {
    var thresholds = [25, 50, 75, 100];
    var fired = {};
    function check() {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop;
      var height = doc.scrollHeight - doc.clientHeight;
      if (height <= 0) return;
      var pct = Math.round((scrollTop / height) * 100);
      thresholds.forEach(function (t) {
        if (pct >= t && !fired[t]) {
          fired[t] = true;
          trackEvent("scroll_depth", { percent: t });
        }
      });
    }
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { check(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------------- Sticky mobile CTA (hides near contact form) ----------- */
  function initStickyCta() {
    var sticky = document.querySelector(".sticky-cta");
    var contact = document.getElementById("contact");
    if (!sticky) return;
    document.body.classList.add("has-sticky-cta");

    if (contact && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            sticky.classList.toggle("is-hidden", entry.isIntersecting);
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(contact);
    }
  }

  /* ---------------- Back to top button ------------------------------------ */
  function initBackToTop() {
    var btn = document.querySelector("[data-back-to-top]");
    if (!btn) return;
    var onScroll = function () {
      btn.classList.toggle("is-visible", window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- Contact form: validation + submission ---------------- */
  function initContactForm() {
    var form = document.getElementById("strategy-form");
    if (!form) return;

    var statusBox = document.getElementById("form-status");
    var formPanel = document.getElementById("form-panel");
    var successPanel = document.getElementById("form-success");
    var hasWebsiteRadios = form.querySelectorAll('input[name="has_website"]');
    var websiteUrlField = document.getElementById("current-website-url-field");
    var startedTracking = false;

    form.addEventListener(
      "focusin",
      function () {
        if (!startedTracking) {
          startedTracking = true;
          trackEvent("form_start", { form_name: "strategy_request" });
        }
      },
      { once: true }
    );

    hasWebsiteRadios.forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (websiteUrlField) {
          websiteUrlField.hidden = radio.value !== "yes" || !radio.checked;
        }
      });
    });

    var requiredFields = [
      { id: "full-name", message: "Please enter your full name." },
      { id: "org-name", message: "Please enter your business or organization name." },
      { id: "email", message: "Please enter a valid email address.", validate: isValidEmail },
      { id: "phone", message: "Please enter a valid phone number.", validate: isValidPhone },
      { id: "org-type", message: "Please select your organization type." },
      { id: "budget", message: "Please select an approximate budget." },
      { id: "timeline", message: "Please select a timeline." },
      { id: "project-details", message: "Please tell us a bit about your project." }
    ];

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }
    function isValidPhone(value) {
      var digits = value.replace(/\D/g, "");
      return digits.length >= 10;
    }

    function setError(fieldEl, errorEl, message) {
      if (!fieldEl) return;
      if (message) {
        fieldEl.setAttribute("aria-invalid", "true");
        if (errorEl) errorEl.textContent = message;
      } else {
        fieldEl.removeAttribute("aria-invalid");
        if (errorEl) errorEl.textContent = "";
      }
    }

    function validateField(rule) {
      var fieldEl = document.getElementById(rule.id);
      var errorEl = document.getElementById(rule.id + "-error");
      if (!fieldEl) return true;
      var value = fieldEl.value || "";
      var empty = value.trim() === "";
      var invalid = empty || (rule.validate && !rule.validate(value));
      setError(fieldEl, errorEl, invalid ? rule.message : "");
      return !invalid;
    }

    function validateNeedGroup() {
      var needSelected = form.querySelectorAll('input[name="need[]"]:checked');
      var needError = document.getElementById("need-error");
      var invalid = needSelected.length === 0;
      if (needError) needError.textContent = invalid ? "Please select at least one option." : "";
      return !invalid;
    }

    function validateConsent() {
      var consent = document.getElementById("consent");
      var consentError = document.getElementById("consent-error");
      var invalid = consent && !consent.checked;
      if (consentError) consentError.textContent = invalid ? "Please confirm you agree to be contacted." : "";
      return !invalid;
    }

    // Clear each field's error as soon as it becomes valid, so a visitor
    // fixing one mistake doesn't have to resubmit to see it acknowledged.
    requiredFields.forEach(function (rule) {
      var fieldEl = document.getElementById(rule.id);
      if (!fieldEl) return;
      var evtName = fieldEl.tagName === "SELECT" ? "change" : "input";
      fieldEl.addEventListener(evtName, function () { validateField(rule); });
    });
    form.querySelectorAll('input[name="need[]"]').forEach(function (checkbox) {
      checkbox.addEventListener("change", validateNeedGroup);
    });
    var consentInput = document.getElementById("consent");
    if (consentInput) consentInput.addEventListener("change", validateConsent);

    function validateForm() {
      var firstInvalid = null;
      var valid = true;

      requiredFields.forEach(function (rule) {
        var ok = validateField(rule);
        if (!ok) {
          valid = false;
          if (!firstInvalid) firstInvalid = document.getElementById(rule.id);
        }
      });

      if (!validateNeedGroup()) {
        valid = false;
        if (!firstInvalid) firstInvalid = form.querySelector('input[name="need[]"]');
      }

      if (!validateConsent()) {
        valid = false;
        if (!firstInvalid) firstInvalid = document.getElementById("consent");
      }

      if (!valid && firstInvalid) {
        firstInvalid.focus();
      }

      return valid;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot spam check — bots tend to fill every field.
      var honeypot = document.getElementById("company_website_hp");
      if (honeypot && honeypot.value.trim() !== "") {
        return; // silently drop likely-bot submissions
      }

      if (!validateForm()) {
        showStatus("Please fix the highlighted fields and try again.", "error");
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }
      showStatus("", "");

      var formData = new FormData(form);
      formData.set("_subject", "New Website Strategy Request — HealthcareLab");
      formData.set("lead_destination", LEAD_EMAIL);

      var isConfigured = FORM_ENDPOINT.indexOf("YOUR_FORM_ID") === -1;

      if (!isConfigured) {
        // Endpoint not yet configured for this deployment: fall back to a
        // pre-filled email draft so no lead is lost, and let the site owner
        // know via the console how to finish wiring up delivery.
        console.warn(
          "HealthcareLab form: FORM_ENDPOINT is not configured. " +
          "See README.md to connect a form-to-email service. Falling back to mailto."
        );
        submitViaMailtoFallback(formData);
        onSubmitSuccess();
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
        return;
      }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (response.ok) {
            onSubmitSuccess();
          } else {
            throw new Error("Submission failed");
          }
        })
        .catch(function () {
          showStatus(
            "We couldn't submit the form automatically. Please email us directly at " +
              LEAD_EMAIL + " and we'll follow up right away.",
            "error"
          );
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });

    function submitViaMailtoFallback(formData) {
      var lines = [];
      formData.forEach(function (value, key) {
        if (key === "company_website_hp" || key === "_subject" || key === "lead_destination") return;
        lines.push(key + ": " + value);
      });
      var body = encodeURIComponent(lines.join("\n"));
      var subject = encodeURIComponent("New Website Strategy Request — HealthcareLab");
      window.location.href = "mailto:" + LEAD_EMAIL + "?subject=" + subject + "&body=" + body;
    }

    function onSubmitSuccess() {
      trackEvent("generate_lead", { form_name: "strategy_request" });
      trackEvent("form_complete", { form_name: "strategy_request" });
      if (formPanel && successPanel) {
        formPanel.hidden = true;
        successPanel.hidden = false;
        successPanel.setAttribute("tabindex", "-1");
        successPanel.focus();
      }
    }

    function showStatus(message, type) {
      if (!statusBox) return;
      statusBox.textContent = message;
      statusBox.className = "form-status" + (type ? " " + type : "");
      statusBox.classList.toggle("is-visible", Boolean(message));
    }
  }
})();
