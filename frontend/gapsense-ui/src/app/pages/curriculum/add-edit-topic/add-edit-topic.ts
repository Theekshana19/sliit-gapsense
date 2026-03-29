import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { TopicFormComponent } from '../../../components/curriculum/topic-form/topic-form';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { Topic } from '../../../models/curriculum/topic.model';

// add/edit topic page
@Component({
  selector: 'app-add-edit-topic',
  standalone: true,
  imports: [MainLayoutComponent, TopicFormComponent, LoadingSpinnerComponent],
  templateUrl: './add-edit-topic.html',
})
export class AddEditTopicComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private curriculumService = inject(CurriculumService);
  private toastService = inject(ToastService);

  isEditMode = signal(false);
  topic = signal<Topic | null>(null);
  pageTitle = signal('Add Topic');
  isLoading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.pageTitle.set('Edit Topic');
      this.isLoading.set(true);

      this.curriculumService.getTopicById(id).subscribe({
        next: (t) => {
          if (t) this.topic.set(t);
          else {
            this.toastService.error('Topic not found');
            this.router.navigate(['/curriculum/module-management']);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.toastService.error('Failed to load topic');
          this.isLoading.set(false);
          this.router.navigate(['/curriculum/module-management']);
        },
      });
    }
  }

  onFormSubmit(data: Partial<Topic>) {
    if (this.isEditMode()) {
      const id = this.route.snapshot.paramMap.get('id')!;
      this.curriculumService.updateTopic(id, data).subscribe({
        next: () => {
          this.toastService.success('Topic updated successfully');
          this.router.navigate(['/curriculum/module-management']);
        },
        error: (err: any) => {
          this.toastService.error(err?.error?.message || 'Failed to update topic');
        },
      });
    } else {
      this.curriculumService.createTopic(data).subscribe({
        next: () => {
          this.toastService.success('Topic created successfully');
          this.router.navigate(['/curriculum/module-management']);
        },
        error: (err: any) => {
          this.toastService.error(err?.error?.message || 'Failed to create topic');
        },
      });
    }
  }

  onFormCancel() {
    this.router.navigate(['/curriculum/module-management']);
  }
}
