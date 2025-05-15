const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface UsageLog {
  token: string;
  date: string;
  wearType: "glasses" | "lenses";
  lensUsageDays: number;
  lastLensReplacementDate: string | null;
}

export interface UsageSummary {
  totalDays: number;
  lensUsageDays: number;
  glassesUsageDays: number;
  lastLensReplacementDate: string | null;
  currentLensUsageDays: number;
  latestLog: UsageLog | null;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const defaultOptions = {
  credentials: 'include' as RequestCredentials,
  headers: defaultHeaders,
};

export const api = {
  async saveLog(log: UsageLog): Promise<UsageLog> {
    const response = await fetch(`${API_BASE_URL}/logs`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify(log),
    });

    if (!response.ok) {
      throw new Error('Failed to save log');
    }

    return response.json();
  },

  async getLogs(token: string): Promise<UsageLog[]> {
    const response = await fetch(`${API_BASE_URL}/logs/${token}`, {
      ...defaultOptions,
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch logs');
    }

    return response.json();
  },

  async getLatestLog(token: string): Promise<UsageLog | null> {
    const response = await fetch(`${API_BASE_URL}/logs/${token}/latest`, {
      ...defaultOptions,
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch latest log');
    }

    const data = await response.json();
    return data || null;
  },

  async getMonthlyLogs(token: string, year: number, month: number): Promise<UsageLog[]> {
    const response = await fetch(`${API_BASE_URL}/logs/${token}/monthly/${year}/${month}`, {
      ...defaultOptions,
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch monthly logs');
    }

    return response.json();
  },

  async getSummary(token: string): Promise<UsageSummary> {
    const response = await fetch(`${API_BASE_URL}/logs/${token}/summary`, {
      ...defaultOptions,
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch summary');
    }

    return response.json();
  },

  async clearAllLogs(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/logs`, {
      ...defaultOptions,
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to clear logs');
    }
  }
}; 