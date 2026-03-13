import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionGuard } from './permission.guard';
import { PermissionService } from '../services/permission.service';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let permissionService: jasmine.SpyObj<PermissionService>;
  let router: jasmine.SpyObj<Router>;

  const mockRoute = (data: Record<string, unknown> = {}): ActivatedRouteSnapshot => {
    const snap = new ActivatedRouteSnapshot();
    (snap as any).data = data;
    return snap;
  };

  beforeEach(() => {
    permissionService = jasmine.createSpyObj('PermissionService', ['can']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        PermissionGuard,
        { provide: PermissionService, useValue: permissionService },
        { provide: Router, useValue: router },
      ],
    });
    guard = TestBed.inject(PermissionGuard);
  });

  it('returns true when user has the required permission', () => {
    permissionService.can.and.returnValue(true);
    expect(guard.canActivate(mockRoute({ module: 'users', action: 'view' }))).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects to /unauthorized when user lacks permission', () => {
    permissionService.can.and.returnValue(false);
    expect(guard.canActivate(mockRoute({ module: 'reports', action: 'export' }))).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('returns true for public routes (no module/action on route data)', () => {
    expect(guard.canActivate(mockRoute({}))).toBeTrue();
  });
});
