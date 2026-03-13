import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from '../../shared/shared.module';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleFormComponent } from './role-form/role-form.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PermissionGuard } from '../../core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: RoleListComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { module: 'roles', action: 'view' },
  },
  {
    path: 'new',
    component: RoleFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { module: 'roles', action: 'create' },
  },
  {
    path: ':id/edit',
    component: RoleFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { module: 'roles', action: 'edit' },
  },
];

@NgModule({
  declarations: [RoleListComponent, RoleFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
})
export class RolesModule {}
