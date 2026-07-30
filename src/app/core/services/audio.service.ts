import { Injectable } from '@angular/core';
import { VoiceOption } from '../../models/voice.model';
import { VoiceSettings } from '../../models/settings.model';
import { ProviderService } from './provider.service';

@Injectable({ providedIn: 'root' })
export class AudioService {
  constructor(private readonly providerService: ProviderService) {}

  async downloadAudio(
    text: string,
    voice: VoiceOption | null,
    settings: VoiceSettings,
    providerId = 'browser',
    outputFormat = 'mp3'
  ): Promise<void> {
    const normalizedText = text.trim();
    if (!normalizedText) {
      alert('Add some text before downloading audio.');
      return;
    }

    try {
      const blob = await this.providerService.synthesizeAudio(providerId, voice, normalizedText, {
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume
      });

      if (blob) {
        const extension = providerId === 'browser' ? 'txt' : (outputFormat || 'mp3');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orphivia-${Date.now()}.${extension}`;
        link.click();
        URL.revokeObjectURL(url);
        return;
      }

      const fallbackBlob = new Blob([normalizedText], { type: 'text/plain' });
      const url = URL.createObjectURL(fallbackBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orphivia-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Audio download failed:', err);
      alert('The requested audio could not be generated right now.');
    }
  }
}
