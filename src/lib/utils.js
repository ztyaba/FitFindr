import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a consistent color for a professional based on their ID
 * Uses a hash function to ensure the same ID always gets the same color
 */
export function getProfessionalColor(professionalId) {
  // Predefined vibrant colors that work well on maps
  const colors = [
    "#2563eb", // Blue
    "#dc2626", // Red
    "#16a34a", // Green
    "#ea580c", // Orange
    "#9333ea", // Purple
    "#0891b2", // Cyan
    "#eab308", // Yellow
    "#f43f5e", // Pink
    "#06b6d4", // Sky
    "#8b5cf6", // Violet
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#3b82f6", // Light Blue
    "#ef4444", // Light Red
    "#14b8a6", // Teal
    "#a855f7", // Fuchsia
  ];
  
  // Simple hash function to convert ID to a number
  let hash = 0;
  const idString = String(professionalId);
  for (let i = 0; i < idString.length; i++) {
    const char = idString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
} 