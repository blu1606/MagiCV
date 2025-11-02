# Technology Stack

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Language** | TypeScript | `~5.x` | Language for frontend development | Provides type safety, improving code quality and maintainability. |
| **Frontend Framework**| Next.js | `~14.x` | React framework for the web app | Enables rapid development, server-side rendering, and serverless functions. |
| **UI Library** | shadcn/ui | `Latest` | Collection of accessible UI components | Accelerates UI development with pre-built, customizable, and accessible components. |
| **State Management** | Zustand | `~4.x` | Lightweight state management | Simple, unopinionated state management for React if built-in hooks are insufficient. |
| **Backend Language** | TypeScript | `~5.x` | Language for API development | Ensures consistency and type safety across the full stack. |
| **Backend Framework**| Next.js API Routes| `~14.x` | Framework for serverless functions | Unifies the codebase, allowing frontend and backend code in one project. |
| **Database** | PostgreSQL | `16.x` | Primary relational database | Powerful, reliable, and expertly managed by Supabase. |
| **Authentication** | Supabase Auth | `Latest` | User management and authentication | Provides a secure, pre-built solution for auth, including OAuth with LinkedIn. |
| **Vector Database** | Supabase `pgvector`| `Latest` | Semantic search for AI matching | Integrates vector search directly into our main PostgreSQL database. |
| **AI Provider** | Google Gemini, OpenAI | `Latest` | Core AI text and embedding generation | Allows flexibility to choose the most cost-effective and performant model. |
| **Frontend Testing** | Vitest & RTL | `Latest` | Unit and integration testing | A fast, modern testing framework that works seamlessly with React Testing Library. |
| **Backend Testing** | Vitest | `Latest` | API and business logic testing | Provides a consistent testing framework across the monorepo. |
| **E2E Testing** | Playwright | `Latest` | End-to-end browser testing | Robust and reliable for testing complete user flows across different browsers. |
| **Monorepo Tool** | Turborepo | `Latest` | High-performance build system | Manages the monorepo, optimizing build times and development workflows. |
| **Deployment** | Vercel | `Latest` | Hosting and CI/CD platform | Offers zero-configuration deployment for Next.js and handles our CI/CD pipeline. |
| **Monitoring** | Vercel Analytics | `Latest` | Performance and usage monitoring | Built-in, privacy-friendly analytics to track Core Web Vitals and traffic. |
| **CSS Framework** | Tailwind CSS | `~3.x` | Utility-first CSS framework | Enables rapid and consistent styling directly in the markup. |