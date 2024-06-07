import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCorrectDate(dateString: string | null): string | null {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);
  const correctDate = new Date(date).toISOString();

  return correctDate;
}
