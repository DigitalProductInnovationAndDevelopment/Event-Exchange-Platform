import type { User, LoginCredentials } from '../types/auth';

const AUTH_KEY = 'auth_user';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a user from the provided email
    const user: User = {
      id: crypto.randomUUID(),
      email: credentials.email,
      name: credentials.email.split('@')[0], // Use part of email as name
    };

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