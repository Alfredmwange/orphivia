import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
  imports: [CommonModule]
})
export class LoaderComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message = 'Loading...';
}
