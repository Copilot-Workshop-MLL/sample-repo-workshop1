import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NavItem } from '../models/models';
import { PermissionService } from './permission.service';

const ALL_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', module: 'dashboard', icon: 'dashboard' },
  {
    label: 'Users', module: 'users', icon: 'group',
    children: [
      { label: 'User List',   route: '/users',        module: 'users.list',   icon: 'list' },
      { label: 'Create User', route: '/users/create', module: 'users.create', icon: 'person_add' },
    ],
  },
  {
    label: 'Roles', module: 'roles', icon: 'admin_panel_settings',
    children: [
      { label: 'Role List',   route: '/roles',        module: 'roles.list',   icon: 'list' },
      { label: 'Create Role', route: '/roles/create', module: 'roles.create', icon: 'add_moderator' },
    ],
  },
  {
    label: 'Products', module: 'products', icon: 'inventory_2',
    children: [
      { label: 'Product List', route: '/products', module: 'products.list',       icon: 'view_list' },
      { label: 'Categories',   route: '/products', module: 'products.categories', icon: 'category' },
    ],
  },
  {
    label: 'Orders', module: 'orders', icon: 'receipt_long',
    children: [
      { label: 'All Orders',     route: '/orders', module: 'orders.all',     icon: 'list_alt' },
      { label: 'Pending Orders', route: '/orders', module: 'orders.pending', icon: 'pending_actions' },
    ],
  },
  {
    label: 'Reports', module: 'reports', icon: 'bar_chart',
    children: [
      { label: 'Sales Report',     route: '/reports', module: 'reports.sales',     icon: 'trending_up' },
      { label: 'Inventory Report', route: '/reports', module: 'reports.inventory', icon: 'inventory' },
    ],
  },
  {
    label: 'Settings', module: 'settings', icon: 'settings',
    children: [
      { label: 'Profile',         route: '/settings', module: 'settings.profile', icon: 'person' },
      { label: 'System Settings', route: '/settings', module: 'settings.system',  icon: 'tune' },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class DynamicNavService {
  private navSubject = new BehaviorSubject<NavItem[]>([]);
  navItems$ = this.navSubject.asObservable();

  constructor(private permissionService: PermissionService) {}

  buildNav(): void {
    const filtered = ALL_NAV_ITEMS
      .map((item) => {
        if (item.children) {
          const visibleChildren = item.children.filter((c) =>
            this.permissionService.can(c.module, 'view')
          );
          if (visibleChildren.length === 0) return null;
          return { ...item, children: visibleChildren };
        }
        return this.permissionService.can(item.module, 'view') ? item : null;
      })
      .filter((item): item is NavItem => item !== null);
    this.navSubject.next(filtered);
  }

  clearNav(): void {
    this.navSubject.next([]);
  }
}
