import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUiService } from '../../../services/auth-ui.service';

// /readiness default entry: students → available quizzes; staff → question bank.
@Component({
  standalone: true,
  selector: 'app-readiness-redirect',
  template: '',
})
export class ReadinessRedirectComponent implements OnInit {
  private router = inject(Router);
  private authUi = inject(AuthUiService);

  ngOnInit() {
    const role = this.authUi.currentUser()?.role;
    if (role === 'student') {
      void this.router.navigate(['/readiness/available-quizzes']);
      return;
    }
    void this.router.navigate(['/readiness/question-bank']);
  }
}
