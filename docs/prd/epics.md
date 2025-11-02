# Epic List & Stories

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