# HealthcareLab — Landing Page

A single-page, conversion-focused Google Ads landing page for HealthcareLab, a
healthcare website design and development service targeting healthcare
organizations across Texas.

Static site — no build step or backend required. Files:

- `index.html` — the landing page
- `privacy.html` — privacy policy (linked from the form consent checkbox and footer)
- `css/styles.css` — all styles (mobile-first, WCAG 2.2 AA color contrast)
- `js/main.js` — nav, scroll reveal, form validation/submission, conversion tracking hooks
- `assets/favicon.svg` — minimal wordmark-based icon

## 1. Connect the contact form to email

The site has no server, so the form needs a form-to-email service to deliver
submissions to `adekeyemmanuel6@gmail.com`. The simplest options:

1. Create a free account at [Formspree](https://formspree.io) (or Getform,
   Web3Forms, Basin, etc.).
2. Create a new form and set its notification email to
   `adekeyemmanuel6@gmail.com`.
3. Copy the endpoint URL it gives you (e.g. `https://formspree.io/f/abc123`).
4. Open `js/main.js` and replace the placeholder at the top of the file:

   ```js
   var FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
   ```

Until this is configured, the form still validates and, on submit, falls back
to opening a pre-filled email draft to `adekeyemmanuel6@gmail.com` so no lead
is lost — but wiring up a real endpoint is strongly recommended for a
frictionless experience (no email client required) and for reliable delivery.

The form already includes:
- Full client-side validation with inline error messages
- A hidden honeypot field (`company_website_hp`) for basic spam protection
- A `lead_source` hidden field set to `Google Ads`
- A required consent checkbox linking to `privacy.html`

If you want stronger spam protection, add Google reCAPTCHA v3 (invisible) or
your form service's built-in spam filtering — both work without adding
friction to the form.

## 2. Add Google Ads / GA4 conversion tracking

`index.html` has a commented placeholder in `<head>` for the gtag.js loader.
Uncomment it and add your own container/conversion ID:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXX');
</script>
```

`js/main.js` already pushes these events to `window.dataLayer` and calls
`gtag()` when present:

| Event             | Fires when                                      |
|-------------------|--------------------------------------------------|
| `cta_click`       | Any `[data-cta]` button/link is clicked           |
| `email_click`     | A `mailto:` link is clicked                       |
| `phone_click`     | A `tel:` link is clicked                          |
| `scroll_depth`    | Visitor scrolls past 25/50/75/100%                |
| `form_start`      | Visitor focuses the first form field              |
| `generate_lead`   | **Primary conversion** — form submits successfully |
| `form_complete`   | Same moment as `generate_lead`                    |

Set your Google Ads **conversion action** to fire on `generate_lead`, not on
a button click — this ties the conversion to an actual completed lead, per
the tracking plan.

## 3. Update the OG image (optional)

`index.html` references `assets/og-image.png` for social sharing previews.
Add a 1200×630 image at that path, or remove the `og:image` tag if not needed.

## 4. Replace portfolio/case-study placeholders

The Portfolio section uses clearly labeled "Concept" placeholder cards (CSS
mockups, not real screenshots) since no real client projects were provided.
Replace the `.portfolio-thumb` markup with real project screenshots and
descriptions as work is completed — do not present placeholders as real
results.

## 5. Testimonials

No testimonials were fabricated. A labeled placeholder in the "What Your New
Website Should Do" section explains that testimonials will be added once
available — replace it with real client quotes when you have them.

## 6. About section photo

The "Meet Emmanuel A." section uses a stylized monogram card ("EA") instead
of a stock photo of a stranger. Swap `.monogram-card` in `index.html` for a
real headshot `<img>` whenever one is available — the card's dark background
and layout are sized to drop a portrait straight in.

## 7. Calendly link

"Book a Free Call" / "Book a Free 30-Minute Consultation" buttons throughout
the page (hero, About section, final CTA, contact sidebar) link to
`https://calendly.com/emmanuelwebflow/30mins`. Update that URL in
`index.html` if the Calendly link ever changes — it appears in five places,
each with its own `data-cta` value for tracking.

## Design system

- **Fonts**: Space Grotesk (headings) + Inter (body), loaded from Google
  Fonts in `<head>`. Falls back to the system sans stack if the font request
  fails, so the page never breaks without them.
- **Palette**: deep forest green (`--navy`) as the primary dark/text color,
  warm cream background, a bold lime accent (`--lime`) for high-energy CTAs
  and highlighted headline words, all checked for WCAG AA contrast.
- **Motion**: scroll-reveal (fade/slide), an auto-scrolling marquee trust
  strip, and a subtle hover lift on the hero mockup — all built with plain
  CSS/JS, no animation library. Reveal is visible-by-default (see
  `html.js .reveal` in `css/styles.css`) so nothing depends on JavaScript
  running to be seen, and honors `prefers-reduced-motion`.

## Accessibility & performance notes

- Semantic HTML throughout (`header`, `main`, `section`, `footer`, proper
  heading hierarchy, `<details>/<summary>` for the FAQ accordion).
- No JS animation libraries or component frameworks — the whole page is
  hand-authored HTML/CSS/inline SVG plus one small vanilla-JS file, so
  there's nothing to lazy-load beyond the two Google Fonts requests.
- Focus-visible states, labeled form fields, `aria-live` status region for
  form errors/success, and `prefers-reduced-motion` support are all included.
