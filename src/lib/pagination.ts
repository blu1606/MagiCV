/**
 * Cursor-Based Pagination Utilities
 * Provides efficient pagination for large datasets
 */

export interface PaginationParams {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMetadata {
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
  limit: number;
  returnedCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

export interface CursorData {
  id: string;
  timestamp: number;
  sortValue?: any;
}

// Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Encode cursor data to base64 string
 */
export function encodeCursor(data: CursorData): string {
  const json = JSON.stringify(data);
  return Buffer.from(json).toString('base64');
}

/**
 * Decode cursor string to cursor data
 */
export function decodeCursor(cursor: string): CursorData | null {
  try {
    const json = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decode cursor:', error);
    return null;
  }
}

/**
 * Validate and normalize pagination parameters
 */
export function normalizePaginationParams(params: PaginationParams): {
  limit: number;
  cursor: CursorData | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
} {
  // Validate limit
  let limit = params.limit || DEFAULT_PAGE_SIZE;
  if (limit < 1) limit = DEFAULT_PAGE_SIZE;
  if (limit > MAX_PAGE_SIZE) limit = MAX_PAGE_SIZE;

  // Decode cursor
  const cursor = params.cursor ? decodeCursor(params.cursor) : null;

  // Validate sort
  const sortBy = params.sortBy || 'created_at';
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

  return { limit, cursor, sortBy, sortOrder };
}

/**
 * Build pagination metadata from query results
 */
export function buildPaginationMetadata<T extends { id: string; created_at?: string; updated_at?: string }>(
  items: T[],
  limit: number,
  sortBy: string = 'created_at',
  totalCount?: number
): PaginationMetadata {
  const returnedCount = items.length;
  const hasMore = returnedCount === limit;

  let nextCursor: string | null = null;
  if (hasMore && items.length > 0) {
    const lastItem = items[items.length - 1];
    const cursorData: CursorData = {
      id: lastItem.id,
      timestamp: Date.now(),
      sortValue: getSortValue(lastItem, sortBy),
    };
    nextCursor = encodeCursor(cursorData);
  }

  return {
    nextCursor,
    hasMore,
    totalCount,
    limit,
    returnedCount,
  };
}

/**
 * Get sort value from item based on sort field
 */
function getSortValue(item: any, sortBy: string): any {
  if (sortBy === 'created_at' || sortBy === 'updated_at') {
    return item[sortBy] || item.created_at || new Date().toISOString();
  }
  return item[sortBy];
}

/**
 * Build Supabase query with cursor-based pagination
 */
export function applyCursorPagination(
  query: any,
  cursor: CursorData | null,
  limit: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
) {
  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply cursor filter
  if (cursor) {
    if (sortOrder === 'asc') {
      if (cursor.sortValue !== undefined) {
        query = query.gt(sortBy, cursor.sortValue);
      } else {
        query = query.gt('id', cursor.id);
      }
    } else {
      if (cursor.sortValue !== undefined) {
        query = query.lt(sortBy, cursor.sortValue);
      } else {
        query = query.lt('id', cursor.id);
      }
    }
  }

  // Apply limit (fetch one extra to check if there are more)
  query = query.limit(limit);

  return query;
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T extends { id: string; created_at?: string; updated_at?: string }>(
  items: T[],
  limit: number,
  sortBy: string = 'created_at',
  totalCount?: number
): PaginatedResponse<T> {
  return {
    data: items,
    pagination: buildPaginationMetadata(items, limit, sortBy, totalCount),
  };
}

/**
 * Parse pagination params from URL search params
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  return {
    cursor: searchParams.get('cursor') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
  };
}

/**
 * Build URL with pagination params
 */
export function buildPaginationUrl(
  baseUrl: string,
  params: PaginationParams & Record<string, any>
): string {
  const url = new URL(baseUrl, 'http://localhost'); // Base doesn't matter for relative URLs

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.pathname + url.search;
}
