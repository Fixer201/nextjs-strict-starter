import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

/**
 * Combines conditional class names and resolves conflicting Tailwind utilities.
 *
 * @param classNames - Class values accepted by clsx.
 * @returns A normalized class-name string.
 */
export function cn(...classNames: ClassValue[]) {
  return twMerge(clsx(classNames))
}
