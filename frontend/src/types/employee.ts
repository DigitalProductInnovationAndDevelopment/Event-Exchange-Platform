import type { UUID } from "components/canvas/utils/constants.tsx";

export interface Employee {
  profile: Profile;
  employmentStartDate: string;
  location: string;
  projects: Project[];
  participations?: ParticipationDetails[];
}

export function getFullName(profile: Profile | ParticipationDetails | undefined): string | "" {
  if (profile) {
    return profile.lastName ? `${profile.name} ${profile.lastName}` : profile.name;
  }
  return "";
}

export interface Profile {
  id: UUID;
  name: string;
  lastName: string;
  gender: string;
  gitlabUsername?: string;
  email: string;
  dietTypes: (keyof typeof DietaryPreference)[];
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
  name: string;
  lastName: string;
  gitlabUsername: string;
  email: string;
  dietTypes: (keyof typeof DietaryPreference)[];
}

export enum DietaryPreference {
  VEGETARIAN = "Vegetarian",
  PESCATARIAN = "Pescatarian",
  HALAL = "Halal",
  KOSHER = "Kosher",
  VEGAN = "Vegan",
  LACTOSE_FREE = "Lactose free",
  GLUTEN_FREE = "Gluten free",
  KETO = "Keto",
}

export enum EmploymentType {
  FULLTIME = "Full Time",
  PARTTIME = "Part Time",
  WORKING_STUDENT = "Working Student",
  THESIS = "Thesis",
}

export enum Role {
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  PARTNER = "PARTNER",
  VISITOR = "VISITOR",
}
