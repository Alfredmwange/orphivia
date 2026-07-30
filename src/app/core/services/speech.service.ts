import { Injectable } from '@angular/core';
import { VoiceOption } from '../../models/voice.model';
import { VoiceSettings } from '../../models/settings.model';
import { HistoryService } from './history.service';
import { ProviderService } from './provider.service';

export type SpeechProgressCallback = (progress: number) => void;

@Injectable({ providedIn: 'root' })
export class SpeechService {
  private utterance: SpeechSynthesisUtterance | undefined;
  private readonly synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  private audioElement: HTMLAudioElement | null = null;
  private audioUrl: string | null = null;
  private audioCompleted = false;

  constructor(
    private readonly historyService: HistoryService,
    private readonly providerService: ProviderService
  ) {}

  createUtterance(
    text: string,
    voice: VoiceOption | null,
    settings: VoiceSettings
  ): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = settings.volume;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    if (voice && this.synth) {
      const match = this.synth.getVoices().find(v => v.name === voice.name);
      if (match) utterance.voice = match;
    }

    this.utterance = utterance;
    return utterance;
  }

  async speak(
    text: string,
    voice: VoiceOption | null,
    settings: VoiceSettings,
    providerId = 'browser',
    startIndex = 0,
    onProgress?: SpeechProgressCallback
  ): Promise<void> {
    if (!text.trim()) return;
    this.cancel();

    const segment = text.slice(startIndex);
    if (providerId && providerId !== 'browser') {
      const blob = await this.providerService.synthesizeAudio(providerId, voice, segment, {
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume
      });

      if (blob) {
        this.playAudioBlob(blob, text, voice, settings, onProgress);
        return;
      }
    }

    if (!this.synth) {
      return;
    }

    const utterance = this.createUtterance(segment, voice, settings);
    utterance.onboundary = (event) => {
      const totalLength = Math.max(text.length, 1);
      const currentIndex = startIndex + event.charIndex;
      const progress = Math.min(100, Math.max(0, Math.round((currentIndex / totalLength) * 100)));
      onProgress?.(progress);
    };

    utterance.onend = () => {
      onProgress?.(100);
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
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      return;
    }

    if (this.synth?.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.audioElement) {
      void this.audioElement.play();
      return;
    }

    if (this.synth?.paused) {
      this.synth.resume();
    }
  }

  cancel(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioCompleted = true;
    }

    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }

    if (this.synth?.speaking || this.synth?.pending) {
      this.synth.cancel();
    }
  }

  isSpeaking(): boolean {
    if (this.audioElement) {
      return !this.audioElement.paused && !this.audioElement.ended;
    }
    return Boolean(this.synth?.speaking && !this.synth.paused);
  }

  isPaused(): boolean {
    if (this.audioElement) {
      return this.audioElement.paused && !this.audioElement.ended;
    }
    return Boolean(this.synth?.paused);
  }

  private playAudioBlob(
    blob: Blob,
    text: string,
    voice: VoiceOption | null,
    settings: VoiceSettings,
    onProgress?: SpeechProgressCallback
  ): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }

    this.audioUrl = URL.createObjectURL(blob);
    this.audioElement = new Audio(this.audioUrl);
    this.audioElement.volume = settings.volume;
    this.audioElement.playbackRate = settings.rate;

    this.audioElement.addEventListener('timeupdate', () => {
      const duration = this.audioElement?.duration ?? 1;
      const progress = Math.min(100, Math.max(0, Math.round((this.audioElement!.currentTime / duration) * 100)));
      onProgress?.(progress);
    });

    this.audioElement.addEventListener('ended', () => {
      onProgress?.(100);
      this.historyService.addEntry({
        text,
        voiceName: voice?.name ?? 'Default',
        language: voice?.language ?? 'en',
        settings: { ...settings }
      });
      this.audioCompleted = true;
    });

    void this.audioElement.play();
  }
}
