import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../core/models/models';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedColumns = ['name', 'email', 'roles', 'status', 'actions'];
  loading = false;

  constructor(private userService: UserService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => { this.users = users; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  deleteUser(id: string): void {
    if (!confirm('Delete this user?')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u._id !== id);
        this.snackBar.open('User deleted', 'Close', { duration: 3000 });
      },
      error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 }),
    });
  }
}
