export interface UserPreferences {
  id: string;
  userId: string;
  timezone: string;
  showClock: boolean;
  showHealthInsights: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PreferencesUpdateInput {
  timezone?: string;
  showClock?: boolean;
  showHealthInsights?: boolean;
}
