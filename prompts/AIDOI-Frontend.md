## Plan: AIDOI Portal Frontend (Next.js + Tailwind + TypeScript)

**TL;DR:** Build a Next.js 14 (App Router) frontend inside `Frontend/` that connects to the Rust/Warp backend at `http://localhost:3000`. The app has two layout zones: (1) **Auth pages** (sign-in, sign-up, forgot/reset password) with a split-screen design — dark blue neural-network background on the left, white form on the right; and (2) **Dashboard pages** behind a persistent dark navy sidebar with four nav items. All API calls go through a centralized fetch client that attaches JWT tokens from cookies/localStorage. Design closely follows the attached mockups.

---

**Steps**

### Step 0 — Project Scaffolding

1. Initialize Next.js 14 project in `Frontend/` with App Router, TypeScript, Tailwind CSS, ESLint.
2. Install dependencies: `axios` (HTTP client), `react-hook-form` + `zod` (form validation), `zustand` (lightweight auth state), `lucide-react` (icons matching the sidebar icons), `js-cookie` (token storage), `clsx`/`tailwind-merge` (class utilities).
3. Copy `background-image-login.png` into `Frontend/public/images/` as the auth background asset.
4. Configure `tailwind.config.ts` with the AIDOI color palette extracted from designs:
   - **Navy sidebar:** `#1B2E4B` (dark navy blue)
   - **Primary blue button:** `#2563EB` (Tailwind `blue-600`)
   - **Gradient left:** `#38BDF8` → `#2563EB` (cyan-to-blue for "Add Institution" button)
   - **Gradient right:** `#6366F1` → `#8B5CF6` (indigo-to-purple for "Create AIDOI" button)
   - **Background:** `#F1F5F9` (Tailwind `slate-100`)
   - **Active green:** `#16A34A` for "Active" status text
5. Set up the `next.config.ts` to proxy `/api` calls to `http://localhost:3000` during development (via `rewrites`), avoiding CORS issues.

### Step 1 — API Client & Type Definitions

6. Create `Frontend/src/lib/api-client.ts` — Axios instance with base URL, interceptors to attach `Authorization: Bearer <token>` header from stored JWT, and response interceptor for 401 → redirect to `/sign-in`.
7. Create `Frontend/src/types/` with TypeScript interfaces mirroring all backend entities:
   - `auth.ts` — `LoginRequest`, `RegisterRequest`, `LoginResponse`, `User`, `Claims`
   - `organization.ts` — `Organization`, `CreateOrganizationDto`, `UpdateOrganizationDto`, `LegalStatus`, `Address`, `AidoiPrefix`, `PrefixStatus`
   - `aidoi.ts` — `Aidoi`, `CreateAidoiDto`, `UpdateAidoiDto`, `AidoiMetadata`, `AidoiAuthor`, `AidoiResourceType`, `AidoiStatus`, `ResearchStage`, etc.
   - `api-key.ts` — `ApiKey`, `CreateApiKeyDto`
   - `profile.ts` — `Profile`, `UpdateProfileDto`
   - `common.ts` — `ApiResponse<T>`, `PaginatedResponse<T>`, `PaginatedParams`
8. Create `Frontend/src/services/` with API service modules:
   - `auth.service.ts` — `login()`, `register()`, `logout()`, `forgotPassword()`, `resetPassword()`, `changePassword()`
   - `organization.service.ts` — `create()`, `getMany()`, `getById()`, `update()`, `delete()`
   - `aidoi.service.ts` — `create()`, `getMany()`, `getById()`, `update()`, `delete()`
   - `api-key.service.ts` — `create()`, `getMany()`, `delete()`
   - `profile.service.ts` — `getMyProfile()`, `update()`

### Step 2 — Auth State & Route Protection

9. Create `Frontend/src/store/auth-store.ts` (Zustand) to hold `user`, `token`, `isAuthenticated`, `login()`, `logout()` actions. Persist token to `localStorage`, read `x-auth-token` response header from login API.
10. Create `Frontend/src/middleware.ts` (Next.js middleware) to protect `/dashboard/**` routes — redirect to `/sign-in` if no token cookie exists.
11. Create `Frontend/src/components/providers/auth-provider.tsx` — client component that hydrates auth store on mount.

### Step 3 — Shared UI Components

12. Create reusable components in `Frontend/src/components/ui/`:
    - `Button` — variants: `primary` (blue filled), `outline` (bordered), `gradient` (for dashboard action buttons)
    - `Input` — labeled text input with error state, matching the light gray rounded inputs in designs
    - `Select` — labeled dropdown (for Institution Type, Object Type, Issuing Institution)
    - `Textarea` — labeled multiline input
    - `TagInput` — chip/tag input component with removable tags (for Keywords/Tags in AIDOI form)
    - `Table` — simple table with header row styling matching the "Recent AIDOIs" table
    - `Card` — white rounded card container
    - `Breadcrumb` — "Dashboard / Institutions / New" breadcrumb component
    - `StatusBadge` — colored badge for Active/Inactive/Deleted status
    - `Modal` — confirmation dialog (for delete actions)
    - `Toast` — success/error notification component

### Step 4 — Auth Layout & Pages

13. Create `Frontend/src/app/(auth)/layout.tsx` — the split-screen auth layout:
    - **Left half:** Full-height dark blue section using `background-image-login.png` as CSS background. Overlay with "AIDOI Portal" logo (top-left, white bold text), large centered "AIDOI" heading, and tagline "The Global Registry for AI Digital Objects. Secure your AI assets today."
    - **Right half:** Light gray/white background, vertically centered form slot.

14. Create `Frontend/src/app/(auth)/sign-in/page.tsx`:
    - Heading: "Log In to AIDOI Portal"
    - Fields: Work Email, Password
    - "Forgot Password?" link below password → `/forgot-password`
    - "Log In" full-width blue button
    - "New member? Create Account" link → `/sign-up`
    - On submit: call `authService.login()`, store JWT from `x-auth-token` response header, redirect to `/dashboard`

15. Create `Frontend/src/app/(auth)/sign-up/page.tsx`:
    - Heading: "Create your AIDOI Account"
    - Fields: Full Name (single input, split into `first_name`/`last_name` on submit), Work Email, Password, Confirm Password
    - "Create Account" full-width blue button
    - "Already a member? Log In" link → `/sign-in`
    - On submit: call `authService.register()`, show success message, redirect to `/sign-in`

16. Create `Frontend/src/app/(auth)/forgot-password/page.tsx`:
    - Same auth layout, form with email input and "Send Reset Link" button
    - Calls `POST /api/forgot-password`

17. Create `Frontend/src/app/(auth)/reset-password/page.tsx`:
    - Form: Email, Token (6-digit), New Password
    - Calls `POST /api/reset-password`

### Step 5 — Dashboard Layout

18. Create `Frontend/src/app/(dashboard)/layout.tsx` — the main authenticated layout:
    - **Left sidebar** (fixed, ~240px width, `bg-[#1B2E4B]` dark navy):
      - "AIDOI Portal" white branding at top ("AIDOI" bold, "Portal" normal weight)
      - Nav items with icons from `lucide-react`: Dashboard (`LayoutGrid`), My Institutions (`Building2`), Manage AIDOIs (`Link2`), Profile Settings (`Settings`)
      - Active item: highlighted with slightly lighter blue background + white text
      - Inactive items: white text with 70% opacity
    - **Top bar** (inside main content area): "Welcome back, {user.first_name} {user.last_name}", notification bell icon (with red dot indicator), user avatar circle (right-aligned)
    - **Content area:** `bg-slate-100` padding with `{children}` slot

19. Create `Frontend/src/components/layout/sidebar.tsx` — the sidebar with `usePathname()` for active state.
20. Create `Frontend/src/components/layout/top-bar.tsx` — the top bar with user greeting and avatar dropdown (logout action).

### Step 6 — Dashboard Page

21. Create `Frontend/src/app/(dashboard)/dashboard/page.tsx`:
    - **Account Status card:** White card with green checkmark icon, "Account Status: **Active**" (green text), "Verified Issuer" subtitle
    - **Two action buttons** side-by-side (responsive grid):
      - "Add New Institution +" — cyan-to-blue gradient, links to `/institutions/new`
      - "Create New AIDOI +" — blue-to-purple gradient, links to `/aidois/new`
    - **Recent AIDOIs table:** White card titled "Recent AIDOIs", table columns: AIDOI ID (`full_aidoi`), Object Name (`metadata.title`), Date Created (`created_at`), Status (`status` badge). Fetches latest 5 AIDOIs via `GET /aidoi?page=0&limit=5`.

### Step 7 — My Institutions Pages

22. Create `Frontend/src/app/(dashboard)/institutions/page.tsx` — **Institutions List**:
    - Breadcrumb: Dashboard / Institutions
    - "Add New Institution" button (top-right)
    - Table/cards listing user's organizations from `GET /organization`: columns for Name, Type, Website, Prefix, Status
    - Row actions: View, Edit, Delete (with confirmation modal)

23. Create `Frontend/src/app/(dashboard)/institutions/new/page.tsx` — **Add New Institution** (matches design exactly):
    - Breadcrumb: Dashboard / Institutions / New
    - Page title: "Add New Institution"
    - White card form:
      - Institution Name → maps to `legal_name` (and auto-derive `short_name` or add as second field)
      - Institution Type dropdown → maps to `legal_status` (options: University=`academic`, Corporate R&D=`forprofit`, Independent Lab=`other`, Government=`government`, Non-Profit=`nonprofit`, NGO=`ngo`)
      - Website URL → maps to `website`
      - Official Contact Email → stored client-side or as metadata (backend doesn't have this field directly — will note in form but not block submission)
      - Description / Notes → stored client-side for now
    - Address sub-fields (street, city, state, postal code, country) — add an expandable "Address" section since the backend requires it
    - Buttons: "Cancel" (outline, navigates back) and "Submit Institution for Review" (blue filled, calls `POST /organization`)

24. Create `Frontend/src/app/(dashboard)/institutions/[id]/page.tsx` — **View/Edit Institution** with pre-populated form, "Update" button calling `PUT /organization`.

### Step 8 — Manage AIDOIs Pages

25. Create `Frontend/src/app/(dashboard)/aidois/page.tsx` — **AIDOIs List**:
    - Breadcrumb: Dashboard / AIDOIs
    - "Create New AIDOI" button (top-right)
    - Table listing AIDOIs from `GET /aidoi`: columns for AIDOI ID, Object Name, Date Created, Status
    - Row actions: View, Edit, Delete

26. Create `Frontend/src/app/(dashboard)/aidois/new/page.tsx` — **Create New AIDOI** (matches design exactly):
    - Breadcrumb: Dashboard / AIDOIs / New
    - Page title: "Create New AIDOI (Digital Object Identifier)"
    - White card form:
      - AI Object Name → maps to `metadata.title` (placeholder: "e.g. GPT-4 Model Card")
      - Object Type dropdown → maps to `AidoiResourceType` (Model=`Software`, Dataset=`Dataset`, Paper=`JournalArticle`, Codebase=`Software`, Report, Image, Audio, Video, Other)
      - Current Version → maps to custom metadata field or `suffix` context
      - Issuing Institution dropdown → populated from `GET /organization` (user's orgs), maps to `organization_id`
      - **Metadata section:**
        - Abstract / Description → maps to `metadata.description`
        - Keywords/Tags → tag input component (stored as part of metadata or suffix context)
      - AI Transparency Scoring sections (B through F) — collapsed/accordion sections for the detailed `AIDOIMetadata` research stage fields (can be progressive disclosure)
    - Buttons: "Save Draft" (outline, creates with `status: Inactive`) and "Mint AIDOI" (blue filled, creates with `status: Active`, calls `POST /aidoi`)

27. Create `Frontend/src/app/(dashboard)/aidois/[id]/page.tsx` — **View/Edit AIDOI** with pre-populated form.

### Step 9 — Profile Settings Page

28. Create `Frontend/src/app/(dashboard)/profile/page.tsx`:
    - Display user info from JWT claims (first_name, last_name, email)
    - Organization association (from `GET /profile`)
    - Change Password form (old_pwd, new_pwd) calling `POST /api/change-pwd`
    - API Key management section: List API keys (`GET /api-key`), "Generate New API Key" button (`POST /api-key`), show generated key once in a copy-able modal, delete button per key

### Step 10 — Error Handling & Polish

29. Create `Frontend/src/components/ui/error-boundary.tsx` — React error boundary for graceful failures.
30. Create `Frontend/src/app/not-found.tsx` — custom 404 page.
31. Add loading skeletons (`loading.tsx` files) in each route segment for Suspense/streaming support.
32. Add form validation with Zod schemas matching backend constraints (email format, required fields, URL validation).
33. Add responsive design: sidebar collapses to hamburger menu on mobile, forms stack vertically.

---

**File Structure Summary**

```
Frontend/
├── public/images/background-login.png
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── sign-in/page.tsx
│   │   │   ├── sign-up/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── institutions/
│   │   │   │   ├── page.tsx (list)
│   │   │   │   ├── new/page.tsx (create form)
│   │   │   │   └── [id]/page.tsx (view/edit)
│   │   │   ├── aidois/
│   │   │   │   ├── page.tsx (list)
│   │   │   │   ├── new/page.tsx (create form)
│   │   │   │   └── [id]/page.tsx (view/edit)
│   │   │   └── profile/page.tsx
│   │   ├── layout.tsx (root)
│   │   ├── page.tsx (redirect to /dashboard or /sign-in)
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── layout/sidebar.tsx, top-bar.tsx
│   │   ├── providers/auth-provider.tsx
│   │   └── ui/button, input, select, textarea, tag-input, table, card, breadcrumb, status-badge, modal, toast
│   ├── lib/api-client.ts
│   ├── middleware.ts
│   ├── services/auth, organization, aidoi, api-key, profile
│   ├── store/auth-store.ts
│   └── types/auth, organization, aidoi, api-key, profile, common
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

**Verification**

1. `npm run build` — ensure zero TypeScript/lint errors
2. Start backend (`cargo run` in `Backend/AIDOI/`) on port 3000
3. Start frontend (`npm run dev` in `Frontend/`) on port 3001
4. Manual test flow: Sign Up → Sign In → Dashboard loads with user name → Add Institution → Create AIDOI (selecting the institution) → View in table → Profile Settings → Change Password → Generate API Key → Logout
5. Verify all API calls hit correct endpoints by checking browser Network tab
6. Verify protected routes redirect to sign-in when no token is present

**Decisions**

- **Next.js App Router** over Pages Router — better layout nesting for the auth vs dashboard split, built-in loading/error states
- **Zustand** over React Context for auth — simpler API, persist middleware, no provider hell
- **Axios** over native fetch — interceptors for auth header injection and 401 handling
- **Form field mapping:** The design's "Full Name" single field will be split into `first_name`/`last_name` (by first space) to match `POST /api/register`. The design's "Official Contact Email" and "Description/Notes" on institution form don't have direct backend fields — they'll be included in the UI but noted as frontend-only until backend support is added.
- **Address fields:** The backend requires `address` on organization creation but the design doesn't show address fields — an expandable "Address" section will be added below the main form fields.
- **API proxy:** `next.config.ts` rewrites `/api/**` → `http://localhost:3000/api/**` to avoid CORS in development.
- **JWT storage:** `localStorage` + cookie (for middleware SSR check) — the backend returns the JWT in the `x-auth-token` response header.
