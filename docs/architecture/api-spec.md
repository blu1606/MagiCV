# API Specification

**Authentication:** All endpoints require an authenticated user session, unless otherwise noted.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/signin/linkedin` | Initiates the LinkedIn OAuth sign-in flow. |
| `GET` | `/api/me` | Gets the current user's profile details. |
| `GET` | `/api/components` | Lists all of the user's professional components. |
| `POST` | `/api/components` | Creates a new manual component. |
| `POST` | `/api/cvs/generate` | **(AI)** Generates a new CV draft from a Job Description. |
| `GET` | `/api/cvs/{id}/export` | Generates and returns the CV as a PDF file. |
| `POST` | `/api/ai/rephrase` | **(AI)** Rephrases a given piece of text. |

## Components

(This section defines the logical software components like the Frontend Application, API Layer, MCP Service, and AI Engine, along with an interaction diagram.)

## External APIs

(This section details the integration with the LinkedIn API and a provider-agnostic AI API, e.g., Google Gemini or OpenAI.)

## Core Workflows

(This section includes a sequence diagram for the critical "CV Generation Workflow," showing how all the software components interact.)

## Database Schema

(This section provides the complete SQL DDL to create the `profiles`, `accounts`, `components`, and `cvs` tables in PostgreSQL, including indexes and notes on Row Level Security.)