# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone in Vietnam who has to speak in front of others and wants to get better at it (confirmed by the owner as "all", no single lead segment):

- university students: group presentations, thesis defence;
- job seekers and working people: interviews, reporting to managers, work presentations;
- founders and sales people: pitching;
- debaters.

They practise alone, on a laptop or phone, often shortly before a real talk. Many are nervous about speaking and price-sensitive.

## Product Purpose

luyenthuyettrinh.com is an AI presentation coach. The user records or uploads a talk (audio, video or a written script); the product transcribes it, scores it and returns a report that points to the exact sentence and second to fix, then recommends lessons and a learning path. Success is a user who practises again and sees their score move.

## Positioning

Feedback tied to the exact moment in the user's own talk (transcript line, timestamp, pace, filler words, eye contact), in Vietnamese and English, for five speaking formats, each with its own AI listener who asks follow-up questions.

## Operating Context

- Five formats (goals): presentation, reporting, interview, pitching, debating.
- Three ways to submit: live recording (audio, or video on Premium), file upload, written script.
- Seven scoring criteria; pass score for a lesson is 60.
- Flow: landing, guest onboarding (interface language, goal, speech language, preview), sign-up, 60-second placement test, dashboard, practice set-up, record/upload/script, analysing, report, library, progress, courses and lessons, pricing, account.
- Interface in Vietnamese and English (switch in the header); speech analysed in Vietnamese or English.

## Capabilities and Constraints

- Front end is a static single-page app: plain HTML, one stylesheet (`css/app.css`), vanilla JS views rendered as template strings, hash routing, localStorage as the demo store. `build.sh` wraps it for Netlify. No framework, no build step.
- A separate Next.js + Supabase backend exists in `../luyenthuyettrinh-app`; it is not part of the visual work here.
- Plans: Free (3 analyses a month, 5 minutes analysed, no video) and Premium (50 a month, 30 minutes, video, live coaching, AI audience Q&A, error timeline, 4-week plan). Prices and limits live in `js/config.js` and are marked "needs confirmation" by the owner; never restate them elsewhere.
- Contact details in `js/config.js` are placeholders awaiting confirmation.

## Brand Commitments

- Name: luyenthuyettrinh.com (always lower-case, with the .com).
- Existing Vietnamese and English copy is kept as written (owner decision, 2026-11-10).
- Existing screens, routes and step order are kept (owner decision, 2026-11-10).
- Colours, typeface, logo mark and photographs are NOT commitments; the owner left them open to change.
- Standing visual preference (owner decision, 2026-11-10, replaces the earlier white learning-platform look): dark indigo site in the manner of elsaspeak.com: gradient pill buttons, gradient-highlighted words in headings, purple-tinted bordered cards, light footer. Own logo, copy and content; no borrowed ELSA assets or claims.

## Evidence on Hand

- Six photographs in `img/` (hero, stage, pitch, interview, mic, report).
- Sample report, sample transcripts and course content in `js/data.js` (demonstration data).
- Site flow diagram in `flow/`.
- No testimonials, user counts, press, partner logos or success statistics exist. Do not invent any.

## Product Principles

1. Show the feedback, not a promise of it: the report is the product.
2. Private practice first: nobody is watching, mistakes are safe.
3. One obvious next step on every screen.
4. Works as well on a phone as on a laptop.
5. Must look serious enough to pay for.

## Accessibility & Inclusion

Vietnamese text with stacked diacritics must render cleanly at every size (typeface needs full Vietnamese coverage and enough line height). Keyboard focus visible; reduced motion respected.
