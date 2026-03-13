import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { RoleListComponent } from './role-list.component';
import { RoleService } from '../../../core/services/role.service';
import { SharedModule } from '../../../shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const mockRoles = [
  { _id: '1', name: 'Admin', description: '', permissions: [], createdAt: '', updatedAt: '' },
  { _id: '2', name: 'Viewer', description: '', permissions: [], createdAt: '', updatedAt: '' },
];

describe('RoleListComponent', () => {
  let component: RoleListComponent;
  let fixture: ComponentFixture<RoleListComponent>;
  let roleService: jasmine.SpyObj<RoleService>;

  beforeEach(async () => {
    roleService = jasmine.createSpyObj('RoleService', ['getRoles', 'deleteRole']);
    roleService.getRoles.and.returnValue(of(mockRoles as any));

    await TestBed.configureTestingModule({
      declarations: [RoleListComponent],
      imports: [
        RouterTestingModule, HttpClientTestingModule, SharedModule,
        MatTableModule, MatButtonModule, MatIconModule, MatCardModule,
        MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule, NoopAnimationsModule,
      ],
      providers: [{ provide: RoleService, useValue: roleService }],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads and displays roles from RoleService on init', () => {
    expect(roleService.getRoles).toHaveBeenCalled();
    expect(component.roles.length).toBe(2);
  });

  it('deleteRole() removes role from the list after successful delete', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    roleService.deleteRole.and.returnValue(of(undefined));

    component.deleteRole('1');

    expect(roleService.deleteRole).toHaveBeenCalledWith('1');
    expect(component.roles.find(r => r._id === '1')).toBeUndefined();
  });

  it('does not call deleteRole if user cancels confirm dialog', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteRole('1');
    expect(roleService.deleteRole).not.toHaveBeenCalled();
  });
});
