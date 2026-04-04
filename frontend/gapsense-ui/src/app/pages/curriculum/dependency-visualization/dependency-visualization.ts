import { Component, inject, signal, OnInit } from '@angular/core';
import { MainLayoutComponent } from '../../../components/layout/main-layout/main-layout';
import { LoadingSpinnerComponent } from '../../../components/ui/loading-spinner/loading-spinner';
import { CurriculumService } from '../../../services/curriculum.service';
import { DependencyNode, DependencyEdge } from '../../../models/curriculum/prerequisite.model';

// dependency visualization page - SVG graph showing module prerequisite chains
// modules are shown as cards connected by lines
@Component({
  selector: 'app-dependency-visualization',
  standalone: true,
  imports: [MainLayoutComponent, LoadingSpinnerComponent],
  templateUrl: './dependency-visualization.html',
})
export class DependencyVisualizationComponent implements OnInit {
  private curriculumService = inject(CurriculumService);

  isLoading = signal(true);
  nodes = signal<DependencyNode[]>([]);
  edges = signal<DependencyEdge[]>([]);

  ngOnInit() {
    this.curriculumService.getDependencyNodes().subscribe((n) => {
      this.nodes.set(n);
    });
    this.curriculumService.getDependencyEdges().subscribe((e) => {
      this.edges.set(e);
      this.isLoading.set(false);
    });
  }

  // get node by id - used for drawing edges
  getNode(id: string): DependencyNode | undefined {
    return this.nodes().find((n) => n.id === id);
  }

  // generate SVG path for an edge (curved line between two nodes)
  getEdgePath(edge: DependencyEdge): string {
    const from = this.getNode(edge.from);
    const to = this.getNode(edge.to);
    if (!from || !to) return '';

    // start from bottom of "from" node, end at top of "to" node
    const x1 = from.x + 80;
    const y1 = from.y + 50;
    const x2 = to.x + 80;
    const y2 = to.y;

    // create a smooth curve
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  }

  // get level color for node border
  getLevelColor(level: number): string {
    switch (level) {
      case 0: return 'border-primary';
      case 1: return 'border-primary-container';
      case 2: return 'border-tertiary';
      case 3: return 'border-error';
      default: return 'border-outline-variant';
    }
  }

  // get level label
  getLevelLabel(level: number): string {
    switch (level) {
      case 0: return 'Foundation';
      case 1: return 'Level 1';
      case 2: return 'Level 2';
      case 3: return 'Level 3';
      default: return 'Level ' + level;
    }
  }

  // get node status ring class
  getStatusRing(status: string): string {
    switch (status) {
      case 'error': return 'ring-2 ring-error';
      case 'warning': return 'ring-2 ring-amber-400';
      default: return '';
    }
  }
}
