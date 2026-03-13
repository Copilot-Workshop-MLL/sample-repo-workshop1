import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Role, User } from '../../../core/models/models';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.minLength(6)],
    roles: [[] as string[]],
    isActive: [true],
  });

  availableRoles: Role[] = [];
  isEdit = false;
  userId = '';
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.userId;

    if (this.isEdit) {
      // Password optional on edit
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }

    this.roleService.getRoles().subscribe((roles) => (this.availableRoles = roles));

    if (this.isEdit) {
      this.userService.getUserById(this.userId).subscribe((user) => {
        this.form.patchValue({
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          roles: user.roles.map((r) => r._id),
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const { name, email, password, roles, isActive } = this.form.value;

    const request$ = this.isEdit
      ? this.userService.updateUser(this.userId, { name: name!, roles: roles as any, isActive: isActive! })
      : this.userService.createUser({ name: name!, email: email!, password: password!, roles: roles as any });

    request$.subscribe({
      next: () => {
        this.snackBar.open(`User ${this.isEdit ? 'updated' : 'created'}`, 'Close', { duration: 3000 });
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Save failed';
        this.loading = false;
      },
    });
  }
}
