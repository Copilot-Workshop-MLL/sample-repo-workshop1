import { Component, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HasPermissionDirective } from './has-permission.directive';
import { PermissionService } from '../../core/services/permission.service';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

@Component({
  template: `<button *appHasPermission="['users','create']">Add User</button>`,
})
class TestHostComponent {}

describe('HasPermissionDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let permissionService: jasmine.SpyObj<PermissionService>;

  const setup = async (canValue: boolean) => {
    permissionService = jasmine.createSpyObj('PermissionService', ['can']);
    permissionService.can.and.returnValue(canValue);

    await TestBed.configureTestingModule({
      declarations: [TestHostComponent, HasPermissionDirective],
      imports: [CommonModule],
      providers: [{ provide: PermissionService, useValue: permissionService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  };

  it('renders the element when can() returns true', async () => {
    await setup(true);
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).not.toBeNull();
  });

  it('removes the element from DOM when can() returns false', async () => {
    await setup(false);
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeNull();
  });
});
