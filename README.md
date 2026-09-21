# Foresight Consulting — Website

Static multi-page site. No build step, no dependencies, no server-side code.

## What's in this package

| Path | What it is |
| --- | --- |
| `index.html` + 8 more | The nine pages. Deploy these as-is. |
| `assets/css/style.css` | The whole design system, one file |
| `assets/js/main.js` | Sticky header, mobile drawer, scroll reveal, form validation |
| `assets/img/` | Logo lockups, favicons, client logos |
| `foresight-demo-standalone.html` | Single-file offline preview of all nine pages — double-click to open, no server needed. Not part of the deploy. |
| `README.md` | This file |

## Deploying

Upload the nine `.html` files plus the `assets/` folder to any static host — Netlify,
Vercel, Cloudflare Pages, S3, or plain shared hosting. `index.html` is the home page.
Nothing needs Node, PHP or a database.

To preview locally before uploading:

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`.

**Two things to wire up before go-live** — the audit form has no backend, and the legal
pages are placeholders. Both are detailed under *Form* and *Launch gates* below.

## Structure — mapped to the Aeline reference

The page architecture mirrors `aeline.webflow.io` section for section. Aeline's grammar,
which this site follows throughout:

- **Inset rounded panels** rather than full-bleed sections — hero, CTA and footer sit
  inside the viewport with a gutter and a large corner radius.
- **Centered section heads**: `▪ EYEBROW` → large heading → supporting line → optional
  centered pill CTA.
- **Pill buttons** (fully rounded) with a circular arrow chip.
- **Bento and card grids** with mixed surface colours, rounded corners and hover lift.

| # | Aeline section | Foresight equivalent |
| --- | --- | --- |
| 1 | Hero (colour panel, centered, card arc, rating) | Hero panel — navy/ember gradient, fanned dashboard cards, verified-figures trust line |
| 2 | Logo marquee | Discipline + platform marquee |
| 3 | About (bento, big numbers, mixed cards) | Outcomes bento — 4 result cards (white / ember / ink / tint) |
| 4 | — | The problem (ink statement card) |
| 5 | Services (3-col cards, icon badges) | Framework — the five disciplines |
| 6 | Services cont. | Capabilities — six numbered cards |
| 7 | Expertise (timeline) | Approach — five-stage timeline |
| 8 | Blog (3-col cards w/ visual) | Results — four case cards, each led by the client logo |
| 9 | About stats | Why Foresight (ink card) |
| 10 | CTA (rounded panel) | CTA panel |
| 11 | Footer (rounded dark panel) | Footer panel — brand, three link columns, disclaimer, base bar |

**Three Aeline sections are deliberately absent**, because the content brief forbids them:
pricing (no pricing anywhere in the brief), testimonials and blog/insights (launch gate 6 —
"Testimonials and Insights stay hidden until approved content exists"). Say the word and I
can scaffold any of them.

## Logo assets

All derived from the supplied `Foresight - Logo.png`, in `assets/img/`.

| File | What it is | Used |
| --- | --- | --- |
| `foresight-logo.png` | The original vertical lockup, untouched | Reference / print |
| `foresight-lockup.png` | Horizontal lockup, full colour | Header on light surfaces |
| `foresight-lockup-light.png` | Horizontal lockup, reversed | Header over the dark hero, footer panel |
| `foresight-mark.png` / `-light` | The F mark alone | Spare |
| `foresight-wordmark.png` | The wordmark alone | Spare |
| `favicon.png`, `apple-touch-icon.png` | Square mark | Browser tab, iOS |

**Why a horizontal lockup.** The supplied artwork stacks the mark above the wordmark at
roughly 1:1. Scaled to a 34px navbar that makes "CONSULTING" about 3px tall — unreadable.
The build script cuts the two elements apart at their alpha bounds and recomposes them
side by side at 1333×320, which reads cleanly at nav size.

**Why a reversed variant.** In the original, "CONSULTING" is dark navy (`#0C3C60`), which
is effectively invisible on the ink footer panel and on the dark homepage hero. The
reversed file recolours the wordmark (ember + white), lifts the mark's navy tail to a
light blue, and keeps the mark's gradient rather than flat-filling it. The header swaps
between the two automatically: reversed while it sits over the dark hero, full colour the
moment the glass background kicks in on scroll — verified at scroll positions 0/5/40/600/3000.

Note the bull is *knocked out* of the F as transparency, so on a dark panel it reads as the
background colour rather than white. That is inherent to the artwork, not a conversion
fault. If you have an official reversed or single-colour lockup, drop it in over
`foresight-lockup-light.png` and nothing else needs to change.

## Brand palette

Sampled from `Foresight - Logo.png` by pixel frequency, then tuned for contrast.

| Token | Value | Role |
| --- | --- | --- |
| `--ember` | `#E8431C` | Decorative flame — eyebrow squares, rules, gradients, focus ring |
| `--ember-text` | `#C42D0C` | Ember as **text**; flips to `--ember-bright` inside dark panels |
| `--ember-fill` | `#C42D0C` | Filled surfaces carrying white text; never overridden |
| `--ember-bright` | `#FC4824` | The logo's brightest flame; ember text on dark |
| `--ember-deep` | `#9C1800` | Deep gradient end; primary button hover |
| `--brick` | `#B4240C` | The "FORESIGHT" wordmark red |
| `--ink` | `#0A1B2E` | Body text and dark panels, from the logo's navy |
| `--teal` | `#0C6C90` | The logo's blue tail; evidence links, deltas |
| `--paper` `--card` | `#F6F3EF` `#FFFFFF` | Warm paper base, white cards |

The ember split matters: white on the bright ember is only 4.0:1, so it is never used
behind or as text. `--ember-text` carries the same hue at the wordmark's value and clears
4.5:1 everywhere; `--ember-fill` stays fixed so a pill button reads identically on light
and dark.

## Type

Two families, set in `--sans` and `--body`:

| Token | Stack | Used for |
| --- | --- | --- |
| `--sans` | `"Google Sans", "DM Sans", …` | Headings, buttons, nav, eyebrows, metadata, every figure |
| `--body` | `"Lato", …` | All running text — leads, paragraphs, card copy |

**On Google Sans.** It is Google's proprietary brand font. It is not served by Google
Fonts and is not licensed for third-party websites, so it cannot be loaded from a CDN and
must not be redistributed. It is listed *first* in `--sans`, which means:

- **Today**, it is absent, so the browser falls through to **DM Sans** (SIL OFL, served
  from Google Fonts) — the closest freely-licensed geometric match. Verified by width
  probe: `"Google Sans", monospace` measures identically to `monospace` alone, while
  `"DM Sans", monospace` does not.
- **If you obtain a licence**, self-host the files, add one `@font-face` block, and every
  heading switches over with no other change to the CSS or markup.

If you would rather not reference an unlicensed name at all, delete `"Google Sans", ` from
the `--sans` token — nothing else needs to change.

**Figures still align.** The retired mono face was doing the column alignment in the
scorecards and stat cards. That job now sits on `font-variant-numeric: tabular-nums`,
verified by measurement: `111111`, `000000` and `748392` all render at exactly 59.17px.
Lato ships only 400 and 700, so anything needing 500/600 (buttons, stat names, text links)
is set in `--sans`, which carries the full 400–700 range, rather than letting the browser
synthesise a weight.

## Visuals

The hero fan uses inline SVG built from the real engagement numbers — a menu-score gauge,
revenue bars, an availability ring, a ROAS trend line. Nothing loads from a third party.

### Image slots

There are currently **no photo placeholders on the site** — the results pages carry client
logos instead (see below), and the founder portrait slot was removed at the client's
request.

The `.media` component that powered them is still available if photography arrives later.
Give the box an aspect ratio and a `data-slot` label and it renders as a labelled
placeholder; put an `<img>` inside and the dashed chrome and label remove themselves:

```html
<div class="media media--16x10" data-slot="Image&#10;storefront.jpg&#10;16:10">
  <img src="assets/img/storefront.jpg" alt="Trupthi Veg Restaurant storefront">
</div>
```

Ratios available: `.media--16x10`, `.media--3x2`, `.media--4x5`. Images are
`object-fit: cover`, so only the ratio matters — roughly 1600px on the long edge is
plenty. Always write a real `alt`.

### Client logos

The four client marks live in `assets/img/clients/` and appear in two places:

| Page | Treatment |
| --- | --- |
| `index.html` result cards | Logo plate on the card — tinted band, fixed height, logo contained |
| `results.html` case heads | Small logo chip beside each case-study name |

They were prepared from the supplied files, which were 1350×1080 with heavy white
margins. Each was trimmed to its ink bounds and had the white field knocked out to
transparency (feathered, so antialiased edges keep no white fringe) so they sit on the
card tint. **Trails Of Taste was left opaque** — its yellow tile *is* the logo, so only
the surrounding white was trimmed.

Their aspect ratios range from 1:1 to 5.2:1, so they are `object-fit: contain` inside a
fixed band with a `max-width`/`max-height` cap. That cap is what makes four unrelated
logos read as one set instead of four different sizes — and it is why the band uses its
own height rather than a 16:10 ratio, which would go card-width tall on mobile.

### Footer: five peer columns

The footer was two columns — brand + tagline + contact stacked on the left, three link
lists on the right. That made the left column's height a **sum** of three blocks (305px)
while the right was the **max** of one (~145px), leaving 160–210px of dead space under the
links. Stacking was the cause, so the fix was to unstack:

| Viewport | Layout |
| --- | --- |
| ≥ 1080px | 5 peer columns — brand, contact, Practice, Engage, Legal |
| 760–1080px | 3 columns: brand + contact on row 1, the three lists on row 2 |
| 520–760px | 2 columns, Legal spanning the pair |
| < 520px | one per row |

`align-items: start` stops short columns being stretched into empty boxes. The
"Contact & Location" heading was also demoted from 20px white to the same 12px muted caps
as every other column heading — one column shouting was itself part of the imbalance.

Result: footer-top 305px → 218px, panel 615px → 482px, tallest-vs-shortest column 74px
(natural ragged bottoms) instead of a 210px void. Zero row shortfall at nine widths.

### Grids never orphan a row

Five items don't divide into a 3- or 2-column grid, so the Framework section used to
leave a half-empty last row. Rather than accept the gap, `.grid--5` steps down through
counts that fill evenly:

| Viewport | Rows | Card width |
| --- | --- | --- |
| ≥ 1180px | 5 across | ~216px |
| 820–1180px | 3 + 2 (on a 6-column track) | 263–347px |
| 560–820px | 2 + 2 + 1 (last spans both) | 272–364px |
| < 560px | one per row | full |

The 1180px step exists because below it five across drops under ~200px wide and the copy
starts wrapping to four lines.

Elsewhere a lone trailing item stretches to fill its row:

```css
.facts > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
```

The `:nth-child(odd)` guard means even-numbered sets are left alone — so the 5-item
Principles list and the 5-step timelines fill out, while the 6-item Capabilities and Why
Foresight grids are untouched.

Verified across 14 viewport widths × 9 pages: **zero orphan rows, zero horizontal overflow.**

### Case-study layout

Each case card reads head → metrics → prose → quote → evidence:

1. **Head** — market/platform/period, client name, headline figure, client logo
2. **Metrics band** — the verified scorecard, full width, as a grid of cells (3 across,
   dropping to 2 then 1). Running it full width rather than stacking it in one column is
   what balances the card: it was previously up to 296px taller than the prose beside it.
3. **Two prose beats** — "The situation" and "The work", side by side in equal columns.
   They are near-identical in length, so they sit level (measured imbalance 0–24px).
4. **Closing quote** and **evidence line**, spanning both columns.

Card heights now land in a 714–800px band instead of 684–836px, so the four cases read as
a set rather than four different shapes.

Put the files in `assets/img/`. Images are `object-fit: cover`, so exact pixel dimensions
don't matter — only the aspect ratio, and roughly 1600px on the long edge is plenty.
Always write a real `alt`; leave it empty (`alt=""`) only if the image is purely decorative.

**Hero and CTA background photographs** are supported too, but left off by default because
the gradients look intentional on their own. `assets/css/style.css` has both as commented
blocks (search "Optional hero photograph") — drop in `hero.jpg` / `cta.jpg`, uncomment, and
the gradients stay on top as the legibility scrim over the photo.

## Form

`contact.html` validates client-side and shows the "what happens next" confirmation, but
**does not post anywhere** — there is no backend. Wire the `submit` handler in
`assets/js/main.js` to your endpoint (Formspree, Netlify Forms, or your own) before launch.

## Verified

- 9/9 pages: no unclosed tags, no duplicate IDs, one `<h1>` each, no heading-level jumps,
  every `<label>` bound to a control, every internal link and `#fragment` resolves.
- Zero horizontal overflow at 360, 480, 768, 1024 and 1280px on every page.
- 916 rendered text nodes measured against their true composited background (alpha layers
  resolved, fixed header treated as sitting on the hero): zero WCAG AA failures. Only
  visually-hidden text is excluded.
- Mobile drawer opens and closes, header chrome inverts over the dark hero and reverts
  when the drawer is open; form rejects an empty submit (10 fields flagged, no false
  success) and confirms + resets on a valid one.

Partially verified: rendered screenshots. The preview pane composited only intermittently,
so I confirmed the hero and the outcomes bento visually and measured everything else from
live computed styles and geometry. Worth one human pass over the full page.

## Launch gates — must clear before go-live

From the content brief, unchanged:

1. **Written client permission for all four case studies** — currently not recorded.
2. ~~**Founder's published name**~~ — **cleared.** `about.html` now publishes both
   founders: Sachin (CEO, Co-founder) and Khizar (Executive Director, Co-founder), each
   with bio, email and phone.
3. **Legal review of Privacy, Terms and Platform Disclaimer.** All three are structural
   placeholders carrying a `requires legal review` flag and are `noindex`. The approved
   client text must replace them verbatim. The disclaimer wording itself is the approved
   text from the brief and appears in every footer.
4. **Approved logo.** The supplied `Foresight - Logo.png` is now used throughout — see
   *Logo assets* below. The legacy triangular mark is not used anywhere. The reversed
   variant is machine-generated; replace it if an official reversed lockup exists.
5. **Held/derived metrics stay excluded** until verified — none are present.
6. **Testimonials and Insights stay hidden** until approved content exists — no such
   sections were built.
