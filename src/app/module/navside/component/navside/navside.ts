import {
  Component,
  OnInit,
  HostListener,
  HostBinding,
  Output,
  EventEmitter,
} from '@angular/core';

import { Router } from '@angular/router';
import { NAVBAR_DATA, NavItem } from '../../../../shard/nav-data';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-navside',
  standalone: false,
  templateUrl: './navside.html',
  styleUrl: './navside.css',
})
export class Navside implements OnInit {

  /* =========================================================
     SIDEBAR STATE
  ========================================================= */

  isCollapsed = false;
  isMobile = false;

  private isCompact = false;
  private responsiveModeInitialized = false;

  @HostBinding('class.collapsed')
  get isHostCollapsed(): boolean {
    return this.isCollapsed;
  }

  @HostBinding('class.mobile-mode')
  get isHostMobile(): boolean {
    return this.isMobile;
  }

  @HostBinding('class.mobile-open')
  get isHostMobileOpen(): boolean {
    return this.isMobile && !this.isCollapsed;
  }

  navbarData: NavItem[] = NAVBAR_DATA;

  showLogoutDialog = false;

  @Output() onToggleSideNav = new EventEmitter<boolean>();


  /* =========================================================
     CONSTRUCTOR
  ========================================================= */

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}


  /* =========================================================
     INIT
  ========================================================= */

  ngOnInit(): void {
    this.updateResponsiveMode();
  }


  /* =========================================================
     RESIZE
     
     مهم:
     لا نغير isCollapsed هنا أثناء كل resize.
     لأن تغيير حالة الـ sidebar أثناء الـ transition
     كان سبب الـ jump.
  ========================================================= */

  @HostListener('window:resize')
  onResize(): void {
    this.updateResponsiveMode();
  }


  /* =========================================================
     TOGGLE SIDEBAR
  ========================================================= */

  toggleSidebar(): void {

    this.isCollapsed = !this.isCollapsed;

    /* عند التصغير نقفل الـ dropdowns */

    if (this.isCollapsed) {
      this.closeAllDropdowns();
    }

    this.emitNavState();
  }

  closeSidebar(): void {
    if (this.isCollapsed) {
      return;
    }

    this.isCollapsed = true;
    this.closeAllDropdowns();
    this.emitNavState();
  }

  closeAfterNavigation(): void {
    if (this.isMobile) {
      this.closeSidebar();
    }
  }


  /* =========================================================
     HANDLE DROPDOWN
  ========================================================= */

  handleItemClick(item: NavItem): void {

    /*
     * لو الـ Sidebar مقفول:
     * نفتحه أولاً بدون أي resize أو تغيير خارجي.
     */

    if (this.isCollapsed) {

      this.isCollapsed = false;

      this.emitNavState();
    }

    /*
     * Toggle dropdown
     */

    item.isOpen = !item.isOpen;


    /*
     * لو عنده children
     * ننتقل لأول صفحة.
     */

    if (item.children && item.children.length > 0) {

      this.router.navigateByUrl(
        item.children[0].path
      );
    }
  }


  /* =========================================================
     CHECK PARENT ACTIVE
  ========================================================= */

  isParentActive(item: NavItem): boolean {

    if (!item.children || item.children.length === 0) {
      return false;
    }

    return item.children.some(child =>
      this.router.url.startsWith(child.path)
    );
  }


  /* =========================================================
     CLOSE ALL DROPDOWNS
  ========================================================= */

  private closeAllDropdowns(): void {

    this.navbarData.forEach(item => {
      item.isOpen = false;
    });
  }


  /* =========================================================
     EMIT SIDEBAR STATE
  ========================================================= */

  private emitNavState(): void {

    /*
     * true  = sidebar مفتوح
     * false = sidebar مقفول
     */

    this.onToggleSideNav.emit(!this.isCollapsed);
  }

  private updateResponsiveMode(): void {
    const compact = window.innerWidth <= 1120;
    const mobile = window.innerWidth <= 768;
    const breakpointChanged = !this.responsiveModeInitialized
      || compact !== this.isCompact
      || mobile !== this.isMobile;

    this.isCompact = compact;
    this.isMobile = mobile;
    this.responsiveModeInitialized = true;

    if (breakpointChanged) {
      this.isCollapsed = compact;

      if (this.isCollapsed) {
        this.closeAllDropdowns();
      }

      this.emitNavState();
    }
  }


  /* =========================================================
     LOGOUT DIALOG
  ========================================================= */

  openLogoutDialog(): void {

    this.showLogoutDialog = true;
  }


  closeLogoutDialog(): void {

    this.showLogoutDialog = false;
  }


  /* =========================================================
     CONFIRM LOGOUT
  ========================================================= */

  confirmLogout(): void {

    this.showLogoutDialog = false;
    this.authService.logout();
  }
}