# Frontend Standards — TypeScript/React/Next.js

> **Scope**: Frontend source in `apps/frontend/homepage-app/`
> **Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI
> **Goal**: Consistent naming, comprehensive docs, organized code, and type reuse

---

## Golden Rules (apply on every edit)

1. **camelCase everything** (variables, params, functions). Components/types/interfaces use **PascalCase**.
2. **Actionable names**: functions describe behavior (`computePricePerSqFt`, `buildClassName`, `fetchUserProfile`).
3. **JSDoc required** for every exported function + type (templates below).
4. **Organize files**: imports → types → constants → pure helpers → hooks/selectors → components → side-effects → exports.
5. **Pure first**: prefer small pure helpers; isolate I/O/async effects behind thin wrappers.
6. **No silent coercion**: use guard clauses; prefer returning `undefined` for "not computable."
7. **Immutable UI state transforms**: avoid mutating props or params; copy/derive.
8. **Reuse existing types**: before defining any new type/interface, **import from `@user-management/types`** if a compatible shape exists. **Do not redefine** shapes already exported in the types library.
9. **Server components by default** - only add `'use client'` when you need interactivity (state, effects, event handlers).

---

## Naming Conventions

- **Booleans**: `is`, `has`, `can`, `should` prefixes (`isLoading`, `hasError`, `canEdit`)
- **Event handlers**: `handleX` (inside components) and `onX` props (`handleClick`, `onSubmit`)
- **Hooks**: `useX` and must follow rules of hooks (`useAuth`, `useUserProfile`)
- **Data mappers**: `mapXToY` (`mapUserToProfile`)
- **Selectors**: `selectX` (`selectActiveUsers`)
- **Formatters**: `formatX` (`formatCurrency`, `formatDate`)
- **Calculators**: `computeX` (`computeTotal`, `computePricePerSqFt`)
- **Constants**: prefer `camelCase`. Use `PascalCase` only for React components and types.
- **Files**: `kebab-case.tsx` for components, `kebab-case.ts` for utilities

---

## Type Lookup & Reuse

The `@user-management/types` library contains auto-generated types from the OpenAPI spec. **Always check there first.**

### Rules

1. **Import before defining**: Search `@user-management/types` for compatible shapes (≈80% field overlap)
2. **Extend, don't redefine**: If close match exists, import and extend locally:
   ```ts
   import type { User } from "@user-management/types";

   type EditableUser = User & {
     isEditing: boolean;
   };
   ```
3. **Use type imports**: Prefer `import type { ... }` for type-only imports
4. **No duplicate interfaces**: Don't create `IUser` when `User` exists in types library

### Import Pattern

```ts
import type { User, LoginRequest, LoginResponse } from "@user-management/types";
```

### Extension Pattern (only when necessary)

```ts
import type { User } from "@user-management/types";

/**
 * EditableUser
 * ---------------------------------------------------------------------------
 * Extends User with UI-specific editing state. Base fields come from the
 * API contract; isEditing tracks row-level edit mode in the table.
 *
 * @property isEditing UI flag for inline editing state
 */
export type EditableUser = User & {
  isEditing: boolean;
};
```

---

## JSDoc Templates

### Function JSDoc

```ts
/**
 * functionName
 * -------------------------------------------------------------
 * One-sentence imperative summary. Include policies on rounding,
 * parsing, and how callers should interpret guard returns.
 *
 * Guard clauses: return `undefined` for non-computable inputs.
 *
 * @param foo Description (units/range).
 * @param bar Description.
 * @returns What is returned; when `undefined` occurs.
 * @throws If any; otherwise "never throws".
 * @example
 * const result = functionName(a, b);
 */
```

**Example**

```ts
/**
 * computePricePerSqFt
 * -------------------------------------------------------------
 * Derives an integer price-per-square-foot metric. Rounds to
 * the nearest whole dollar to keep UI consistent and avoid
 * floating point noise.
 *
 * @param numerator A sale or adjusted value representing price.
 * @param sqft Total property square footage.
 * @returns Rounded PPSF or undefined for invalid inputs.
 * @example
 * const ppsf = computePricePerSqFt(250000, 1200); // 208
 */
export function computePricePerSqFt(
  numerator: number | undefined,
  sqft: number | undefined
): number | undefined {
  if (typeof numerator !== "number" || numerator <= 0) return undefined;
  if (typeof sqft !== "number" || sqft <= 0) return undefined;
  return Math.round(numerator / sqft);
}
```

### Type/Interface JSDoc

```ts
/**
 * TypeName
 * ---------------------------------------------------------------------------
 * One-sentence description of what this type represents and its purpose.
 * Include notes about required fields, validation rules, or usage context.
 *
 * @property field1 Description (units, validation, defaults)
 * @property field2 Description
 */
export type TypeName = {
  field1: string;
  field2: number;
};
```

**Example**

```ts
/**
 * AdjustmentRow
 * ---------------------------------------------------------------------------
 * Unified shape for "Adjustments" UI rows: static property keys and dynamic
 * custom fields. Numeric fields default upstream; UI may treat empty string
 * separately while editing.
 *
 * @property variable string key (sale field name or custom_<id>)
 * @property adjustment numeric weight/value
 * @property isCustom flag to differentiate dynamic vs static rows
 * @property label optional display label
 */
export type AdjustmentRow = {
  variable: string;
  adjustment: number;
  isCustom: boolean;
  label: string;
};
```

---

## File Organization (enforced order)

Every TypeScript file should follow this structure:

1. **Imports**
   - External packages (`react`, `next`, `@radix-ui`, etc.)
   - Workspace libs (`@user-management/types`, `@user-management/shared`)
   - Local relative imports (`./components`, `../utils`)

2. **Types & Interfaces** (exported, with JSDoc)

3. **Constants** (pure, serializable values)

4. **Pure Helpers** (format/compute/map functions)

5. **Hooks & Selectors** (pure where possible; effects in hooks only)

6. **Components** (presentational first, containers last)

7. **Side-Effects / I/O** (fetch, storage) behind small wrappers

8. **Public Exports** (named exports; default export only for page components)

**Example**

```ts
// 1. Imports
import { useState, useEffect } from "react";
import type { User } from "@user-management/types";
import { formatDate } from "../utils/format-date";

// 2. Types
type UserCardProps = {
  user: User;
  onEdit: (id: string) => void;
};

// 3. Constants
const MAX_NAME_LENGTH = 50;

// 4. Pure helpers
function truncateName(name: string): string {
  if (name.length <= MAX_NAME_LENGTH) return name;
  return name.slice(0, MAX_NAME_LENGTH) + "...";
}

// 5. Hooks (if any)
// 6. Components
export function UserCard({ user, onEdit }: UserCardProps) {
  // component implementation
}

// 7. Side effects (if any)
// 8. Exports (already done inline above)
```

---

## React/Next.js Conventions

### Components

- **Functional components** with explicit props types (no `React.FC`)
- **Server components by default** - only add `'use client'` for:
  - State (`useState`, `useReducer`)
  - Effects (`useEffect`, `useLayoutEffect`)
  - Browser APIs (`window`, `document`)
  - Event handlers (`onClick`, `onChange`)
  - Context consumers that need reactivity
- **Props interface**: Define props type inline or as separate type
- **Component composition**: Break large components into smaller pieces
- **Presentational focus**: Push data transforms to helpers/selectors

**Example Server Component**

```tsx
// app/users/page.tsx
import type { User } from "@user-management/types";
import { UserCard } from "./user-card";

async function getUsers(): Promise<User[]> {
  const res = await fetch("http://localhost:3000/api/users");
  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

**Example Client Component**

```tsx
// app/users/user-card.tsx
"use client";

import { useState } from "react";
import type { User } from "@user-management/types";

type UserCardProps = {
  user: User;
};

export function UserCard({ user }: UserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div onClick={() => setIsExpanded(!isExpanded)}>
      {/* ... */}
    </div>
  );
}
```

### Hooks

- **Follow Rules of Hooks** (only call at top level, only in function components/hooks)
- **Colocate domain hooks** next to features (`app/users/hooks/use-user-profile.ts`)
- **Cross-cutting hooks** go in `hooks/` directory
- **Pure hooks** where possible (deterministic, no external I/O)
- **Clear return types** (don't rely on inference for complex returns)

**Example Hook**

```ts
/**
 * useAuth
 * -------------------------------------------------------------
 * Provides authentication state and login/logout actions.
 * Syncs with authStore (Zustand) and handles token refresh.
 *
 * @returns Auth state and actions
 */
export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}
```

### Data Fetching

- **Server Components**: Use `fetch` directly with `await`
- **Client Components**: Use hooks (`useSWR`, `useQuery`) or `useEffect`
- **API routes**: Create in `app/api/` for client-side requests
- **Type safety**: Import request/response types from `@user-management/types`

### Error Handling

- **Error boundaries** for component trees
- **Suspense** for async data loading
- **Try/catch** in async functions
- **User-friendly messages** (not raw error objects)

### Accessibility

- **Semantic HTML** (`<button>`, `<nav>`, `<main>`)
- **ARIA labels** for interactive elements
- **Keyboard support** (Enter, Escape, Tab)
- **Focus management** (trap focus in modals)
- **Use Radix UI** for accessible primitives (already in stack)

---

## Tailwind CSS Conventions

### Class Organization

Order classes for readability:
1. **Layout**: `flex`, `grid`, `absolute`, `relative`
2. **Spacing**: `p-4`, `m-2`, `gap-4`
3. **Typography**: `text-lg`, `font-bold`
4. **Color**: `bg-blue-500`, `text-white`
5. **Effects**: `shadow-lg`, `rounded-md`
6. **State**: `hover:bg-blue-600`, `focus:ring-2`

**Example**

```tsx
<button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
  Click me
</button>
```

### Conditional Classes

Use a `cn` helper for conditional class composition:

```ts
/**
 * cn
 * -------------------------------------------------------------
 * Combines class names, filtering out falsy values.
 * Useful for conditional Tailwind classes.
 *
 * @param parts Array of class strings or falsy values
 * @returns Combined class string
 * @example
 * cn("p-4", isActive && "bg-blue-500", "text-white") // "p-4 bg-blue-500 text-white"
 */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
```

**Usage**

```tsx
<div className={cn(
  "p-4 rounded-md",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Content
</div>
```

### Design Tokens

- Use **CSS custom properties** for colors/spacing in `globals.css`
- Reference via Tailwind theme extensions in `tailwind.config.js`
- Avoid **magic numbers** - use theme values

---

## State Management

### Zustand (Preferred)

```ts
// stores/auth-store.ts
import { create } from "zustand";
import type { User } from "@user-management/types";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### React Context (When Needed)

- Use for **component-tree-scoped state** (theme, feature flags)
- Avoid for **global state** (prefer Zustand)
- Split context by concern (don't create mega-contexts)

---

## Testing (what to propose in Post-Change Review)

- **Unit tests**: Pure helpers, selectors, mappers, calculations
- **Component tests**: Render, assert DOM, test interactions
- **Hook tests**: Use `@testing-library/react-hooks`
- **Guard cases**: `undefined` returns, invalid inputs, edge cases
- **No CSS mocks**: Focus on behavior, not styles

**Minimal Jest Test**

```ts
// utils/compute-price-per-sqft.test.ts
import { computePricePerSqFt } from "./compute-price-per-sqft";

describe("computePricePerSqFt", () => {
  it("rounds to nearest whole number", () => {
    expect(computePricePerSqFt(201000, 1000)).toBe(201);
  });

  it("returns undefined for invalid inputs", () => {
    expect(computePricePerSqFt(undefined, 1000)).toBeUndefined();
    expect(computePricePerSqFt(100000, 0)).toBeUndefined();
    expect(computePricePerSqFt(-1000, 1000)).toBeUndefined();
  });
});
```

---

## Common Patterns

### Form Handling

```tsx
"use client";

import { useState } from "react";
import type { LoginRequest } from "@user-management/types";

export function LoginForm() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call API with formData
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      {/* ... */}
    </form>
  );
}
```

### Conditional Rendering

```tsx
// Prefer guard clauses
if (!user) {
  return <div>Loading...</div>;
}

if (error) {
  return <div>Error: {error.message}</div>;
}

return <UserProfile user={user} />;
```

### List Rendering

```tsx
// Always include keys
{users.map((user) => (
  <UserCard key={user.id} user={user} />
))}

// For empty states
{users.length === 0 ? (
  <EmptyState />
) : (
  users.map((user) => <UserCard key={user.id} user={user} />)
)}
```

---

## Security Considerations

- **Never expose tokens** in client-side code (use HttpOnly cookies)
- **Validate on server** (client validation is UX, not security)
- **Sanitize user input** before rendering (React does this by default)
- **Use HTTPS** in production (already configured in deployment)
- **CORS** configured on backend (don't bypass)

---

## Performance

- **Server components** for static content (default)
- **Client components** only when needed (state, effects)
- **Dynamic imports** for heavy components (`next/dynamic`)
- **Image optimization** with `next/image`
- **Debounce** expensive operations (search inputs)
- **Memoize** expensive calculations (`useMemo`, `useCallback` sparingly)

---

## When in Doubt

1. **Check existing code** - consistency over perfection
2. **Keep it simple** - readable beats clever
3. **Ask before refactoring** - don't change working patterns without reason
4. **Document why** - JSDoc explains the "why", code shows the "how"
