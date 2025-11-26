import { z } from 'zod';
import { uuidSchema, nonEmptyStringSchema, optionalNonEmptyStringSchema, urlSchema } from './base';

/**
 * Job Description validation schemas
 */

// Job description create request
export const jobDescriptionCreateSchema = z.object({
    user_id: uuidSchema,
    title: nonEmptyStringSchema.max(200, 'Title too long'),
    company: optionalNonEmptyStringSchema.max(200),
    description: nonEmptyStringSchema.max(20000, 'Description too long'),
    requirements: z.string().trim().max(10000).optional(),
    responsibilities: z.string().trim().max(10000).optional(),
    location: optionalNonEmptyStringSchema.max(200),
    salary_range: optionalNonEmptyStringSchema.max(100),
    employment_type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']).optional(),
    experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
    source_url: z.string().url().optional(),
    tags: z.array(z.string().trim().max(50)).max(20).default([]),
    metadata: z.record(z.any()).optional(),
});

export type JobDescriptionCreateRequest = z.infer<typeof jobDescriptionCreateSchema>;

// Job description update request
export const jobDescriptionUpdateSchema = z.object({
    title: optionalNonEmptyStringSchema.max(200),
    company: optionalNonEmptyStringSchema.max(200),
    description: z.string().trim().max(20000).optional(),
    requirements: z.string().trim().max(10000).optional(),
    responsibilities: z.string().trim().max(10000).optional(),
    location: optionalNonEmptyStringSchema.max(200),
    salary_range: optionalNonEmptyStringSchema.max(100),
    employment_type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']).optional(),
    experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
    source_url: z.string().url().optional(),
    tags: z.array(z.string().trim().max(50)).max(20).optional(),
    metadata: z.record(z.any()).optional(),
});

export type JobDescriptionUpdateRequest = z.infer<typeof jobDescriptionUpdateSchema>;

// Job description extract request (from URL or text)
export const jobDescriptionExtractSchema = z.object({
    url: z.string().url().optional(),
    text: z.string().trim().max(50000).optional(),
    userId: uuidSchema.optional(),
}).refine(
    (data) => data.url || data.text,
    { message: 'Either URL or text must be provided' }
);

export type JobDescriptionExtractRequest = z.infer<typeof jobDescriptionExtractSchema>;

// Job description match request
export const jobDescriptionMatchSchema = z.object({
    jobDescriptionId: uuidSchema.optional(),
    jobDescriptionText: z.string().trim().max(20000).optional(),
    userId: uuidSchema,
    includeDetails: z.boolean().default(false),
}).refine(
    (data) => data.jobDescriptionId || data.jobDescriptionText,
    { message: 'Either jobDescriptionId or jobDescriptionText must be provided' }
);

export type JobDescriptionMatchRequest = z.infer<typeof jobDescriptionMatchSchema>;

// Job description query parameters
export const jobDescriptionQuerySchema = z.object({
    userId: uuidSchema.optional(),
    search: z.string().trim().max(200).optional(),
    company: z.string().trim().max(200).optional(),
    employment_type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']).optional(),
    experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
    tags: z.string().optional(), // Comma-separated
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(['created_at', 'updated_at', 'title']).default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type JobDescriptionQueryParams = z.infer<typeof jobDescriptionQuerySchema>;
