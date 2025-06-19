/* eslint-disable @typescript-eslint/no-unused-vars */

import type {Employee, Profile} from 'types/employee.ts';
import type {Event, FileEntity} from 'types/event.ts';
import toast from 'react-hot-toast';
import {useCallback} from 'react';
import {useAuth} from '../contexts/AuthContext.tsx';
import type {AppState} from "components/canvas/reducers/CanvasReducer.tsx";

const BASE_URL = 'http://localhost:8000';

export default function useApiService() {
    const {logout} = useAuth();

    const request = useCallback(
        async <T = never>(endpoint: string, options: RequestInit = {}): Promise<T> => {
            const url = `${BASE_URL}${endpoint}`;

            const isFormData = options.body instanceof FormData;

            const config: RequestInit = {
                headers: {
                    ...(isFormData ? {} : {'Content-Type': 'application/json'}),
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
            } else if (response.status >= 500 || response.status === 409) {
                const errorMessage = await response.text();
                toast.error(errorMessage);
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
        return await request(`/profile/logout`, {
            method: 'POST',
        });
    }, [request]);

    const getOwnProfile = useCallback(async (): Promise<Profile> => {
        return await request<Profile>('/profile/own');
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
                const response = await request(`/events/${id}`, {
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

    const fileUpload = useCallback(
        async (formData: FormData) => {
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
        },
        [request]
    );

    const fileDownload = useCallback(
        async (file: FileEntity) => {
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
        },
        [request]
    );

    const deleteFile = useCallback(
        async (id: string) => {
            try {
                const response = await request(`/files/${id}`, {
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

    const getSchematics = useCallback(async (id: string) => {
        try {
            return await request<{ id: string, name: string, state: AppState }>(`/schematics/${id}`);
        } catch (err) {
            toast.error('Schematics fetch failed');
        }
    }, [request]);


    const initiateSchematics = useCallback(async (eventId: string, fileName: string) => {
        try {
            const response = await request(`/schematics`, {
                method: 'POST',
                body: JSON.stringify({
                    name: fileName,
                    eventId: eventId,
                    state: JSON.stringify({
                        buildMode: 0,
                        elements: [],
                        groups: [],
                        canvasPosition: {x: 0, y: 0},
                        scale: 1
                    } as AppState),
                }),
            });
            toast.success('Schematics saved successfully!');
            return response;
        } catch (err) {
            toast.error('Schematics save failed');
        }
    }, [request]);

    const updateSchematics = useCallback(async (id: string, canvasState: AppState & {
        canvasPosition: { x: number; y: number };
        scale: number
    }) => {
        try {
            const response = await request(`/schematics/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    state: JSON.stringify(canvasState),
                }),
            });
            toast.success('Schematics saved successfully!');
            return response;
        } catch (err) {
            toast.error('Schematics save failed');
        }
    }, [request]);

    const deleteSchematics = useCallback(
        async (id: string) => {
            try {
                const response = await request(`/schematics/${id}`, {
                    method: 'DELETE',
                });
                toast.success('Schematics is deleted successfully!');
                return response;
            } catch (err) {
                toast.error('Schematics deletion failed');
            }
        },
        [request]
    );

    const getEmployeeById = useCallback(async (id: string) => {
        try {
            return await request<Employee>(`/profile/employee/${id}`);
        } catch (err) {
            toast.error('Employee fetch failed');
        }
    }, [request]);

    const getEmployees = useCallback(async () => {
        try {
            return await request<Employee[]>(`/profile/employees`);
        } catch (err) {
            toast.error('Employee fetch all operation failed');
        }
    }, [request]);

    const createEmployee = useCallback(
        async (employeeData: Employee): Promise<Employee | null> => {
            try {
                const response = await request<Employee>('/profile/employee', {
                    method: 'POST',
                    body: JSON.stringify(employeeData),
                });
                toast.success('Employee created successfully!');
                return response;
            } catch (error) {
                console.error('Failed to create employee', error);
                return null;
            }
        },
        [request]
    );

    const updateEmployee = useCallback(
        async (id: string, employeeData: Employee): Promise<Employee | null> => {
            try {
                const response = await request<Employee>(`/profile/employee/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(employeeData),
                });
                toast.success('Employee edited successfully!');
                return response;
            } catch (error) {
                console.error('Failed to update employee data', error);
                return null;
            }
        },
        [request]
    );

    const deleteEmployee = useCallback(
        async (id: string) => {
            try {
                const response = await request(`/profile/employee/${id}`, {
                    method: 'DELETE',
                });
                toast.success('Employee is deleted successfully!');
                return response;
            } catch (err) {
                toast.error('Employee deletion failed');
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
        initiateSchematics,
        getSchematics,
        updateSchematics,
        deleteSchematics,
        getEmployeeById,
        getEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee,
    };
}
