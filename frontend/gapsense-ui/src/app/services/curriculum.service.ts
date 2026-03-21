import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

import { Module, ModuleFilter, ModuleStats } from '../models/curriculum/module.model';
import { Topic, TopicWeightEntry, TopicStats } from '../models/curriculum/topic.model';
import {
  Prerequisite,
  PrerequisiteStats,
  ValidationAlert,
  ValidationStats,
  DependencyNode,
  DependencyEdge,
} from '../models/curriculum/prerequisite.model';
import { SemesterOffering, OfferingStats } from '../models/curriculum/semester-offering.model';

// ============================================
// MOCK DATA - will be replaced with real API calls in Stage 2
// ============================================

// --- mock modules ---
const MOCK_MODULES: Module[] = [
  {
    id: '1',
    moduleCode: 'IT1040',
    moduleName: 'Object Oriented Programming',
    description: 'Introduction to OOP concepts including classes, objects, inheritance, polymorphism and encapsulation.',
    program: 'BSc IT',
    semester: 'Y1S2',
    credits: 4,
    status: 'Active',
    topicCount: 5,
    prerequisiteCount: 0,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: '2',
    moduleCode: 'IT2040',
    moduleName: 'Data Structures & Algorithms',
    description: 'Covers arrays, linked lists, stacks, queues, trees, graphs, sorting and searching algorithms.',
    program: 'BSc IT',
    semester: 'Y2S1',
    credits: 4,
    status: 'Active',
    topicCount: 8,
    prerequisiteCount: 1,
    createdAt: '2025-06-01',
    updatedAt: '2025-08-15',
  },
  {
    id: '3',
    moduleCode: 'IT2080',
    moduleName: 'Web Application Development',
    description: 'Building modern web applications with HTML, CSS, JavaScript and frameworks.',
    program: 'BSc IT',
    semester: 'Y2S1',
    credits: 3,
    status: 'Active',
    topicCount: 6,
    prerequisiteCount: 1,
    createdAt: '2025-06-01',
    updatedAt: '2025-07-20',
  },
  {
    id: '4',
    moduleCode: 'IT3030',
    moduleName: 'Database Management Systems',
    description: 'Relational databases, SQL, normalization, transactions and database design.',
    program: 'BSc IT',
    semester: 'Y2S2',
    credits: 4,
    status: 'Active',
    topicCount: 7,
    prerequisiteCount: 1,
    createdAt: '2025-06-01',
    updatedAt: '2025-09-10',
  },
  {
    id: '5',
    moduleCode: 'IT3011',
    moduleName: 'Software Engineering',
    description: 'Software development lifecycle, design patterns, agile methods and project management.',
    program: 'BSc IT',
    semester: 'Y3S1',
    credits: 3,
    status: 'Active',
    topicCount: 6,
    prerequisiteCount: 2,
    createdAt: '2025-06-01',
    updatedAt: '2025-10-01',
  },
  {
    id: '6',
    moduleCode: 'IT4020',
    moduleName: 'Software Quality Assurance',
    description: 'Testing methodologies, quality models, test automation and quality metrics.',
    program: 'BSc IT',
    semester: 'Y3S2',
    credits: 3,
    status: 'Active',
    topicCount: 5,
    prerequisiteCount: 2,
    createdAt: '2025-06-01',
    updatedAt: '2025-11-05',
  },
  {
    id: '7',
    moduleCode: 'IT3040',
    moduleName: 'IT Project Management',
    description: 'Project planning, scheduling, risk management and team collaboration.',
    program: 'BSc IT',
    semester: 'Y3S1',
    credits: 3,
    status: 'Active',
    topicCount: 4,
    prerequisiteCount: 1,
    createdAt: '2025-06-01',
    updatedAt: '2025-10-15',
  },
  {
    id: '8',
    moduleCode: 'CS2050',
    moduleName: 'Computer Architecture',
    description: 'CPU design, memory hierarchy, instruction sets and assembly programming.',
    program: 'BSc CS',
    semester: 'Y2S1',
    credits: 4,
    status: 'Draft',
    topicCount: 3,
    prerequisiteCount: 0,
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: '9',
    moduleCode: 'SE3020',
    moduleName: 'Distributed Systems',
    description: 'Distributed computing concepts, microservices, cloud computing and containerization.',
    program: 'BSc SE',
    semester: 'Y3S1',
    credits: 4,
    status: 'Active',
    topicCount: 5,
    prerequisiteCount: 2,
    createdAt: '2025-06-01',
    updatedAt: '2026-01-20',
  },
  {
    id: '10',
    moduleCode: 'DS1010',
    moduleName: 'Introduction to Data Science',
    description: 'Basics of data analysis, statistics, Python for data science and visualization.',
    program: 'BSc DS',
    semester: 'Y1S1',
    credits: 3,
    status: 'Draft',
    topicCount: 0,
    prerequisiteCount: 0,
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
  },
];

// --- mock topics for IT2040 (Data Structures & Algorithms) ---
const MOCK_TOPICS: Topic[] = [
  {
    id: '1',
    moduleId: '2',
    moduleCode: 'IT2040',
    moduleName: 'Data Structures & Algorithms',
    topicName: 'Asymptotic Analysis',
    description: 'Big-O, Big-Omega, Big-Theta notations and time complexity analysis.',
    weight: 15,
    importanceLevel: 'Critical',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: '2',
    moduleId: '2',
    moduleCode: 'IT2040',
    moduleName: 'Data Structures & Algorithms',
    topicName: 'Linear Data Structures',
    description: 'Arrays, linked lists, stacks and queues with their operations.',
    weight: 20,
    importanceLevel: 'High',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: '3',
    moduleId: '2',
    moduleCode: 'IT2040',
    moduleName: 'Data Structures & Algorithms',
    topicName: 'Trees & Binary Trees',
    description: 'Binary trees, BST, AVL trees, tree traversals and heap data structure.',
    weight: 18,
    importanceLevel: 'High',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-07-15',
  },
  {
    id: '4',
    moduleId: '2',
    moduleCode: 'IT2040',
    moduleName: 'Data Structures & Algorithms',
    topicName: 'Graph Algorithms',
    description: 'Graph representations, BFS, DFS, shortest path and spanning trees.',
    weight: 20,
    importanceLevel: 'Critical',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-08-10',
  },
  {
    id: '5',
    moduleId: '2',
    moduleCode: 'IT2040',
    moduleName: 'Data Structures & Algorithms',
    topicName: 'Sorting Algorithms',
    description: 'Bubble, selection, insertion, merge, quick sort and their complexities.',
    weight: 15,
    importanceLevel: 'Medium',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: '6',
    moduleId: '2',
    moduleCode: 'IT2040',
    moduleName: 'Data Structures & Algorithms',
    topicName: 'Recursion',
    description: 'Recursive thinking, base cases, recursive algorithms and dynamic programming intro.',
    weight: 8,
    importanceLevel: 'Medium',
    status: 'Draft',
    isActive: true,
    createdAt: '2025-07-01',
    updatedAt: '2025-07-01',
  },
  {
    id: '7',
    moduleId: '2',
    moduleCode: 'IT2040',
    moduleName: 'Data Structures & Algorithms',
    topicName: 'Hashing',
    description: 'Hash tables, hash functions, collision resolution techniques.',
    weight: 4,
    importanceLevel: 'Low',
    status: 'Draft',
    isActive: false,
    createdAt: '2025-08-01',
    updatedAt: '2025-08-01',
  },
  // topics for IT3030 (DBMS)
  {
    id: '8',
    moduleId: '4',
    moduleCode: 'IT3030',
    moduleName: 'Database Management Systems',
    topicName: 'Database Design',
    description: 'ER diagrams, relational model and schema design.',
    weight: 25,
    importanceLevel: 'Critical',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: '9',
    moduleId: '4',
    moduleCode: 'IT3030',
    moduleName: 'Database Management Systems',
    topicName: 'Database Queries',
    description: 'SQL SELECT, JOIN, subqueries, aggregation and views.',
    weight: 30,
    importanceLevel: 'Critical',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: '10',
    moduleId: '4',
    moduleCode: 'IT3030',
    moduleName: 'Database Management Systems',
    topicName: 'Normalization',
    description: '1NF, 2NF, 3NF, BCNF and denormalization strategies.',
    weight: 20,
    importanceLevel: 'High',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: '11',
    moduleId: '4',
    moduleCode: 'IT3030',
    moduleName: 'Database Management Systems',
    topicName: 'Database Transactions',
    description: 'ACID properties, concurrency control and recovery.',
    weight: 25,
    importanceLevel: 'High',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  // topics for IT1040 (OOP)
  {
    id: '12',
    moduleId: '1',
    moduleCode: 'IT1040',
    moduleName: 'Object Oriented Programming',
    topicName: 'OOP Fundamentals',
    description: 'Classes, objects, methods, constructors and access modifiers.',
    weight: 30,
    importanceLevel: 'Critical',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: '13',
    moduleId: '1',
    moduleCode: 'IT1040',
    moduleName: 'Object Oriented Programming',
    topicName: 'Inheritance & Polymorphism',
    description: 'Inheritance hierarchies, method overriding, abstract classes and interfaces.',
    weight: 30,
    importanceLevel: 'Critical',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: '14',
    moduleId: '1',
    moduleCode: 'IT1040',
    moduleName: 'Object Oriented Programming',
    topicName: 'Exception Handling',
    description: 'Try-catch blocks, custom exceptions and error handling strategies.',
    weight: 20,
    importanceLevel: 'Medium',
    status: 'Validated',
    isActive: true,
    createdAt: '2025-06-01',
    updatedAt: '2025-06-01',
  },
  {
    id: '15',
    moduleId: '1',
    moduleCode: 'IT1040',
    moduleName: 'Object Oriented Programming',
    topicName: 'Collections Framework',
    description: 'Lists, sets, maps and iterators.',
    weight: 20,
    importanceLevel: 'Medium',
    status: 'Draft',
    isActive: true,
    createdAt: '2025-07-01',
    updatedAt: '2025-07-01',
  },
];

// --- mock prerequisites ---
const MOCK_PREREQUISITES: Prerequisite[] = [
  {
    id: '1',
    mainModuleId: '2',
    mainModuleCode: 'IT2040',
    mainModuleName: 'Data Structures & Algorithms',
    prerequisiteModuleId: '1',
    prerequisiteModuleCode: 'IT1040',
    prerequisiteModuleName: 'Object Oriented Programming',
    relationshipType: 'Mandatory',
    relevanceWeight: 90,
    notes: 'OOP concepts are essential for understanding data structure implementations.',
    status: 'Validated',
    createdAt: '2025-06-01',
  },
  {
    id: '2',
    mainModuleId: '3',
    mainModuleCode: 'IT2080',
    mainModuleName: 'Web Application Development',
    prerequisiteModuleId: '1',
    prerequisiteModuleCode: 'IT1040',
    prerequisiteModuleName: 'Object Oriented Programming',
    relationshipType: 'Mandatory',
    relevanceWeight: 75,
    notes: 'Basic programming knowledge required for web development.',
    status: 'Validated',
    createdAt: '2025-06-01',
  },
  {
    id: '3',
    mainModuleId: '4',
    mainModuleCode: 'IT3030',
    mainModuleName: 'Database Management Systems',
    prerequisiteModuleId: '1',
    prerequisiteModuleCode: 'IT1040',
    prerequisiteModuleName: 'Object Oriented Programming',
    relationshipType: 'Optional',
    relevanceWeight: 50,
    notes: 'Basic programming helps with understanding SQL and database concepts.',
    status: 'Validated',
    createdAt: '2025-06-15',
  },
  {
    id: '4',
    mainModuleId: '5',
    mainModuleCode: 'IT3011',
    mainModuleName: 'Software Engineering',
    prerequisiteModuleId: '2',
    prerequisiteModuleCode: 'IT2040',
    prerequisiteModuleName: 'Data Structures & Algorithms',
    relationshipType: 'Mandatory',
    relevanceWeight: 80,
    notes: 'DSA knowledge needed for understanding design patterns and system design.',
    status: 'Validated',
    createdAt: '2025-06-01',
  },
  {
    id: '5',
    mainModuleId: '5',
    mainModuleCode: 'IT3011',
    mainModuleName: 'Software Engineering',
    prerequisiteModuleId: '3',
    prerequisiteModuleCode: 'IT2080',
    prerequisiteModuleName: 'Web Application Development',
    relationshipType: 'Optional',
    relevanceWeight: 60,
    notes: 'Web dev experience helpful for software engineering projects.',
    status: 'Review Required',
    createdAt: '2025-07-01',
  },
  {
    id: '6',
    mainModuleId: '6',
    mainModuleCode: 'IT4020',
    mainModuleName: 'Software Quality Assurance',
    prerequisiteModuleId: '5',
    prerequisiteModuleCode: 'IT3011',
    prerequisiteModuleName: 'Software Engineering',
    relationshipType: 'Mandatory',
    relevanceWeight: 95,
    notes: 'SE concepts are foundational for understanding quality assurance.',
    status: 'Validated',
    createdAt: '2025-06-01',
  },
  {
    id: '7',
    mainModuleId: '6',
    mainModuleCode: 'IT4020',
    mainModuleName: 'Software Quality Assurance',
    prerequisiteModuleId: '4',
    prerequisiteModuleCode: 'IT3030',
    prerequisiteModuleName: 'Database Management Systems',
    relationshipType: 'Optional',
    relevanceWeight: 40,
    notes: 'Database knowledge helps with testing data-driven applications.',
    status: 'Validated',
    createdAt: '2025-08-01',
  },
  {
    id: '8',
    mainModuleId: '9',
    mainModuleCode: 'SE3020',
    mainModuleName: 'Distributed Systems',
    prerequisiteModuleId: '2',
    prerequisiteModuleCode: 'IT2040',
    prerequisiteModuleName: 'Data Structures & Algorithms',
    relationshipType: 'Mandatory',
    relevanceWeight: 85,
    notes: 'DSA fundamentals needed for distributed algorithm design.',
    status: 'Validated',
    createdAt: '2025-06-01',
  },
];

// --- mock validation alerts ---
const MOCK_ALERTS: ValidationAlert[] = [
  {
    id: '1',
    type: 'Circular Dependency',
    moduleCode: 'IT3011',
    moduleName: 'Software Engineering',
    severity: 'Critical',
    description: 'Circular dependency detected between IT3011 and IT4020. Both modules list each other as prerequisites.',
    status: 'Unresolved',
    createdAt: '2026-03-15',
  },
  {
    id: '2',
    type: 'Missing Topic Weight',
    moduleCode: 'CS2050',
    moduleName: 'Computer Architecture',
    severity: 'Warning',
    description: 'Topic weights for CS2050 do not total 100%. Current total is 85%.',
    status: 'Unresolved',
    createdAt: '2026-03-14',
  },
  {
    id: '3',
    type: 'Duplicate Mapping',
    moduleCode: 'IT2080',
    moduleName: 'Web Application Development',
    severity: 'Warning',
    description: 'IT1040 is mapped as prerequisite twice with different relationship types.',
    status: 'In Progress',
    createdAt: '2026-03-12',
  },
  {
    id: '4',
    type: 'Incomplete Setup',
    moduleCode: 'DS1010',
    moduleName: 'Introduction to Data Science',
    severity: 'Info',
    description: 'Module DS1010 has no topics configured yet. Add topics to complete setup.',
    status: 'Unresolved',
    createdAt: '2026-03-10',
  },
  {
    id: '5',
    type: 'Missing Topic Weight',
    moduleCode: 'IT2040',
    moduleName: 'Data Structures & Algorithms',
    severity: 'Warning',
    description: 'Topic "Hashing" has 0% weight assigned. This may affect readiness calculations.',
    status: 'In Progress',
    createdAt: '2026-03-08',
  },
];

// --- mock semester offerings ---
const MOCK_OFFERINGS: SemesterOffering[] = [
  {
    id: '1',
    moduleId: '1',
    moduleCode: 'IT1040',
    moduleName: 'Object Oriented Programming',
    program: 'BSc IT',
    intake: 'February 2024',
    semester: 'Y1S2',
    lecturerName: 'Dr. Kamal Perera',
    lecturerAvatar: 'KP',
    avatarColor: 'bg-primary-fixed',
    status: 'Published',
    createdAt: '2025-12-01',
  },
  {
    id: '2',
    moduleId: '2',
    moduleCode: 'IT2040',
    moduleName: 'Data Structures & Algorithms',
    program: 'BSc IT',
    intake: 'February 2024',
    semester: 'Y2S1',
    lecturerName: 'Dr. Aruna Perera',
    lecturerAvatar: 'AP',
    avatarColor: 'bg-secondary-container',
    status: 'Published',
    createdAt: '2025-12-01',
  },
  {
    id: '3',
    moduleId: '4',
    moduleCode: 'IT3030',
    moduleName: 'Database Management Systems',
    program: 'BSc IT',
    intake: 'February 2024',
    semester: 'Y2S2',
    lecturerName: 'Ms. Nishani Silva',
    lecturerAvatar: 'NS',
    avatarColor: 'bg-tertiary-fixed',
    status: 'Published',
    createdAt: '2025-12-01',
  },
  {
    id: '4',
    moduleId: '8',
    moduleCode: 'CS2050',
    moduleName: 'Computer Architecture',
    program: 'BSc CS',
    intake: 'June 2024',
    semester: 'Y2S1',
    lecturerName: 'Prof. Ruwan Fernando',
    lecturerAvatar: 'RF',
    avatarColor: 'bg-surface-container-high',
    status: 'Draft',
    createdAt: '2026-01-15',
  },
  {
    id: '5',
    moduleId: '5',
    moduleCode: 'IT3011',
    moduleName: 'Software Engineering',
    program: 'BSc IT',
    intake: 'February 2024',
    semester: 'Y3S1',
    lecturerName: 'Dr. Tharaka Jayasinghe',
    lecturerAvatar: 'TJ',
    avatarColor: 'bg-primary-fixed',
    status: 'Published',
    createdAt: '2025-12-01',
  },
  {
    id: '6',
    moduleId: '10',
    moduleCode: 'DS1010',
    moduleName: 'Introduction to Data Science',
    program: 'BSc DS',
    intake: 'October 2024',
    semester: 'Y1S1',
    lecturerName: 'Dr. Malini Rathnayake',
    lecturerAvatar: 'MR',
    avatarColor: 'bg-secondary-container',
    status: 'Inactive',
    createdAt: '2026-02-01',
  },
];

// --- mock dependency graph nodes ---
const MOCK_DEPENDENCY_NODES: DependencyNode[] = [
  { id: '1', moduleCode: 'IT1040', moduleName: 'Object Oriented Programming', level: 0, x: 400, y: 60, status: 'valid', prerequisites: [] },
  { id: '2', moduleCode: 'IT2040', moduleName: 'Data Structures & Algorithms', level: 1, x: 200, y: 200, status: 'valid', prerequisites: ['1'] },
  { id: '3', moduleCode: 'IT2080', moduleName: 'Web Application Development', level: 1, x: 600, y: 200, status: 'valid', prerequisites: ['1'] },
  { id: '4', moduleCode: 'IT3030', moduleName: 'Database Management Systems', level: 1, x: 800, y: 200, status: 'valid', prerequisites: ['1'] },
  { id: '5', moduleCode: 'IT3011', moduleName: 'Software Engineering', level: 2, x: 300, y: 360, status: 'warning', prerequisites: ['2', '3'] },
  { id: '6', moduleCode: 'IT4020', moduleName: 'Software Quality Assurance', level: 3, x: 400, y: 500, status: 'valid', prerequisites: ['5', '4'] },
  { id: '9', moduleCode: 'SE3020', moduleName: 'Distributed Systems', level: 2, x: 100, y: 360, status: 'error', prerequisites: ['2'] },
];

const MOCK_DEPENDENCY_EDGES: DependencyEdge[] = [
  { from: '1', to: '2', type: 'Mandatory' },
  { from: '1', to: '3', type: 'Mandatory' },
  { from: '1', to: '4', type: 'Optional' },
  { from: '2', to: '5', type: 'Mandatory' },
  { from: '3', to: '5', type: 'Optional' },
  { from: '5', to: '6', type: 'Mandatory' },
  { from: '4', to: '6', type: 'Optional' },
  { from: '2', to: '9', type: 'Mandatory' },
];

// ============================================
// CURRICULUM SERVICE
// handles all data operations for the curriculum module
// right now uses mock data - will switch to real API in Stage 2
// ============================================

@Injectable({
  providedIn: 'root',
})
export class CurriculumService {
  // signals to hold current data state
  modules = signal<Module[]>(MOCK_MODULES);
  topics = signal<Topic[]>(MOCK_TOPICS);

  // ---------- MODULE METHODS ----------

  // get all modules, optionally filtered
  getModules(filter?: ModuleFilter): Observable<Module[]> {
    let result = [...MOCK_MODULES];

    if (filter) {
      if (filter.search) {
        const search = filter.search.toLowerCase();
        result = result.filter(
          (m) =>
            m.moduleName.toLowerCase().includes(search) ||
            m.moduleCode.toLowerCase().includes(search)
        );
      }
      if (filter.program) {
        result = result.filter((m) => m.program === filter.program);
      }
      if (filter.semester) {
        result = result.filter((m) => m.semester === filter.semester);
      }
      if (filter.status) {
        result = result.filter((m) => m.status === filter.status);
      }
    }

    return of(result).pipe(delay(300));
  }

  // get single module by id
  getModuleById(id: string): Observable<Module | undefined> {
    return of(MOCK_MODULES.find((m) => m.id === id)).pipe(delay(200));
  }

  // create a new module
  createModule(module: Partial<Module>): Observable<Module> {
    const newModule: Module = {
      id: String(MOCK_MODULES.length + 1),
      moduleCode: module.moduleCode || '',
      moduleName: module.moduleName || '',
      description: module.description || '',
      program: module.program || 'BSc IT',
      semester: module.semester || 'Y1S1',
      credits: module.credits || 3,
      status: module.status || 'Draft',
      topicCount: 0,
      prerequisiteCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    MOCK_MODULES.push(newModule);
    this.modules.set([...MOCK_MODULES]);
    return of(newModule).pipe(delay(300));
  }

  // update an existing module
  updateModule(id: string, updates: Partial<Module>): Observable<Module> {
    const index = MOCK_MODULES.findIndex((m) => m.id === id);
    if (index !== -1) {
      MOCK_MODULES[index] = { ...MOCK_MODULES[index], ...updates };
      this.modules.set([...MOCK_MODULES]);
    }
    return of(MOCK_MODULES[index]).pipe(delay(300));
  }

  // delete a module
  deleteModule(id: string): Observable<boolean> {
    const index = MOCK_MODULES.findIndex((m) => m.id === id);
    if (index !== -1) {
      MOCK_MODULES.splice(index, 1);
      this.modules.set([...MOCK_MODULES]);
    }
    return of(true).pipe(delay(300));
  }

  // get module stats
  getModuleStats(): Observable<ModuleStats> {
    const stats: ModuleStats = {
      totalModules: MOCK_MODULES.length,
      activeModules: MOCK_MODULES.filter((m) => m.status === 'Active').length,
      totalCreditHours: MOCK_MODULES.reduce((sum, m) => sum + m.credits, 0),
      needsAttention: MOCK_MODULES.filter((m) => m.status === 'Draft').length,
    };
    return of(stats).pipe(delay(200));
  }

  // get all unique programs for dropdown
  getPrograms(): string[] {
    return [...new Set(MOCK_MODULES.map((m) => m.program))];
  }

  // get all unique semesters for dropdown
  getSemesters(): string[] {
    return [...new Set(MOCK_MODULES.map((m) => m.semester))].sort();
  }

  // ---------- TOPIC METHODS ----------

  // get topics for a specific module
  getTopicsByModule(moduleId: string): Observable<Topic[]> {
    const result = MOCK_TOPICS.filter((t) => t.moduleId === moduleId);
    return of(result).pipe(delay(300));
  }

  // get all topics
  getAllTopics(): Observable<Topic[]> {
    return of([...MOCK_TOPICS]).pipe(delay(300));
  }

  // get single topic by id
  getTopicById(id: string): Observable<Topic | undefined> {
    return of(MOCK_TOPICS.find((t) => t.id === id)).pipe(delay(200));
  }

  // create a new topic
  createTopic(topic: Partial<Topic>): Observable<Topic> {
    const newTopic: Topic = {
      id: String(MOCK_TOPICS.length + 1),
      moduleId: topic.moduleId || '',
      moduleCode: topic.moduleCode || '',
      moduleName: topic.moduleName || '',
      topicName: topic.topicName || '',
      description: topic.description || '',
      weight: topic.weight || 0,
      importanceLevel: topic.importanceLevel || 'Medium',
      status: topic.status || 'Draft',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    MOCK_TOPICS.push(newTopic);
    this.topics.set([...MOCK_TOPICS]);
    return of(newTopic).pipe(delay(300));
  }

  // update an existing topic
  updateTopic(id: string, updates: Partial<Topic>): Observable<Topic> {
    const index = MOCK_TOPICS.findIndex((t) => t.id === id);
    if (index !== -1) {
      MOCK_TOPICS[index] = { ...MOCK_TOPICS[index], ...updates };
      this.topics.set([...MOCK_TOPICS]);
    }
    return of(MOCK_TOPICS[index]).pipe(delay(300));
  }

  // delete a topic
  deleteTopic(id: string): Observable<boolean> {
    const index = MOCK_TOPICS.findIndex((t) => t.id === id);
    if (index !== -1) {
      MOCK_TOPICS.splice(index, 1);
      this.topics.set([...MOCK_TOPICS]);
    }
    return of(true).pipe(delay(300));
  }

  // get topic stats for a module
  getTopicStats(moduleId: string): Observable<TopicStats> {
    const topics = MOCK_TOPICS.filter((t) => t.moduleId === moduleId);
    const stats: TopicStats = {
      totalTopics: topics.length,
      validatedCount: topics.filter((t) => t.status === 'Validated').length,
      draftCount: topics.filter((t) => t.status === 'Draft').length,
      totalWeight: topics.reduce((sum, t) => sum + t.weight, 0),
      alignmentPercentage: 92,
    };
    return of(stats).pipe(delay(200));
  }

  // get topic weight entries for configuration page
  getTopicWeights(moduleId: string): Observable<TopicWeightEntry[]> {
    const entries = MOCK_TOPICS
      .filter((t) => t.moduleId === moduleId)
      .map((t) => ({
        id: t.id,
        topicName: t.topicName,
        currentWeight: t.weight,
        importanceLevel: t.importanceLevel,
        lastUpdated: t.updatedAt,
      }));
    return of(entries).pipe(delay(300));
  }

  // update topic weights (batch update)
  updateTopicWeights(moduleId: string, weights: { id: string; weight: number }[]): Observable<boolean> {
    for (const w of weights) {
      const index = MOCK_TOPICS.findIndex((t) => t.id === w.id);
      if (index !== -1) {
        MOCK_TOPICS[index].weight = w.weight;
      }
    }
    this.topics.set([...MOCK_TOPICS]);
    return of(true).pipe(delay(300));
  }

  // ---------- PREREQUISITE METHODS ----------

  // get all prerequisites
  getPrerequisites(): Observable<Prerequisite[]> {
    return of([...MOCK_PREREQUISITES]).pipe(delay(300));
  }

  // get prerequisites for a specific module
  getPrerequisitesByModule(moduleId: string): Observable<Prerequisite[]> {
    const result = MOCK_PREREQUISITES.filter((p) => p.mainModuleId === moduleId);
    return of(result).pipe(delay(300));
  }

  // create a new prerequisite
  createPrerequisite(prereq: Partial<Prerequisite>): Observable<Prerequisite> {
    const newPrereq: Prerequisite = {
      id: String(MOCK_PREREQUISITES.length + 1),
      mainModuleId: prereq.mainModuleId || '',
      mainModuleCode: prereq.mainModuleCode || '',
      mainModuleName: prereq.mainModuleName || '',
      prerequisiteModuleId: prereq.prerequisiteModuleId || '',
      prerequisiteModuleCode: prereq.prerequisiteModuleCode || '',
      prerequisiteModuleName: prereq.prerequisiteModuleName || '',
      relationshipType: prereq.relationshipType || 'Mandatory',
      relevanceWeight: prereq.relevanceWeight || 50,
      notes: prereq.notes || '',
      status: 'Review Required',
      createdAt: new Date().toISOString().split('T')[0],
    };

    MOCK_PREREQUISITES.push(newPrereq);
    return of(newPrereq).pipe(delay(300));
  }

  // delete a prerequisite
  deletePrerequisite(id: string): Observable<boolean> {
    const index = MOCK_PREREQUISITES.findIndex((p) => p.id === id);
    if (index !== -1) {
      MOCK_PREREQUISITES.splice(index, 1);
    }
    return of(true).pipe(delay(300));
  }

  // get prerequisite stats for a module
  getPrerequisiteStats(moduleId: string): Observable<PrerequisiteStats> {
    const prereqs = MOCK_PREREQUISITES.filter((p) => p.mainModuleId === moduleId);
    const stats: PrerequisiteStats = {
      activePrerequisites: prereqs.length,
      mandatoryPaths: prereqs.filter((p) => p.relationshipType === 'Mandatory').length,
      avgRelevanceScore: prereqs.length > 0
        ? Math.round(prereqs.reduce((sum, p) => sum + p.relevanceWeight, 0) / prereqs.length)
        : 0,
      depthLevels: 3,
    };
    return of(stats).pipe(delay(200));
  }

  // ---------- DEPENDENCY VISUALIZATION METHODS ----------

  // get dependency graph nodes
  getDependencyNodes(): Observable<DependencyNode[]> {
    return of([...MOCK_DEPENDENCY_NODES]).pipe(delay(300));
  }

  // get dependency graph edges
  getDependencyEdges(): Observable<DependencyEdge[]> {
    return of([...MOCK_DEPENDENCY_EDGES]).pipe(delay(300));
  }

  // ---------- SEMESTER OFFERING METHODS ----------

  // get semester offerings with optional filters
  getOfferings(): Observable<SemesterOffering[]> {
    return of([...MOCK_OFFERINGS]).pipe(delay(300));
  }

  // get offering stats
  getOfferingStats(): Observable<OfferingStats> {
    const stats: OfferingStats = {
      completionPercentage: 85,
      attentionNeeded: 3,
      efficiencyGrowth: 12,
    };
    return of(stats).pipe(delay(200));
  }

  // ---------- VALIDATION ALERT METHODS ----------

  // get all validation alerts
  getValidationAlerts(): Observable<ValidationAlert[]> {
    return of([...MOCK_ALERTS]).pipe(delay(300));
  }

  // get validation stats
  getValidationStats(): Observable<ValidationStats> {
    const stats: ValidationStats = {
      criticalCount: MOCK_ALERTS.filter((a) => a.severity === 'Critical').length,
      complianceScore: 84,
      checksPassed: 156,
    };
    return of(stats).pipe(delay(200));
  }

  // update alert status
  updateAlertStatus(id: string, status: 'Unresolved' | 'In Progress' | 'Resolved'): Observable<boolean> {
    const index = MOCK_ALERTS.findIndex((a) => a.id === id);
    if (index !== -1) {
      MOCK_ALERTS[index].status = status;
    }
    return of(true).pipe(delay(300));
  }
}
