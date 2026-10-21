export interface GradingSettings {
  minAccuracy: number;
  atRiskMargin: number;
  updatedAt: string | null;
}

export interface GradingSettingsPayload {
  minAccuracy: number;
  atRiskMargin: number;
}
