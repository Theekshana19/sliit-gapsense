import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogOverlayComponent } from './components/ui/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from './components/ui/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ConfirmDialogOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
