# Data Models

## Profile

  * **Purpose:** To store public profile information and application-specific settings for each authenticated user, linked to their core authentication record in Supabase Auth.
  * **TypeScript Interface**

```typescript
export interface Profile {
  id: string; // Corresponds to Supabase user ID
  full_name: string | null;
  avatar_url: string | null;
  profession: string | null;
}
```

  * **Relationships:** One-to-One with `auth.users`, One-to-Many with `Accounts`, `Components`, and `CVs`.

## Account

  * **Purpose:** To store the connection details for each third-party platform (like LinkedIn or GitHub) that a user links to their profile.
  * **TypeScript Interface**

```typescript
// This client-safe interface omits sensitive tokens.
export interface Account {
  id: string;
  provider: 'linkedin' | 'github' | 'behance';
  provider_account_id: string;
  last_synced_at: string | null;
}
```

  * **Relationships:** Many-to-One with `Profile`.

## Component

  * **Purpose:** To store a single, atomic piece of a user's professional history (e.g., one job, one project, one skill).
  * **TypeScript Interface**

```typescript
export interface Component {
  id: string;
  type: 'experience' | 'project' | 'education' | 'skill';
  title: string;
  organization: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  highlights: string[];
}
```

  * **Relationships:** Many-to-One with `Profile` and `Account`.

## CV

  * **Purpose:** To store a specific curriculum vitae created by a user, representing a curated and ordered assembly of components.
  * **TypeScript Interface**

```typescript
interface CvSection {
  section_title: string;
  component_ids: string[]; // An ordered array of Component IDs
}

export interface CV {
  id: string;
  user_id: string;
  title: string;
  job_description: string;
  match_score: number;
  content: CvSection[];
}
```

  * **Relationships:** Many-to-One with `Profile`. The `content` field establishes a Many-to-Many relationship with `Components`.