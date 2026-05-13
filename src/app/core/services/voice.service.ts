import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VoiceOption } from '../../models/voice.model';

@Injectable({ providedIn: 'root' })
export class VoiceService {
  private voiceList: VoiceOption[] = [];
  private readonly voicesSubject = new BehaviorSubject<VoiceOption[]>([]);
  readonly voices$ = this.voicesSubject.asObservable();

  private readonly speechSynthesis = window.speechSynthesis;

  constructor() {
    this.loadVoices();
  }

  private loadVoices(): void {
    const synthVoices = this.speechSynthesis.getVoices();
    if (synthVoices.length > 0) {
      this.populateVoices(synthVoices);
    } else {
      this.speechSynthesis.onvoiceschanged = () => {
        this.populateVoices(this.speechSynthesis.getVoices());
      };
    }
  }

  private populateVoices(synthVoices: SpeechSynthesisVoice[]): void {
    this.voiceList = synthVoices.map((voice): VoiceOption => ({
      id: voice.name,
      name: voice.name,
      language: voice.lang,
      gender: voice.name.toLowerCase().includes('female')
        ? 'female'
        : voice.name.toLowerCase().includes('male')
          ? 'male'
          : 'system',
      supported: true
    }));
    this.voicesSubject.next(this.voiceList);
  }

  getVoiceOptions(filter?: { language?: string; search?: string }): VoiceOption[] {
    let filtered = [...this.voiceList];
    if (filter?.language) {
      filtered = filtered.filter(v => v.language.startsWith(filter.language!));
    }
    if (filter?.search) {
      const term = filter.search.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(term) || v.language.toLowerCase().includes(term)
      );
    }
    return filtered;
  }

  getAvailableLanguages(): string[] {
    return [...new Set(this.voiceList.map(v => v.language.split('-')[0]))].sort();
  }

  getDefaultVoice(): VoiceOption | undefined {
    return this.voiceList.find(v => v.language.startsWith('en')) || this.voiceList[0];
  }
}
