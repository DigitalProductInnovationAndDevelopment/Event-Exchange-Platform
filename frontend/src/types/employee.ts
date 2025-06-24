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
  id: string;
  employeeId: string;
  eventId: string;
  guestCount: number;
  confirmed: boolean;
  eventName: string;
  eventType: string;
  eventDate: string;
  eventAddress: string;
  fullName: string;
  gitlabUsername: string;
  email: string;
}

export enum DietaryPreference {
  VEGETARIAN = 'Vegetarian',
  PESCATARIAN = 'Pescatarian',
  HALAL = 'Halal',
  KOSHER = 'Kosher',
  VEGAN = 'Vegan',
  LACTOSE_FREE = 'Lactose free',
  GLUTEN_FREE = 'Gluten free',
  KETO = 'Keto'
}

export enum EmploymentType {
  FULLTIME = "Full Time",
  PARTTIME = "Part Time",
  WORKING_STUDENT = "Working Student",
  THESIS = "Thesis",
}

export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  VISITOR = 'VISITOR',
}