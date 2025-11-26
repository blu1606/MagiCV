import { z } from 'zod';
import { uuidSchema, nonEmptyStringSchema, optionalNonEmptyStringSchema } from './base';

/**
 * CV-related validation schemas
 */

// CV generation request
export const cvGenerateSchema = z.object({
    jobDescription: z.string().trim().max(10000, 'Job description too long (max 10000 characters)').optional().default(''),
    cvData: z.record(z.any()).optional(),
    includeProjects: z.boolean().default(true),
    useOnlineCompiler: z.boolean().default(false),
    saveToDatabase: z.boolean().default(false),
    useHybridArchitecture: z.boolean().default(true),
});

export type CVGenerateRequest = z.infer<typeof cvGenerateSchema>;

// CV preview request (GET)
export const cvPreviewQuerySchema = z.object({
    userId: uuidSchema,
    jobDescription: z.string().trim().max(10000).optional().default(''),
    format: z.enum(['json', 'pdf']).default('json'),
});

export type CVPreviewQuery = z.infer<typeof cvPreviewQuerySchema>;

// CV match request
export const cvMatchSchema = z.object({
    jobDescription: nonEmptyStringSchema.max(10000, 'Job description too long'),
    userId: uuidSchema.optional(),
});

export type CVMatchRequest = z.infer<typeof cvMatchSchema>;

// CV rephrase request
export const cvRephraseSchema = z.object({
    text: nonEmptyStringSchema.max(5000, 'Text too long (max 5000 characters)'),
    tone: z.enum(['professional', 'casual', 'technical', 'creative']).default('professional'),
    targetRole: optionalNonEmptyStringSchema.max(200),
});

export type CVRephraseRequest = z.infer<typeof cvRephraseSchema>;

// CV summary generation
export const cvSummarySchema = z.object({
    userId: uuidSchema,
    targetRole: optionalNonEmptyStringSchema.max(200),
    yearsOfExperience: z.number().int().nonnegative().max(50).optional(),
});

export type CVSummaryRequest = z.infer<typeof cvSummarySchema>;

// CV variant generation
export const cvVariantSchema = z.object({
    cvId: uuidSchema,
    targetRole: nonEmptyStringSchema.max(200),
    count: z.number().int().positive().max(5).default(1),
});

export type CVVariantRequest = z.infer<typeof cvVariantSchema>;

// CV update request
export const cvUpdateSchema = z.object({
    title: optionalNonEmptyStringSchema.max(200),
    job_description: z.string().trim().max(10000).optional(),
    match_score: z.number().min(0).max(100).optional(),
    content: z.record(z.any()).optional(),
});

export type CVUpdateRequest = z.infer<typeof cvUpdateSchema>;

// CV create request
export const cvCreateSchema = z.object({
    user_id: uuidSchema,
    title: nonEmptyStringSchema.max(200),
    job_description: z.string().trim().max(10000).nullable().optional(),
    match_score: z.number().min(0).max(100).default(0),
    content: z.record(z.any()),
});

export type CVCreateRequest = z.infer<typeof cvCreateSchema>;

// CV draft request
export const cvDraftSchema = z.object({
    userId: uuidSchema,
    jobDescription: optionalNonEmptyStringSchema.max(10000),
    includeProjects: z.boolean().default(true),
});

export type CVDraftRequest = z.infer<typeof cvDraftSchema>;
