import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// sidebar navigation - fixed on the left side of the page
// has navigation items for both Chamodi (readiness) and Sewwandi (curriculum) modules
// uses glassmorphic style (blur + transparency)
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  // curriculum section - Sewwandi's pages
  curriculumItems = [
    { label: 'Module Management', icon: 'inventory_2', route: '/curriculum/module-management' },
    { label: 'Topic Management', icon: 'topic', route: '/curriculum/modules/11111111-1111-1111-1111-111111111102/topics' },
    { label: 'Prerequisite Mapping', icon: 'account_tree', route: '/curriculum/prerequisite-management' },
    { label: 'Dependency View', icon: 'hub', route: '/curriculum/dependency-visualization' },
    { label: 'Semester Offerings', icon: 'calendar_month', route: '/curriculum/semester-offerings' },
    { label: 'Validation Alerts', icon: 'report', route: '/curriculum/validation-alerts' },
  ];

  // readiness section - Chamodi's pages (lecturer side only)
  // Student Assessment is NOT here because it has no sidebar (student page)
  // Students access it via direct URL: /readiness/quiz-attempt/:quizId
  readinessItems = [
    { label: 'Question Bank', icon: 'database', route: '/readiness/question-bank' },
    { label: 'Quiz Builder', icon: 'quiz', route: '/readiness/quiz-builder' },
    { label: 'Quiz Scheduling', icon: 'event_note', route: '/readiness/quiz-scheduling' },
    { label: 'Submission Tracking', icon: 'troubleshoot', route: '/readiness/submission-tracking' },
    { label: 'Attempt History', icon: 'history', route: '/readiness/attempt-history' },
    { label: 'Notifications', icon: 'notifications', route: '/monitoring/plans' },
  ];
}
