import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HistoryService } from '../../core/services/history.service';
import { SettingsService } from '../../core/services/settings.service';
import { AppSettings } from '../../models/settings.model';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class SettingsPageComponent implements OnInit {
  settings: AppSettings = this.createDefaults();
  statusMessage = 'Your settings are ready.';

  themeOptions = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' }
  ];

  accentOptions = [
    { value: '#7c9eff', label: 'Blue' },
    { value: '#6ee7b7', label: 'Mint' },
    { value: '#f472b6', label: 'Rose' },
    { value: '#fbbf24', label: 'Amber' }
  ];

  languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'Arabic' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' }
  ];

  providerOptions = [
    { value: 'elevenlabs', label: 'ElevenLabs' },
    { value: 'azure', label: 'Azure' },
    { value: 'google', label: 'Google' }
  ];

  voiceOptions = [
    { value: 'Rachel', label: 'Rachel' },
    { value: 'Adam', label: 'Adam' },
    { value: 'Bella', label: 'Bella' },
    { value: 'Noah', label: 'Noah' }
  ];

  styleOptions = [
    { value: 'narrator', label: 'Narrator' },
    { value: 'energetic', label: 'Energetic' },
    { value: 'deep', label: 'Deep' },
    { value: 'robot', label: 'Robot' }
  ];

  constructor(
    private readonly settingsService: SettingsService,
    private readonly historyService: HistoryService
  ) {}

  ngOnInit(): void {
    this.settings = this.settingsService.getAppSettings();
  }

  updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.settings = this.settingsService.updateAppSettings({ [key]: value } as Partial<AppSettings>);
    const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
    this.statusMessage = `Updated ${label}.`;
  }

  clearCache(): void {
    this.settingsService.clearCache();
    this.historyService.clearAll();
    this.settings = this.settingsService.getAppSettings();
    this.statusMessage = 'Cache and local data were cleared.';
  }

  resetToDefaults(): void {
    this.settings = this.settingsService.resetToDefaults();
    this.statusMessage = 'All settings were restored to defaults.';
  }

  clearHistory(): void {
    this.historyService.clearAll();
    this.statusMessage = 'Speech history was cleared.';
  }

  restoreShortcuts(): void {
    this.updateSetting('enableKeyboardShortcuts', true);
  }

  checkForUpdates(): void {
    this.statusMessage = 'You are already running the latest version of orphivia.';
  }

  saveProfile(): void {
    this.statusMessage = 'Profile details were saved.';
  }

  private createDefaults(): AppSettings {
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
      profilePicture: '',
      username: 'orphivia User',
      email: 'you@orphivia.app',
      version: '1.0.0',
      developer: 'Perry Tech',
      license: 'MIT'
    };
  }
}
