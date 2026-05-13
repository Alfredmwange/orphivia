import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
  imports: [CommonModule]
})
export class DropdownComponent {
  @Input() label = '';
  @Input() options: { value: unknown; label: string }[] = [];
  @Input() selectedValue: unknown;
  @Output() selectionChange = new EventEmitter<unknown>();

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const idx = target.selectedIndex;
    const selected = this.options[idx]?.value;
    this.selectedValue = selected;
    this.selectionChange.emit(selected);
  }
}
