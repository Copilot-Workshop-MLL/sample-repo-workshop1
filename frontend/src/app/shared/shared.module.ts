import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PermissionMatrixComponent } from './components/permission-matrix/permission-matrix.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HasPermissionDirective } from './directives/has-permission.directive';

@NgModule({
  declarations: [PermissionMatrixComponent, SidebarComponent, HasPermissionDirective],
  imports: [CommonModule, RouterModule, MatCheckboxModule, MatListModule, MatIconModule, MatDividerModule],
  exports: [PermissionMatrixComponent, SidebarComponent, HasPermissionDirective],
})
export class SharedModule {}
