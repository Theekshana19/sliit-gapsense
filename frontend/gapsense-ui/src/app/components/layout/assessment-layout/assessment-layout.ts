import { Component, input } from '@angular/core';

// assessment layout - used ONLY for the student quiz attempt page
// this layout has NO sidebar - just a minimal header with timer
// students should not be distracted while taking a quiz
@Component({
  selector: 'app-assessment-layout',
  standalone: true,
  templateUrl: './assessment-layout.html',
})
export class AssessmentLayoutComponent {
  // quiz title shown in the header
  quizTitle = input<string>('');

  // timer display (like "42:15")
  timerDisplay = input<string>('00:00');

  // student name
  studentName = input<string>('Student');

  // student initials for avatar
  studentInitials = input<string>('ST');
}
