// src/lib/types.ts
// TypeScript interfaces matching backend schemas

export interface Section {
  _id: string;
  code: string;
  name?: string;
  semester: number;
  branch: string;
  strength?: number;
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
  department?: string;
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
  sectionId: string | Section;
  subjectId: string | Subject;
  teacherId: string | Teacher;
  sessions: Sessions;
  constraint: 'hard' | 'soft';
  priority?: number;
  createdAt: string;
}

export interface Config {
  days: string[];
  periodsPerDay: number;
  maxConsecutive: number;
  breakPeriods?: number[];
  lunchPeriod?: number;
}

export interface TimetableSlot {
  _id: string;
  generationId: string;
  sectionId: string | Section;
  subjectId?: string | Subject;
  teacherId?: string | Teacher;
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
  config: Config;
  status: 'draft' | 'active' | 'archived';
  createdBy?: string;
  generationTime?: number;
  createdAt: string;
  updatedAt?: string;
  slots?: TimetableSlot[];
  conflicts?: Conflict[];
}