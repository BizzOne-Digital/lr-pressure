# LR Pressure Washing — Website + Admin CMS

A production website for LR Pressure Washing (Philadelphia, PA) with a full custom admin CMS.
Built with Next.js 16 (App Router, TypeScript), Tailwind CSS v4, and MongoDB (Mongoose + GridFS)
as the sole data store. There is no hardcoded content, no local-filesystem uploads, and no
localStorage/JSON-file "CMS" — every editable piece of the public site is read live from MongoDB
on every request.

## What was implemented

**Public site** — Home, About, Services (index + individual service pages), Contact, Our Team,
Privacy Policy, Terms. Fully responsive (320px–1440px+), keyboard-accessible, semantic HTML,
`prefers-reduced-motion`-aware. Homepage includes hero, trust/benefit strip, services preview,
before/after section, "why choose us," process steps, a categorized project gallery, testimonials,
service-area note, and a closing CTA — all editable from the admin.

**Lead generation** — A quote-request form (name, phone, email, address, service, preferred date,
message, optional photo) with client + server validation, an invisible honeypot field for spam
bots (fails silently with a fake success response so bots don't learn they were caught), and
per-IP rate limiting. Every submission is stored in MongoDB and shows up in the admin Leads inbox
immediately.

**Admin CMS** (`/admin`) — Real backend, not a mock:
- Email/password login, bcrypt-hashed passwords, HTTP-only signed session cookies (JWT via `jose`,
  8-hour expiry), server-side route protection via `middleware.ts`.
- Site Settings (business name, phone, email, address, social links, logo).
- Navigation editor (labels, links, order, show/hide).
- Homepage, About, Contact page section editors (hero copy, benefits, process steps, etc.) plus
  per-page SEO (title, meta description, OG tags, canonical URL).
- Services — full CRUD, icon picker, image upload, featured flag, active/inactive, reorder.
- Team — full CRUD, photo upload, social links, active/inactive.
- Gallery — full CRUD, categories, featured flag, active/inactive.
- Testimonials — full CRUD, star rating, optional photo, explicit "placeholder" flag so nothing
  fabricated is ever presented as a real review without being labeled.
- Leads inbox — search, filter by status, sort, status workflow (New → Contacted → Quote Sent →
  Scheduled → Completed/Cancelled), internal notes, delete.
- Every image anywhere in the admin uploads through one reusable drag-and-drop component
  (progress bar, client + server validation for type/size) straight into MongoDB GridFS — nothing
  is ever written to `/public` or the server's local disk.

**SEO** — Per-page editable title/description/OG/canonical, `LocalBusiness` JSON-LD structured
data built only from fields the admin has actually filled in (no invented certifications, years in
business, or service areas).

## Data models (MongoDB via Mongoose)

| Model | Purpose |
|---|---|
| `Admin` | Admin user accounts (email, bcrypt password hash, name, last login). |
| `SiteSettings` | Singleton: business name, phone, email, address, social links, logo media ref. |
| `Navigation` | Singleton: header nav items (label, href, order, visible). |
| `Page` | One document per page (`home`, `about`, `services`, `contact`, `team`); `content` is a validated JSON blob (schema depends on `pageKey`) plus a shared `seo` sub-document. This is what makes every page's sections and SEO editable without a model per page. |
| `Service` | Services shown on the homepage and `/services` (name, slug, descriptions, icon, image, featured, order, active). |
| `TeamMember` | Our Team profiles (name, role, bio, photo, social links, active, order). |
| `GalleryItem` | Project photos (title, caption, category, image, featured, order, active). |
| `Testimonial` | Customer reviews (name, text, rating, photo, `isPlaceholder` flag, featured, active). |
| `Lead` | Quote-request submissions (contact info, service, message, optional photo, status, internal notes[], timestamps). |
| `Media` | Metadata for every uploaded image (filename, MIME type, size, dimensions, alt text) plus a `gridfsId` pointing at the actual binary in GridFS. Every `imageMediaId`/`photoMediaId` field elsewhere in the app stores a `Media` document's own `_id` — the API resolves that to the GridFS file internally, so nothing outside `/api/media/[id]` needs to know GridFS exists. |

Binary image data itself lives in a GridFS bucket (`media`) inside the same MongoDB database — not
on disk.

## API routes

Public:
- `POST /api/leads` — submit a quote request (multipart form, optional image). Honeypot + rate
  limited.
- `GET /api/media/:id` — streams an uploaded image's binary (long-lived cache headers).

Admin (all require a valid session cookie; enforced in `middleware.ts`):
- `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/session`
- `GET /api/admin/dashboard` — summary stats for the dashboard home.
- `GET/POST /api/admin/services`, `PUT/DELETE /api/admin/services/:id`
- `GET/POST /api/admin/team`, `PUT/DELETE /api/admin/team/:id`
- `GET/POST /api/admin/gallery`, `PUT/DELETE /api/admin/gallery/:id`
- `GET/POST /api/admin/testimonials`, `PUT/DELETE /api/admin/testimonials/:id`
- `GET/PATCH/DELETE /api/admin/leads/:id`, `GET /api/admin/leads`
- `GET/PUT /api/admin/settings`
- `GET/PUT /api/admin/navigation`
- `GET/PUT /api/admin/pages/:key` — content + SEO for `home`/`about`/`services`/`contact`/`team`
- `GET/POST /api/admin/media`, `DELETE /api/admin/media/:id` — upload/list/delete images (GridFS)

## Environment variables

See `.env.example` for the full list with explanations. Summary:

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | Yes | Your MongoDB connection string (local or Atlas). Nothing runs without this. |
| `ADMIN_EMAIL` | Only for seeding | Email for the first admin account created by `npm run seed`. |
| `ADMIN_PASSWORD` | No | If left blank, the seed script generates and prints a secure random password once. |
| `SESSION_SECRET` | Yes | Long random string used to sign admin session cookies. |

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in MONGODB_URI and SESSION_SECRET
npm run seed                 # creates the first admin account + starter content (see below)
npm run dev                  # http://localhost:3000
```

For a production build:

```bash
npm run build
npm run start
```

## Creating the first admin account

The admin account is created by the seed script, not by hand or via any UI (there is intentionally
no public admin-signup page). With `.env.local` filled in:

```bash
npm run seed
```

If `ADMIN_PASSWORD` is not set in `.env.local`, the script generates a secure random password and
prints it to the terminal **once** — copy it immediately, it is not shown again and is not
recoverable (only its bcrypt hash is stored). Log in at `/admin/login` with `ADMIN_EMAIL` and that
password, then change it by creating a fresh admin (there is currently no self-service "change
password" flow — see Remaining Items below).

Running `npm run seed` again is safe: it checks for existing data before creating anything, so it
will not duplicate the admin account or content.

## Seeding initial content

The same `npm run seed` command also seeds:

- Default site settings (business name, phone, email from the project brief)
- Default navigation (Home / About / Services / Our Team / Contact)
- 7 starter services (House Washing, Driveway Cleaning, Window Cleaning, Roof Cleaning, Exterior
  Surface Cleaning, Concrete Cleaning, Patio/Walkway Cleaning) with real, license-clean stock
  photography (see `seed-assets/CREDITS.md` for attribution)
- 3 clearly-labeled **placeholder** team member profiles (no real names/photos invented)
- 8 categorized gallery images
- 3 clearly-labeled **placeholder** testimonials (`isPlaceholder: true` — never presented as real
  reviews; replace with genuine customer feedback in the admin as it comes in)
- Starter homepage/about/services/contact/team section content and SEO metadata

Everything seeded is fully editable (and deletable) from the admin — the seed script is a
starting point, not a fixed data source.

## Remaining items that need client-provided information

These were intentionally left as placeholders or omitted rather than invented, per the project
brief:

- **Production MongoDB URI** — currently only a local placeholder; needs a real MongoDB Atlas (or
  equivalent) connection string before deploying.
- **Real team member names, roles, bios, and photos** — currently 3 generic placeholder profiles.
- **Real customer testimonials** — currently 3 clearly labeled placeholder reviews; add genuine
  reviews via the admin as they come in.
- **Service area / cities served** — not stated anywhere on the site since no specific list of
  cities was provided; add this copy via the admin once confirmed.
- **Certifications, awards, insurance/licensing details, "years in business," and customer counts**
  — none of these were invented; if Luis wants any of these claims on the site, add them via the
  relevant page editor once they're confirmed accurate.
- **Business address** (if it should be public) — currently only phone/email are shown.
- **Logo file** — Site Settings supports an uploaded logo; the header currently falls back to a
  text wordmark until one is uploaded.
- **Admin password rotation** — there is no self-service "change password" screen yet; rotating
  credentials currently requires creating a new admin (via a short script or direct DB update).
  Worth adding before handing full day-to-day control to non-technical staff.
- **Custom domain / hosting** — this repo is framework-agnostic Next.js and deploys cleanly to
  Vercel or any Node host; DNS/domain setup is a separate step.

## A few implementation notes worth knowing

- The public site renders with `export const dynamic = "force-dynamic"` on the `(site)` layout —
  this is deliberate. Admin edits must appear on the live site immediately without a rebuild/
  redeploy, so these pages are never statically frozen at build time.
- Image uploads always go through `/api/admin/media` → GridFS. Nothing is ever written to
  `/public/uploads` or elsewhere on local disk, so the site works the same on any host (including
  stateless/serverless ones where local disk writes wouldn't persist anyway).
- CRUD "partial update" endpoints (Services/Team/Gallery/Testimonials `PUT`) only touch the fields
  actually sent in the request — this matters for features like the Services reorder buttons,
  which intentionally send only `{ order }`.
