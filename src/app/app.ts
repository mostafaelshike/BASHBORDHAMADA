import { Component, signal } from '@angular/core';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('dashbord');

  constructor(public toastService: ToastService) {}
}
