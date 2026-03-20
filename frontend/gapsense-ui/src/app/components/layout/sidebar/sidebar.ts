import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// sidebar navigation - fixed on the left side of the page
// has 8 navigation items matching the readiness module pages
// uses glassmorphic style (blur + transparency)
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  // navigation items - each has a label, icon, and route
  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/readiness/dashboard' },
    { label: 'Question Bank', icon: 'database', route: '/readiness/question-bank' },
    { label: 'Quiz Builder', icon: 'quiz', route: '/readiness/quiz-builder' },
    { label: 'Quiz Scheduling', icon: 'event_note', route: '/readiness/quiz-scheduling' },
    { label: 'Student Assessment', icon: 'assignment_ind', route: '/readiness/quiz-attempt/1' },
    { label: 'Submission Tracking', icon: 'troubleshoot', route: '/readiness/submission-tracking' },
    { label: 'Attempt History', icon: 'history', route: '/readiness/attempt-history' },
    { label: 'Learning Resources', icon: 'menu_book', route: '/readiness/resources' },
  ];
}
