## 📋 Product Requirements Document (PRD)
# CV Match Product Requirements Document (PRD)

## Goals and Background Context

### Goals

  * **For Users:** To significantly reduce the time and effort Digital Nomads spend creating and customizing CVs, ultimately increasing their interview requests.
  * **For the Business:** To validate the problem-solution fit for our AI-powered platform within the Digital Nomad niche and achieve a sustainable conversion rate from our "Single-Slot" freemium model.
  * **For the Project:** To define, build, and launch a Minimum Viable Product (MVP) with a low-cost Go-to-Market strategy, gathering the necessary traction to create a winning pitch for a startup competition.

### Background Context

Digital Nomads and remote professionals face a recurring and significant pain point: their professional history is fragmented across multiple online platforms like LinkedIn, GitHub, and Behance. Compiling this scattered data into a tailored CV for each new application is a tedious, manual process. Current resume builders act as simple template editors and fail to address this core data aggregation problem, leading to wasted hours and missed opportunities.

Our proposed solution is an AI-powered platform that acts as a central "career hub." Its core technology, the Model Context Protocol (MCP), automatically syncs and structures a user's professional data. This enables the rapid generation of a highly relevant CV tailored to a specific job description, shifting the user's effort from manual data entry to strategic refinement.

### Change Log

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-10-07 | 1.0 | Initial PRD draft | John, PM |

## Requirements

### Functional

  * **FR1:** Users must be able to sign up and log in to the platform using their LinkedIn and/or GitHub accounts (OAuth).
  * **FR2:** The system's Model Context Protocol (MCP) must automatically ingest, parse, and structure professional data (e.g., work experience, projects, skills) from connected sources into a unified component library.
  * **FR3:** The system must be "profession-aware," intelligently prioritizing the display and synchronization of data from sources most relevant to the user's stated profession (e.g., GitHub for developers, Behance for designers).
  * **FR4:** Users must be able to manually create, edit, and delete professional components in their library to account for experiences not available on synced platforms (e.g., private consulting work).
  * **FR5:** Users must be able to initiate a CV creation process by providing a job description.
  * **FR6:** The system's AI must analyze the provided job description and the user's component library to automatically generate a tailored draft CV ("One-Click Autofill").
  * **FR7:** The system must provide an interactive "Lego-like" editor allowing users to manually add, remove, and reorder components on the CV draft.
  * **FR8:** The system must display a real-time "Match Score" that updates as the user edits the CV, indicating its relevance to the job description.
  * **FR9:** Users must be able to use an AI-powered tool to rephrase specific text sections within the CV to better align with the job description's keywords and tone.
  * **FR10:** Users must be able to export their finalized CV as a formatted, watermark-free PDF document.

### Non-Functional

  * **NFR1:** The initial AI-powered CV generation ("One-Click Autofill") must complete in under 10 seconds.
  * **NFR2:** The real-time "Match Score" update must have a maximum latency of 500ms after a user action in the editor.
  * **NFR3:** The user interface must be a responsive web application, fully functional on modern desktop and tablet browsers.
  * **NFR4:** All user data, particularly authentication tokens for third-party services, must be encrypted both at rest and in transit.
  * **NFR5:** The platform's infrastructure must prioritize serverless and managed cloud services to align with the project's low-budget constraint and minimize operational overhead.

## User Interface Design Goals

### Overall UX Vision

The overall user experience will be **clean, efficient, and intelligent**. The interface should empower users by automating the tedious aspects of CV creation, allowing them to focus on strategic refinement. The design will prioritize clarity and speed, making the process of generating a tailored CV feel effortless and almost magical.

### Key Interaction Paradigms

  * **Automated Generation ("One-Click"):** A single button will initiate the primary workflow of generating a CV from a job description, delivering immediate and significant value.
  * **Modular Editing ("Lego-like"):** A core feature will be a two-panel layout with a component library on one side and the live CV draft on the other, enabling intuitive drag-and-drop customization.
  * **Real-time Feedback:** The "Match Score" will provide immediate and constant feedback on user actions, guiding them toward a better-optimized CV without being intrusive.
  * **In-context AI Assistance:** AI tools, like the rephrasing feature, will be available directly on the content they affect, rather than in a separate tool or chat window.

### Core Screens and Views

  * **Onboarding:** A streamlined, "LinkedIn-first" flow to provide instant value upon sign-up.
  * **Dashboard:** A central hub showing connected data sources, recent CVs, and key insights.
  * **Component Library:** A dedicated area for users to view and manage all their synced and manually created professional components (experiences, projects, skills).
  * **CV Editor:** The primary two-panel workspace for generating, editing, and refining CVs against a specific job description.
  * **Account Settings:** A page for managing profile information and connected data sources.

### Accessibility

  * **WCAG 2.1 Level AA:** The application will be designed and built to meet this widely accepted standard for web accessibility.

### Branding

  * The branding will be **modern, clean, and professional**. The aesthetic should convey intelligence and efficiency, using a focused color palette and clear typography to establish trust. It should feel like a premium, data-driven tool.

### Target Device and Platforms

  * **Web Responsive:** The application will be a responsive web app, optimized for a primary desktop experience, with full functionality on tablets.

## Technical Assumptions

### Repository Structure: Monorepo

  * A monorepo will be used to manage both the frontend and backend code in a single repository. This simplifies code sharing (especially for data types) and streamlines the development workflow.

### Service Architecture: Serverless

  * The architecture will be serverless, primarily using serverless functions for the backend API. This aligns with our non-functional requirement for a low-cost, scalable, and low-maintenance infrastructure.

### Additional Technical Assumptions and Requests

  * **Language:** **TypeScript** will be used for both the frontend and backend to ensure type safety and improve code quality, which is critical when handling data from multiple sources.
  * **Frontend Framework:** **Next.js (React)** is recommended for its excellent developer experience, performance optimizations (static site generation and server-side rendering), and seamless integration with serverless deployment platforms.
  * **Backend Framework:** **Next.js API Routes** will be used for the backend. This keeps the entire application within a single, unified framework, dramatically speeding up development.
  * **Deployment Platform:** **Vercel** is the recommended platform. It's built for Next.js, offers a generous free tier, and handles serverless deployment automatically, aligning perfectly with our cost and speed requirements.
  * **Database & Auth:** **Supabase** is recommended as the backend-as-a-service. It provides a scalable PostgreSQL database, authentication, and file storage out of the box, which will significantly accelerate MVP development.
  * **Styling:** **Tailwind CSS** will be used for styling. It's a utility-first CSS framework that allows for rapid and consistent UI development.
  * **AI Integration:** An LLM orchestration library like **LangChain** will be used to manage interactions with an AI provider (e.g., OpenAI). For the "Match Score" and component matching, a **Vector Database** (e.g., Pinecone, Supabase pgvector) will be used for semantic search.

## Epic List

  * **Epic 1: Foundation & Core Data Ingestion**
      * **Goal:** Establish the core application infrastructure, user authentication, and deliver the initial "magic moment" by automatically ingesting a user's professional data from LinkedIn.
  * **Epic 2: CV Generation & Refinement**
      * **Goal:** Implement the core CV generation engine and the interactive "Lego-like" editor, empowering users to create a tailored CV draft and refine it with real-time feedback.
  * **Epic 3: Finalization & Freemium Model**
      * **Goal:** Enable users to finalize and export their CV, and implement the "Single-Slot" Freemium model to validate the platform's core business strategy.

## Epic 1: Foundation & Core Data Ingestion

**Epic Goal:** The primary objective of this epic is to build the foundational skeleton of the application and deliver the first critical piece of user value. This includes setting up the project, implementing a secure and seamless user authentication flow via LinkedIn, and successfully demonstrating the core power of the MCP by automatically ingesting a user's profile data. By the end of this epic, a new user will be able to sign up and immediately see their own professional data structured within our platform.

-----

### Story 1.1: Initial Project Scaffolding and Deployment

  * **As a** Product Owner,
  * **I want** the Next.js monorepo created and configured for Vercel and Supabase,
  * **so that** we have a foundational, deployable application structure.

**Acceptance Criteria:**

1.  A new monorepo is created containing a Next.js application using TypeScript.
2.  The project is successfully connected to a new Supabase project for the database and authentication services.
3.  The application is successfully deployed to a Vercel preview environment.
4.  A simple, unstyled landing page is visible at the Vercel URL, confirming the deployment pipeline is functional.

-----

### Story 1.2: User Sign-up and Login via LinkedIn

  * **As a** new user,
  * **I want** to sign up and log in to the platform using my LinkedIn account,
  * **so that** I can securely access the service without creating a new password.

**Acceptance Criteria:**

1.  A "Login with LinkedIn" button is present on the landing page.
2.  Clicking the button initiates the standard LinkedIn OAuth authentication flow.
3.  Upon successful authentication, a new user record is created in the Supabase `users` table.
4.  The user is redirected to a private, authenticated (but currently empty) dashboard page.
5.  Subsequent login attempts for an existing user are successful.

-----

### Story 1.3: Automated Ingestion of LinkedIn Profile Data

  * **As a** newly authenticated user,
  * **I want** the system to automatically ingest my professional data from my LinkedIn profile,
  * **so that** I can see my experiences and skills structured in the component library without manual entry.

**Acceptance Criteria:**

1.  Immediately following the user's first successful login, the system triggers the MCP ingestion process for their LinkedIn profile.
2.  The ingestion process correctly extracts key sections like Work Experience, Education, and Skills.
3.  Each extracted item (e.g., a single job position) is saved as a distinct "component" in the user's personal data repository in the database.
4.  The authenticated dashboard page displays the ingested components in a simple list format, confirming the data has been successfully imported.

## Epic 2: CV Generation & Refinement

**Epic Goal:** This epic delivers the core product experience where users transform their raw data into a polished, job-specific CV. We will implement the 'One-Click Autofill' feature to generate an initial draft from a job description and build the interactive two-panel editor for manual refinement. This epic also introduces the real-time 'Match Score' and the manual component creator, giving users a complete and powerful toolkit for CV customization.

-----

### Story 2.1: Manual Creation of Professional Components

  * **As a** user,
  * **I want** to manually create and add new professional components (like work experience or projects) to my component library,
  * **so that** my professional history is complete, including items not found on my synced profiles.

**Acceptance Criteria:**

1.  A "Create New Component" button is available in the component library view.
2.  Clicking the button opens a form with fields for component type (e.g., Experience, Project), title, dates, and description.
3.  Submitting the form successfully adds the new component to the user's library in the database.
4.  The new component appears in the component library view alongside the automatically ingested ones.

-----

### Story 2.2: AI-Powered CV Generation from a Job Description

  * **As a** user,
  * **I want** to provide a job description and have the AI automatically generate a draft CV using the most relevant components from my library,
  * **so that** I can get a strong starting point in seconds.

**Acceptance Criteria:**

1.  The dashboard has a text area to paste a job description and a "Generate CV" button.
2.  Upon submission, the system's AI analyzes the JD and semantically matches it against the user's component library.
3.  A new CV document is created and saved in the database, populated with the top-ranked components.
4.  The user is redirected to the new CV Editor view, which displays the newly generated draft.

-----

### Story 2.3: Two-Panel CV Editor with Component Library

  * **As a** user,
  * **I want** to see my CV draft on one side of the screen and my full component library on the other,
  * **so that** I can easily see what's available to add or modify.

**Acceptance Criteria:**

1.  The CV Editor page is divided into two main panels.
2.  The left panel displays the current CV draft, rendering the components it contains in a clean, readable format.
3.  The right panel displays a searchable list of all components in the user's library (both synced and manual).
4.  Components already used in the current CV are visually distinguished (e.g., greyed out) in the library panel.

-----

### Story 2.4: Drag-and-Drop Component Management

  * **As a** user,
  * **I want** to drag components from my library into my CV and reorder components within the CV,
  * **so that** I have full, intuitive control over the content and structure of my document.

**Acceptance Criteria:**

1.  Users can drag a component from the library panel and drop it into a valid section in the CV panel.
2.  Users can reorder components within a section of the CV by dragging and dropping.
3.  Users can remove a component from the CV (e.g., via a delete icon or dragging it out), which makes it available in the library again.
4.  All changes to the CV structure are automatically saved.

-----

### Story 2.5: Real-time "Match Score" Feedback

  * **As a** user editing my CV,
  * **I want** to see a "Match Score" that updates in real-time,
  * **so that** I can immediately understand how my changes impact the CV's relevance to the job description.

**Acceptance Criteria:**

1.  A "Match Score" (as a percentage) is prominently displayed in the CV Editor view.
2.  The score is initially calculated when the CV is first generated.
3.  The score is automatically recalculated and the display is updated within 500ms whenever a user adds, removes, or reorders a component in the CV.

## Epic 3: Finalization & Freemium Model

**Epic Goal:** This final epic closes the loop on the core user journey and introduces our primary business model. It will provide users with the essential ability to export their polished CV into a professional PDF format. Critically, we will also implement the "Single-Slot" Freemium logic, which serves as the natural trigger for converting free users to paid subscribers, allowing us to test our monetization strategy from day one.

-----

### Story 3.1: CV Export to PDF

  * **As a** user with a completed CV draft,
  * **I want** to export it as a professional, clean PDF document,
  * **so that** I can submit it for job applications.

**Acceptance Criteria:**

1.  An "Export to PDF" button is available in the CV Editor.
2.  Clicking the button generates a PDF version of the current CV's content.
3.  The generated PDF is well-formatted, respecting the layout and styling of a clean, professional template.
4.  The PDF is completely watermark-free.
5.  The PDF is downloaded directly to the user's device.

-----

### Story 3.2: Implementation of the "Single-Slot" Freemium Model

  * **As a** free user,
  * **I want** to be able to create and manage one primary CV "slot",
  * **so that** I can experience the full value of the platform for a single job application.

**Acceptance Criteria:**

1.  User accounts on the free tier are limited to creating and saving only one CV document at a time.
2.  The UI clearly indicates that the user is using their single free "slot".
3.  The "Generate CV" button is disabled (or directs to the upgrade prompt) if a user already has an existing CV in their slot.
4.  The user can delete their existing CV to free up their slot and create a new one.

-----

### Story 3.3: Premium Upgrade Prompt

  * **As a** free user who already has a CV,
  * **I want** to be prompted to upgrade to a premium plan when I try to create a second one,
  * **so that** I understand how to unlock unlimited CVs.

**Acceptance Criteria:**

1.  When a free user with an existing CV attempts to generate a new CV, an upgrade modal or page appears.
2.  The upgrade prompt clearly communicates the primary benefit of the premium plan: "Unlimited CV Slots".
3.  The prompt includes a clear call-to-action button, such as "Upgrade Now".
4.  For the MVP, clicking the button will lead to a "Coming Soon" page or a waitlist form to gauge interest, as a full payment gateway integration is out of scope.

\</details\>
