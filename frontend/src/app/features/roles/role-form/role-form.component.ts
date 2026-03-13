import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Permission } from '../../../core/models/models';
import { ModuleDef } from '../../../shared/components/permission-matrix/permission-matrix.component';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
import { DynamicNavService } from '../../../core/services/dynamic-nav.service';

const API = 'http://localhost:5000/api';

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
})
export class RoleFormComponent implements OnInit {
  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  permissions: Permission[] = [];
  modules: ModuleDef[] = [];
  isEdit = false;
  roleId = '';
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private permissionService: PermissionService,
    private dynamicNavService: DynamicNavService
  ) {}

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.roleId;

    // Load module definitions from backend
    this.http.get<{ modules: ModuleDef[]; actions: string[] }>(`${API}/modules`).subscribe({
      next: (res) => {
        this.modules = res.modules;
        if (this.isEdit) {
          this.loadRole();
        } else {
          // Initialize empty permissions for all leaf-level sub-modules
          const leaves = this.flattenLeaves(res.modules);
          this.permissions = leaves.map((m) => ({
            module: m.key, view: false, create: false, edit: false,
            delete: false, export: false, import: false, search: false,
          }));
        }
      },
    });
  }

  private flattenLeaves(mods: ModuleDef[]): ModuleDef[] {
    return mods.flatMap((m) => (m.children && m.children.length ? m.children : [m]));
  }

  loadRole(): void {
    this.roleService.getRoleById(this.roleId).subscribe({
      next: (role) => {
        this.form.patchValue({ name: role.name, description: role.description });
        this.permissions = role.permissions;
      },
    });
  }

  onPermissionsChange(updated: Permission[]): void {
    this.permissions = updated;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const payload = { ...(this.form.value as { name: string; description: string }), permissions: this.permissions };

    const request$ = this.isEdit
      ? this.roleService.updateRole(this.roleId, payload)
      : this.roleService.createRole(payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(`Role ${this.isEdit ? 'updated' : 'created'} successfully`, 'Close', { duration: 3000 });
        // Refresh current user's permissions so UI updates immediately without re-login
        this.authService.fetchMe().subscribe({
          next: (res) => {
            this.permissionService.loadPermissions(res.user);
            this.dynamicNavService.buildNav();
          },
        });
        this.router.navigate(['/roles']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Save failed';
        this.loading = false;
      },
    });
  }
}
