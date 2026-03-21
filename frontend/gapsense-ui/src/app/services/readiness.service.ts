import { Injectable, signal } from '@angular/core';
import { ReadinessOverview, WeakTopic } from '../models/readiness/readiness.model';

const topicsSeed: WeakTopic[] = [
  {
    id: 'wt-1',
    topicName: 'Normalization & indexing',
    courseCode: 'IT3010',
    gapScore: 72,
    studentCount: 38,
    trend: 'up',
  },
  {
    id: 'wt-2',
    topicName: 'UML class diagrams',
    courseCode: 'IT3020',
    gapScore: 54,
    studentCount: 22,
    trend: 'down',
  },
  {
    id: 'wt-3',
    topicName: 'REST API security',
    courseCode: 'IT3030',
    gapScore: 61,
    studentCount: 45,
    trend: 'stable',
  },
];

const overviewSeed: ReadinessOverview[] = [
  {
    id: 'ro-1',
    cohort: 'Y3 — Semester 5',
    averageReadiness: 68,
    atRiskCount: 14,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ro-2',
    cohort: 'Y3 — Semester 6',
    averageReadiness: 74,
    atRiskCount: 9,
    updatedAt: new Date().toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class ReadinessService {
  private readonly weakTopics = signal<WeakTopic[]>([...topicsSeed]);
  private readonly overviews = signal<ReadinessOverview[]>([...overviewSeed]);

  weakTopicList(): WeakTopic[] {
    return this.weakTopics();
  }

  filterWeakTopics(query: string): WeakTopic[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.weakTopicList();
    }
    return this.weakTopics().filter(
      (t) =>
        t.topicName.toLowerCase().includes(q) || t.courseCode.toLowerCase().includes(q),
    );
  }

  overviewList(): ReadinessOverview[] {
    return this.overviews();
  }
}
