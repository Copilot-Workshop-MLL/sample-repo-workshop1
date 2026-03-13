import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionService } from './permission.service';
import { User } from '../models/models';

const mockUser = (permMap: { module: string; view?: boolean; create?: boolean; edit?: boolean; delete?: boolean; export?: boolean; import?: boolean; search?: boolean }[]): User =>
  ({
    _id: '1',
    name: 'Test',
    email: 'test@example.com',
    isActive: true,
    createdAt: '',
    roles: [{
      _id: 'role1',
      name: 'TestRole',
      description: '',
      createdAt: '',
      updatedAt: '',
      permissions: permMap.map((p) => ({
        module: p.module,
        view: p.view ?? false,
        create: p.create ?? false,
        edit: p.edit ?? false,
        delete: p.delete ?? false,
        export: p.export ?? false,
        import: p.import ?? false,
        search: p.search ?? false,
      })),
    }],
  } as User);

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(PermissionService);
  });

  it('can() returns true when role grants the permission', () => {
    service.loadPermissions(mockUser([{ module: 'users', view: true }]));
    expect(service.can('users', 'view')).toBeTrue();
  });

  it('can() returns false when role denies the permission', () => {
    service.loadPermissions(mockUser([{ module: 'users', delete: false }]));
    expect(service.can('users', 'delete')).toBeFalse();
  });

  it('can() returns false when module has no entry', () => {
    service.loadPermissions(mockUser([{ module: 'products', view: true }]));
    expect(service.can('reports', 'view')).toBeFalse();
  });

  it('can() returns false when no roles loaded', () => {
    service.loadPermissions(null);
    expect(service.can('users', 'view')).toBeFalse();
  });

  it('merges permissions from multiple roles via union (most permissive wins)', () => {
    const user: User = {
      _id: '1', name: 'T', email: 't@t.com', isActive: true, createdAt: '',
      roles: [
        { _id: 'r1', name: 'R1', description: '', createdAt: '', updatedAt: '',
          permissions: [{ module: 'users', view: false, create: false, edit: false, delete: false, export: false, import: false, search: false }] },
        { _id: 'r2', name: 'R2', description: '', createdAt: '', updatedAt: '',
          permissions: [{ module: 'users', view: false, create: false, edit: false, delete: true,  export: false, import: false, search: false }] },
      ],
    };
    service.loadPermissions(user);
    expect(service.can('users', 'delete')).toBeTrue();
  });

  it('clear() resets all permissions', () => {
    service.loadPermissions(mockUser([{ module: 'users', view: true }]));
    service.clear();
    expect(service.can('users', 'view')).toBeFalse();
  });
});
