import { z } from 'zod';
import { uuidSchema, emailSchema, nonEmptyStringSchema, optionalNonEmptyStringSchema, urlSchema } from './base';

/**
 * User and Profile validation schemas
 */

// Profile update request
export const profileUpdateSchema = z.object({
    full_name: z.string().trim().min(1).max(100).optional(),
    email: emailSchema.optional(),
    phone: z.string().trim().max(20).optional(),
    location: z.string().trim().min(1).max(200).optional(),
    bio: z.string().trim().max(1000).optional(),
    title: z.string().trim().min(1).max(200).optional(),
    linkedin_url: z.string().url().optional(),
    github_url: z.string().url().optional(),
    portfolio_url: z.string().url().optional(),
    avatar_url: z.string().url().optional(),
    preferences: z.record(z.any()).optional(),
    metadata: z.record(z.any()).optional(),
});

export type ProfileUpdateRequest = z.infer<typeof profileUpdateSchema>;

// User preferences schema
export const userPreferencesSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    language: z.enum(['en', 'vi', 'es', 'fr', 'de']).default('en'),
    notifications: z.object({
        email: z.boolean().default(true),
        push: z.boolean().default(false),
        cv_generation: z.boolean().default(true),
        match_alerts: z.boolean().default(true),
    }).default({}),
    cv_defaults: z.object({
        include_projects: z.boolean().default(true),
        use_online_compiler: z.boolean().default(false),
        use_hybrid_architecture: z.boolean().default(true),
    }).default({}),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// User stats query
export const userStatsQuerySchema = z.object({
    userId: uuidSchema,
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    includeComponents: z.coerce.boolean().default(true),
    includeCVs: z.coerce.boolean().default(true),
    includeMatches: z.coerce.boolean().default(true),
});

export type UserStatsQuery = z.infer<typeof userStatsQuerySchema>;
