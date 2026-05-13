import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { HistoryService, HistoryEntry } from '../../../core/services/history.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-history-panel',
  standalone: true,
  templateUrl: './history-panel.component.html',
  styleUrls: ['./history-panel.component.css'],
  imports: [CommonModule, NgFor, NgIf, DatePipe, CardComponent, ButtonComponent]
})
export class HistoryPanelComponent implements OnInit {
  @Output() replay = new EventEmitter<HistoryEntry>();

  entries: HistoryEntry[] = [];
  isExpanded = false;

  constructor(private readonly historyService: HistoryService) {}

  ngOnInit(): void {
    this.historyService.history$.subscribe(entries => {
      this.entries = entries;
    });
  }

  onReplay(entry: HistoryEntry): void {
    this.replay.emit(entry);
  }

  onRemove(id: string): void {
    this.historyService.removeEntry(id);
  }

  onClearAll(): void {
    this.historyService.clearAll();
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  truncate(text: string, max = 80): string {
    return text.length > max ? text.slice(0, max) + '…' : text;
  }
}
