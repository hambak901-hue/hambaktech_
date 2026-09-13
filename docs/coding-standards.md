# HambakTech Smart Digital Platform — Coding Standards & Engineering Principles

**Status:** ACTIVE GOVERNANCE  
**Date:** Milestone 1 — Foundation Audit  
**Author:** AI Studio (Implementation Developer) & ChatGPT (Technical Lead)  

---

## 1. Core Engineering Principles (The 20 Golden Rules)

1. **No Unnecessary Hardcoding:** Never hardcode prices, fee amounts, phone numbers, contact addresses, or service lists in component templates.
2. **Configurable Business Data:** All business parameters belong in the database, CMS, or centralized settings configuration.
3. **DRY (Don't Repeat Yourself):** Reusable functionality must be implemented once in a shared library or utility function.
4. **Avoid Duplicate Components:** Before creating a new UI element, inspect existing components in `src/components/` to reuse or extend them.
5. **Clear Component Responsibilities:** Each component should do one thing well (presentation, container, or specialized control).
6. **Decoupled Business Logic:** Business rules, calculations, and validations must reside in services or custom hooks, not scattered in JSX view templates.
7. **Centralized API Communication:** All HTTP calls route through dedicated API client modules with standard error handling and type definitions.
8. **Zero Committed Secrets:** Passwords, API secret keys, private credentials, and `.env` files must NEVER be committed to Git.
9. **Rigorous Input Validation:** Validate all user input both on the client (immediate UX feedback) and strictly on the server (security).
10. **Universal Loading States:** Every asynchronous operation must display a clear, non-blocking loading indicator or skeleton state.
11. **Universal Error States:** Every failure (network drop, validation error, server 500) must render a graceful, actionable error state.
12. **Universal Empty States:** Lists, search results, orders, and feeds must display an informative, helpful empty state when no data exists.
13. **Mobile-First Responsive Design:** Every screen must be designed for mobile screens first (touch targets ≥ 44px) and scale gracefully to tablet and desktop.
14. **Accessibility (a11y):** Maintain WCAG AA compliance: high text contrast (≥ 4.5:1), descriptive image alt tags, semantic markup, and keyboard focus states.
15. **Consistent Naming Conventions:** PascalCase for React components, camelCase for variables/functions, UPPER_SNAKE_CASE for constants, and kebab-case for URLs and asset files.
16. **TypeScript Precision:** Strictly type all props, interfaces, API responses, and database models. Prohibit `any` types.
17. **Respect Existing Conventions:** Follow existing project conventions unless an architectural reason is formally documented.
18. **Verify Before Committing:** Run `npm run lint` and `npm run build` prior to committing any change. Never commit broken code.
19. **Document Architectural Decisions:** Significant structural, schema, or third-party decisions must be recorded in `/docs`.
20. **Zero Destructive Changes:** Never delete existing functional code simply because it is template code; prefer surgical, incremental refactoring.

---

## 2. Frontend Development Standards (Next.js & TypeScript)

### 2.1 File & Directory Organization
- `src/app/`: App Router route segments (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
- `src/components/`: Reusable components grouped by domain (e.g., `Common/`, `Header/`, `Footer/`, `Services/`, `Academy/`).
- `src/types/`: Centralized TypeScript interface and type declarations.
- `src/lib/`: Pure helper functions, formatting utilities, and constants.
- `public/`: Static public assets (SVGs, photos, favicons).

### 2.2 Server vs. Client Components
- By default, Next.js components are **Server Components**.
- Add `"use client"` **only** when interactivity (hooks like `useState`, `useEffect`, `useRef`, or event handlers like `onClick`, `onChange`) is strictly required.
- Isolate client components to the leaves of the component tree to maximize performance and SEO.

### 2.3 Styling Guidelines (Tailwind CSS v4)
- Use standard Tailwind utility classes exclusively.
- Do not write custom inline CSS or ad-hoc style tags.
- Use tokenized colors defined in `@theme` in `src/styles/index.css` (e.g., `text-primary`, `bg-dark`, `border-stroke`).
- Button horizontal padding must equal 2x vertical padding for visual optical balance.
- Text in buttons, tags, badges, and chips must remain on one line without wrapping.

### 2.4 State Management & Data Fetching
- Avoid infinite re-renders. Do not update state synchronously inside component render bodies.
- Dependency arrays in `useEffect` must contain only primitive values or memoized references.
- For async network requests, maintain:
  ```typescript
  interface AsyncState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
  }
  ```

---

## 3. Git Workflow & Safety

1. **Branching:** Never develop directly on `main`. Create feature or chore branches (e.g., `chore/foundation-audit`, `feat/milestone-2-public-website`).
2. **Conventional Commits:** Use structured commit messages:
   - `chore:` Maintenance, audits, configuration, documentation
   - `feat:` User-facing features
   - `fix:` Bug fixes
   - `refactor:` Code restructuring without behavior changes
3. **Commit Cleanliness:** Always run `git status` and `git diff` before committing to ensure no unintended files or secrets are staged.
