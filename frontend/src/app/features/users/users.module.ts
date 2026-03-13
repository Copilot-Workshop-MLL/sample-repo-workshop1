import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { SharedModule } from '../../shared/shared.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PermissionGuard } from '../../core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: UserListComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { module: 'users', action: 'view' },
  },
  {
    path: 'new',
    component: UserFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { module: 'users', action: 'create' },
  },
  {
    path: ':id/edit',
    component: UserFormComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { module: 'users', action: 'edit' },
  },
];

@NgModule({
  declarations: [UserListComponent, UserFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
  ],
})
export class UsersModule {}
