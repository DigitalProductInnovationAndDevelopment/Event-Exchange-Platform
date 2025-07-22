export interface UserType {
  email: string;
  name: string;
  roles: string[];
}

export class User implements UserType {
  email: string;
  name: string;
  roles: string[];

  constructor(email: string, name: string, roles: string[]) {
    this.email = email;
    this.name = name;
    this.roles = roles;
  }

  isAdmin() {
    return Array.isArray(this.roles) && this.roles.includes("ADMIN");
  }
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
