# Frontend Architecture

## Component Architecture

  * **Organization:** A functional grouping within `src/components/` (`ui/`, `features/`, `layout/`).
  * **Template:** A standard template for React components using TypeScript, `React.forwardRef`, and a `cn` utility for Tailwind CSS.

## State Management Architecture

  * **Structure:** Domain-specific stores in `src/stores/` (e.g., `user-store.ts`, `cv-editor-store.ts`).
  * **Patterns:** Using Zustand for lightweight global state, with a clear template for creating new stores.

## Routing Architecture

  * **Organization:** Using the Next.js App Router with file-system-based routing and Route Groups for authenticated sections.
  * **Protection:** Using Next.js Middleware to secure protected routes by checking for a valid Supabase session.

## Frontend Services Layer

  * **API Client:** A centralized `apiClient` that wraps `fetch` to automatically attach the Supabase authentication token to all requests.
  * **Services:** Dedicated service files (e.g., `cv-service.ts`) that encapsulate all API communication logic, to be called from UI components.