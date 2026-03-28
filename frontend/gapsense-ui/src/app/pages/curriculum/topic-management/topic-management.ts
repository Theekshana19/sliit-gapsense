import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { StatusBadgeComponent } from '../../../components/ui/status-badge/status-badge';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { ConfirmDialogComponent } from '../../../components/ui/confirm-dialog/confirm-dialog';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { Topic, TopicStats } from '../../../models/curriculum/topic.model';
import { Module } from '../../../models/curriculum/module.model';

// topic management page - list all topics for a specific module
// shows topic weights, importance levels, and allows CRUD operations
@Component({
  selector: 'app-topic-management',
  standalone: true,
  imports: [MainLayoutComponent, StatusBadgeComponent, LoadingSpinnerComponent, ConfirmDialogComponent],
  templateUrl: './topic-management.html',
})
export class TopicManagementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private curriculumService = inject(CurriculumService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  module = signal<Module | null>(null);
  topics = signal<Topic[]>([]);
  stats = signal<TopicStats>({ totalTopics: 0, validatedCount: 0, draftCount: 0, totalWeight: 0, alignmentPercentage: 0 });

  // delete dialog
  showDeleteDialog = signal(false);
  topicToDelete = signal<Topic | null>(null);

  // module id from the route URL
  moduleId = '';

  ngOnInit() {
    this.moduleId = this.route.snapshot.paramMap.get('moduleId') || '';
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    this.curriculumService.getModuleById(this.moduleId).subscribe((m) => {
      if (m) this.module.set(m);
    });

    this.curriculumService.getTopicsByModule(this.moduleId).subscribe((data) => {
      this.topics.set(data);
      this.isLoading.set(false);
    });

    this.curriculumService.getTopicStats(this.moduleId).subscribe((s) => this.stats.set(s));
  }

  goToAddTopic() {
    this.router.navigate(['/curriculum/topics/new']);
  }

  goToEditTopic(id: string) {
    this.router.navigate(['/curriculum/topics', id, 'edit']);
  }

  goToWeightConfig() {
    this.router.navigate(['/curriculum/topic-weight-config', this.moduleId]);
  }

  confirmDelete(topic: Topic) {
    this.topicToDelete.set(topic);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed() {
    const topic = this.topicToDelete();
    if (topic) {
      this.curriculumService.deleteTopic(topic.id).subscribe(() => {
        this.toastService.success('Topic deleted successfully');
        this.showDeleteDialog.set(false);
        this.topicToDelete.set(null);
        this.loadData();
      });
    }
  }

  onDeleteCancelled() {
    this.showDeleteDialog.set(false);
    this.topicToDelete.set(null);
  }

  getStatusVariant(status: string): 'primary' | 'neutral' {
    return status === 'Validated' ? 'primary' : 'neutral';
  }

  // get priority dot color based on importance
  getPriorityColor(level: string): string {
    switch (level) {
      case 'Critical': return 'bg-error';
      case 'High': return 'bg-primary';
      case 'Medium': return 'bg-tertiary';
      default: return 'bg-outline-variant';
    }
  }

  // get badge initials color
  getBadgeColor(index: number): string {
    const colors = ['bg-primary-fixed', 'bg-secondary-container', 'bg-tertiary-fixed', 'bg-surface-container-high'];
    return colors[index % colors.length];
  }
}
