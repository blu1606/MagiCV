import { z } from 'zod';
import { uuidSchema, nonEmptyStringSchema, optionalNonEmptyStringSchema } from './base';

/**
 * Component-related validation schemas
 */

// Component type enum
export const componentTypeSchema = z.enum([
    'experience',
    'education',
    'project',
    'skill',
    'certification',
    'award',
    'publication',
    'language',
    'volunteer',
    'other'
]);

export type ComponentType = z.infer<typeof componentTypeSchema>;

// Component source enum
export const componentSourceSchema = z.enum([
    'manual',
    'linkedin',
    'github',
    'youtube',
    'ai_generated',
    'imported'
]);

export type ComponentSource = z.infer<typeof componentSourceSchema>;

// Component create request
export const componentCreateSchema = z.object({
    user_id: uuidSchema,
    type: componentTypeSchema,
    title: nonEmptyStringSchema.max(200, 'Title too long'),
    description: z.string().trim().max(5000, 'Description too long').optional(),
    content: z.record(z.any()),
    tags: z.array(z.string().trim().max(50)).max(20, 'Too many tags').default([]),
    source: componentSourceSchema.default('manual'),
    source_url: z.string().url().optional(),
    is_featured: z.boolean().default(false),
    metadata: z.record(z.any()).optional(),
});

export type ComponentCreateRequest = z.infer<typeof componentCreateSchema>;

// Component update request
export const componentUpdateSchema = z.object({
    type: componentTypeSchema.optional(),
    title: optionalNonEmptyStringSchema.max(200),
    description: z.string().trim().max(5000).optional(),
    content: z.record(z.any()).optional(),
    tags: z.array(z.string().trim().max(50)).max(20).optional(),
    source: componentSourceSchema.optional(),
    source_url: z.string().url().optional(),
    is_featured: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
});

export type ComponentUpdateRequest = z.infer<typeof componentUpdateSchema>;

// Component query parameters
export const componentQuerySchema = z.object({
    userId: uuidSchema.optional(),
    type: componentTypeSchema.optional(),
    source: componentSourceSchema.optional(),
    tags: z.string().optional(), // Comma-separated tags
    is_featured: z.coerce.boolean().optional(),
    search: z.string().trim().max(200).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ComponentQueryParams = z.infer<typeof componentQuerySchema>;

// Component search request
export const componentSearchSchema = z.object({
    query: nonEmptyStringSchema.max(200),
    userId: uuidSchema.optional(),
    type: componentTypeSchema.optional(),
    limit: z.number().int().positive().max(50).default(10),
});

export type ComponentSearchRequest = z.infer<typeof componentSearchSchema>;

// Component embedding generation
export const componentEmbeddingSchema = z.object({
    componentIds: z.array(uuidSchema).min(1, 'At least one component ID required').max(100, 'Too many components'),
    regenerate: z.boolean().default(false),
});

export type ComponentEmbeddingRequest = z.infer<typeof componentEmbeddingSchema>;

// Component stats query
export const componentStatsQuerySchema = z.object({
    userId: uuidSchema.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
});

export type ComponentStatsQuery = z.infer<typeof componentStatsQuerySchema>;
