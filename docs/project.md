# Free Health Finder – Project Overview

## 1 Mission
Provide immigrants, low‑income families, and other underserved groups with a **streamlined, bilingual web app** that lets them discover genuinely **free local health services** (dental, primary care, screenings, etc.) drawn from our nationwide Cosmos DB dataset.

## 2 High‑Level Goals
| # | Goal | Success Metric |
|---|------|----------------|
| G1 | <15 s from homepage load to first set of nearby clinics | 90th‑percentile latency in Sentry |
| G2 | AA WCAG compliance | Axe & Lighthouse scores ≥ 90 |
| G3 | Spanish language parity on day 1 | Complete message keys → ★ done checklist |
| G4 | Mobile‑first usability | 95 % sessions ≤ 768 px complete query |

## 3 Tech Stack
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Front end | **Next 15 + React 19 + Tailwind 4** | App Router streaming, latest React features, utility CSS for rapid iteration |
| Back end (server actions) | Next 15 RSCs + Route Handlers | Keeps code in one repo; edge‑deployable |
| Data | **Azure Cosmos DB for MongoDB vCore** | Geospatial queries via `$near`; sponsorship credit |
| Geo API | **Azure Maps Search/Geocode** | Same cloud, batch geocoding, generous free tier |
| i18n | **next‑intl** | RSC‑safe, small bundle |
| State mgmt | React hooks + cached fetch | Simplicity – no Redux |
| Offline cache | **Dexie + IndexedDB** | Progressive enhancement, low–end devices |

## 4 Data Model (simplified)
```jsonc
{
  _id: ObjectId,
  Name: "College Park Dental",
  Address: "7305 Baltimore Ave #204, College Park, MD 20740",
  Category: "Dentist",
  free_services: [ { service, description, limitations, found_on_page } ],
  location: { type: "Point", coordinates: [ -76.9327, 38.9807 ] },
  Rating: "4.6"
}
```
*All collections share the same shape.*

## 5 Core Backend APIs (Route Handlers)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/nearby` | GET | Return up to 20 providers sorted by distance. Query params: `lat`, `lng`, `km?`, `service?` |
| `/api/categories` | GET | Distinct list of service categories for filter UI |
| `/api/translate` | POST | Proxy to Azure Translator (fallback for dynamic text) |

## 6 UI / UX Principles
* **High‑contrast colour palette** – #0F172A (slate 900) on #FFFFFF with Tailwind dark mode.
* **Large tap targets** (min‑height 48 px).
* **Plain‑language labels**; avoid jargon.
* **Language switcher** fixed top‑right (`EN / ES`).
* **Single‑field address entry** (Azure Maps Autocomplete) ⇒ results list **and** optional mini‑map.
* **Results card** shows:
  * Provider name (bold, lg)
  * Distance badge (rounded pill)
  * Free service names (comma‑separated, truncate after 2 + “+ n more”)

## 7 Security & Compliance
* Store secrets in Vercel / GitHub Actions — never commit keys.
* Restrict public Azure Maps key by HTTP referrer.
* Validate & sanitise all query params.

## 8 MVP Roadmap (10 weeks)
| Week | Milestone |
|------|-----------|
| 1 | Repo scaffolding, Tailwind config, env setup |
| 2 | Cosmos helper + `/api/nearby` with mock data |
| 3 | AddressPicker component; first page renders static list |
| 4 | Real Mongo query + live distance filter |
| 5 | Spanish translations & locale switch |
| 6 | Accessibility sweep (keyboard, aria, contrast) |
| 7 | Mobile optimisation & Dexie offline cache |
| 8 | Basic CI/CD to Vercel, preview builds |
| 9 | Lighthouse & Axe pass; performance tuning |
| 10 | Launch & gather user feedback |

---
**Version:** 2025‑07‑01 / Author = ChatGPT

