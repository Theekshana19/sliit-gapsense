import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

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
import { API_BASE_URL } from '../config/api.config';

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

  private readonly apiUrl = `${API_BASE_URL}/api`;

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

  // update an existing prerequisite - can change type, weight, notes, status
  // cannot change which modules are linked - delete and recreate for that
  updatePrerequisite(id: string, updates: Partial<Prerequisite>): Observable<Prerequisite> {
    const body = {
      relationshipType: updates.relationshipType ?? 'Mandatory',
      relevanceWeight: updates.relevanceWeight ?? 50,
      notes: updates.notes ?? '',
      status: updates.status ?? 'Validated',
    };
    return this.http
      .put<ApiResponse<Prerequisite>>(`${this.apiUrl}/prerequisites/${id}`, body)
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

  // get the dependency graph nodes - loads real modules and computes layout
  // each module becomes a node, level is calculated from prerequisite chain depth
  getDependencyNodes(): Observable<DependencyNode[]> {
    return forkJoin({
      modules: this.getModules(),
      prerequisites: this.getPrerequisites(),
    }).pipe(
      map(({ modules, prerequisites }) => this.buildDependencyNodes(modules, prerequisites))
    );
  }

  // get the dependency graph edges - one edge per prerequisite relationship
  // edge type (mandatory/optional) determines if line is solid or dashed in the SVG
  getDependencyEdges(): Observable<DependencyEdge[]> {
    return this.getPrerequisites().pipe(
      map((prereqs) =>
        prereqs.map((p) => ({
          from: p.prerequisiteModuleId,
          to: p.mainModuleId,
          type: p.relationshipType,
        }))
      )
    );
  }

  // build the visual graph nodes from real module + prerequisite data
  // calculates each module's depth level and assigns x/y positions for the SVG
  private buildDependencyNodes(modules: Module[], prereqs: Prerequisite[]): DependencyNode[] {
    // build a map of moduleId -> list of prerequisite module ids
    const prereqMap = new Map<string, string[]>();
    for (const p of prereqs) {
      const list = prereqMap.get(p.mainModuleId) ?? [];
      list.push(p.prerequisiteModuleId);
      prereqMap.set(p.mainModuleId, list);
    }

    // calculate level (depth) for each module - starts at 0 for modules with no prerequisites
    const levelMap = new Map<string, number>();
    const calculateLevel = (modId: string, visited: Set<string>): number => {
      if (visited.has(modId)) return 0; // prevent infinite loop on circular deps
      if (levelMap.has(modId)) return levelMap.get(modId)!;
      visited.add(modId);

      const prereqIds = prereqMap.get(modId) ?? [];
      if (prereqIds.length === 0) {
        levelMap.set(modId, 0);
        return 0;
      }

      let maxLevel = 0;
      for (const pId of prereqIds) {
        const lvl = calculateLevel(pId, visited);
        if (lvl > maxLevel) maxLevel = lvl;
      }
      const result = maxLevel + 1;
      levelMap.set(modId, result);
      return result;
    };

    for (const mod of modules) {
      calculateLevel(mod.id, new Set());
    }

    // group modules by level so we can position them horizontally on each row
    const byLevel = new Map<number, Module[]>();
    for (const mod of modules) {
      const lvl = levelMap.get(mod.id) ?? 0;
      const list = byLevel.get(lvl) ?? [];
      list.push(mod);
      byLevel.set(lvl, list);
    }

    // assign x/y positions - each level is one row, modules spread horizontally
    const HORIZONTAL_SPACING = 200;
    const VERTICAL_SPACING = 140;
    const Y_OFFSET = 60;
    const nodes: DependencyNode[] = [];

    for (const [level, levelModules] of byLevel.entries()) {
      const rowWidth = (levelModules.length - 1) * HORIZONTAL_SPACING;
      const startX = 500 - rowWidth / 2;

      for (let i = 0; i < levelModules.length; i++) {
        const mod = levelModules[i];
        const x = startX + i * HORIZONTAL_SPACING;
        const y = Y_OFFSET + level * VERTICAL_SPACING;

        // determine status - error if module has unresolved issues
        // for now: all valid unless module status is Draft or Archived
        let status: 'valid' | 'warning' | 'error' = 'valid';
        if (mod.status === 'Draft') status = 'warning';
        if (mod.status === 'Archived') status = 'error';

        nodes.push({
          id: mod.id,
          moduleCode: mod.moduleCode,
          moduleName: mod.moduleName,
          level,
          x,
          y,
          status,
          prerequisites: prereqMap.get(mod.id) ?? [],
        });
      }
    }

    return nodes;
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
    return this.http.get<ApiResponse<ValidationAlert[]>>(`${this.apiUrl}/validation-alerts`).pipe(
      map((res) => (res.success && res.data ? res.data : []))
    );
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
