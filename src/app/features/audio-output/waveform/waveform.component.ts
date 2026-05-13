import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-waveform',
  standalone: true,
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.css'],
  imports: [CommonModule]
})
export class WaveformComponent implements OnChanges, OnDestroy {
  @Input() active = false;

  bars = Array.from({ length: 28 }, (_, i) => ({ id: i, height: 4 }));
  private animFrame: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['active']) {
      if (this.active) {
        this.startAnimation();
      } else {
        this.stopAnimation();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  private startAnimation(): void {
    const animate = () => {
      this.bars = this.bars.map(bar => ({
        ...bar,
        height: this.active ? 4 + Math.random() * 28 : 4
      }));
      this.animFrame = requestAnimationFrame(animate);
    };
    this.animFrame = requestAnimationFrame(animate);
  }

  private stopAnimation(): void {
    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    this.bars = this.bars.map(bar => ({ ...bar, height: 4 }));
  }
}
