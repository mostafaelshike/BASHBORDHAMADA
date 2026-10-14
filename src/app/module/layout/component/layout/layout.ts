import { Component, HostListener, ViewChild } from '@angular/core';
import { Navside } from '../../../navside/component/navside/navside';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  isSideNavOpen: boolean = true;
  isMobile = false;
  isLogoutDialogOpen: boolean = false;

  @ViewChild(Navside) private navside?: Navside;

  constructor() {
    this.updateViewportMode();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateViewportMode();
  }

  onToggleSideNav(isOpen: boolean): void {
    this.isSideNavOpen = isOpen;
  }

  toggleSideNavFromHeader(): void {
    this.navside?.toggleSidebar();
  }

  closeMobileSideNav(): void {
    this.navside?.closeSidebar();
  }

  private updateViewportMode(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  openLogoutDialog(): void {
    this.isLogoutDialogOpen = true;
  }

  closeLogoutDialog(): void {
    this.isLogoutDialogOpen = false;
  }

  confirmLogout(): void {
    this.closeLogoutDialog();
  }
}