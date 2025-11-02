# Technical Assumptions

## Repository Structure: Monorepo

  * A monorepo will be used to manage both the frontend and backend code in a single repository. This simplifies code sharing (especially for data types) and streamlines the development workflow.

## Service Architecture: Serverless

  * The architecture will be serverless, primarily using serverless functions for the backend API. This aligns with our non-functional requirement for a low-cost, scalable, and low-maintenance infrastructure.

## Additional Technical Assumptions and Requests

  * **Language:** **TypeScript** will be used for both the frontend and backend to ensure type safety and improve code quality, which is critical when handling data from multiple sources.
  * **Frontend Framework:** **Next.js (React)** is recommended for its excellent developer experience, performance optimizations (static site generation and server-side rendering), and seamless integration with serverless deployment platforms.
  * **Backend Framework:** **Next.js API Routes** will be used for the backend. This keeps the entire application within a single, unified framework, dramatically speeding up development.
  * **Deployment Platform:** **Vercel** is the recommended platform. It's built for Next.js, offers a generous free tier, and handles serverless deployment automatically, aligning perfectly with our cost and speed requirements.
  * **Database & Auth:** **Supabase** is recommended as the backend-as-a-service. It provides a scalable PostgreSQL database, authentication, and file storage out of the box, which will significantly accelerate MVP development.
  * **Styling:** **Tailwind CSS** will be used for styling. It's a utility-first CSS framework that allows for rapid and consistent UI development.
  * **AI Integration:** An LLM orchestration library like **LangChain** will be used to manage interactions with an AI provider (e.g., OpenAI). For the "Match Score" and component matching, a **Vector Database** (e.g., Pinecone, Supabase pgvector) will be used for semantic search.