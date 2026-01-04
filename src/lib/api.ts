// src/lib/api.ts
// API client for NestJS backend

const BASE_URL = 'http://localhost:4000/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  // Sections
  sections: {
    getAll: () => fetch(`${BASE_URL}/sections`).then(handleResponse),
    getOne: (id: string) => fetch(`${BASE_URL}/sections/${id}`).then(handleResponse),
    create: (data: any) => fetch(`${BASE_URL}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string, data: any) => fetch(`${BASE_URL}/sections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string) => fetch(`${BASE_URL}/sections/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // Subjects
  subjects: {
    getAll: () => fetch(`${BASE_URL}/subjects`).then(handleResponse),
    getOne: (id: string) => fetch(`${BASE_URL}/subjects/${id}`).then(handleResponse),
    create: (data: any) => fetch(`${BASE_URL}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string, data: any) => fetch(`${BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string) => fetch(`${BASE_URL}/subjects/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // Teachers
  teachers: {
    getAll: () => fetch(`${BASE_URL}/teachers`).then(handleResponse),
    getOne: (id: string) => fetch(`${BASE_URL}/teachers/${id}`).then(handleResponse),
    create: (data: any) => fetch(`${BASE_URL}/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string, data: any) => fetch(`${BASE_URL}/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string) => fetch(`${BASE_URL}/teachers/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // Teacher Availability
  availability: {
    getAll: (teacherId?: string) => {
      const url = teacherId ? `${BASE_URL}/teacher-availability?teacherId=${teacherId}` : `${BASE_URL}/teacher-availability`;
      return fetch(url).then(handleResponse);
    },
    getOne: (id: string) => fetch(`${BASE_URL}/teacher-availability/${id}`).then(handleResponse),
    create: (data: any) => fetch(`${BASE_URL}/teacher-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string, data: any) => fetch(`${BASE_URL}/teacher-availability/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string) => fetch(`${BASE_URL}/teacher-availability/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // Assignments
  assignments: {
    getAll: () => fetch(`${BASE_URL}/assignments`).then(handleResponse),
    getOne: (id: string) => fetch(`${BASE_URL}/assignments/${id}`).then(handleResponse),
    create: (data: any) => fetch(`${BASE_URL}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    update: (id: string, data: any) => fetch(`${BASE_URL}/assignments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string) => fetch(`${BASE_URL}/assignments/${id}`, { method: 'DELETE' }).then(handleResponse),
  },

  // Timetable
  timetable: {
    generate: (data: any) => fetch(`${BASE_URL}/timetable/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    getAll: () => fetch(`${BASE_URL}/timetable`).then(handleResponse),
    getOne: (id: string) => fetch(`${BASE_URL}/timetable/${id}`).then(handleResponse),
    update: (id: string, data: any) => fetch(`${BASE_URL}/timetable/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (id: string) => fetch(`${BASE_URL}/timetable/${id}`, { method: 'DELETE' }).then(handleResponse),
    updateSlot: (generationId: string, slotData: any) => fetch(`${BASE_URL}/timetable/${generationId}/slot`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slotData),
    }).then(handleResponse),
    activate: (id: string) => fetch(`${BASE_URL}/timetable/${id}/activate`, {
      method: 'POST',
    }).then(handleResponse),
  },
};