import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TimerComponent, getTimerColor } from './timer.component';
import { CommonModule } from '@angular/common';

describe('TimerComponent', () => {
  let component: TimerComponent;
  let fixture: ComponentFixture<TimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimerComponent],
      imports: [CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  // ── Rendering ────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "25:00" initially', () => {
    expect(component.displayTime).toBe('25:00');
  });

  it('should start in "focus" session and "idle" state', () => {
    expect(component.session).toBe('focus');
    expect(component.state).toBe('idle');
  });

  it('ringInstantReset is false initially', () => {
    expect(component.ringInstantReset).toBeFalse();
  });

  // ── Timer display ─────────────────────────────────────────────────────────

  it('displayTime should format single-digit minutes/seconds with leading zeros', () => {
    component.remainingTime = 65;
    expect(component.displayTime).toBe('01:05');
  });

  it('displayTime should show "00:00" when time is 0', () => {
    component.remainingTime = 0;
    expect(component.displayTime).toBe('00:00');
  });

  // ── SVG ring ──────────────────────────────────────────────────────────────

  it('strokeDashoffset is 0 when no time has elapsed', () => {
    expect(component.strokeDashoffset).toBeCloseTo(0, 1);
  });

  it('strokeDashoffset equals circumference when time is fully elapsed', () => {
    component.remainingTime = 0;
    expect(component.strokeDashoffset).toBeCloseTo(component.circumference, 1);
  });

  // ── Controls ─────────────────────────────────────────────────────────────

  it('start() transitions state to "running"', () => {
    component.start();
    expect(component.state).toBe('running');
    component.reset();
  });

  it('pause() transitions state from "running" to "paused"', () => {
    component.start();
    component.pause();
    expect(component.state).toBe('paused');
  });

  it('reset() transitions state to "idle" and resets time', () => {
    component.start();
    (component as any).remainingTime = 100;
    component.reset();
    expect(component.state).toBe('idle');
    expect(component.remainingTime).toBe(component.totalTime);
  });

  it('reset() sets ringInstantReset to true for the current frame', () => {
    component.start();
    (component as any).remainingTime = 100;
    component.reset();
    expect(component.ringInstantReset).toBeTrue();
  });

  it('start() is idempotent when already running', () => {
    component.start();
    const id1 = (component as any).intervalId;
    component.start();
    const id2 = (component as any).intervalId;
    expect(id1).toBe(id2);
    component.reset();
  });

  // ── Tick ─────────────────────────────────────────────────────────────────

  it('timer decrements remainingTime each second', fakeAsync(() => {
    component.start();
    tick(3000);
    expect(component.remainingTime).toBe(component.totalTime - 3);
    component.reset();
  }));

  it('timer stops and state becomes idle when time reaches 0', fakeAsync(() => {
    component.remainingTime = 2;
    component.totalTime = 2;
    component.start();
    tick(3000);
    expect(component.remainingTime).toBe(0);
    expect(component.state).toBe('idle');
  }));

  // ── Session switching ─────────────────────────────────────────────────────

  it('switchSession("break") sets 5-minute total and idle state', () => {
    component.start();
    component.switchSession('break');
    expect(component.session).toBe('break');
    expect(component.state).toBe('idle');
    expect(component.totalTime).toBe(5 * 60);
    expect(component.remainingTime).toBe(5 * 60);
  });

  it('switchSession() sets ringInstantReset to true for the current frame', () => {
    component.start();
    component.switchSession('break');
    expect(component.ringInstantReset).toBeTrue();
  });

  it('switchSession("focus") restores 25-minute total', () => {
    component.switchSession('break');
    component.switchSession('focus');
    expect(component.totalTime).toBe(25 * 60);
  });

  // ── Final phase ───────────────────────────────────────────────────────────

  it('isInFinalPhase is false when >20% remains', () => {
    component.remainingTime = Math.round(component.totalTime * 0.5);
    expect(component.isInFinalPhase).toBeFalse();
  });

  it('isInFinalPhase is true when ≤20% remains', () => {
    component.remainingTime = Math.round(component.totalTime * 0.15);
    expect(component.isInFinalPhase).toBeTrue();
  });

  // ── Particles only run for focus sessions ─────────────────────────────────

  it('particles do not start when session is "break"', () => {
    component.switchSession('break');
    component.start();
    expect((component as any).animFrameId).toBeNull();
  });
});

// ── getTimerColor ─────────────────────────────────────────────────────────────

describe('getTimerColor', () => {
  it('returns blue at the start (t=0)', () => {
    expect(getTimerColor(0, 100)).toBe('#3b82f6');
  });

  it('returns red at the end (t=1)', () => {
    expect(getTimerColor(100, 100)).toBe('#ef4444');
  });

  it('returns a valid hex string', () => {
    const color = getTimerColor(50, 100);
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('handles total=0 gracefully without NaN', () => {
    const color = getTimerColor(0, 0);
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('produces a different color at 50% elapsed vs 0%', () => {
    expect(getTimerColor(50, 100)).not.toBe(getTimerColor(0, 100));
  });
});
