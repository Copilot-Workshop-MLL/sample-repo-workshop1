import { TestBed } from '@angular/core/testing';
import { DynamicNavService } from './dynamic-nav.service';
import { PermissionService } from './permission.service';

describe('DynamicNavService', () => {
  let service: DynamicNavService;
  let permissionService: jasmine.SpyObj<PermissionService>;

  beforeEach(() => {
    permissionService = jasmine.createSpyObj('PermissionService', ['can']);

    TestBed.configureTestingModule({
      providers: [
        DynamicNavService,
        { provide: PermissionService, useValue: permissionService },
      ],
    });
    service = TestBed.inject(DynamicNavService);
  });

  it('buildNav() emits only modules where view=true (2 out of 3 mocked)', () => {
    // Only dashboard and users viewable; roles not
    permissionService.can.and.callFake((module: string, action: string) => {
      if (action !== 'view') return false;
      return ['dashboard', 'users'].includes(module);
    });

    service.buildNav();

    service.navItems$.subscribe((items) => {
      expect(items.length).toBe(2);
      expect(items.map((i) => i.module)).toEqual(jasmine.arrayContaining(['dashboard', 'users']));
    });
  });

  it('clearNav() emits an empty array', () => {
    permissionService.can.and.returnValue(true);
    service.buildNav();
    service.clearNav();

    service.navItems$.subscribe((items) => {
      expect(items.length).toBe(0);
    });
  });
});
