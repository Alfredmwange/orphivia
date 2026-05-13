import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceStyle } from '../../../models/style.model';

const STYLE_ICONS: Record<string, string> = {
  narrator: '📖',
  energetic: '⚡',
  deep: '🎙️',
  robot: '🤖',
  baby: '🐣'
};

@Component({
  selector: 'app-style-card',
  standalone: true,
  templateUrl: './style-card.component.html',
  styleUrls: ['./style-card.component.css'],
  imports: [CommonModule]
})
export class StyleCardComponent {
  @Input() style!: VoiceStyle;
  @Input() active = false;
  @Output() selected = new EventEmitter<string>();

  get styleIcon(): string {
    return STYLE_ICONS[this.style.id] ?? '🎤';
  }

  onSelect(): void {
    this.selected.emit(this.style.id);
  }
}
