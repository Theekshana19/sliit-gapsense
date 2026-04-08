export interface RiskTrendFilterOption {
  id: string;
  label: string;
}

/** Filter state for risk trends (ready for API params). */
export interface RiskTrendFilterState {
  moduleId: string;
  batchId: string;
  semesterId: string;
}
