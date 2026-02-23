## Plan: Super Admin Dashboard

**TL;DR:** Add a separate `/admin` route group with its own sidebar and layout, providing 5 tabs: Dashboard/Stats, Organizations, Pending Requests, Users, and Organization Admins. The admin dashboard uses **existing backend endpoints** (`GET /api/user`, `PUT /api/user`, `DELETE /api/user`, `GET /api/organization`, `GET /api/aidoi`) — all of which already return full data for users with `Admin` role. Stats are computed client-side from paginated responses. "Pending org admin requests" = users with `role: authenticated` who a super admin can promote to `OrgAdmin` via `PUT /api/user`. Route protection is enforced both in Next.js middleware (checking role from JWT) and by the backend's `admin_middleware`.

---

### Step 1 — Types & Service Layer

1. Add admin-specific types in a new `Frontend/src/types/admin.ts`:
   - `AdminUser` — mirrors the backend `UserResponseDto` shape: `id`, `email`, `first_name`, `last_name`, `verified`, `role` (`UserRole`), `banned`, `is_logged_out`, `reset_pwd_count`, `activation_count`
   - `UpdateUserRoleDto` — `{ id: string; role: UserRole }`
   - `AdminStats` — computed type: `totalAidois`, `totalOrganizations`, `totalUsers`, `topOrganizationsByAidois`, `recentUsers`, etc.
   - Re-export from `Frontend/src/types/index.ts`

2. Create `Frontend/src/services/admin.service.ts` with methods:
   - `getUsers(page, limit)` → `GET /api/user?page=X&limit=Y` — returns `PaginatedResponse<AdminUser>`
   - `getUserById(id)` → `GET /api/user/:id`
   - `updateUser(dto)` → `PUT /api/user` — body: `{ id, role?, verified?, banned? }`
   - `deleteUser(id)` → `DELETE /api/user` — body: `{ user_id: id }`
   - `getAllOrganizations(page, limit)` → `GET /api/organization?page=X&limit=Y` — admin sees all
   - `getAllAidois(page, limit)` → `GET /api/aidoi?page=X&limit=Y` — admin sees all
   - `getStats()` → fetches users (limit=0 for total count), orgs, aidois, then computes stats client-side from `total` fields and record data
   - Re-export from `Frontend/src/services/index.ts`

### Step 2 — Route Protection

3. Update `Frontend/src/middleware.ts`:
   - Add `/admin` to the protected routes matcher
   - For `/admin/*` paths, decode the JWT from cookie (base64-decode the payload segment), check `user_role` is `"admin"` — if not, redirect to `/dashboard`
   - This is a lightweight client-side check; the backend enforces actual admin authorization via `admin_middleware`

4. Add a helper function `isAdminRole(role: UserRole): boolean` in `Frontend/src/lib/utils.ts` that returns `true` when `role.admin === true`

### Step 3 — Admin Layout & Navigation

5. Create route group `Frontend/src/app/(admin)/` with its own `layout.tsx`:
   - Same structural pattern as `(dashboard)/layout.tsx` — sidebar + top bar + content area
   - Uses a dedicated `AdminSidebar` component with admin-specific nav items
   - Uses the existing `TopBar` component (reused)
   - Wraps children in a client-side admin role guard that redirects non-admins

6. Create `Frontend/src/components/layout/admin-sidebar.tsx`:
   - Same visual style as `sidebar.tsx` (navy bg, AIDOI Portal branding)
   - Nav items with `lucide-react` icons:
     - **Overview** (`LayoutGrid`) → `/admin`
     - **Organizations** (`Building2`) → `/admin/organizations`
     - **Pending Requests** (`Clock`) → `/admin/pending`
     - **Users** (`Users`) → `/admin/users`
     - **Org Admins** (`UserCog`) → `/admin/org-admins`
     - **Stats** (`BarChart3`) → `/admin/stats`
   - A "Back to Portal" link at the bottom → `/dashboard`

7. Add a conditional admin link in `sidebar.tsx` — if user role is `admin`, show an "Admin Panel" nav item (`Shield` icon) → `/admin`

### Step 4 — Admin Overview Page

8. Create `Frontend/src/app/(admin)/admin/page.tsx`:
   - Summary cards in a grid: Total Users, Total Organizations, Total AIDOIs, Pending Approvals (count of users with `role: authenticated`)
   - Quick-action buttons: "View Pending Requests", "Manage Users"
   - Recent activity table: latest 5 users (from `GET /api/user?page=0&limit=5`)
   - Uses existing `Card`, `StatusBadge` UI components

### Step 5 — Organizations Management Page

9. Create `Frontend/src/app/(admin)/admin/organizations/page.tsx`:
   - Table listing ALL organizations from `GET /api/organization` (admin gets all)
   - Columns: Name (`legal_name`), Type (`legal_status`), Website, Prefix (`prefix.value`), Status (`prefix.status`), Admin ID, Created At
   - Row actions: View details, Delete (with confirmation `Modal`)
   - Pagination controls using `has_next`, `current_page`, `total` from response
   - Search/filter input that filters client-side by organization name

10. Create `Frontend/src/app/(admin)/admin/organizations/[id]/page.tsx`:
    - Detail view of a single organization (fetched via `GET /api/organization/:id`)
    - Shows all org fields, associated admin info, prefix details
    - Admin can update org status (prefix status) via `PUT /api/organization`

### Step 6 — Pending Requests Page

11. Create `Frontend/src/app/(admin)/admin/pending/page.tsx`:
    - Fetches all users via `GET /api/user`
    - Filters client-side: users where `role === "authenticated"` AND `verified === true` (these are verified users not yet promoted to OrgAdmin)
    - Table columns: Name, Email, Registered Date, Verified status, Actions
    - **Approve** button: calls `PUT /api/user` with `{ id: userId, role: { other: "OrgAdmin" } }` — promotes user to OrgAdmin
    - **Reject/Ban** button: calls `PUT /api/user` with `{ id: userId, banned: true }`
    - Confirmation modal before approve/reject actions
    - Count badge on sidebar nav item showing pending count

### Step 7 — Users Management Page

12. Create `Frontend/src/app/(admin)/admin/users/page.tsx`:
    - Full paginated table of ALL users from `GET /api/user`
    - Columns: Name, Email, Role (displayed as badge), Verified, Banned, Logged Out, Actions
    - Actions per row: Edit Role, Ban/Unban, Delete (with modal)
    - Role editing: inline dropdown/modal to change role to `Admin`, `Authenticated`, or `Other("OrgAdmin")` — calls `PUT /api/user`
    - Filter tabs: All / Admins / OrgAdmins / Regular Users — client-side filtering by role
    - Pagination controls

13. Create `Frontend/src/app/(admin)/admin/users/[id]/page.tsx`:
    - Detail view of a single user (via `GET /api/user/:id`)
    - Edit form for user fields (name, email, role, verified, banned)
    - Shows user's associated profile and organization (if any)

### Step 8 — Org Admins Management Page

14. Create `Frontend/src/app/(admin)/admin/org-admins/page.tsx`:
    - Fetches all users, filters to `role.other === "OrgAdmin"` client-side
    - Table columns: Name, Email, Organization (looked up by cross-referencing org's `admin_id`), Prefix, Org Status, Actions
    - Actions: View organization, Demote (set role back to `authenticated`), Ban
    - Shows organization details inline or via expand row

### Step 9 — Stats Page

15. Create `Frontend/src/app/(admin)/admin/stats/page.tsx`:
    - Fetches data from 3 sources: `GET /api/user?limit=0`, `GET /api/organization?limit=0`, `GET /api/aidoi?limit=0` (limit=0 with `total` gives full counts; then fetch enough records for aggregations)
    - **Stat cards**: Total AIDOIs, Total Organizations, Total Users, Active AIDOIs, Active Organizations
    - **Top Organizations by AIDOIs**: fetch all AIDOIs, group by `organization_id`, count, sort descending; display as a ranked list or simple bar visualization using CSS/Tailwind (no chart library needed)
    - **AIDOIs by Status**: count by `active`/`inactive`/`deleted` — display as color-coded cards
    - **AIDOIs by Resource Type**: group by `metadata.resource_type` — display as categorized count cards
    - **Users by Role**: count by role type — display as cards
    - **Recent Activity**: latest 10 AIDOIs and Organizations by `created_at`
    - All computed client-side from fetched records

### Step 10 — Shared Admin Components

16. Create reusable admin components in `Frontend/src/components/admin/`:
    - `RoleBadge` — colored badge displaying user role (Admin=red, OrgAdmin=blue, Authenticated=gray)
    - `AdminStatCard` — card with icon, label, count, and optional trend indicator
    - `DataTable` — enhanced table with pagination controls, sorting, and optional search filtering (extends existing table pattern)
    - `ConfirmAction` — modal wrapper for destructive admin actions (approve, ban, delete, demote)
    - `UserRoleSelect` — dropdown for selecting user roles during editing

### Step 11 — Integration & Polish

17. Update `Frontend/src/types/auth.ts`:
    - Ensure `UserRole` interface covers all backend variants: `admin?: boolean`, `authenticated?: boolean`, `other?: string`
    - Add `UserResponseDto` type matching the full backend response (includes `verified`, `banned`, `is_logged_out`, etc.)

18. Update `Frontend/src/store/auth-store.ts`:
    - Add an `isAdmin` computed getter that checks `user.role.admin === true`

19. Add loading states (`loading.tsx`) for each admin route segment for Suspense support

20. Add error handling for all admin API calls — show toast on failure, handle 403 (Forbidden) gracefully

---

## Verification

1. Login as admin user (`admin@mail.com` / `1Abc@2De` per API docs)
2. Verify `/admin` routes are accessible and non-admin users are redirected to `/dashboard`
3. Test user management: list users, change a user's role to OrgAdmin, verify the change persists
4. Test pending requests: filter authenticated users, approve one, verify role changes
5. Test organization listing: verify admin sees ALL organizations (not just their own)
6. Test stats page: verify counts match data returned by individual endpoints
7. Verify existing dashboard at `/dashboard` still works for non-admin users
8. Verify the "Admin Panel" link in sidebar only appears for admin users

---

## Key Decisions

- **Frontend-only**: No backend changes — leveraging existing `GET /user`, `PUT /user`, `GET /organization`, `GET /aidoi` endpoints which already support admin access
- **Pending = Authenticated users**: "Pending org admin requests" are implemented as verified users with `role: authenticated` who can be promoted to `OrgAdmin` — no new backend field needed
- **Client-side stats**: Stats computed from fetched paginated data rather than a dedicated backend endpoint
- **Separate route group**: Admin dashboard lives under `/admin/*` with its own layout and sidebar, fully isolated from the regular user dashboard
- **Role in JWT**: Admin route protection in middleware checks the JWT payload's `user_role` field; backend enforces actual authorization

---

## Backend API Reference (Existing Endpoints Used)

| Method | Path | Auth | Admin Behavior |
|--------|------|------|----------------|
| `GET` | `/api/user` | Bearer JWT | Returns all users (paginated) |
| `GET` | `/api/user/:id` | Bearer JWT | Returns single user |
| `PUT` | `/api/user` | Bearer JWT + owner_or_admin | Can set `role`, `verified`, `banned` |
| `DELETE` | `/api/user` | Bearer JWT + owner_or_admin | Body: `{ user_id }` |
| `GET` | `/api/organization` | Bearer JWT | Admin sees ALL orgs (no `admin_id` filter) |
| `GET` | `/api/organization/:id` | Bearer JWT | Returns single org |
| `PUT` | `/api/organization` | Bearer JWT | Updates org fields |
| `DELETE` | `/api/organization/:id` | Bearer JWT | Deletes org |
| `GET` | `/api/aidoi` | Bearer JWT + org_admin | Admin sees ALL AIDOIs (no `org_admin_id` filter) |

## Role System

- `UserRole::Admin` — portal super admin (has `admin: true` in JWT)
- `UserRole::Authenticated` — default role after registration
- `UserRole::Other("OrgAdmin")` — organization admin (can create orgs & AIDOIs)
- Backend `admin_middleware` checks `claims.is_admin()` for admin-only routes
- Backend `org_admin_middleware` allows both `Admin` and `OrgAdmin` roles
- `UpdateUserDto.apply_non_admin_filter()` strips `role`, `verified`, `banned` for non-admins

## File Structure

```
Frontend/src/
├── app/(admin)/
│   └── admin/
│       ├── layout.tsx              # Admin layout with AdminSidebar + TopBar
│       ├── page.tsx                # Overview dashboard
│       ├── organizations/
│       │   ├── page.tsx            # All organizations list
│       │   └── [id]/page.tsx       # Organization detail
│       ├── pending/
│       │   └── page.tsx            # Pending OrgAdmin requests
│       ├── users/
│       │   ├── page.tsx            # All users list
│       │   └── [id]/page.tsx       # User detail/edit
│       ├── org-admins/
│       │   └── page.tsx            # OrgAdmin management
│       └── stats/
│           └── page.tsx            # Portal statistics
├── components/
│   ├── admin/
│   │   ├── role-badge.tsx
│   │   ├── admin-stat-card.tsx
│   │   ├── data-table.tsx
│   │   ├── confirm-action.tsx
│   │   └── user-role-select.tsx
│   └── layout/
│       └── admin-sidebar.tsx
├── services/
│   └── admin.service.ts
└── types/
    └── admin.ts
```
