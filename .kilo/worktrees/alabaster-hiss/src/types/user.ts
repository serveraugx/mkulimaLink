/**
 * Shared TypeScript types for User entities across the application.
 */
export type UserRole = 'admin' | 'user' | 'moderator';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  avatarUrl?: string;
}
