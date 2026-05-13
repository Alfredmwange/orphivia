import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VoiceSettings } from '../../models/settings.model';

export interface HistoryEntry {
  id: string;
  text: string;
  voiceName: string;
  language: string;
  settings: VoiceSettings;
  timestamp: Date;
}

export interface NewHistoryEntry {
  text: string;
  voiceName: string;
  language: string;
  settings: VoiceSettings;
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly MAX_ENTRIES = 20;
  private entries: HistoryEntry[] = [];
  private readonly historySubject = new BehaviorSubject<HistoryEntry[]>([]);
  readonly history$ = this.historySubject.asObservable();

  addEntry(entry: NewHistoryEntry): void {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };
    this.entries = [newEntry, ...this.entries].slice(0, this.MAX_ENTRIES);
    this.historySubject.next([...this.entries]);
  }

  removeEntry(id: string): void {
    this.entries = this.entries.filter(e => e.id !== id);
    this.historySubject.next([...this.entries]);
  }

  clearAll(): void {
    this.entries = [];
    this.historySubject.next([]);
  }
}
