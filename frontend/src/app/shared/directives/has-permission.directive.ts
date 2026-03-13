import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';

/**
 * Structural directive to show/hide elements based on role permissions.
 * Usage: <button *appHasPermission="['users', 'create']">Add User</button>
 */
@Directive({ selector: '[appHasPermission]' })
export class HasPermissionDirective implements OnInit {
  @Input() appHasPermission: [string, string] = ['', ''];

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    const [module, action] = this.appHasPermission;
    if (this.permissionService.can(module, action)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
