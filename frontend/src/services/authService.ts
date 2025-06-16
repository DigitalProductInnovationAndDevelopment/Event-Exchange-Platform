import type { User } from '../types/auth';

const AUTH_KEY = 'auth_user';

export const authService = {
  login: async (user: User): Promise<User> => {
    // Store user in localStorage
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));

    return user;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(AUTH_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser();
  },
};
