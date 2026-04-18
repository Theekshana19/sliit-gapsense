import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CourseModuleDto {
  id: string;
  code: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface LecturerAssignmentDto {
  id: string;
  lecturerUserId: string;
  courseModuleId: string;
  moduleCode: string;
  moduleTitle: string;
  assignedAtUtc: string;
}

export interface StudentInterventionDto {
  id: string;
  studentUserId: string;
  createdByUserId: string;
  title: string;
  notes: string | null;
  status: string;
  createdAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class OptionalModulesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE_URL;

  async fetchCourseModules(): Promise<CourseModuleDto[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<CourseModuleDto[]>>(`${this.base}/api/CourseModules`)
    );
    return res.success && res.data ? res.data : [];
  }

  async createCourseModule(body: {
    code: string;
    title: string;
    description?: string | null;
    sortOrder: number;
  }): Promise<CourseModuleDto | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<CourseModuleDto>>(`${this.base}/api/CourseModules`, body)
      );
      return res.success && res.data ? res.data : null;
    } catch {
      return null;
    }
  }

  async fetchLecturerAssignments(lecturerUserId?: string): Promise<LecturerAssignmentDto[]> {
    const q = lecturerUserId ? `?lecturerUserId=${encodeURIComponent(lecturerUserId)}` : '';
    const res = await firstValueFrom(
      this.http.get<ApiResponse<LecturerAssignmentDto[]>>(`${this.base}/api/LecturerAssignments${q}`)
    );
    return res.success && res.data ? res.data : [];
  }

  async assignModule(body: { courseModuleId: string; lecturerUserId?: string | null }): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<unknown>>(`${this.base}/api/LecturerAssignments`, body)
      );
      return !!res.success;
    } catch {
      return false;
    }
  }

  async fetchInterventions(studentUserId?: string): Promise<StudentInterventionDto[]> {
    const q = studentUserId ? `?studentUserId=${encodeURIComponent(studentUserId)}` : '';
    const res = await firstValueFrom(
      this.http.get<ApiResponse<StudentInterventionDto[]>>(`${this.base}/api/StudentInterventions${q}`)
    );
    return res.success && res.data ? res.data : [];
  }

  async createIntervention(body: {
    studentUserId: string;
    title: string;
    notes?: string | null;
    status?: string;
  }): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<unknown>>(`${this.base}/api/StudentInterventions`, body)
      );
      return !!res.success;
    } catch {
      return false;
    }
  }

  async patchStudentIntervention(
    id: string,
    body: { status?: 'open' | 'closed'; notes?: string | null },
  ): Promise<StudentInterventionDto | null> {
    try {
      const res = await firstValueFrom(
        this.http.patch<ApiResponse<StudentInterventionDto>>(`${this.base}/api/StudentInterventions/${id}`, body)
      );
      return res.success && res.data ? res.data : null;
    } catch {
      return null;
    }
  }
}
