import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-playback-bar',
  standalone: true,
  templateUrl: './playback-bar.component.html',
  styleUrls: ['./playback-bar.component.css'],
  imports: [CommonModule, ButtonComponent]
})
export class PlaybackBarComponent {
  @Input() isSpeaking = false;
  @Input() isPaused = false;
  @Output() play    = new EventEmitter<void>();
  @Output() pause   = new EventEmitter<void>();
  @Output() resume  = new EventEmitter<void>();
  @Output() stop    = new EventEmitter<void>();
  @Output() reset   = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
}
