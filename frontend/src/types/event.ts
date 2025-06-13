export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  participants: number;
  capacity: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  type: 'Winter-Event' | 'Summer-Event' | 'Year-End-Party';
  engagement?: number;
  year: number;
  description: string;
} 