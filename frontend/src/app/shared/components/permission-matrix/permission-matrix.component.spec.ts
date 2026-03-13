import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PermissionMatrixComponent, ACTIONS } from './permission-matrix.component';
import { Permission } from '../../../core/models/models';

const modules = [
  { key: 'users', label: 'Users' },
  { key: 'reports', label: 'Reports' },
];

const emptyPermissions = (): Permission[] => modules.map(m => ({
  module: m.key, view: false, create: false, edit: false, delete: false, export: false, import: false, search: false,
}));

describe('PermissionMatrixComponent', () => {
  let component: PermissionMatrixComponent;
  let fixture: ComponentFixture<PermissionMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PermissionMatrixComponent],
      imports: [CommonModule, MatCheckboxModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PermissionMatrixComponent);
    component = fixture.componentInstance;
    component.modules = modules;
    component.permissions = emptyPermissions();
    fixture.detectChanges();
  });

  it('renders correct number of rows (one per module)', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(modules.length);
  });

  it('renders 7 action checkboxes per row plus 1 "All" checkbox', () => {
    const firstRow = fixture.nativeElement.querySelectorAll('tbody tr')[0];
    const checkboxes = firstRow.querySelectorAll('mat-checkbox');
    // 7 action columns + 1 All column
    expect(checkboxes.length).toBe(ACTIONS.length + 1);
  });

  it('onRowAllChange toggles all actions for that module and emits', () => {
    const emitSpy = spyOn(component.permissionsChange, 'emit');
    component.onRowAllChange('users', true);

    const perm = component.matrix.find(p => p.module === 'users')!;
    ACTIONS.forEach(a => expect((perm as any)[a]).toBeTrue());
    expect(emitSpy).toHaveBeenCalled();
  });

  it('onColumnAllChange toggles that action across all modules and emits', () => {
    const emitSpy = spyOn(component.permissionsChange, 'emit');
    component.onColumnAllChange('view', true);

    component.matrix.forEach(p => expect(p.view).toBeTrue());
    expect(emitSpy).toHaveBeenCalled();
  });

  it('onCellChange sets the specific action boolean and emits', () => {
    const emitSpy = spyOn(component.permissionsChange, 'emit');
    component.onCellChange('reports', 'delete', true);

    const perm = component.matrix.find(p => p.module === 'reports')!;
    expect(perm.delete).toBeTrue();
    expect(emitSpy).toHaveBeenCalledWith(jasmine.arrayContaining([jasmine.objectContaining({ module: 'reports', delete: true })]));
  });

  it('isRowAllChecked returns true only when all actions are true', () => {
    expect(component.isRowAllChecked('users')).toBeFalse();
    component.onRowAllChange('users', true);
    expect(component.isRowAllChecked('users')).toBeTrue();
  });
});
