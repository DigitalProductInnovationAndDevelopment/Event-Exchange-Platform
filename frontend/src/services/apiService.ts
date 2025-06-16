import type { Profile } from 'types/employee.ts';
import type { Event, FileEntity } from 'types/event.ts';
import toast from 'react-hot-toast';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';

const BASE_URL = 'http://localhost:8000';

export default function useApiService() {
  const { logout } = useAuth();

  const request = useCallback(
    async <T = never>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const url = `${BASE_URL}${endpoint}`;

      const isFormData = options.body instanceof FormData;

      const config: RequestInit = {
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...(options.headers || {}),
        },
        credentials: 'include',
        ...options,
      };

      let response: Response;

      try {
        response = await fetch(url, config);
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }

      if (response.status === 400) {
        toast.error(await response.text());
        throw new Error('Bad request');
      } else if (response.status === 401) {
        toast.error('Access denied. You are logged out.');
        logout();
        throw new Error('Access denied. You are logged out.');
      } else if (response.status === 403) {
        toast.error("Access denied. You don't have permission for this action.");
        throw new Error("Access denied. You don't have permission for this action.");
      } else if (response.status >= 500) {
        toast.error('Server error. Please try again later.');
        throw new Error('Server error. Please try again later.');
      }

      const contentType = response.headers.get('Content-Type') ?? '';

      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      if (
        contentType.includes('application/octet-stream') ||
        contentType.startsWith('application/') ||
        contentType.startsWith('image/') ||
        contentType.startsWith('video/')
      ) {
        return (await response.blob()) as T;
      }

      return (await response.text()) as unknown as T;
    },
    [logout]
  );

  const logoutRequest = useCallback(async () => {
    return request(`/profile/logout`, {
      method: 'POST',
    });
  }, [request]);

  const getOwnProfile = useCallback(async (): Promise<Profile> => {
    return request<Profile>('/profile/own');
  }, [request]);

  const getEventById = useCallback(
    async (id: string): Promise<Event | null> => {
      try {
        return await request<Event>(`/events/${id}`);
      } catch (error) {
        console.error(`Failed to fetch event with ID ${id}:`, error);
        return null;
      }
    },
    [request]
  );

  const getEvents = useCallback(async (): Promise<Event[] | null> => {
    try {
      return await request<Event[]>(`/events/all`);
    } catch (error) {
      console.error(`Failed to fetch events:`, error);
      return null;
    }
  }, [request]);

  const createEvent = useCallback(
    async (eventData: Event): Promise<Event | null> => {
      try {
        const response = await request<Event>('/events', {
          method: 'POST',
          body: JSON.stringify(eventData),
        });
        toast.success('Event created successfully!');
        return response;
      } catch (error) {
        console.error('Failed to create event', error);
        return null;
      }
    },
    [request]
  );

  const updateEvent = useCallback(
    async (id: string, eventData: Event): Promise<Event | null> => {
      try {
        const response = await request<Event>(`/events/${id}`, {
          method: 'PUT',
          body: JSON.stringify(eventData),
        });
        toast.success('Event edited successfully!');
        return response;
      } catch (error) {
        console.error('Failed to update event', error);
        return null;
      }
    },
    [request]
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      try {
        const response = request(`/events/${id}`, {
          method: 'DELETE',
        });
        toast.success('Event is deleted successfully!');
        return response;
      } catch (err) {
        toast.error('Event deletion failed');
      }
    },
    [request]
  );

  const fileUpload = async (formData: FormData) => {
    try {
      const response = await request<string>('/files/upload', {
        method: 'POST',
        body: formData,
      });
      toast.success('File upload is successful!');
      return response;
    } catch (err) {
      toast.error('File upload failed');
    }
  };

  const fileDownload = async (file: FileEntity) => {
    try {
      const blob = await request<Blob>(`/files/${file.fileId}`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error('Failed to download file');
    }
  };

  const deleteFile = useCallback(
    async (id: string) => {
      try {
        const response = request(`/files/${id}`, {
          method: 'DELETE',
        });
        toast.success('File is deleted successfully!');
        return response;
      } catch (err) {
        toast.error('File deletion failed');
      }
    },
    [request]
  );

  return {
    request,
    logoutRequest,
    getOwnProfile,
    getEventById,
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    fileUpload,
    deleteFile,
    fileDownload,
  };
}
