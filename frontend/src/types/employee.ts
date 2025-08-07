import { DietaryPreference, type UUID } from "components/canvas/utils/constants.tsx";

export interface Employee {
  profile: Profile;
  employmentStartDate: string;
  location: string;
  participations?: ParticipationDetails[];
  participationCount?: number;
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
  gitlabUsername?: string | null;
  notes?: string | null;
  email: string;
  dietTypes: (keyof typeof DietaryPreference)[];
  authorities?: Role[];
  isVisitor?: boolean;
}

export interface Project {
  name: string | null;
  abbreviation: string | null;
}

export interface EmployeeBatchUpsertResponse {
  insertedEmployees: Employee[];
  updatedEmployees: Employee[];
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
  name?: string;
  lastName?: string;
  gitlabUsername?: string;
  email?: string;
  dietTypes: (keyof typeof DietaryPreference)[];
}

export type ParticipationBatchResult = {
  createdParticipations: ParticipationDetails[];
  updatedParticipations: ParticipationDetails[];
};

export enum Role {
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  PARTNER = "PARTNER",
  VISITOR = "VISITOR",
}
