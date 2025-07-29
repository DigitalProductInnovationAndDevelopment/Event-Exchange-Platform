import type { AppState } from "components/canvas/reducers/CanvasReducer.tsx";
import type { UUID } from "components/canvas/utils/constants.tsx";
import { type Profile } from "types/employee.ts";

export type EventStatus = "upcoming" | "ongoing" | "completed";
export type EventType = "WINTER_EVENT" | "SUMMER_EVENT" | "YEAR_END_PARTY";

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  upcoming: "orange",
  ongoing: "blue",
  completed: "green",
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  WINTER_EVENT: "blue",
  SUMMER_EVENT: "orange",
  YEAR_END_PARTY: "purple",
};

export interface FileEntity {
  fileId: string;
  name: string;
  contentType: string;
}

export interface SchematicsEntity {
  id: string;
}

export interface SeatAllocationResult {
  profile: Profile,
  participationId: UUID;
  invitorId: UUID | null,
  chairId: UUID | null,
  accessLink: string
}

export interface SeatAllocationUpsert {
  participationId: UUID,
  chairId: UUID | null,
}

export interface EventMinimal {
  id: string;
  name: string;
  date: string;
  address: string;
  fileEntities: FileEntity[];
  capacity: number;
  employeeParticipantCount: number;
  visitorParticipantCount: number;
  status: EventStatus;
  eventType: EventType;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  address: string;
  employeeParticipantCount: number;
  visitorParticipantCount: number;
  capacity: number;
  status: EventStatus;
  eventType: EventType;
  engagement?: number;
  description: string;
  notes?: string;
  fileEntities: FileEntity[];
  participantDetails: Profile[];
  schematics: SchematicsEntity | null;
}

export type SchematicsType = { id: string; state: AppState } | null;
