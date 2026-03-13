import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
import { DynamicNavService } from '../../../core/services/dynamic-nav.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private permissionService: PermissionService,
    private dynamicNavService: DynamicNavService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;
    this.authService.login(email!, password!).subscribe({
      next: (res) => {
        this.permissionService.loadPermissions(res.user);
        this.dynamicNavService.buildNav();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
        this.loading = false;
      },
    });
  }
}
