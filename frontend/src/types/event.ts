export type EventStatus = 'upcoming' | 'ongoing' | 'completed';
export type EventType = 'Winter-Event' | 'Summer-Event' | 'Year-End-Party';

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  'upcoming': 'orange',
  'ongoing': 'blue',
  'completed': 'green'
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  'Winter-Event': 'blue',
  'Summer-Event': 'orange',
  'Year-End-Party': 'purple'
};

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  participants: number;
  capacity: number;
  status: EventStatus;
  type: EventType;
  engagement?: number;
  year: number;
  description: string;
  cost: number;
}