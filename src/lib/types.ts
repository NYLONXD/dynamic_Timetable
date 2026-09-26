// src/lib/types.ts
// TypeScript interfaces matching backend schemas.
// A reference to another record arrives either as its id or, where the API populates it,
// as the record itself: see `idOf` and `docOf` in utils.ts.

export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface Department {
  _id: string;
  code: string;
  name: string;
}

export type RoomType = 'lecture' | 'lab' | 'seminar';

export interface Room {
  _id: string;
  code: string;
  name?: string;
  building?: string;
  type: RoomType;
  capacity: number;
  departmentId?: string | Department | null;
}

export interface PeriodTime {
  start: string; // "09:00"
  end: string;
}

export interface Term {
  _id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  days: string[];
  periodsPerDay: number;
  periodTimes: PeriodTime[]; // empty, or one per period
  breakPeriods: number[];
  lunchPeriod?: number | null;
  timetableCount?: number; // only from GET /terms
  createdAt: string;
}

export interface Section {
  _id: string;
  code: string;
  name?: string;
  semester: number;
  branch: string;
  strength?: number;
  departmentId?: string | Department | null;
  batches: string[]; // e.g. ["B1", "B2"] when labs split the section
  createdAt: string;
}

export interface Subject {
  _id: string;
  code: string;
  name: string;
  category: 'theory' | 'lab' | 'seminar' | 'tutorial';
  defaultCredits?: number;
  requiresConsecutive?: boolean;
  defaultSessionLength?: number;
  createdAt: string;
}

export interface Teacher {
  _id: string;
  staffId: string;
  name: string;
  email?: string;
  departmentId?: string | Department | null;
  maxHoursPerDay?: number;
  maxHoursPerWeek?: number;
  createdAt: string;
}

export interface TeacherAvailability {
  _id: string;
  teacherId: string | Teacher;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number;
  type: 'unavailable' | 'preferred';
  reason?: string;
  createdAt: string;
}

export interface Sessions {
  perWeek: number;
  length: number;
}

export interface Assignment {
  _id: string;
  sectionIds: (string | Section)[]; // several = a combined class
  subjectId: string | Subject;
  teacherId: string | Teacher;
  sessions: Sessions;
  constraint: 'hard' | 'soft';
  priority?: number;
  batch?: string | null; // only this batch of the section attends
  parallelGroup?: string | null; // same label = scheduled at the same times
  roomId?: string | Room | null; // pinned room
  studentCount?: number | null; // expected attendance, if not the whole sections
  createdAt: string;
}

export interface Config {
  days: string[];
  periodsPerDay: number;
  maxConsecutive: number;
  breakPeriods?: number[];
  lunchPeriod?: number;
  periodTimes?: PeriodTime[];
}

export interface TimetableSlot {
  _id: string;
  generationId: string;
  sectionIds: (string | Section)[];
  batch?: string;
  subjectId?: string | Subject;
  teacherId?: string | Teacher;
  roomId?: string | Room;
  parallelGroup?: string;
  day: string;
  period: number;
  status: 'active' | 'locked' | 'substituted' | 'cancelled' | 'break';
  isLocked?: boolean;
  lockReason?: string;
  originalTeacherId?: string;
  substituteReason?: string;
  changedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Conflict {
  _id: string;
  generationId: string;
  type: string;
  severity: 'warning' | 'error';
  message: string;
  affectedSlots?: string[];
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

export interface Generation {
  _id: string;
  name: string;
  termId?: string | Pick<Term, '_id' | 'name'>;
  sectionIds?: string[];
  config: Config;
  status: 'draft' | 'active' | 'archived';
  createdBy?: string;
  generationTime?: number;
  createdAt: string;
  updatedAt?: string;
  slots?: TimetableSlot[]; // only from GET /timetable/:id
  conflicts?: Conflict[]; // only from GET /timetable/:id
  slotCount?: number; // only from GET /timetable
  conflictCount?: number; // only from GET /timetable
}
