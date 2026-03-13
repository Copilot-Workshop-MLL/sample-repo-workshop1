import { Component, OnInit } from '@angular/core';
import { NavItem } from '../../../core/models/models';
import { DynamicNavService } from '../../../core/services/dynamic-nav.service';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  navItems: NavItem[] = [];
  private expanded = new Set<string>();

  constructor(
    private dynamicNavService: DynamicNavService,
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.dynamicNavService.navItems$.subscribe((items) => (this.navItems = items));
  }

  toggleItem(moduleKey: string): void {
    if (this.expanded.has(moduleKey)) {
      this.expanded.delete(moduleKey);
    } else {
      this.expanded.add(moduleKey);
    }
  }

  isExpanded(moduleKey: string): boolean {
    return this.expanded.has(moduleKey);
  }

  logout(): void {
    this.permissionService.clear();
    this.dynamicNavService.clearNav();
    this.authService.logout();
  }
}
