const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface UsageLog {
  token: string;
  date: string;
  wearType: "glasses" | "lenses";
  lensUsageDays: number;
  lastLensReplacementDate: string | null;
}

export const api = {
  async saveLog(log: UsageLog): Promise<UsageLog> {
    const response = await fetch(`${API_BASE_URL}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(log),
    });

    if (!response.ok) {
      throw new Error('Failed to save log');
    }

    return response.json();
  },

  async getLogs(token: string): Promise<UsageLog[]> {
    const response = await fetch(`${API_BASE_URL}/logs/${token}`);

    if (!response.ok) {
      throw new Error('Failed to fetch logs');
    }

    return response.json();
  },

  async getLatestLog(token: string): Promise<UsageLog | null> {
    const response = await fetch(`${API_BASE_URL}/logs/${token}/latest`);

    if (!response.ok) {
      throw new Error('Failed to fetch latest log');
    }

    const data = await response.json();
    return data || null;
  },
}; 