// learning resource models - students can access these to prepare for quizzes

// type of learning resource
export type ResourceType = 'PDF' | 'Video' | 'Article' | 'Link';

// main resource model - linked to specific topics and modules
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  topic: string;
  module: string;
  moduleCode: string;
  createdAt: string;
  updatedAt: string;
}
