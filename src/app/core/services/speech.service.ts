import { Injectable } from '@angular/core';
import { VoiceOption } from '../../models/voice.model';
import { VoiceSettings } from '../../models/settings.model';
import { HistoryService } from './history.service';

@Injectable({ providedIn: 'root' })
export class SpeechService {
  private utterance: SpeechSynthesisUtterance | undefined;
  private readonly synth = window.speechSynthesis;

  constructor(private readonly historyService: HistoryService) {}

  createUtterance(
    text: string,
    voice: VoiceOption | null,
    settings: VoiceSettings
  ): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = settings.volume;
    utterance.rate   = settings.rate;
    utterance.pitch  = settings.pitch;

    if (voice) {
      const match = this.synth.getVoices().find(v => v.name === voice.name);
      if (match) utterance.voice = match;
    }

    this.utterance = utterance;
    return utterance;
  }

  speak(text: string, voice: VoiceOption | null, settings: VoiceSettings): void {
    if (!text.trim()) return;
    this.cancel();
    const utterance = this.createUtterance(text, voice, settings);
    utterance.onend = () => {
      this.historyService.addEntry({
        text,
        voiceName: voice?.name ?? 'Default',
        language: voice?.language ?? 'en',
        settings: { ...settings }
      });
    };
    this.synth.speak(utterance);
  }

  pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  cancel(): void {
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synth.speaking && !this.synth.paused;
  }

  isPaused(): boolean {
    return this.synth.paused;
  }
}
