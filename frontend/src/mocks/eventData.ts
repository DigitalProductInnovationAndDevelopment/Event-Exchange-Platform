import type { Event } from '../types/event';

export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Tech Conference 2024',
    date: '2025-12-13',
    location: 'San Francisco Convention Center',
    type: 'Winter-Event',
    status: 'upcoming',
    participants: 158,
    capacity: 200,
    description: 'Join us for the biggest tech conference of the year. Network with industry leaders, attend workshops, and discover the latest innovations in technology.',
    engagement: 92,
    year: 2024
  },
  {
    id: '2',
    name: 'Web Development Workshop',
    date: '2023-07-06',
    location: 'New York Tech Hub',
    type: 'Winter-Event',
    status: 'completed',
    participants: 225,
    capacity: 300,
    description: 'Hands-on workshop covering modern web development practices, frameworks, and tools. Perfect for developers looking to enhance their skills.',
    engagement: 88,
    year: 2024
  },
  {
    id: '3',
    name: 'Project Planning Meeting',
    date: '2024-12-20',
    location: 'Chicago Business Center',
    type: 'Year-End-Party',
    status: 'completed',
    participants: 108,
    capacity: 150,
    description: 'Quarterly project planning meeting to discuss goals, timelines, and resource allocation for upcoming initiatives.',
    engagement: 85,
    year: 2024
  },
  {
    id: '4',
    name: 'Winter Networking Mixer',
    date: '2023-12-14',
    location: 'Boston Innovation Center',
    type: 'Winter-Event',
    status: 'completed',
    participants: 145,
    capacity: 150,
    description: 'Annual winter networking event bringing together industry professionals for an evening of connections and collaboration.',
    engagement: 78,
    year: 2024
  },
  {
    id: '5',
    name: 'Summer Tech Festival',
    date: '2025-06-25',
    location: 'Miami Beach Convention Center',
    type: 'Summer-Event',
    status: 'ongoing',
    participants: 180,
    capacity: 250,
    description: 'A week-long celebration of technology and innovation featuring workshops, hackathons, and networking opportunities.',
    engagement: 95,
    year: 2024
  },
  {
    id: '6',
    name: 'Annual Company Celebration',
    date: '2024-06-20',
    location: 'Las Vegas Grand Hotel',
    type: 'Summer-Event',
    status: 'completed',
    participants: 120,
    capacity: 150,
    description: 'Join us for our annual year-end celebration featuring awards, entertainment, and a look back at our achievements.',
    engagement: 90,
    year: 2024
  }
]; 