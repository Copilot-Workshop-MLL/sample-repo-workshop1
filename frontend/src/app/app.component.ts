import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { PermissionService } from './core/services/permission.service';
import { DynamicNavService } from './core/services/dynamic-nav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private dynamicNavService: DynamicNavService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      if (user) {
        this.permissionService.loadPermissions(user);
        this.dynamicNavService.buildNav();
      }
    });
  }
}
