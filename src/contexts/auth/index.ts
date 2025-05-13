
export { AuthProvider } from './AuthProvider';
export { useAuth } from './AuthContext';
export type { AuthContextType } from './AuthContext';

// Export some utility functions to help with auth checks
export const isAdminUser = (role?: string): boolean => role === 'admin';
export const isBusinessOwner = (role?: string): boolean => role === 'business';
export const isRegularUser = (role?: string): boolean => role === 'user';
