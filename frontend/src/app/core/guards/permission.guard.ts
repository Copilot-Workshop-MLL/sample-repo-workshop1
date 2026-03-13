import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private permissionService: PermissionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const { module, action } = route.data as { module?: string; action?: string };

    // Public routes (no module/action required)
    if (!module || !action) return true;

    if (this.permissionService.can(module, action)) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
