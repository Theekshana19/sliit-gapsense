import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { AppFooterComponent } from '../../../components/layout/app-footer/app-footer.component';
import {
  OptionalModulesApiService,
  type CourseModuleDto,
  type LecturerAssignmentDto,
  type StudentInterventionDto,
} from '../../../services/optional-modules-api.service';
import { AuthUiService } from '../../../services/auth-ui.service';

@Component({
  selector: 'app-curriculum-page',
  standalone: true,
  imports: [TopBarComponent, SidebarComponent, AppFooterComponent, FormsModule, DatePipe],
  templateUrl: './curriculum-page.component.html',
  styleUrl: './curriculum-page.component.css',
})
export class CurriculumPageComponent implements OnInit {
  private readonly api = inject(OptionalModulesApiService);
  protected readonly authUi = inject(AuthUiService);

  protected readonly modules = signal<CourseModuleDto[]>([]);
  protected readonly assignments = signal<LecturerAssignmentDto[]>([]);
  protected readonly interventions = signal<StudentInterventionDto[]>([]);
  protected readonly notice = signal<string | null>(null);

  protected newModuleCode = '';
  protected newModuleTitle = '';
  protected newModuleDescription = '';
  protected newModuleSortOrder = 100;

  protected selectedModuleForAssign = '';

  protected interventionStudentId = '';
  protected interventionTitle = '';
  protected interventionNotes = '';

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  protected async refresh(): Promise<void> {
    const [mods, assigns, inter] = await Promise.all([
      this.api.fetchCourseModules(),
      this.api.fetchLecturerAssignments(),
      this.api.fetchInterventions(),
    ]);
    this.modules.set(mods);
    this.assignments.set(assigns);
    this.interventions.set(inter);
  }

  protected async addModule(): Promise<void> {
    const created = await this.api.createCourseModule({
      code: this.newModuleCode,
      title: this.newModuleTitle,
      description: this.newModuleDescription || null,
      sortOrder: this.newModuleSortOrder,
    });
    if (created) {
      this.notice.set('Module added.');
      this.newModuleCode = '';
      this.newModuleTitle = '';
      this.newModuleDescription = '';
      await this.refresh();
    } else {
      this.notice.set('Could not add module (check code is unique).');
    }
  }

  protected async assignSelectedModule(): Promise<void> {
    if (!this.selectedModuleForAssign) return;
    const ok = await this.api.assignModule({ courseModuleId: this.selectedModuleForAssign });
    this.notice.set(ok ? 'Module assigned.' : 'Assignment failed.');
    if (ok) await this.refresh();
  }

  protected async addIntervention(): Promise<void> {
    if (!this.interventionStudentId.trim() || !this.interventionTitle.trim()) {
      this.notice.set('Student id and title are required.');
      return;
    }
    const ok = await this.api.createIntervention({
      studentUserId: this.interventionStudentId.trim(),
      title: this.interventionTitle.trim(),
      notes: this.interventionNotes.trim() || null,
      status: 'open',
    });
    this.notice.set(ok ? 'Follow-up recorded.' : 'Could not record follow-up.');
    if (ok) {
      this.interventionTitle = '';
      this.interventionNotes = '';
      await this.refresh();
    }
  }

  protected dismissNotice(): void {
    this.notice.set(null);
  }

  protected isAdmin(): boolean {
    return this.authUi.currentUser()?.role === 'admin';
  }
}
