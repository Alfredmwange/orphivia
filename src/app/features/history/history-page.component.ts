import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HistoryEntry, HistoryService } from '../../core/services/history.service';

@Component({
  selector: 'app-history-page',
  standalone: true,
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class HistoryPageComponent implements OnInit {
  entries: HistoryEntry[] = [];
  search = '';
  providerFilter = 'all';
  voiceFilter = 'all';
  favoritesOnly = false;

  constructor(private readonly historyService: HistoryService) {}

  ngOnInit(): void {
    this.historyService.history$.subscribe(entries => {
      this.entries = entries;
    });
  }

  get filteredEntries(): HistoryEntry[] {
    return this.entries.filter(entry => {
      const matchesSearch = !this.search || entry.text.toLowerCase().includes(this.search.toLowerCase());
      const matchesProvider = this.providerFilter === 'all' || entry.voiceName.toLowerCase().includes(this.providerFilter.toLowerCase());
      const matchesVoice = this.voiceFilter === 'all' || entry.voiceName.toLowerCase().includes(this.voiceFilter.toLowerCase());
      return matchesSearch && matchesProvider && matchesVoice;
    });
  }
}
