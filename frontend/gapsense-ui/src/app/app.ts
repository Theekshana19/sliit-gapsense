import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// root component - this is the app shell that loads everything
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
