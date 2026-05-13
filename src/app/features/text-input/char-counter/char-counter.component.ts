import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-char-counter',
  standalone: true,
  templateUrl: './char-counter.component.html',
  styleUrls: ['./char-counter.component.css'],
  imports: [CommonModule]
})
export class CharCounterComponent {
  @Input() text = '';
  @Input() maxLength = 5000;

  get charCount(): number { return this.text.length; }
  get wordCount(): number { return this.text.trim() ? this.text.trim().split(/\s+/).length : 0; }
  get isNearLimit(): boolean { return this.charCount > this.maxLength * 0.85; }
  get isAtLimit(): boolean { return this.charCount >= this.maxLength; }
  get progressPct(): number { return Math.min(100, (this.charCount / this.maxLength) * 100); }
}
