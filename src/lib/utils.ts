import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Text for a failed-request toast. api.ts throws Errors that carry the backend's message.
export function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

// A reference arrives as an id, or as the record when the API populated it
export function idOf(ref: string | { _id: string } | null | undefined): string {
  return typeof ref === "object" && ref ? ref._id : ref ?? ""
}

export function docOf<T extends { _id: string }>(ref: string | T | null | undefined): T | undefined {
  return typeof ref === "object" && ref ? ref : undefined
}

// "09:00–09:50" for period 1, if the term has clock times
export function periodTime(times: { start: string; end: string }[] | undefined, period: number) {
  const time = times?.[period - 1]
  return time ? `${time.start}–${time.end}` : ""
}
