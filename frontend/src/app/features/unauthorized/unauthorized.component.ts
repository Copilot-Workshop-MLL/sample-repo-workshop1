import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="unauth-container">
      <mat-icon class="icon">lock</mat-icon>
      <h2>Access Denied</h2>
      <p>You don't have permission to view this page.</p>
      <button mat-raised-button color="primary" (click)="goBack()">Go Back</button>
    </div>
  `,
  styles: [`
    .unauth-container { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; gap:16px; }
    .icon { font-size:64px; width:64px; height:64px; color:#f44336; }
    h2 { margin:0; color:#333; }
    p { color:#666; }
  `],
})
export class UnauthorizedComponent {
  constructor(private location: Location) {}
  goBack(): void { this.location.back(); }
}
