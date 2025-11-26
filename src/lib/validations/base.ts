import { z } from 'zod';

/**
 * Base validation schemas for common patterns
 * Used across multiple API endpoints
 */

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Pagination schemas
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().nonnegative().optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// Cursor-based pagination
export const cursorPaginationSchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CursorPaginationParams = z.infer<typeof cursorPaginationSchema>;

// Date range schema
export const dateRangeSchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
}).refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return data.startDate <= data.endDate;
        }
        return true;
    },
    { message: 'Start date must be before or equal to end date' }
);

export type DateRangeParams = z.infer<typeof dateRangeSchema>;

// Email validation
export const emailSchema = z.string().email('Invalid email format').toLowerCase();

// URL validation
export const urlSchema = z.string().url('Invalid URL format');

// Non-empty string
export const nonEmptyStringSchema = z.string().trim().min(1, 'Field cannot be empty');

// Optional non-empty string (either undefined or non-empty)
export const optionalNonEmptyStringSchema = z.string().trim().min(1).optional();

// ID parameter (for route params)
export const idParamSchema = z.object({
    id: uuidSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;

// User ID parameter
export const userIdParamSchema = z.object({
    userId: uuidSchema,
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;

// Search query schema
export const searchQuerySchema = z.object({
    q: z.string().trim().min(1, 'Search query cannot be empty').max(200),
    ...paginationSchema.shape,
});

export type SearchQueryParams = z.infer<typeof searchQuerySchema>;

// Sort schema
export const sortSchema = z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SortParams = z.infer<typeof sortSchema>;

// Common response metadata
export const responseMetadataSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
});

export type ResponseMetadata = z.infer<typeof responseMetadataSchema>;
