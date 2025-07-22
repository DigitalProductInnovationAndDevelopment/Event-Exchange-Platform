import { User, type UserType } from "../types/auth";

const AUTH_KEY = "auth_user";

export const authService = {
  login: async (userType: UserType): Promise<User> => {
    // Store user in localStorage
    localStorage.setItem(AUTH_KEY, JSON.stringify(userType));
    return new User(userType.email, userType.name, userType.roles);
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(AUTH_KEY);
    if (!userStr) return null;

    try {
      const userObj = JSON.parse(userStr);
      return new User(userObj.email, userObj.name, userObj.roles);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser();
  },
};
