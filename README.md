# Roamies

**The anti-swipe travel app. Designed to be closed once you book your trip.**

Roamies helps solo backpackers, budget trekkers and remote workers find travel buddies on the Himachal and Uttarakhand circuits and the Goa hostel belt. You can't swipe. You connect by commenting on someone's itinerary or one of their prompt answers.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router) + Tailwind CSS v4, mobile-first (`max-w-md` app frame) |
| Auth | Supabase Auth (Google OAuth, phone OTP) via `@supabase/ssr` |
| Database | Supabase Postgres + PostGIS |
| Realtime | Supabase Realtime (`postgres_changes` on `messages`, `interactions`) |
| Hosting | Vercel |

## Data model

The design borrows from Hinge's client data model, which I studied through the unofficial [hinge-ts](https://github.com/wrsrsh/hinge-ts) SDK. It is a reference only. Roamies does not call Hinge in any way.

| Hinge concept | Roamies table / rule |
|---|---|
| Fixed prompt catalog | `prompts` (admin-curated), `user_prompts` (exactly 2 per user) |
| Rate a specific piece of content | `interactions.target_type` = `itinerary` or `prompt`, plus a required `intro_message` |
| Skip | `skips` (skipped travellers never come back in the feed) |
| Daily like limit | Trigger caps intros at 8 per day (IST) |
| Like, then connection, then chat channel | Accepting an interaction auto-creates a `matches` row; `messages` hang off the match |
| Preferences, max distance | `get_feed(radius_km, slack_days)` uses PostGIS `ST_DWithin` and date overlap |

```
profiles ─┬─< itineraries >── places (PostGIS point)
          ├─< user_prompts >── prompts
          ├─< interactions ──> (itinerary | user_prompt) of receiver
          │        └── accepted ──> matches ─< messages
          └─< skips
```

### Security (enforced in the database, not the UI)

- Row Level Security is on for every table.
- Users cannot set their own `verification_status` (column-level grants).
- A receiver can change an interaction's `status` and nothing else, and only once.
- The liked content must belong to the receiver (trigger).
- Only the two members of a match can read or post its messages.
- No Aadhaar number or image is stored, only the verification outcome and a last-4.

## Demo mode

Open `/demo` (or tap "look around first" on the landing page) to click through the whole app with sample travellers. It needs no Supabase project and no login. Sending intros, skipping, accepting and adding trips all work; the state lives in a cookie on your browser, and **Reset** in the banner starts over. The demo renders the same view components as the real app (`src/components/views/`), only the data and actions differ (`src/lib/demo/`, `src/app/demo/actions.ts`).

## Getting started

1. Create a free Supabase project.
2. In the SQL editor, run every file in `supabase/migrations/` in filename order, then `supabase/seed.sql` (safe to re-run).
3. Auth > Providers: enable **Google** (add the Google client ID and secret). Phone OTP needs an SMS provider such as Twilio, which is paid, so Google is the free default.
4. Auth > URL Configuration: add `http://localhost:3000/auth/callback` (and your Vercel URL later) to redirect URLs.
5. Copy `.env.example` to `.env.local` and fill in the URL and publishable key.
6. Install and run:

```bash
npm install
npm run dev
```

## Roadmap

- [x] **Week 1:** shell, auth, schema with RLS, PostGIS feed function
- [x] **Week 2:** atomic onboarding RPC (2 prompts + first trip), feed with radius filter, comment-to-connect on a trip or prompt, skip, intros inbox (accept/decline), trips page. UI is deliberately unstyled until the final design lands.
- [x] **Week 3 (part 1):** planning room chat at `/matches/[id]` with the matched trip or prompt pinned on top, live via Supabase Realtime (`postgres_changes`, RLS-scoped), plus a demo room
- [x] **Launch prep:** report/block, delete account, privacy + terms pages, email alerts (Resend, opt-out in Account), 169 places across India with a searchable picker, verified badge hidden until real verification exists
- [x] **Brand + launch gaps:** Meeting-pins logo (favicon, PWA icons, link preview, 600ms match moment), 253 places with treks/beaches/spots, trips already under way, wider-net feed when nobody is nearby, unread chats, share/QR page, feedback, edit profile, "You sent" list; deleting a trip or prompt no longer deletes chats
- [ ] **Week 3 (part 2):** ID verification
- [ ] **Week 4:** Vercel deploy, custom domain, alpha launch
