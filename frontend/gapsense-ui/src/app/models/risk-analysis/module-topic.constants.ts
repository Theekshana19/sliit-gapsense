export interface ModuleOption {
  id: string;
  label: string;
}

export const MODULE_OPTIONS: ModuleOption[] = [
  { id: 'IT3040', label: 'IT3040 - IT Project Management' },
  { id: 'SE4020', label: 'SE4020 - Software Architecture' },
  { id: 'CS2010', label: 'CS2010 - Algorithms' },
];

export const TOPIC_BY_MODULE: Record<string, string[]> = {
  IT3040: ['Risk Analysis', 'Procurement Planning', 'Stakeholder Management'],
  SE4020: ['System Arch', 'Microservices', 'Design Patterns'],
  CS2010: ['Algorithmic Logic', 'Complexity', 'Graph Algorithms'],
};

export function topicsForModule(moduleId: string): string[] {
  return TOPIC_BY_MODULE[moduleId] ?? [];
}
