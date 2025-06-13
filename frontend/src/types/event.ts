export interface Event {
  id: string;
  name: string;
  date: string;
  participants: number;
  capacity: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  engagement?: number;
  year: number;
} 