import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slider',
  standalone: true,
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
  imports: [CommonModule]
})
export class SliderComponent {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() value = 0;
  @Input() label = '';
  @Output() valueChange = new EventEmitter<number>();

  onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = parseFloat(target.value);
    this.value = newValue;
    this.valueChange.emit(newValue);
  }
}
