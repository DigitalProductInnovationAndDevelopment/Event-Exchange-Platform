/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Employee, ParticipationDetails, Profile } from "types/employee.ts";
import type { Event, FileEntity, SchematicsEntity } from "types/event.ts";
import toast from "react-hot-toast";
import React, { useCallback } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import type { AppState } from "components/canvas/reducers/CanvasReducer.tsx";
import Konva from "konva";
import { handleExport } from "components/canvas/utils/functions.tsx";

export const BASE_URL = import.meta.env.VITE_API_ORIGIN;

export default function useApiService() {
  const { logout } = useAuth();

  const request = useCallback(
    async <T = never>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const url = `${BASE_URL}${endpoint}`;

      const isFormData = options.body instanceof FormData;

      const config: RequestInit = {
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...(options.headers || {}),
        },
        credentials: "include",
        ...options,
      };

      let response: Response;

      try {
        response = await fetch(url, config);
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }

      if (response.status === 400) {
        toast.error(await response.text());
        throw new Error("Bad request");
      } else if (response.status === 401) {
        toast.error("Access denied. You are logged out.");
        logout();
        throw new Error("Access denied. You are logged out.");
      } else if (response.status === 403) {
        toast.error("Access denied. You don't have permission for this action.");
        //logout();
        throw new Error("Access denied. You don't have permission for this action.");
      } else if (response.status >= 500 || response.status === 409) {
        const errorMessage = await response.text();
        toast.error(errorMessage);
        throw new Error("Server error. Please try again later.");
      }

      const contentType = response.headers.get("Content-Type") ?? "";

      if (contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      if (
        contentType.includes("application/octet-stream") ||
        contentType.startsWith("application/") ||
        contentType.startsWith("image/") ||
        contentType.startsWith("video/")
      ) {
        return (await response.blob()) as T;
      }

      return (await response.text()) as unknown as T;
    },
    [logout]
  );

  const logoutRequest = useCallback(async () => {
    return await request(`/profile/logout`, {
      method: "POST",
    });
  }, [request]);

  const getOwnProfile = useCallback(async (): Promise<Profile> => {
    return await request<Profile>("/profile/own");
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
        const response = await request<Event>("/events", {
          method: "POST",
          body: JSON.stringify(eventData),
        });
        toast.success("Event created successfully!");
        return response;
      } catch (error) {
        console.error("Failed to create event", error);
        return null;
      }
    },
    [request]
  );

  const updateEvent = useCallback(
    async (id: string, eventData: Event): Promise<Event | null> => {
      try {
        const response = await request<Event>(`/events/${id}`, {
          method: "PUT",
          body: JSON.stringify(eventData),
        });
        toast.success("Event edited successfully!");
        return response;
      } catch (error) {
        console.error("Failed to update event", error);
        return null;
      }
    },
    [request]
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      try {
        const response = await request(`/events/${id}`, {
          method: "DELETE",
        });
        toast.success("Event is deleted successfully!");
        return response;
      } catch (err) {
        toast.error("Event deletion failed");
      }
    },
    [request]
  );

  const fileUpload = useCallback(
    async (formData: FormData) => {
      try {
        const response = await request<FileEntity>("/files/upload", {
          method: "POST",
          body: formData,
        });
        toast.success("File upload is successful!");
        return response;
      } catch (err) {
        toast.error("File upload failed");
      }
    },
    [request]
  );

  const fileDownload = useCallback(
    async (file: FileEntity) => {
      try {
        const blob = await request<Blob>(`/files/${file.fileId}`);

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", file.name);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        toast.error("Failed to download file");
      }
    },
    [request]
  );

  const deleteFile = useCallback(
    async (id: string) => {
      try {
        const response = await request(`/files/${id}`, {
          method: "DELETE",
        });
        toast.success("File is deleted successfully!");
        return response;
      } catch (err) {
        toast.error("File deletion failed");
      }
    },
    [request]
  );

  const getSchematics: (id: string) => Promise<AppState | undefined> = useCallback(
    async (id: string) => {
      try {
        const response = await request<{ state: string }>(`/schematics/${id}`);
        return JSON.parse(response.state) as AppState;
      } catch (err) {
        toast.error("Schematics fetch failed");
      }
    },
    [request]
  );

  const initiateSchematics = useCallback(
    async (eventId: string): Promise<SchematicsEntity | null> => {
      try {
        const response = await request(`/schematics`, {
          method: "POST",
          body: JSON.stringify({
            eventId: eventId,
            state: JSON.stringify({
              buildMode: 0,
              elements: [],
              groups: [],
              canvasPosition: { x: 0, y: 0 },
              scale: 1,
            } as AppState),
          }),
        });
        toast.success("Schematics saved successfully!");
        return response;
      } catch (err) {
        toast.error("Schematics save failed");
        return null;
      }
    },
    [request]
  );

  const updateSchematics = useCallback(
    async (
      id: string,
      canvasState: AppState,
      stageRef: React.RefObject<Konva.Stage | null> | null
    ): Promise<SchematicsEntity | null> => {
      const historyTemp = { ...canvasState.history };

      try {
        delete canvasState.history;

        const response = await request(`/schematics/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            state: JSON.stringify(canvasState),
          }),
        });
        if (stageRef && stageRef!.current) {
          const dataUrl = await handleExport(stageRef);
          if (dataUrl) {
            const arr = dataUrl!.split(",");
            const mime = arr[0].match(/:(.*?);/)![1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);

            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }

            const file = new File([u8arr], id, { type: mime });

            const formData = new FormData();
            formData.append("file", file);
            formData.append("schematicsId", id);
            await fileUpload(formData);
          }
        }

        toast.success("Schematics saved successfully!");
        // @ts-ignore
        canvasState.history = historyTemp;
        return response;
      } catch (err) {
        toast.error("Schematics save failed");
        // @ts-ignore
        canvasState.history = historyTemp;
        return null;
      }
    },
    [fileUpload, request]
  );

  const deleteSchematics = useCallback(
    async (id: string) => {
      try {
        const response = await request(`/schematics/${id}`, {
          method: "DELETE",
        });
        toast.success("Schematics is deleted successfully!");
        return response;
      } catch (err) {
        toast.error("Schematics deletion failed");
      }
    },
    [request]
  );

  const getEmployeeById = useCallback(
    async (id: string) => {
      try {
        return await request<Employee>(`/profile/employee/${id}`);
      } catch (err) {
        toast.error("Employee fetch failed");
      }
    },
    [request]
  );

  const getEmployees = useCallback(async () => {
    try {
      return await request<Employee[]>(`/profile/employees`);
    } catch (err) {
      toast.error("Employee fetch all operation failed");
    }
  }, [request]);

  const createEmployee = useCallback(
    async (employeeData: Employee): Promise<Employee | null> => {
      try {
        const response = await request<Employee>("/profile/employee", {
          method: "POST",
          body: JSON.stringify(employeeData),
        });
        toast.success("Employee created successfully!");
        return response;
      } catch (error) {
        console.error("Failed to create employee", error);
        return null;
      }
    },
    [request]
  );

  const createEmployeeBatch = useCallback(
    async (employeeDataList: Employee[]): Promise<Employee[] | null> => {
      try {
        const response = await request<Employee[]>("/profile/employees/batch", {
          method: "POST",
          body: JSON.stringify(employeeDataList),
        });
        toast.success("Employees created successfully!");
        return response;
      } catch (error) {
        console.error("Failed to create employees batch", error);
        return null;
      }
    },
    [request]
  );

  const updateEmployee = useCallback(
    async (id: string, employeeData: Employee): Promise<Employee | null> => {
      try {
        const response = await request<Employee>(`/profile/employee/${id}`, {
          method: "PUT",
          body: JSON.stringify(employeeData),
        });
        toast.success("Employee edited successfully!");
        return response;
      } catch (error) {
        console.error("Failed to update employee data", error);
        return null;
      }
    },
    [request]
  );

  const deleteEmployee = useCallback(
    async (id: string) => {
      try {
        const response = await request(`/profile/employee/${id}`, {
          method: "DELETE",
        });
        toast.success("Employee is deleted successfully!");
        return response;
      } catch (err) {
        toast.error("Employee deletion failed");
      }
    },
    [request]
  );

  const getEventParticipants = useCallback(
    async (eventId: string) => {
      try {
        return await request<ParticipationDetails[]>(`/events/${eventId}/participants`);
      } catch (err) {
        toast.error("Fetch operation for the participants of the event failed");
      }
    },
    [request]
  );

  const addParticipant = useCallback(
    async (participation: {
      guestCount: number;
      eventId: string;
      employeeId: string;
    }): Promise<ParticipationDetails | null> => {
      try {
        const response = await request<ParticipationDetails>(
          `/events/${participation.eventId}/participants`,
          {
            method: "POST",
            body: JSON.stringify(participation),
          }
        );
        toast.success("Participant added successfully!");
        return response;
      } catch (error) {
        console.error("Failed to add participant to the event", error);
        return null;
      }
    },
    [request]
  );

  const addParticipantsBatch = useCallback(
    async (
      participations: {
        guestCount: number;
        eventId: string;
        employeeId: string;
      }[]
    ): Promise<ParticipationDetails[] | null> => {
      try {
        if (participations.length === 0) return [];
        // Assume all participations are for the same event
        const eventId = participations[0].eventId;
        const response = await request<ParticipationDetails[]>(
          `/events/${eventId}/participants/batch`,
          {
            method: "POST",
            body: JSON.stringify(participations),
          }
        );
        toast.success("Participants added successfully!");
        return response;
      } catch (error) {
        console.error("Batch add participants failed", error);
        return null;
      }
    },
    [request]
  );

  const updateParticipant = useCallback(
    async (participation: {
      guestCount: number;
      eventId: string;
      employeeId: string;
    }): Promise<ParticipationDetails | null> => {
      try {
        const response = await request<ParticipationDetails>(
          `/events/${participation.eventId}/participants`,
          {
            method: "PUT",
            body: JSON.stringify(participation),
          }
        );
        toast.success("Participant updated successfully!");
        return response;
      } catch (error) {
        console.error("Failed to update participant to the event", error);
        return null;
      }
    },
    [request]
  );

  const deleteParticipation = useCallback(
    async (id: string) => {
      try {
        const response = await request(`/events/participants/${id}`, {
          method: "DELETE",
        });
        toast.success("Event participant is deleted successfully!");
        return response;
      } catch (err) {
        toast.error("Event participant deletion failed");
      }
    },
    [request]
  );

  // Returns a list of Employee objects who are participants of a given event
  const getEmployeesByEventId = useCallback(
    async (eventId: string): Promise<Employee[]> => {
      try {
        const participants = await getEventParticipants(eventId);
        const employees = await getEmployees();
        if (!participants || !employees) return [];
        const participantIds = new Set(participants.map(p => p.employeeId));
        return employees.filter(e => participantIds.has(e.profile.id));
      } catch (err) {
        toast.error("Failed to fetch employees for event");
        return [];
      }
    },
    [getEventParticipants, getEmployees]
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
    createEmployeeBatch,
    updateEmployee,
    deleteEmployee,
    getEventParticipants,
    addParticipant,
    addParticipantsBatch,
    updateParticipant,
    deleteParticipation,
    getEmployeesByEventId,
  };
}
