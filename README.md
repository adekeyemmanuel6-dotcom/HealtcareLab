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

## 1. Contact form email delivery

The site has no server, so the form submits directly to
[Web3Forms](https://web3forms.com), which emails submissions to
`adekeyemmanuel6@gmail.com`. This is already configured in `js/main.js`:

```js
var FORM_ENDPOINT = "https://api.web3forms.com/submit";
var WEB3FORMS_ACCESS_KEY = "43a2b4ad-3586-45ce-b123-93c9a67545d5";
```

Unlike a typical secret API key, a Web3Forms access key is meant to be used
client-side (their own docs cover this) — that's what makes a no-backend
static site able to use it directly. To rotate the key (e.g. if it starts
receiving spam), generate a new one at web3forms.com and replace the value
above.

If the access key is ever invalid or unset, the form does **not** silently
fall back to opening the visitor's email client — that used to trigger a
confusing "open your email app?" permission prompt and depended on the
visitor manually hitting send. Instead it shows an honest inline error
asking the visitor to email `adekeyemmanuel6@gmail.com` directly.

On a successful submission, the visitor is redirected to `thank-you.html`
(served at the clean `/thank-you` URL on Vercel via `vercel.json`) — point
your Google Ads conversion action at that page load. See section 2 below.

The form already includes:
- Full client-side validation with inline error messages
- A hidden honeypot field (`company_website_hp`) for basic spam protection
- A `lead_source` hidden field set to `Google Ads`
- A required consent checkbox linking to `privacy.html`

If you want stronger spam protection, add Google reCAPTCHA v3 (invisible) or
your form service's built-in spam filtering — both work without adding
friction to the form.

## 2. Google Ads / GA4 conversion tracking

The gtag.js loader is already installed in `<head>` on every page
(`index.html`, `thank-you.html`, `privacy.html`), pointed at container
`AW-18447413113`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18447413113"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18447413113');
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

Alternatively (or in addition), since a successful submission now redirects
to `thank-you.html`, you can set up a simpler **page load** conversion
action in Google Ads targeting `/thank-you`. `thank-you.html` already loads
the base gtag tag; it has a commented `gtag('event', 'conversion', ...)`
call ready to uncomment once you create the conversion action in Google
Ads and have its label to fill in. A page-load trigger is easier to set up
correctly than an event-based one, and only fires after a real redirect,
not a button click.

## 3. Update the OG image (optional)

`index.html` references `assets/og-image.png` for social sharing previews.
Add a 1200×630 image at that path, or remove the `og:image` tag if not needed.

## 4. Portfolio images

The `#work` gallery carousel uses real project screenshots at
`assets/portfolio/portfolio-01.png` through `portfolio-20.png`. Add more by
dropping a new image in that folder and adding a matching
`.carousel-slide`/`.portfolio-image` block in `index.html`; the carousel's
arrows/dots update automatically.

## 5a. "Who We Help" photos — please verify

The `#who-we-help` sector cards (Medical Practices, Doctors & Physicians,
Clinics, etc.) each try to load a representative Unsplash photo. This
development sandbox's network policy blocks all image-CDN domains, so these
specific photo URLs could **not** be test-loaded or verified before shipping.
Each `<img>` has `onerror="this.remove()"`, so if any URL is stale the card
falls back to a clean gradient-and-icon placeholder instead of a broken-image
icon — the section never looks broken either way. **Please open the deployed
site and confirm all 8 photos actually load**; swap any that don't (or all of
them, for photos specific to your own work) by replacing the `src` on the
`.sector-photo img` elements in `index.html`.

## 5. Testimonials

The "What Clients Think" carousel uses real client quotes and names — no
testimonials were fabricated. Add more by appending another
`.testimonial-card` slide in `index.html`.

## 6. About section photo

The "Meet Emmanuel A." section uses a real photo (`assets/personal-image.jpg`)
in `.monogram-card`. To swap it for a different photo, replace that file (or
change the `src` on `.monogram-photo` in `index.html`) — the card crops to a
4:5 portrait via `object-fit: cover`.

## 7. Calendly link

"Book a Free Call" / "Book a Free 30-Minute Consultation" buttons throughout
the page (hero, About section, final CTA, contact sidebar) link to
`https://calendly.com/emmanuelwebflow/30mins`. Update that URL in
`index.html` if the Calendly link ever changes — it appears in five places,
each with its own `data-cta` value for tracking.

## 8. What changed in this pass

- **Hero rebuilt dark**, matching a bold SaaS-style reference: badge pill,
  centered headline/CTAs, and a floating card row (mini laptop preview +
  three real stat cards) below. All copy was re-checked for em dashes,
  none remain anywhere on the page.
- **Stat numbers count up** (`[data-count-to]` in `index.html`,
  `initCountUp()` in `js/main.js`) when scrolled into view, and jump
  straight to the final value under `prefers-reduced-motion`.
- **Icon system**: solid navy/lime badges were replaced with a rotating
  soft-pastel palette (blue/amber/purple/green, defined as `--pastel-*`
  variables) across trust-bar, Services, and Why HealthcareLab icons, to
  match a supplied reference image.
- **Reviews carousel** (`#` "What Clients Think" section): built as a real,
  functional carousel component, but populated only with an honest
  "reviews coming soon" placeholder card. **No testimonials were
  fabricated** — no invented names, companies, quotes, or star ratings.
  When real reviews are available, add more `.carousel-slide` entries
  using `.testimonial-card` (see the CSS for the markup shape); the
  carousel's arrows/dots activate automatically once there's more than
  one slide.
- **Project gallery carousel**: the old static 3-card Portfolio grid is now
  a 6-slide carousel (same arrows/dots component as reviews) with
  Unsplash placeholder images and the same `onerror` graceful-fallback
  pattern used elsewhere — see item 5a above for the general caveat about
  verifying these load. Replace the `src` attributes with real project
  screenshots as work is completed and uploaded.
- **Radial "Features" section**: removed the card-style background from
  each list item (now flat icon + text) and widened the ring/lists to use
  more of the page's width.
- Container width is a fixed 1400px max (`--max-width` in `css/styles.css`),
  confirmed via automated check at a 1920px viewport.

## 8a. Logo

The header/footer logo is a hand-rebuilt SVG (`assets/favicon.svg`) — a
shield-and-flask mark modeled on the reference image supplied, since that
image wasn't accessible as a file in this environment (only visible inline
in chat). The reference image read "Healtcare Lab" (missing an 'h'); the
wordmark here uses the correct "HealthcareLab" spelling used everywhere else
on the site. If you have the original logo file, drop it in as
`assets/logo.svg` (or `.png`) and swap the `<img src="assets/favicon.svg">`
references in `index.html`/`privacy.html` to point at it.

## Design system

- **Fonts**: Funnel Display (headings) + Funnel Sans (body), loaded from
  Google Fonts in `<head>`. Falls back to the system sans stack if the font
  request fails, so the page never breaks without them.
- **Palette**: deep forest green (`--navy`) as the primary dark/text color,
  warm cream background, a bold lime accent (`--lime`) for high-energy CTAs
  and highlighted headline words, all checked for WCAG AA contrast.
- **Type floor**: every real piece of UI text on the page is 16px (1rem) or
  larger — labels, tags, form hints, footer text included. The only
  exceptions are the simulated browser chrome inside the decorative hero
  mockup (`.mockup-*` classes), which is an illustration of a miniature
  website, not real page copy.
- **Layout**: sections intentionally vary in structure rather than
  repeating a heading+3-card-grid pattern — an editorial numbered list
  (Services), a sticky split intro + list (Why HealthcareLab), a radial
  feature layout, dark stat/pricing blocks, and a DIY-vs-HealthcareLab
  comparison table are mixed with a smaller number of card grids.
- **No decorative gradient blobs**: replaced with a faint engineered grid
  texture (`.texture-grid`) used sparingly behind the hero, stats, and
  final CTA sections.
- **Motion**: scroll-reveal (fade/slide/scale) with a `cubic-bezier(0.16, 1,
  0.3, 1)` ease, a staggered reveal for row/list groups (`.stagger` +
  `--i` custom property per item), button hover micro-interactions (arrow
  nudge), an animated nav underline, an auto-scrolling marquee strip, and a
  subtle hover lift on the hero mockup — all built with plain CSS/JS, no
  animation library. Reveal is visible-by-default (see `html.js .reveal` in
  `css/styles.css`) so nothing depends on JavaScript running to be seen, and
  everything honors `prefers-reduced-motion`.
- **Container**: fixed at 1400px max-width, fluid and responsive below that
  down to mobile.

## Accessibility & performance notes

- Semantic HTML throughout (`header`, `main`, `section`, `footer`, proper
  heading hierarchy, `<details>/<summary>` for the FAQ accordion).
- No JS animation libraries or component frameworks — the whole page is
  hand-authored HTML/CSS/inline SVG plus one small vanilla-JS file, so
  there's nothing to lazy-load beyond the two Google Fonts requests.
- Focus-visible states, labeled form fields, `aria-live` status region for
  form errors/success, and `prefers-reduced-motion` support are all included.
