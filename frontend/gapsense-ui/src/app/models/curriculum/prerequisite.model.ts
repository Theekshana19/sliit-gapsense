// prerequisite related models - used in prerequisite mapping and dependency visualization
// defines which modules must be completed before starting another module

// relationship type between two modules
export type RelationshipType = 'Mandatory' | 'Optional';

// prerequisite validation status
export type PrerequisiteStatus = 'Validated' | 'Review Required' | 'Inactive';

// main prerequisite model - one record = one prerequisite relationship
export interface Prerequisite {
  id: string;
  mainModuleId: string;
  mainModuleCode: string;
  mainModuleName: string;
  prerequisiteModuleId: string;
  prerequisiteModuleCode: string;
  prerequisiteModuleName: string;
  relationshipType: RelationshipType;
  relevanceWeight: number; // 0-100 percentage
  notes: string;
  status: PrerequisiteStatus;
  createdAt: string;
}

// prerequisite stats for the management page
export interface PrerequisiteStats {
  activePrerequisites: number;
  mandatoryPaths: number;
  avgRelevanceScore: number;
  depthLevels: number;
}

// --- validation alert models ---

// types of alerts the system can detect
export type AlertType =
  | 'Circular Dependency'
  | 'Duplicate Mapping'
  | 'Missing Topic Weight'
  | 'Incomplete Setup';

// how serious the alert is
export type AlertSeverity = 'Critical' | 'Warning' | 'Info';

// alert status
export type AlertStatus = 'Unresolved' | 'In Progress' | 'Resolved';

// a single validation alert
export interface ValidationAlert {
  id: string;
  type: AlertType;
  moduleCode: string;
  moduleName: string;
  severity: AlertSeverity;
  description: string;
  status: AlertStatus;
  createdAt: string;
}

// validation stats for the alerts page header
export interface ValidationStats {
  criticalCount: number;
  complianceScore: number;
  checksPassed: number;
}

// dependency visualization node - represents a module in the graph
export interface DependencyNode {
  id: string;
  moduleCode: string;
  moduleName: string;
  level: number; // depth level in the graph (0 = root, 1 = first level, etc.)
  x: number; // x position for SVG rendering
  y: number; // y position for SVG rendering
  status: 'valid' | 'warning' | 'error';
  prerequisites: string[]; // list of prerequisite module IDs
}

// dependency edge - a connection line between two modules
export interface DependencyEdge {
  from: string; // module ID
  to: string; // module ID
  type: RelationshipType;
}
