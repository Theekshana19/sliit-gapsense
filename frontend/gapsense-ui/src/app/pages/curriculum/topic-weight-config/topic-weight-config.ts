import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { StatusBadgeComponent } from '../../../components/ui/status-badge/status-badge';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { CurriculumService } from '../../../services/curriculum.service';
import { ToastService } from '../../../services/toast.service';
import { TopicWeightEntry } from '../../../models/curriculum/topic.model';
import { Module } from '../../../models/curriculum/module.model';

// topic weight configuration page - fine tune percentage weights for each topic
// all topic weights in a module should total exactly 100%
@Component({
  selector: 'app-topic-weight-config',
  standalone: true,
  imports: [MainLayoutComponent, StatusBadgeComponent, LoadingSpinnerComponent, FormsModule],
  templateUrl: './topic-weight-config.html',
})
export class TopicWeightConfigComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private curriculumService = inject(CurriculumService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  module = signal<Module | null>(null);
  weights = signal<TopicWeightEntry[]>([]);

  moduleId = '2';

  // calculate total weight from all topics
  totalWeight = computed(() => {
    return this.weights().reduce((sum, w) => sum + w.currentWeight, 0);
  });

  // check if total is valid (exactly 100)
  isValid = computed(() => this.totalWeight() === 100);

  ngOnInit() {
    this.moduleId = this.route.snapshot.paramMap.get('moduleId') || '2';

    this.curriculumService.getModuleById(this.moduleId).subscribe((m) => {
      if (m) this.module.set(m);
    });

    this.curriculumService.getTopicWeights(this.moduleId).subscribe((data) => {
      this.weights.set(data);
      this.isLoading.set(false);
    });
  }

  // update weight for a specific topic
  updateWeight(id: string, value: number) {
    this.weights.update((list) =>
      list.map((w) => (w.id === id ? { ...w, currentWeight: value } : w))
    );
  }

  // distribute weights evenly across all topics
  distributeEvenly() {
    const count = this.weights().length;
    if (count === 0) return;

    const evenWeight = Math.floor(100 / count);
    const remainder = 100 - evenWeight * count;

    this.weights.update((list) =>
      list.map((w, i) => ({
        ...w,
        currentWeight: evenWeight + (i < remainder ? 1 : 0),
      }))
    );
  }

  // reset all weights to 0
  resetWeights() {
    this.weights.update((list) =>
      list.map((w) => ({ ...w, currentWeight: 0 }))
    );
  }

  // save all weights
  saveWeights() {
    if (!this.isValid()) {
      this.toastService.error('Total weight must be exactly 100%');
      return;
    }

    const updates = this.weights().map((w) => ({ id: w.id, weight: w.currentWeight }));
    this.curriculumService.updateTopicWeights(this.moduleId, updates).subscribe(() => {
      this.toastService.success('Topic weights saved successfully');
    });
  }

  // get importance badge variant
  getImportanceVariant(level: string): 'error' | 'primary' | 'success' | 'neutral' {
    switch (level) {
      case 'Critical': return 'error';
      case 'High': return 'primary';
      case 'Medium': return 'success';
      default: return 'neutral';
    }
  }
}
