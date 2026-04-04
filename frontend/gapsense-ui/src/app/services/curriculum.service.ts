import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

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

// API response wrapper - matches the backend ApiResponseDto
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

// ============================================
// CURRICULUM SERVICE
// now connects to real .NET backend API
// dependency visualization still uses local data (no backend endpoint for SVG graph)
// ============================================

@Injectable({
  providedIn: 'root',
})
export class CurriculumService {
  private http = inject(HttpClient);

  // backend API base URL
  private apiUrl = 'http://localhost:5172/api';

  // ---------- MODULE METHODS ----------

  // get all modules with optional filters
  getModules(filter?: ModuleFilter): Observable<Module[]> {
    let params = new HttpParams();
    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.program) params = params.set('program', filter.program);
    if (filter?.semester) params = params.set('semester', filter.semester);
    if (filter?.status) params = params.set('status', filter.status);

    return this.http
      .get<ApiResponse<Module[]>>(`${this.apiUrl}/modules`, { params })
      .pipe(map((res) => res.data));
  }

  // get single module by id
  getModuleById(id: string): Observable<Module | undefined> {
    return this.http
      .get<ApiResponse<Module>>(`${this.apiUrl}/modules/${id}`)
      .pipe(map((res) => res.data));
  }

  // create a new module
  createModule(module: Partial<Module>): Observable<Module> {
    return this.http
      .post<ApiResponse<Module>>(`${this.apiUrl}/modules`, module)
      .pipe(map((res) => res.data));
  }

  // update an existing module
  updateModule(id: string, updates: Partial<Module>): Observable<Module> {
    return this.http
      .put<ApiResponse<Module>>(`${this.apiUrl}/modules/${id}`, updates)
      .pipe(map((res) => res.data));
  }

  // delete a module
  deleteModule(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${this.apiUrl}/modules/${id}`)
      .pipe(map((res) => res.data));
  }

  // get module stats for the dashboard
  getModuleStats(): Observable<ModuleStats> {
    return this.http
      .get<ApiResponse<ModuleStats>>(`${this.apiUrl}/modules/stats`)
      .pipe(map((res) => res.data));
  }

  // get all unique programs for dropdown
  getPrograms(): string[] {
    return ['BSc IT', 'BSc CS', 'BSc SE', 'BSc DS'];
  }

  // get all unique semesters for dropdown
  getSemesters(): string[] {
    return ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2'];
  }

  // ---------- TOPIC METHODS ----------

  // get topics for a specific module
  getTopicsByModule(moduleId: string): Observable<Topic[]> {
    const params = new HttpParams().set('moduleId', moduleId);
    return this.http
      .get<ApiResponse<Topic[]>>(`${this.apiUrl}/topics`, { params })
      .pipe(map((res) => res.data));
  }

  // get all topics
  getAllTopics(): Observable<Topic[]> {
    return this.http
      .get<ApiResponse<Topic[]>>(`${this.apiUrl}/topics`)
      .pipe(map((res) => res.data));
  }

  // get single topic by id
  getTopicById(id: string): Observable<Topic | undefined> {
    return this.http
      .get<ApiResponse<Topic>>(`${this.apiUrl}/topics/${id}`)
      .pipe(map((res) => res.data));
  }

  // create a new topic
  createTopic(topic: Partial<Topic>): Observable<Topic> {
    return this.http
      .post<ApiResponse<Topic>>(`${this.apiUrl}/topics`, topic)
      .pipe(map((res) => res.data));
  }

  // update an existing topic
  updateTopic(id: string, updates: Partial<Topic>): Observable<Topic> {
    return this.http
      .put<ApiResponse<Topic>>(`${this.apiUrl}/topics/${id}`, updates)
      .pipe(map((res) => res.data));
  }

  // delete a topic
  deleteTopic(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${this.apiUrl}/topics/${id}`)
      .pipe(map((res) => res.data));
  }

  // get topic stats for a module
  getTopicStats(moduleId: string): Observable<TopicStats> {
    return this.http
      .get<ApiResponse<TopicStats>>(`${this.apiUrl}/topics/stats/${moduleId}`)
      .pipe(map((res) => res.data));
  }

  // get topic weight entries for configuration page
  getTopicWeights(moduleId: string): Observable<TopicWeightEntry[]> {
    // the backend returns TopicWeightUpdateDto, but frontend needs TopicWeightEntry
    // so we get full topics and map them
    return this.getTopicsByModule(moduleId).pipe(
      map((topics) =>
        topics.map((t) => ({
          id: t.id,
          topicName: t.topicName,
          currentWeight: t.weight,
          importanceLevel: t.importanceLevel,
          lastUpdated: t.updatedAt,
        }))
      )
    );
  }

  // update topic weights (batch update)
  updateTopicWeights(moduleId: string, weights: { id: string; weight: number }[]): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${this.apiUrl}/topics/weights/${moduleId}`, weights)
      .pipe(map((res) => res.data));
  }

  // ---------- PREREQUISITE METHODS ----------

  // get all prerequisites
  getPrerequisites(): Observable<Prerequisite[]> {
    return this.http
      .get<ApiResponse<Prerequisite[]>>(`${this.apiUrl}/prerequisites`)
      .pipe(map((res) => res.data));
  }

  // get prerequisites for a specific module
  getPrerequisitesByModule(moduleId: string): Observable<Prerequisite[]> {
    const params = new HttpParams().set('moduleId', moduleId);
    return this.http
      .get<ApiResponse<Prerequisite[]>>(`${this.apiUrl}/prerequisites`, { params })
      .pipe(map((res) => res.data));
  }

  // create a new prerequisite
  createPrerequisite(prereq: Partial<Prerequisite>): Observable<Prerequisite> {
    return this.http
      .post<ApiResponse<Prerequisite>>(`${this.apiUrl}/prerequisites`, prereq)
      .pipe(map((res) => res.data));
  }

  // delete a prerequisite
  deletePrerequisite(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${this.apiUrl}/prerequisites/${id}`)
      .pipe(map((res) => res.data));
  }

  // get prerequisite stats for a module
  getPrerequisiteStats(moduleId: string): Observable<PrerequisiteStats> {
    return this.http
      .get<ApiResponse<PrerequisiteStats>>(`${this.apiUrl}/prerequisites/stats/${moduleId}`)
      .pipe(map((res) => res.data));
  }

  // ---------- DEPENDENCY VISUALIZATION ----------
  // these still use local data because the SVG graph positions are frontend-only

  getDependencyNodes(): Observable<DependencyNode[]> {
    const nodes: DependencyNode[] = [
      { id: '1', moduleCode: 'IT1040', moduleName: 'Object Oriented Programming', level: 0, x: 400, y: 60, status: 'valid', prerequisites: [] },
      { id: '2', moduleCode: 'IT2040', moduleName: 'Data Structures & Algorithms', level: 1, x: 200, y: 200, status: 'valid', prerequisites: ['1'] },
      { id: '3', moduleCode: 'IT2080', moduleName: 'Web Application Development', level: 1, x: 600, y: 200, status: 'valid', prerequisites: ['1'] },
      { id: '4', moduleCode: 'IT3030', moduleName: 'Database Management Systems', level: 1, x: 800, y: 200, status: 'valid', prerequisites: ['1'] },
      { id: '5', moduleCode: 'IT3011', moduleName: 'Software Engineering', level: 2, x: 300, y: 360, status: 'warning', prerequisites: ['2', '3'] },
      { id: '6', moduleCode: 'IT4020', moduleName: 'Software Quality Assurance', level: 3, x: 400, y: 500, status: 'valid', prerequisites: ['5', '4'] },
      { id: '9', moduleCode: 'SE3020', moduleName: 'Distributed Systems', level: 2, x: 100, y: 360, status: 'error', prerequisites: ['2'] },
    ];
    return of(nodes);
  }

  getDependencyEdges(): Observable<DependencyEdge[]> {
    const edges: DependencyEdge[] = [
      { from: '1', to: '2', type: 'Mandatory' },
      { from: '1', to: '3', type: 'Mandatory' },
      { from: '1', to: '4', type: 'Optional' },
      { from: '2', to: '5', type: 'Mandatory' },
      { from: '3', to: '5', type: 'Optional' },
      { from: '5', to: '6', type: 'Mandatory' },
      { from: '4', to: '6', type: 'Optional' },
      { from: '2', to: '9', type: 'Mandatory' },
    ];
    return of(edges);
  }

  // ---------- SEMESTER OFFERING METHODS ----------

  // get semester offerings
  getOfferings(): Observable<SemesterOffering[]> {
    return this.http
      .get<ApiResponse<SemesterOffering[]>>(`${this.apiUrl}/semester-offerings`)
      .pipe(map((res) => res.data));
  }

  // get offering stats
  getOfferingStats(): Observable<OfferingStats> {
    return this.http
      .get<ApiResponse<OfferingStats>>(`${this.apiUrl}/semester-offerings/stats`)
      .pipe(map((res) => res.data));
  }

  // create a new semester offering
  createOffering(offering: any): Observable<SemesterOffering> {
    return this.http
      .post<ApiResponse<SemesterOffering>>(`${this.apiUrl}/semester-offerings`, offering)
      .pipe(map((res) => res.data));
  }

  // update an existing semester offering
  updateOffering(id: string, offering: any): Observable<SemesterOffering> {
    return this.http
      .put<ApiResponse<SemesterOffering>>(`${this.apiUrl}/semester-offerings/${id}`, offering)
      .pipe(map((res) => res.data));
  }

  // delete a semester offering
  deleteOffering(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${this.apiUrl}/semester-offerings/${id}`)
      .pipe(map((res) => res.data));
  }

  // ---------- VALIDATION ALERT METHODS ----------

  // get all validation alerts
  getValidationAlerts(): Observable<ValidationAlert[]> {
    return this.http
      .get<ApiResponse<ValidationAlert[]>>(`${this.apiUrl}/validation-alerts`)
      .pipe(map((res) => res.data));
  }

  // get validation stats
  getValidationStats(): Observable<ValidationStats> {
    return this.http
      .get<ApiResponse<ValidationStats>>(`${this.apiUrl}/validation-alerts/stats`)
      .pipe(map((res) => res.data));
  }

  // update alert status
  updateAlertStatus(id: string, status: string): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(`${this.apiUrl}/validation-alerts/${id}/status`, { status })
      .pipe(map(() => true));
  }
}
