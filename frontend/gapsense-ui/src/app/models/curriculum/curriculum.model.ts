export type CurriculumStatus = 'active' | 'draft' | 'archived';

export interface Curriculum {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  status: CurriculumStatus;
}
