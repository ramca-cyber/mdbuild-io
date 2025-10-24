import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Linear interpolation for smooth scrolling
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

// Smooth scroll animator using RAF
export class SmoothScroller {
  private rafId: number | null = null;
  private currentPos: number;
  private targetPos: number;
  private readonly smoothFactor = 0.15; // Lower = smoother but slower

  constructor(initialPos: number = 0) {
    this.currentPos = initialPos;
    this.targetPos = initialPos;
  }

  setTarget(target: number) {
    this.targetPos = target;
  }

  getCurrentPos(): number {
    return this.currentPos;
  }

  animate(callback: (pos: number) => void, threshold: number = 0.5) {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    const step = () => {
      const diff = Math.abs(this.targetPos - this.currentPos);
      
      if (diff < threshold) {
        this.currentPos = this.targetPos;
        callback(this.currentPos);
        this.rafId = null;
        return;
      }

      this.currentPos = lerp(this.currentPos, this.targetPos, this.smoothFactor);
      callback(this.currentPos);
      
      this.rafId = requestAnimationFrame(step);
    };

    step();
  }

  cancel() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
