---
name: luyenthuyettrinh.com
description: AI presentation coach. White, calm learning product whose proof is the report itself.
colors:
  bg: "#FFFFFF"
  soft: "#F6F7F9"
  soft-2: "#ECEEF2"
  line: "#E5E7EB"
  line-2: "#D1D5DB"
  ink: "#111827"
  ink-2: "#374151"
  muted: "#4B5563"
  faint: "#6B7280"
  blue: "#2563EB"
  blue-600: "#1D4ED8"
  blue-700: "#1E40AF"
  blue-50: "#EFF4FF"
  blue-100: "#DBE6FE"
  blue-200: "#A9C3FB"
  good: "#15803D"
  good-50: "#E8F6ED"
  warn: "#B45309"
  warn-50: "#FEF3E2"
  orange: "#D97706"
  bad: "#C81E1E"
  bad-50: "#FDECEC"
  yellow-50: "#FEF6DC"
typography:
  display:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(34px, 4.1vw, 54px)"
    fontWeight: 700
    lineHeight: 1.14
    letterSpacing: "-0.032em"
  headline:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(27px, 3.3vw, 40px)"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.028em"
  page-title:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(24px, 2.8vw, 30px)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.028em"
  title:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.6
  caption:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
    lineHeight: 1.6
  stat:
    fontFamily: "Be Vietnam Pro, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
rounded:
  chip: "6px"
  sm: "8px"
  control: "10px"
  r: "12px"
  lg: "14px"
  xl: "18px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  card: "22px"
  column-gap: "56px"
  section: "96px"
  section-mobile: "64px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.bg}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
    height: "42px"
  button-primary-hover:
    backgroundColor: "{colors.blue-600}"
  button-tonal:
    backgroundColor: "{colors.blue-50}"
    textColor: "{colors.blue-700}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
    height: "42px"
  button-tonal-hover:
    backgroundColor: "{colors.blue-100}"
  button-outline:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
    height: "42px"
  button-outline-hover:
    backgroundColor: "{colors.soft}"
  button-lg:
    rounded: "{rounded.r}"
    padding: "14px 24px"
    height: "52px"
  button-sm:
    rounded: "{rounded.sm}"
    padding: "7px 13px"
    height: "36px"
  chip:
    backgroundColor: "{colors.soft-2}"
    textColor: "{colors.ink-2}"
    typography: "{typography.caption}"
    rounded: "{rounded.chip}"
    padding: "3px 9px"
  chip-good:
    backgroundColor: "{colors.good-50}"
    textColor: "{colors.good}"
  chip-warn:
    backgroundColor: "{colors.warn-50}"
    textColor: "{colors.warn}"
  chip-bad:
    backgroundColor: "{colors.bad-50}"
    textColor: "{colors.bad}"
  chip-premium:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.chip}"
    padding: "2px 7px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
    height: "44px"
  card:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "22px"
  nav-item:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  nav-item-current:
    backgroundColor: "{colors.blue-50}"
    textColor: "{colors.blue}"
  score-pill-high:
    backgroundColor: "{colors.good-50}"
    textColor: "{colors.good}"
    rounded: "{rounded.chip}"
    padding: "3px 9px"
  score-pill-mid:
    backgroundColor: "{colors.warn-50}"
    textColor: "{colors.warn}"
  score-pill-low:
    backgroundColor: "{colors.bad-50}"
    textColor: "{colors.bad}"
---

# Design System: luyenthuyettrinh.com

## Overview

**Creative North Star: "The Marked Transcript"**

The product's proof is one device: a line of the user's own speech with a timestamp beside it and the filler word marked in red. Everything around that device stays out of its way. The ground is white, the text is near-black, panels are a quiet grey, borders are hairlines, and a single blue says "press this" or "you are here". It is the familiar learning-platform look played straight, built so a nervous, price-sensitive speaker trusts it enough to pay.

Density is moderate. Public pages are roomy (96px section rhythm, a 1160px column) and argue with real report fragments instead of illustration. App screens sit on a grey shell with white cards and always resolve to one obvious next step. The landing hero carries the one decorative device in the system, a slowly rotating sphere of presentation photographs; the sample report panel opens the solution section directly below.

Colour outside the blue is reserved for meaning. Green, amber and red appear only where a score, a state or a mistake is being reported. Category colour does not exist: course, goal and feature tiles are all the same neutral grey.

**Key Characteristics:**
- White ground, near-black ink, one blue, grey panels, hairline borders.
- One typeface (Be Vietnam Pro) in four weights; heavy, tight headings; tabular numerals for every score and time.
- Flat at rest. Shadow only on things that float or lift.
- One solid blue button per view; tonal blue for the second-rank action.
- Semantic colour is spent only on scores and states.
- Phone app layout: compact top bar plus a fixed five-item bottom tab bar.

## Colors

A neutral grey ladder carrying one saturated blue, with three state hues held in reserve.

### Primary
- **Action Blue** (`blue`, #2563EB): the solid primary button, text links, the current nav item, selected filters, the current step, focus rings, and the product's own data marks (progress meters, score ring, chart line and bars). One exception in prose: a single highlighted phrase in the landing headline.
- **Action Blue Pressed** (`blue-600`, #1D4ED8): hover on the solid primary button.
- **Deep Blue Ink** (`blue-700`, #1E40AF): text on tonal blue surfaces (tonal buttons, info alerts, selected options).
- **Blue Wash** (`blue-50`, #EFF4FF): tonal button fill, current sidebar item, selected choice cards, informational banners and the active analysis step.
- **Blue Mist** (`blue-100`, #DBE6FE): tonal hover, input focus ring, banner border, text selection.
- **Blue Haze** (`blue-200`, #A9C3FB): secondary bars in the waveform, dashed placeholders, the audience-question tip border.

### Neutral
- **Paper White** (`bg`, #FFFFFF): page ground on public pages; every card, panel, input and bar.
- **Panel Grey** (`soft`, #F6F7F9): the app shell behind cards, tinted landing sections, inset blocks (quotes, KPIs, transcript excerpt), hover fills.
- **Tile Grey** (`soft-2`, #ECEEF2): chips, avatars, icon tiles, meter and chart tracks, the segmented-control trough.
- **Hairline** (`line`, #E5E7EB): card and section borders, row dividers, chart gridlines.
- **Control Line** (`line-2`, #D1D5DB): borders of anything pressable or typable (outline buttons, inputs, pills, option cards), dashed empty states.
- **Ink** (`ink`, #111827): headings and body text; also the fill of the closing call-to-action band, the footer, toasts and the Premium chip.
- **Ink Soft** (`ink-2`, #374151): nav labels, field labels, chip text.
- **Muted** (`muted`, #4B5563): supporting copy, meta lines, table headers.
- **Faint** (`faint`, #6B7280): placeholders, inactive steps, hover border on controls.

### Tertiary (state only)
- **Pass Green** (`good`, #15803D, wash `good-50` #E8F6ED): scores of 75 and above, completed steps and lessons, the "fix" label, best-of-row table cells, positive deltas.
- **Caution Amber** (`warn`, #B45309, wash `warn-50` #FEF3E2): scores from 60 to 74, warnings, script highlights. A brighter **Signal Orange** (`orange`, #D97706) fills mid-range bars, the pending-count badge and the comparison line in charts.
- **Mistake Red** (`bad`, #C81E1E, wash `bad-50` #FDECEC): scores below 60, marked filler words, over-pace bars, errors, destructive actions, the recording dot.
- **Flash Yellow** (`yellow-50`, #FEF6DC): the momentary highlight on a transcript line when the user jumps to it.

### Named Rules
**The One Blue Rule.** Blue means "act", "current" or "your data". If an element is none of those three, it is not blue.

**The Earned Colour Rule.** Green, amber and red are score and state colours. They never decorate, never categorise. Thresholds are fixed: 75 and above is green, 60 to 74 is amber, below 60 is red.

**The Neutral Tile Rule.** Goals, courses and features do not get their own hue. Every category tile is Tile Grey with Ink Soft content.

## Typography

**Display Font:** Be Vietnam Pro (with system-ui, -apple-system, Segoe UI, sans-serif)
**Body Font:** Be Vietnam Pro (same stack)

**Character:** One family in four self-hosted weights (400, 500, 600, 700), chosen for complete Vietnamese coverage so stacked diacritics stay clean at every size. Headings are heavy and tightly tracked; body is open (1.6) to give the diacritics room.

### Hierarchy
- **Display** (700, clamp(34px, 4.1vw, 54px), 1.14, -0.032em): the landing headline only.
- **Headline** (700, clamp(27px, 3.3vw, 40px), 1.18, -0.028em): public section headings and the closing band.
- **Page title** (700, clamp(24px, 2.8vw, 30px), 1.25, -0.028em): the H1 of each app screen; flow and course screens run the same style up to 34-36px.
- **Title** (600, 16px, 1.25, -0.015em): card and list headings; 17-20px for feature, step and lesson-section headings on roomier surfaces.
- **Body** (400, 15px, 1.6): default text. Lead paragraphs run 16-18px in Muted, capped at 44-62ch.
- **Label** (600, 13px): field labels, section mini-headings, table headers (12.5px).
- **Caption** (500, 12.5px): chips, hints, row meta, timestamps (12px).
- **Stat** (700, 28px, -0.025em, tabular): dashboard figures. The same treatment scales up for the sample report score (76px, -0.04em), the recording timer (clamp(46px, 7vw, 72px)) and the price (40px).

### Named Rules
**The Tabular Figure Rule.** Every score, percentage, time, price and table cell uses tabular numerals so digits do not shift as values change.

**The Balanced Heading Rule.** Headings wrap balanced and paragraphs wrap pretty. Vietnamese headlines break mid-phrase badly without it.

## Layout

Two layouts. The public layout is a sticky 64px white top bar (logo, three links, language switch, log in, small primary button), a centred column 1160px wide with 16px gutters that respect device safe areas, and an ink footer. Sections are 96px tall in padding (64px below 720px) and alternate white with Panel Grey bands bounded by hairlines. Two-column compositions use an even split with a 56px gap; feature rows are four across, steps three across.

The app layout is a 264px white sidebar beside a Panel Grey main area whose content is capped at 1080px. Cards sit on a 16px grid in two, three or four columns, with an asymmetric 1.6 : 1 split for main-plus-aside screens. Card padding is 22px (18px on phones). Flow screens (onboarding, login, set-up) are a single centred card, 760px or 460px wide.

Responsive behaviour is structural, not just a reflow:
- **1080px:** public nav links collapse; feature grid drops to two columns.
- **960px:** hero and split sections stack; the app sidebar becomes a compact top bar and its navigation becomes a fixed bottom tab bar with five destinations (Dashboard, Practice, Courses, Library, Progress). Plans and Account move to icon buttons in the top bar. Main content gains 96px of bottom padding so nothing hides behind the bar; toasts lift above it.
- **720px:** every multi-column grid becomes one column; the primary button in a page header or flow footer goes full width and moves first; buttons grow to a 44px minimum height; step indicators shrink to numbers with only the current label shown.
- **520px and 380px:** remaining two-column grids collapse; the top-bar primary button is dropped at 380px in favour of the menu.

Lists inside cards are rows separated by hairlines, not nested cards. The landing "problem and answer" block is a two-column table under a 1px ink rule, deliberately not a card grid.

## Elevation & Depth

Flat by default. Depth is carried by tone (white cards on a grey shell, grey insets inside white cards) and by hairline borders. Shadows are reserved for surfaces that genuinely sit above the page.

### Shadow Vocabulary
- **Contact** (`box-shadow: 0 1px 2px rgba(17,24,39,.06)`): the selected segment of a segmented control and small floating utility buttons.
- **Float** (`box-shadow: 0 1px 2px rgba(17,24,39,.05), 0 12px 28px -12px rgba(17,24,39,.18)`): dropdown menu, modal, the sample report panel, the featured pricing card, and course cards on hover.

### Named Rules
**The Flat-At-Rest Rule.** A card in the normal flow has a hairline and no shadow. Shadow appears when something floats over content or lifts in response to hover.

**The Inset-Ring Rule.** Selection is shown with a blue border plus a 1px inset blue ring and a Blue Wash fill, never with a drop shadow or a thicker outer border that would shift layout.

## Shapes

Softly rounded rectangles on a short ladder: chips and score pills 6px, small buttons and inset blocks 8px, buttons and inputs 10px, large buttons and list items 12px, cards and panels 14px, the largest containers (modal, pricing card, report panel, closing band) 18px. Full circles are kept for avatars, step numbers, radio dots and status dots. Nothing is pill-shaped except the toggle switch.

Borders are 1px throughout: Hairline for containers, Control Line for interactive elements. Dashed borders mean "empty" or "drop here". Icons are one inline SVG set drawn on a 24px grid with a 1.8px round stroke in the current text colour. The logo mark is a 32px blue rounded square (9px radius) holding four white bars of unequal height, a waveform.

## Components

### Buttons
Plain and confident: weight 600, 15px, no uppercase, no gradient.
- **Shape:** gently rounded (10px), 42px minimum height (44px on phones); large is 52px with 12px radius, small is 36px with 8px radius.
- **Primary:** solid Action Blue with white text, 10px by 18px padding. Hover darkens to Action Blue Pressed.
- **Tonal:** Blue Wash fill with Deep Blue Ink text; hover is Blue Mist. This is what a primary button becomes automatically when it sits inside a next-lesson card, an empty state, a Premium lock or a course card, so the screen keeps a single solid blue.
- **Outline:** white with a Control Line border and Ink text; hover fills Panel Grey and darkens the border.
- **Text and link:** bare Ink text that turns blue on hover; bare blue text that underlines on hover.
- **Danger:** solid Mistake Red, used only for destructive confirmation.
- **States:** press nudges 1px down; disabled is 50% opacity; focus is a 2px blue outline offset 2px. State transitions take 150ms.

### Chips
- **Style:** Tile Grey fill, Ink Soft text, 12.5px medium, 6px radius, 3px by 9px padding. A white outlined variant exists for counts.
- **State:** green, amber and red washes only when the chip reports a result. The Premium chip is solid Ink with white 11px text.
- **Score pill:** the same shape at 14px bold with tabular figures, coloured by the fixed thresholds.

### Cards / Containers
- **Corner Style:** 14px (18px for modal, pricing and report panels).
- **Background:** white on the grey shell; grey insets inside.
- **Shadow Strategy:** none at rest; see Elevation.
- **Border:** 1px Hairline. Informational variants use Blue Wash with a Blue Mist border.
- **Internal Padding:** 22px (18px on phones); 28px for flow panels and modals.
- **Empty state:** white, dashed Control Line border, centred bold line, one sentence, one tonal action.

### Inputs / Fields
- **Style:** white, 1px Control Line, 10px radius, 44px minimum height, label above in 13px semibold Ink Soft, hint below in 12.5px Muted.
- **Focus:** border turns Action Blue with a 3px Blue Mist ring.
- **Error:** border turns Mistake Red, with an alert block (red wash, icon, message) carrying the text.
- **Selection controls:** option cards, prompt rows and payment options share one selected look (blue border, inset ring, Blue Wash). Filter pills fill solid blue when on. The segmented control is a grey trough with a white raised segment.

### Navigation
- **Public top bar:** sticky, white, hairline beneath; links are 15px medium Ink Soft, the current route turns blue; language switch is a small outlined two-button group.
- **App sidebar (desktop):** icon plus label rows, 10px radius; hover is Panel Grey; current is Blue Wash with blue semibold text. A plan box sits at the bottom with a usage meter.
- **Bottom tab bar (phone):** fixed, white, hairline on top, five equal columns, icon over an 11px label, 52px minimum target, safe-area padding. Current is blue text with no fill.

### Report Elements (signature)
The parts that make a report, reused wherever feedback is shown.
- **Marked transcript line:** a tabular timestamp column, then the sentence at 15px with 1.7 leading; flagged words get a red wash, red semibold text and a 4px radius.
- **Criterion bar:** label, 6px rounded track in Tile Grey, value in tabular bold; fill is green, orange or red by threshold.
- **Score ring:** a blue arc on a Tile Grey ring with the score centred.
- **Fix line:** a green "Fix:" label followed by one plain sentence.
- **Sample report panel:** white, 18px radius, Float shadow, grey title strip. On load the score counts up (1.1s), bars grow from the left (0.9s, staggered 80ms), then the flagged words take their mark. Easing is cubic-bezier(.16,1,.3,1).

### Photo Sphere (landing hero only)
Forty-eight square photographs of people presenting, placed evenly on a tilted sphere up to 520px wide that turns slowly. Tiles have 22% corner radius; nearer tiles are larger and opaque, farther ones shrink and fade to 18%. It is decorative and hidden from assistive technology, stops updating when scrolled out of view, and renders as a single still frame under reduced motion. Below 960px it shrinks to 380px and moves beneath the call-to-action.

### Motion
State changes are quick and plain (100 to 200ms). Entrances (modal, toast, live tips, intro rows) rise 8px over 250 to 500ms on cubic-bezier(.16,1,.3,1), with no bounce. Under reduced motion every animation and transition is switched off and content shows its end state.

## Do's and Don'ts

### Do:
- **Do** keep one solid Action Blue button per view and demote the next action to tonal (Blue Wash with Deep Blue Ink text) or outline.
- **Do** colour scores by the fixed thresholds: 75 and above green, 60 to 74 amber, below 60 red.
- **Do** show feedback as the real thing: a timestamp, the user's sentence, the marked word, one fix.
- **Do** set every number that can change in tabular figures.
- **Do** keep pressable and typable controls at 44px or taller on phones, with a Control Line border when they are not filled.
- **Do** use Be Vietnam Pro for everything and leave body line height at 1.6 so stacked Vietnamese diacritics never collide.
- **Do** keep the phone tab bar at five destinations and reserve bottom padding so content clears it.
- **Do** ship an end state for every animation and honour reduced motion.

### Don't:
- **Don't** give goals, courses or features their own colours; category tiles stay Tile Grey.
- **Don't** use green, amber or red for decoration or emphasis that is not a score or a state.
- **Don't** add a second accent hue; the only saturated colour that is not a state is Action Blue.
- **Don't** put a shadow on a card at rest; shadow is for menus, modals, the report panel and hover lift.
- **Don't** nest cards inside cards; separate items with hairline rows or grey insets.
