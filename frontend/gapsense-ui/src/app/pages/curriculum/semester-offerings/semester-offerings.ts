import { Component, inject, signal, OnInit } from '@angular/core';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { StatusBadgeComponent } from '../../../components/ui/status-badge/status-badge';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { CurriculumService } from '../../../services/curriculum.service';
import { SemesterOffering, OfferingStats } from '../../../models/curriculum/semester-offering.model';

// semester offerings page - manage which modules are offered each semester
@Component({
  selector: 'app-semester-offerings',
  standalone: true,
  imports: [MainLayoutComponent, StatusBadgeComponent, LoadingSpinnerComponent],
  templateUrl: './semester-offerings.html',
})
export class SemesterOfferingsComponent implements OnInit {
  private curriculumService = inject(CurriculumService);

  isLoading = signal(true);
  offerings = signal<SemesterOffering[]>([]);
  stats = signal<OfferingStats>({ completionPercentage: 0, attentionNeeded: 0, efficiencyGrowth: 0 });

  ngOnInit() {
    this.curriculumService.getOfferings().subscribe((data) => {
      this.offerings.set(data);
      this.isLoading.set(false);
    });
    this.curriculumService.getOfferingStats().subscribe((s) => this.stats.set(s));
  }

  getStatusVariant(status: string): 'primary' | 'error' | 'neutral' {
    switch (status) {
      case 'Published': return 'primary';
      case 'Inactive': return 'error';
      default: return 'neutral';
    }
  }
}
