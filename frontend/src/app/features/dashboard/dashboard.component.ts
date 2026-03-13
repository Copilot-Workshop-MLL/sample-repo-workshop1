import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div style="padding:24px">
      <h2>Welcome to the Dashboard</h2>
      <p>Use the sidebar to navigate to the modules you have access to.</p>
      <a routerLink="/timer" style="
        display:inline-block;
        margin-top:12px;
        padding:10px 24px;
        background:#3b82f6;
        color:#fff;
        border-radius:8px;
        text-decoration:none;
        font-weight:600;
      ">🍅 Open Focus Timer</a>
    </div>`,
})
export class DashboardComponent {}
