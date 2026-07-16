import { formatInTimeZone, toDate } from 'date-fns-tz';

const TIMEZONE = 'America/Sao_Paulo';

/**
 * Converts a date to a string suitable for Supabase (ISO format) in the Brazil/Sao_Paulo timezone.
 * Defaults to current time if no date is provided.
 */
export const toSupabaseDateTime = (date: Date | number = new Date()): string => {
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
};

/**
 * Parses a date string from Supabase and converts it to a Date object.
 */
export const fromSupabaseDateTime = (dateString: string): Date => {
  return toDate(dateString);
};

/**
 * Formats a date for display in the Brazil/Sao_Paulo timezone.
 */
export const formatDisplayDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy HH:mm'): string => {
  const d = typeof date === 'string' ? fromSupabaseDateTime(date) : date;
  return formatInTimeZone(d, TIMEZONE, formatStr);
};
