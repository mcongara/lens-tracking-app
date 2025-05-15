import { api, UsageLog as ApiUsageLog } from './api';
import { dataChangeEmitter } from './events';

interface Entry {
  date: string; // ISO date format YYYY-MM-DD
  wearType: "glasses" | "lenses";
}

interface TokenData {
  entries: Entry[];
  lastLensReplacementDate: string | null;
  lensUsageDays: number;
}

interface AppData {
  token: string | null;
  tokenData: Record<string, TokenData>;
  generatedTokens: string[];
}

const STORAGE_KEY = "eyewear-tracker-data";

// Initialize with default values
const defaultData: AppData = {
  token: null,
  tokenData: {},
  generatedTokens: [],
};

// Load data from localStorage
export const loadData = (): AppData => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData) as AppData;
    }
  } catch (error) {
    console.error("Failed to load data from storage", error);
  }
  return { ...defaultData };
};

// Save data to localStorage and server
export const saveData = async (data: AppData): Promise<void> => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // If there's a token and token data, sync with server
    if (data.token && data.tokenData[data.token]) {
      const tokenData = data.tokenData[data.token];
      const latestEntry = tokenData.entries[tokenData.entries.length - 1];
      
      if (latestEntry) {
        await api.saveLog({
          token: data.token,
          date: latestEntry.date,
          wearType: latestEntry.wearType,
          lensUsageDays: tokenData.lensUsageDays,
          lastLensReplacementDate: tokenData.lastLensReplacementDate
        });
      }
    }
    
    // Notify listeners that data has changed
    dataChangeEmitter.emit();
  } catch (error) {
    console.error("Failed to save data", error);
  }
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  const data = loadData();
  return !!data.token;
};

// Authenticate user with token
import { isValidToken, PREDEFINED_TOKENS } from './tokens';

export const authenticate = async (token: string): Promise<boolean> => {
  if (!isValidToken(token)) {
    console.log("Invalid token attempted:", token);
    return false;
  }
  
  const data = loadData();
  
  try {
    // Try to get all logs from server
    const logs = await api.getLogs(token);
    
    // Save token and create data structure regardless of logs
    data.token = token;
    
    // Initialize token data with empty state or existing logs
    data.tokenData[token] = {
      entries: logs ? logs.map(log => ({
        date: log.date,
        wearType: log.wearType
      })) : [],
      lastLensReplacementDate: logs?.[0]?.lastLensReplacementDate || null,
      lensUsageDays: logs?.[0]?.lensUsageDays || 0
    };
    
    await saveData(data);
    return true;
  } catch (error) {
    console.error("Failed to authenticate with server", error);
    return false;
  }
};

// Log out user
export const logout = async (): Promise<void> => {
  const data = loadData();
  data.token = null;
  await saveData(data);
};

// Get current user's token data
const getCurrentTokenData = (): TokenData => {
  const data = loadData();
  if (!data.token) {
    return { entries: [], lastLensReplacementDate: null, lensUsageDays: 0 };
  }
  
  return data.tokenData[data.token] || { entries: [], lastLensReplacementDate: null, lensUsageDays: 0 };
};

// Add an entry for a specific date
export const addEntry = async (date: string, wearType: "glasses" | "lenses"): Promise<void> => {
  const data = loadData();
  if (!data.token) return;
  
  const tokenData = data.tokenData[data.token] || { entries: [], lastLensReplacementDate: null, lensUsageDays: 0 };
  
  // Remove any existing entry for this date
  const filteredEntries = tokenData.entries.filter(entry => entry.date !== date);
  
  // Add new entry
  const newEntry: Entry = { date, wearType };
  tokenData.entries = [...filteredEntries, newEntry];
  
  // Handle lens usage tracking
  if (wearType === "lenses") {
    tokenData.lensUsageDays += 1;
    
    // If this is the first lens usage, set the replacement date
    if (tokenData.lastLensReplacementDate === null) {
      tokenData.lastLensReplacementDate = date;
    }
  }
  
  data.tokenData[data.token] = tokenData;
  await saveData(data);
};

// Get entry for a specific date
export const getEntryForDate = (date: string): Entry | undefined => {
  if (!date) return undefined;
  
  const tokenData = getCurrentTokenData();
  return tokenData.entries.find(entry => entry.date === date);
};

// Remove an entry for a specific date
export const removeEntry = (date: string): void => {
  const data = loadData();
  if (!data.token) return;
  
  const tokenData = data.tokenData[data.token];
  if (!tokenData) return;
  
  const entry = getEntryForDate(date);
  
  // If removing a lens entry, decrement the usage count
  if (entry && entry.wearType === "lenses") {
    tokenData.lensUsageDays = Math.max(0, tokenData.lensUsageDays - 1);
  }
  
  tokenData.entries = tokenData.entries.filter(entry => entry.date !== date);
  data.tokenData[data.token] = tokenData;
  saveData(data);
};

// Reset lens counter
export const resetLensCounter = async (): Promise<void> => {
  const data = loadData();
  if (!data.token) return;
  
  const tokenData = data.tokenData[data.token];
  if (!tokenData) return;
  
  tokenData.lensUsageDays = 0;
  tokenData.lastLensReplacementDate = getCurrentDate();
  
  data.tokenData[data.token] = tokenData;
  await saveData(data);
};

// Get current date in YYYY-MM-DD format
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Get stats for a given month and year
export const getMonthStats = (month: number, year: number): { glasses: number; lenses: number } => {
  const tokenData = getCurrentTokenData();
  const stats = { glasses: 0, lenses: 0 };
  
  tokenData.entries.forEach(entry => {
    const entryDate = new Date(entry.date);
    if (entryDate.getMonth() === month && entryDate.getFullYear() === year) {
      if (entry.wearType === "glasses") {
        stats.glasses += 1;
      } else {
        stats.lenses += 1;
      }
    }
  });
  
  return stats;
};

// Check if lens replacement is due
export const isLensReplacementDue = (): boolean => {
  const tokenData = getCurrentTokenData();
  return tokenData.lensUsageDays >= 30;
};

// Get lens usage days remaining
export const getLensUsageDaysRemaining = (): number => {
  const tokenData = getCurrentTokenData();
  return Math.max(0, 30 - tokenData.lensUsageDays);
};
