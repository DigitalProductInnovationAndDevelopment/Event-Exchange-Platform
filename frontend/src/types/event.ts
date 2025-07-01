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
  overviewFileId: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  address: string;
  participantCount: number;
  capacity: number;
  status: EventStatus;
  eventType: EventType;
  engagement?: number;
  year: number;
  description: string;
  cost: number;
  fileEntities: FileEntity[];
  schematics: SchematicsEntity | null;
}
