import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TimerComponent } from './timer.component';

@NgModule({
  declarations: [TimerComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: TimerComponent }]),
  ],
  exports: [TimerComponent],
})
export class TimerModule {}
