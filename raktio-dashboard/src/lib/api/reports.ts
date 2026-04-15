import { api } from './client';

export interface ReportSection {
  report_section_id: string;
  report_id: string;
  section_key: string;
  status: string;
  content_markdown: string | null;
  structured_json: Record<string, any> | null;
  generated_at: string | null;
}

export interface Report {
  report_id: string;
  simulation_id: string;
  run_id: string | null;
  status: 'pending' | 'generating' | 'partial' | 'completed' | 'failed';
  report_version: number;
  summary_json: Record<string, any> | null;
  scorecard_json: Record<string, any> | null;
  confidence_notes: string | null;
  created_at: string;
  completed_at: string | null;
  sections: ReportSection[];
}

export interface ReportList {
  items: Report[];
  total: number;
}

export const reportsApi = {
  list: () =>
    api.get<ReportList>('/api/reports'),

  get: (simulationId: string) =>
    api.get<Report>(`/api/reports/${simulationId}`),

  generate: (simulationId: string, language?: string) =>
    api.post<Report>(`/api/reports/${simulationId}/generate`, language ? { language } : undefined),
};
