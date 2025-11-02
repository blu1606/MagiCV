# Requirements

## Functional Requirements

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

## Non-Functional Requirements

  * **NFR1:** The initial AI-powered CV generation ("One-Click Autofill") must complete in under 10 seconds.
  * **NFR2:** The real-time "Match Score" update must have a maximum latency of 500ms after a user action in the editor.
  * **NFR3:** The user interface must be a responsive web application, fully functional on modern desktop and tablet browsers.
  * **NFR4:** All user data, particularly authentication tokens for third-party services, must be encrypted both at rest and in transit.
  * **NFR5:** The platform's infrastructure must prioritize serverless and managed cloud services to align with the project's low-budget constraint and minimize operational overhead.