// src/lib/api.ts
// API client for NestJS backend

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    // Validation errors come back as a list of messages
    const message = Array.isArray(error.message) ? error.message.join('; ') : error.message;
    throw new Error(message || 'Request failed');
  }
  if (response.status === 204) return null;
  return response.json();
};

const send = (method: string, path: string, data?: unknown) =>
  fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
  }).then(handleResponse);

// The standard list/get/create/update/delete endpoints of one resource
const crud = (path: string) => ({
  getAll: () => fetch(`${BASE_URL}${path}`).then(handleResponse),
  getOne: (id: string) => fetch(`${BASE_URL}${path}/${id}`).then(handleResponse),
  create: (data: unknown) => send('POST', path, data),
  update: (id: string, data: unknown) => send('PUT', `${path}/${id}`, data),
  delete: (id: string) => send('DELETE', `${path}/${id}`),
});

export const api = {
  departments: crud('/departments'),
  terms: crud('/terms'),
  rooms: crud('/rooms'),
  sections: crud('/sections'),
  subjects: crud('/subjects'),
  teachers: crud('/teachers'),
  assignments: crud('/assignments'),

  // Teacher Availability
  availability: {
    ...crud('/teacher-availability'),
    getAll: (teacherId?: string) => {
      const url = teacherId ? `${BASE_URL}/teacher-availability?teacherId=${teacherId}` : `${BASE_URL}/teacher-availability`;
      return fetch(url).then(handleResponse);
    },
  },

  // Timetable
  timetable: {
    ...crud('/timetable'),
    generate: (data: unknown) => send('POST', '/timetable/generate', data),
    updateSlot: (generationId: string, slotData: unknown) => send('PUT', `/timetable/${generationId}/slot`, slotData),
    activate: (id: string) => send('POST', `/timetable/${id}/activate`),
  },
};
