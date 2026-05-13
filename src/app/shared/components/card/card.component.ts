import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  imports: [CommonModule]
})
export class CardComponent {
  @Input() glow = false;
}
