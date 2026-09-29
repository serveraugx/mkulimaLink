/**
 * Global TypeScript type augmentations and utility types.
 */

/** Make all properties of T optional recursively */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Extract the resolved type from a Promise */
export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}

/** Standard paginated API response */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Standard API error response */
export interface ApiError {
  error: string;
  success: false;
  statusCode: number;
}
