
import { v4 as uuidv4 } from 'uuid';
import { loadData, saveData } from './storage';

// 5 predefined tokens
export const PREDEFINED_TOKENS = [
  "EYEWEAR21",
  "VISION48X",
  "OPTICS92Z",
  "LENSES73Y",
  "GLASSES05"
];

// Generate a secure token - keeping for backwards compatibility
export const generateToken = (): string => {
  // Create a token based on UUID and timestamp for uniqueness
  return uuidv4().substring(0, 8).toUpperCase();
};

// Get all generated tokens
export const getGeneratedTokens = (): string[] => {
  return [...PREDEFINED_TOKENS];
};

// Check if a token is valid
export const isValidToken = (token: string): boolean => {
  // Compare exact match with our predefined tokens, case-sensitive
  return PREDEFINED_TOKENS.includes(token);
};

// Generate a specific number of tokens - keeping for backwards compatibility
export const generateTokens = (count: number): string[] => {
  return PREDEFINED_TOKENS.slice(0, count);
};
