import { Injectable } from '@angular/core';
import { VoiceSettings } from '../../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private defaultSettings: VoiceSettings = {
    pitch: 1,
    rate: 1,
    volume: 1
  };

  getSettings(): VoiceSettings {
    return { ...this.defaultSettings };
  }

  applyStyle(style: Partial<VoiceSettings>): VoiceSettings {
    this.defaultSettings = { ...this.defaultSettings, ...style };
    return this.getSettings();
  }
}
