export interface Employee {
  profile: Profile;
  employmentStartDate: string;
  employmentType: string;
  location: string;
  projects: Project[],
  participations?: ParticipationDetails[];
}

export interface Profile {
  id: string;
  fullName: string;
  gender: string;
  gitlabUsername: string;
  email: string;
  dietTypes: DietaryPreference[];
  authorities?: Role[];
}

export interface Project {
  name: string | null;
  abbreviation: string | null;
}

export interface ParticipationDetails {
  eventId: string;
  guestCount: number;
  confirmed: boolean;
  eventName: string;
  eventType: string;
  eventDate: string;
  eventAddress: string;
}

export enum DietaryPreference {
  VEGETARIAN = 'Vegetarian',
  PESCATARIAN = 'Pescatarian',
  HALAL = 'Halal',
  KOSHER = 'Kosher',
  VEGAN = 'Vegan',
}

export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  VISITOR = 'VISITOR',
}