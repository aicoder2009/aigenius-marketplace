---
name: saas-landing-page
description: Design, build, or audit SaaS marketing/landing pages that convert without looking AI-generated. Use this whenever the user asks for a landing page, marketing site, waitlist page, homepage, or hero section; asks to audit or redesign an existing site; asks how to make a site look "less generic" or "less AI"; or mentions conversion, signups, or launch pages — even if they don't say "landing page" explicitly. Also use it when reviewing landing-page copy or layout.
---

# SaaS Landing Pages That Don't Look AI-Built

A landing page has ONE job: make a specific visitor believe a specific outcome, then act.
Everything below serves that. The two failure modes are opposites — pages that are so
templated they're invisible ("AI slop"), and pages so clever they're unusable. The rule
that resolves the tension: **keep UX conventions stable, differentiate through type,
color, voice, and story — never against usability.**

## Step 0: Find the brand before writing any code

Distinctiveness comes from the product, not from decoration. Before designing:

1. Name 1–3 specific outcomes the product delivers (not categories — outcomes).
2. Name the audience in their own words. Then write copy in THEIR domain language,
   not SaaS jargon ("stories", "shifts", "prompts" — not "workflows", "solutions").
3. Find the product's proprietary details — the keyboard shortcuts, the metaphor,
   the weird internal names — and surface them. A template page can't fake these.
4. Apply the founder test to every headline: "Would the founder actually say this
   out loud?" If it reads like averaged marketing ("Unlock your potential",
   "Your all-in-one platform"), rewrite from the founder's mouth.

If the page accompanies an existing app, reuse the app's exact design tokens
(colors, fonts, chip/tag components). The app IS the brand; the landing page
borrows from it, never invents a second identity.

## The AI-slop tells (audit checklist)

These are the specific signals readers now recognize as "AI-built". Avoid every one:

| Tell | Fix |
|---|---|
| Inter/system-sans only, no typographic choices | Pick a display face with intent (serif, mono, distinctive grotesque) paired with a readable body face |
| Purple→blue gradients on hero/buttons | A palette derived from the product's world (paper, terminal, ink, brand pigment) |
| Eyebrow label stacked above EVERY heading | At most one kicker, in the hero, carrying real information |
| Uniform card grids, identical 16px radii and padding | Vary the rhythm: ruled lists, editorial columns, one card that's actually a card |
| Vague aspirational headline ("Build the future of work") | Specific outcome in the user's language; the founder test |
| Em-dash-bridged sentences everywhere | Full sentences; keep at most a couple of deliberate dashes per page |
| Identical fade-in-on-scroll on every section | Motion only where it demonstrates something (see "Let the product perform") |
| Stock photos of diverse teams at laptops; 3D blobs | Real product UI, real screenshots, or a hand-built product mock |
| The same phrase repeated in hero, features, and FAQ | Say each idea once, best; vary or cut repeats |

Never fake what you don't have: no invented signup counts, no fabricated
testimonials, no logo walls you didn't earn. A small real number is worse than
none; an honest founder's note is better than both.

## Page structure (order matters)

Hero → product demo → how it works → features → objection handling → trust/data →
founder note → FAQ → final CTA → footer. Five to seven sections; waitlist pages
lean shorter (hero + proof + 1–2 sections + CTA).

**Hero (all four, above the fold):**
- Outcome-driven headline, ideally under ~8–10 words, written at a 7th-grade
  reading level (simple copy measurably outconverts "professional" copy).
- One clarifying subheadline.
- Primary CTA that leads with benefit — "Get early access", not "Join our waitlist"
  or "Submit". Pair it with a low-commitment secondary ("See how it works" → anchor).
- A product-focused visual, not abstract art.
- Put the strongest trust signal directly under the CTA (founder credential,
  real user quote), not buried at the bottom.

**Objection handling:** list the top 2–3 objections this specific visitor arrives
with, and answer each in its own section or FAQ entry before it hardens. Generic
FAQs ("What is X?") are fine, but the objection entries are the ones that convert
("Why not just a spreadsheet?", "Is this cheating?", "Do you train on my data?").

**Waitlist specifics:** email-only form (every extra field costs signups); show
queue position on confirmation; add a share nudge on the confirmation state
("Copy the link to pass along") — the honest version of referral mechanics.
After submit, restore the button label from a captured variable, not a hardcoded
string that will drift from the markup.

## Let the product perform

The strongest heroes don't explain the product — they let it demonstrate itself
in 3–5 seconds (Linear principle). Prefer, in order:

1. A self-playing vignette of the core loop: e.g. the prompt types itself into a
   mocked UI, results land staggered. One shot, not looping; settle into a
   complete static state.
2. A real screenshot in a device/browser frame.
3. Nothing. (Better than a stock illustration.)

Vignette mechanics: gate all animation behind a `.js` class on `<html>` so no-JS
renders the finished state; honor `prefers-reduced-motion` by jumping straight to
the final frame; mark the mock `aria-hidden` since it's decoration.

Microinteractions elsewhere: primary button lifts 1px with a soft shadow on hover,
presses on click; form inputs show clear focus. Small, purposeful, done.

## Layout: measure is law, but use the width

Two rules that seem to conflict, and the resolution:

- **Line length stays capped at 60–75 characters (~560–680px)** for body text.
  Never let prose run full-width.
- **Wide screens must not show a skinny left-pinned stack with dead space.**
  Users read that as broken.

Resolution: below ~1100px, a single centered reading column (cap the shell at
~780px). At ≥1100px, keep the measure but multiply columns:
- hero: copy beside the demo (grid `minmax(420px,5fr) 6fr`)
- 3-step "how it works": three columns
- features/FAQ: two columns
- nav, footer, and full-bleed bands ride a wider shell (~1280px)

Ruled lists (border-top per item) survive column layouts gracefully; card grids don't.

## CSS traps found the hard way

- **Shorthand `padding` clobbers across selectors of equal specificity.** A later
  `.hero{padding:72px 0}` silently erases `.wrap`'s side padding. Split axes:
  containers own `padding-inline`, sections own `padding-block`. They can never
  fight.
- **Grid children default to `min-width:auto`.** Any `white-space:nowrap` content
  inside a `1fr` column forces the column wider than the viewport → horizontal
  overflow → the whole page looks shoved to one side. Put `min-width:0` on grid
  children that hold text.
- **Scroll-reveal via IntersectionObserver can permanently hide content.** A fast
  scroll (End key, flick, find-in-page) can jump an element across the viewport
  between IO samples; it never reports intersecting and stays at opacity 0.
  Don't put reveals on headings or body content at all — reserve them for one
  decorative element that starts near the viewport. This also removes an AI tell.
- **Theme-follow, don't theme-force.** Drive light/dark purely from
  `@media (prefers-color-scheme: dark)` over CSS custom properties, with full
  token parity (every color has a dark counterpart, including shadows and
  selection). Set both `theme-color` metas.
- Always verify at ~375px, ~800px, and ≥1280px, in BOTH themes, and check
  `document.documentElement.scrollWidth <= window.innerWidth` at each.

## Technical hygiene (ship checklist)

- `<title>` with the value prop; meta description written as copy, not keywords.
- Canonical URL; full OG set (`og:image` 1200×630 with width/height/alt,
  `og:site_name`, twitter card). OG image should carry the brand mark, not a screenshot.
- If the app behind the marketing page is login-gated, `noindex` the app page so
  search lands on the marketing page.
- Forms: `type=email`, `autocomplete=email`, `inputmode=email`, a real `<label>`
  (visually hidden is fine), `aria-live` on the status region, focus moved to the
  confirmation message, network timeout + distinct error copy for "server said no"
  vs "couldn't reach server".
- Test the form UX with `fetch` stubbed in the console before hitting the real
  backend — never write test signups into production data.
- Zero external requests if possible (self-contained CSS/JS); every request is a
  point of failure and a performance cost. Fast load is a conversion factor.
- Footer: log-in link, anchor links, a data/privacy trust link, and — if the repo
  is public — a GitHub link (real, verifiable trust beats claims).

## Copy voice quick-reference

Write like one specific person explaining to one specific reader:
- Concrete nouns from the user's life beat abstractions ("at a Sunday shift, in
  the middle of something else" beats "in your daily routine").
- Name what the product will NOT do, plainly. A stated limitation is a
  positioning asset ("It will not write your essay. That's the point.").
- Section headings can be sentences with a stance, not labels ("Fair questions."
  beats "FAQ"; "Your stories are yours." beats "Security").
- Cut the second occurrence of any clever phrase.
