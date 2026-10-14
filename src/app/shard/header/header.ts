import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SvgIcon } from '../svg-icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SvgIcon],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Output() menuToggle = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}