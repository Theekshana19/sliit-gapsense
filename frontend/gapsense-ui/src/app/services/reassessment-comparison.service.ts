import { computed, Injectable, signal } from '@angular/core';
import type { ReassessmentComparisonViewModel } from '../models/risk-analysis/reassessment-comparison.model';

const MOCK_VIEW_MODEL: ReassessmentComparisonViewModel = {
  improvementDelta: {
    label: 'Improvement Delta',
    message: 'Significant 36% improvement detected.',
  },
  attempt1Score: {
    label: 'Initial Assessment',
    title: 'Attempt 1 Score',
    sessionDate: '12 Oct 2023',
    riskBadge: 'High Risk',
    scorePercent: 42,
    isHighRisk: true,
  },
  reassessmentScore: {
    label: 'Current Status',
    title: 'Reassessment Score',
    sessionDate: '24 Jan 2024',
    riskBadge: 'Low Risk',
    scorePercent: 78,
    isHighRisk: false,
  },
  topicComparisons: [
    { topicName: 'Data Structures', attempt1Percent: 35, reassessmentPercent: 80, growthText: '+45% Growth' },
    { topicName: 'Algorithm Logic', attempt1Percent: 42, reassessmentPercent: 80, growthText: '+38% Growth' },
    { topicName: 'System Architecture', attempt1Percent: 50, reassessmentPercent: 70, growthText: '+20% Growth' },
    { topicName: 'Database Design', attempt1Percent: 41, reassessmentPercent: 82, growthText: '+41% Growth' },
  ],
  topicBreakdown: [
    { topicName: 'Data Structures', beforePercent: 35, afterPercent: 80, improvementPercent: 45 },
    { topicName: 'Algorithm Logic', beforePercent: 42, afterPercent: 80, improvementPercent: 38 },
    { topicName: 'System Arch.', beforePercent: 50, afterPercent: 70, improvementPercent: 20 },
    { topicName: 'Database Design', beforePercent: 41, afterPercent: 82, improvementPercent: 41 },
    { topicName: 'API Protocols', beforePercent: 38, afterPercent: 75, improvementPercent: 37 },
  ],
  observation: {
    label: 'Observation',
    text: 'The learner has successfully mitigated all "Critical Gaps" from Attempt 1. Focus recommended on System Architecture for next tier.',
  },
  certificateAction: {
    title: 'Ready for the Final Certification?',
    subtitle: 'Based on your reassessment, you have reached the 75% threshold required for formal validation.',
    buttonLabel: 'Generate Readiness Certificate',
  },
};

/**
 * Mock reassessment comparison service. Replace with HTTP + DTO mapping
 * when the backend is ready.
 */
@Injectable({ providedIn: 'root' })
export class ReassessmentComparisonService {
  private readonly _certificateNotice = signal<string | null>(null);

  readonly certificateNotice = this._certificateNotice.asReadonly();

  readonly viewModel = computed((): ReassessmentComparisonViewModel =>
    MOCK_VIEW_MODEL
  );

  clearCertificateNotice(): void {
    this._certificateNotice.set(null);
  }

  requestGenerateCertificate(): void {
    const msg = 'Certificate generation will be available when the API is connected.';
    this._certificateNotice.set(msg);
    window.setTimeout(() => {
      if (this._certificateNotice() === msg) this._certificateNotice.set(null);
    }, 8000);
  }
}
