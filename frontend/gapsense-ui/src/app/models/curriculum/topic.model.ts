// topic related models - used in topic management and weight configuration pages
// each module has multiple topics, and each topic has a weight percentage

// how important this topic is for the module
export type ImportanceLevel = 'Critical' | 'High' | 'Medium' | 'Low';

// topic validation status
export type TopicStatus = 'Validated' | 'Draft' | 'Review';

// main topic model - represents one topic inside a module
export interface Topic {
  id: string;
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  topicName: string;
  description: string;
  weight: number; // percentage (0-100), all topics in a module should total 100%
  importanceLevel: ImportanceLevel;
  status: TopicStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// used in topic weight configuration page - editable weight row
export interface TopicWeightEntry {
  id: string;
  topicName: string;
  currentWeight: number;
  importanceLevel: ImportanceLevel;
  lastUpdated: string;
}

// topic stats shown in topic management header
export interface TopicStats {
  totalTopics: number;
  validatedCount: number;
  draftCount: number;
  totalWeight: number; // should be 100%
  alignmentPercentage: number; // how well topics align with curriculum
}
