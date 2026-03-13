import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';

export type TimerSession = 'focus' | 'break';
export type TimerState = 'idle' | 'running' | 'paused';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
}

const FOCUS_DURATION_SECONDS = 25 * 60;
const BREAK_DURATION_SECONDS = 5 * 60;
const MAX_PARTICLES = 20;
const RING_RADIUS = 90;
const SVG_SIZE = 220;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  session: TimerSession = 'focus';
  state: TimerState = 'idle';

  totalTime = FOCUS_DURATION_SECONDS;
  remainingTime = FOCUS_DURATION_SECONDS;

  circumference = CIRCUMFERENCE;
  svgSize = SVG_SIZE;
  ringRadius = RING_RADIUS;
  ringInstantReset = false;

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private animFrameId: number | null = null;
  private resetFrameId: number | null = null;
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D | null = null;
  private prefersReducedMotion = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = mq.matches;
    mq.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      if (this.prefersReducedMotion) {
        this.stopParticles();
      } else if (this.state === 'running' && this.session === 'focus') {
        this.startParticles();
      }
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
  }

  ngOnDestroy(): void {
    this.clearInterval();
    this.stopParticles();
    if (this.resetFrameId !== null) {
      cancelAnimationFrame(this.resetFrameId);
      this.resetFrameId = null;
    }
  }

  // ── Computed display values ──────────────────────────────────────────────

  get displayTime(): string {
    const m = Math.floor(this.remainingTime / 60);
    const s = this.remainingTime % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  get strokeDashoffset(): number {
    const progress = this.remainingTime / this.totalTime;
    return CIRCUMFERENCE * (1 - progress);
  }

  get ringColor(): string {
    return getTimerColor(this.totalTime - this.remainingTime, this.totalTime);
  }

  get isInFinalPhase(): boolean {
    return this.remainingTime / this.totalTime <= 0.2;
  }

  // ── Timer controls ───────────────────────────────────────────────────────

  start(): void {
    if (this.state === 'running') return;
    this.state = 'running';
    this.intervalId = setInterval(() => this.tick(), 1000);
    if (this.session === 'focus' && !this.prefersReducedMotion) {
      this.startParticles();
    }
  }

  pause(): void {
    if (this.state !== 'running') return;
    this.state = 'paused';
    this.clearInterval();
    this.stopParticles();
  }

  reset(): void {
    this.state = 'idle';
    this.clearInterval();
    this.stopParticles();
    this.particles = [];
    this.applyInstantRingReset();
    this.remainingTime = this.totalTime;
    this.clearCanvas();
  }

  switchSession(session: TimerSession): void {
    this.state = 'idle';
    this.clearInterval();
    this.stopParticles();
    this.particles = [];
    this.clearCanvas();
    this.session = session;
    this.totalTime =
      session === 'focus' ? FOCUS_DURATION_SECONDS : BREAK_DURATION_SECONDS;
    this.applyInstantRingReset();
    this.remainingTime = this.totalTime;
  }

  // ── Internal tick ────────────────────────────────────────────────────────

  private tick(): void {
    if (this.remainingTime > 0) {
      this.remainingTime--;
      this.cdr.detectChanges();
    } else {
      this.state = 'idle';
      this.clearInterval();
      this.stopParticles();
    }
  }

  private applyInstantRingReset(): void {
    if (this.resetFrameId !== null) {
      cancelAnimationFrame(this.resetFrameId);
    }
    this.ringInstantReset = true;
    this.cdr.detectChanges();
    this.resetFrameId = requestAnimationFrame(() => {
      this.resetFrameId = null;
      this.ringInstantReset = false;
      this.cdr.detectChanges();
    });
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ── Particle system ──────────────────────────────────────────────────────

  private startParticles(): void {
    if (this.animFrameId !== null) return;
    this.animFrameId = requestAnimationFrame(() => this.animateParticles());
  }

  private stopParticles(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private clearCanvas(): void {
    if (this.ctx && this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  private animateParticles(): void {
    if (!this.ctx || !this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spawn new particles up to the max
    if (this.particles.length < MAX_PARTICLES && Math.random() < 0.4) {
      this.spawnParticle(canvas.width / 2, canvas.height / 2);
    }

    // Determine max alpha based on phase
    const maxAlpha = this.isInFinalPhase ? 0.3 : 0.15;

    // Update and draw particles
    this.particles = this.particles.filter((p) => p.alpha > 0.005);
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = Math.min(p.alpha - p.decay, maxAlpha);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.hexToRgba(p.color, Math.max(0, p.alpha));
      this.ctx.fill();
    }

    this.animFrameId = requestAnimationFrame(() => this.animateParticles());
  }

  private spawnParticle(cx: number, cy: number): void {
    // Spawn on the circumference of the ring
    const angle = Math.random() * Math.PI * 2;
    const spawnRadius = RING_RADIUS + (Math.random() - 0.5) * 20;
    const x = cx + Math.cos(angle) * spawnRadius;
    const y = cy + Math.sin(angle) * spawnRadius;

    const speed = 0.3 + Math.random() * 0.5;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    this.particles.push({
      x,
      y,
      vx,
      vy,
      radius: 2 + Math.random() * 3,
      alpha: 0.05 + Math.random() * 0.1,
      decay: 0.003 + Math.random() * 0.004,
      color: this.ringColor,
    });
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}

/**
 * Returns a smoothly interpolated hex color based on how much time has elapsed.
 * Blue (0–40% elapsed) → Yellow (40–70% elapsed) → Red (70–100% elapsed)
 * Corresponds to: 100–60% remaining → 60–30% remaining → 30–0% remaining
 */
export function getTimerColor(elapsed: number, total: number): string {
  const t = total > 0 ? elapsed / total : 0;

  // Blue → Yellow (t: 0 → 0.4, i.e. 100% → 60% remaining)
  if (t <= 0.4) {
    return lerpColor('#3b82f6', '#f59e0b', t / 0.4);
  }
  // Yellow → Red  (t: 0.4 → 0.7, i.e. 60% → 30% remaining)
  if (t <= 0.7) {
    return lerpColor('#f59e0b', '#ef4444', (t - 0.4) / 0.3);
  }
  // Full red (t: 0.7 → 1, i.e. 30% → 0% remaining)
  return '#ef4444';
}

function lerpColor(a: string, b: string, t: number): string {
  const c = clamp(t, 0, 1);
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * c);
  const g = Math.round(ag + (bg - ag) * c);
  const bv = Math.round(ab + (bb - ab) * c);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bv.toString(16).padStart(2, '0')}`;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
