import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { RoleFormComponent } from './role-form.component';
import { RoleService } from '../../../core/services/role.service';
import { SharedModule } from '../../../shared/shared.module';

describe('RoleFormComponent', () => {
  let component: RoleFormComponent;
  let fixture: ComponentFixture<RoleFormComponent>;
  let roleService: jasmine.SpyObj<RoleService>;

  beforeEach(async () => {
    roleService = jasmine.createSpyObj('RoleService', ['createRole', 'updateRole', 'getRoleById']);

    await TestBed.configureTestingModule({
      declarations: [RoleFormComponent],
      imports: [
        ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule,
        SharedModule, MatCardModule, MatFormFieldModule, MatInputModule,
        MatButtonModule, MatSnackBarModule, MatProgressSpinnerModule, NoopAnimationsModule,
      ],
      providers: [{ provide: RoleService, useValue: roleService }],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('form is invalid when name is empty', () => {
    component.form.get('name')?.setValue('');
    expect(component.form.invalid).toBeTrue();
  });

  it('form is valid when name is provided', () => {
    component.form.get('name')?.setValue('Admin');
    expect(component.form.valid).toBeTrue();
  });

  it('calls createRole() on submit in create mode', () => {
    roleService.createRole.and.returnValue(of({ _id: '1', name: 'Admin' } as any));
    component.isEdit = false;
    component.form.get('name')?.setValue('Admin');
    component.onSubmit();
    expect(roleService.createRole).toHaveBeenCalled();
  });

  it('calls updateRole() on submit in edit mode', () => {
    roleService.updateRole.and.returnValue(of({ _id: '1', name: 'Updated' } as any));
    component.isEdit = true;
    component.roleId = '1';
    component.form.get('name')?.setValue('Updated');
    component.onSubmit();
    expect(roleService.updateRole).toHaveBeenCalledWith('1', jasmine.anything());
  });

  it('displays error message on API failure', () => {
    roleService.createRole.and.returnValue(throwError(() => ({ error: { message: 'Role name already exists' } })));
    component.isEdit = false;
    component.form.get('name')?.setValue('Duplicate');
    component.onSubmit();
    expect(component.errorMessage).toBe('Role name already exists');
  });
});
