import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Role } from '../../../core/models/models';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  displayedColumns = ['name', 'description', 'actions'];
  loading = false;

  constructor(private roleService: RoleService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (roles) => { this.roles = roles; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  deleteRole(id: string): void {
    if (!confirm('Delete this role?')) return;
    this.roleService.deleteRole(id).subscribe({
      next: () => {
        this.roles = this.roles.filter((r) => r._id !== id);
        this.snackBar.open('Role deleted', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 }),
    });
  }
}
