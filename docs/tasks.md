# Task Backlog – Free Health Finder

> **Legend** ▪ 🟢 = good first issue  ▪ ⚡ = time‑critical  ▪ 📐 = design needed  ▪ 👩‍🔧 = backend  ▪ 🎨 = frontend  ▪ 🔁 = recurring

| ID | Priority | Label(s) | Description | Acceptance Criteria |
|----|----------|----------|-------------|---------------------|
| T‑01 | P0 ⚡ | 👩‍🔧 | **/api/nearby route handler** – query Cosmos `$near` & return provider list (max 20). | Returns 200 JSON array ≤ 200 ms in local dev; unit test passes. |
| T‑02 | P0 ⚡ | 🎨 | **AddressPicker client component** using Azure Maps Autocomplete. | Emits correct `lat,lng` on selection; a11y label present. |
| T‑03 | P1 | 👩‍🔧 | **Env validation util** – throw at boot if required vars missing. | Jest test asserts error when var absent. |
| T‑04 | P1 | 🎨 | **ResultsCard component** with high‑contrast Tailwind styles. | Mobile ≤ 375 px renders without horizontal scroll; Axe shows 0 violations. |
| T‑05 | P2 | 🟢 🎨 | Replace default Next banner with minimal hero + "Enter your address" CTA. | Page LCP ≤ 2.5 s on Moto G4 in Lighthouse. |
| T‑06 | P2 | 👩‍🔧 | **categories endpoint** (`/api/categories`) for filter dropdown. | Returns unique list; cached 1 hour. |
| T‑07 | P2 📐 | 🎨 | **LanguageSwitcher** component integrating `next‑intl`. | Toggles between `en` and `es`, URL locale updates, no full reload. |
| T‑09 | P3 | 🎨 | Add mini static map (Azure Maps Web Control) under results list. | Shows pins of first 5 results; lazy‑loads sdk. |
| T‑10 | P3 | 🟢 👩‍🔧 | Unit test: `/api/nearby` returns only docs with `free_services`. | Test passes with Mongo‑Memory‑Server. |
| T‑11 | P4 | 📐🎨 | Design polish – card hover, focus outlines, dark‑mode palette. | Meets design tokens in PROJECT.md. |
| T‑12 | P4 | 🔁👩‍🔧 | Lighthouse & Axe audits in CI on PRs. | Failing scores block merge (<90). |

## Epic 1 – Data plumbing (owner = backend dev)
1. T‑01  → T‑03  → T‑06 
2. Hook up telemetry (Sentry perf traces).

## Epic 2 – Core UX (owner = frontend dev)
1. T‑02  → T‑04  → T‑05  → T‑07  → T‑09 → T‑11

## Epic 3 – Quality + Ops (owner = DevOps)
1. T‑08  → T‑10  → T‑12

---
### How to pick up a task
1. Create a new branch `feature/<task‑id>‑<slug>` from `main`.
2. Check *PROJECT.md* for architecture guidance.
3. Commit small; open a draft PR early for CI.
4. When done, add **Closes #ID** in commit message.

---
**Updated:** 2025‑07‑01 15:30 ET

