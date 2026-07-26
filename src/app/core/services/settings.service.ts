import { Injectable } from '@angular/core';
import { AppSettings, VoiceSettings } from '../../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly storageKey = 'orphivia-app-settings';

  private defaultSettings: VoiceSettings = {
    pitch: 1,
    rate: 1,
    volume: 1
  };

  private appSettings: AppSettings = this.createDefaultAppSettings();

  constructor() {
    this.appSettings = this.loadAppSettings();
    this.applyAppSettings(this.appSettings);
  }

  getSettings(): VoiceSettings {
    return { ...this.defaultSettings };
  }

  applyStyle(style: Partial<VoiceSettings>): VoiceSettings {
    this.defaultSettings = { ...this.defaultSettings, ...style };
    return this.getSettings();
  }

  getAppSettings(): AppSettings {
    return { ...this.appSettings };
  }

  updateAppSettings(patch: Partial<AppSettings>): AppSettings {
    this.appSettings = { ...this.appSettings, ...patch };
    this.persistAppSettings();
    this.applyAppSettings(this.appSettings);
    return this.getAppSettings();
  }

  resetToDefaults(): AppSettings {
    this.appSettings = this.createDefaultAppSettings();
    this.persistAppSettings();
    this.applyAppSettings(this.appSettings);
    return this.getAppSettings();
  }

  clearCache(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.storageKey);
    }
    this.appSettings = this.createDefaultAppSettings();
    this.applyAppSettings(this.appSettings);
  }

  private createDefaultAppSettings(): AppSettings {
    return {
      theme: 'dark',
      accentColor: '#7c9eff',
      language: 'en',
      defaultProvider: 'elevenlabs',
      defaultVoice: 'Rachel',
      defaultVoiceMode: 'default',
      defaultLanguage: 'en',
      defaultStyle: 'narrator',
      outputFormat: 'mp3',
      audioQuality: 'high',
      defaultVolume: 100,
      playbackSpeed: 1,
      normalizeAudio: true,
      trimSilence: false,
      autoDetectLanguage: true,
      smartPunctuation: true,
      aiRewriteBeforeSpeaking: false,
      expandAbbreviations: true,
      convertNumbersToWords: false,
      spellCorrection: true,
      profanityFilter: false,
      saveSpeechHistory: true,
      saveGeneratedAudio: true,
      historyLimit: 100,
      autoDeleteAfter: 30,
      defaultDownloadFolder: 'Downloads/orphivia',
      filenameFormat: 'Voice_Name_Date',
      automaticallyDownload: false,
      openFolderAfterDownload: true,
      enableKeyboardShortcuts: true,
      notificationsGenerationComplete: true,
      notificationsDownloadFinished: true,
      notificationsUpdateAvailable: true,
      profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      username: 'orphivia User',
      email: 'you@orphivia.app',
      version: '1.0.0',
      developer: 'Perry Tech',
      license: 'MIT'
    };
  }

  private loadAppSettings(): AppSettings {
    if (typeof window === 'undefined') {
      return this.createDefaultAppSettings();
    }

    try {
      const stored = window.localStorage.getItem(this.storageKey);
      if (!stored) {
        return this.createDefaultAppSettings();
      }

      return { ...this.createDefaultAppSettings(), ...JSON.parse(stored) };
    } catch {
      return this.createDefaultAppSettings();
    }
  }

  private persistAppSettings(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(this.appSettings));
  }

  private applyAppSettings(settings: AppSettings): void {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme);
    root.setAttribute('data-lang', settings.language);
    root.lang = settings.language;
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--accent-soft', `${settings.accentColor}22`);
    root.style.colorScheme = settings.theme;
    document.body.dataset['theme'] = settings.theme;
  }
}
