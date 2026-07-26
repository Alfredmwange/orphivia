export interface VoiceSettings {
  pitch: number;
  rate: number;
  volume: number;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  accentColor: string;
  language: string;
  defaultProvider: string;
  defaultVoice: string;
  defaultVoiceMode: 'default' | 'none';
  defaultLanguage: string;
  defaultStyle: string;
  outputFormat: 'mp3' | 'wav' | 'ogg';
  audioQuality: 'standard' | 'high' | 'low';
  defaultVolume: number;
  playbackSpeed: number;
  normalizeAudio: boolean;
  trimSilence: boolean;
  autoDetectLanguage: boolean;
  smartPunctuation: boolean;
  aiRewriteBeforeSpeaking: boolean;
  expandAbbreviations: boolean;
  convertNumbersToWords: boolean;
  spellCorrection: boolean;
  profanityFilter: boolean;
  saveSpeechHistory: boolean;
  saveGeneratedAudio: boolean;
  historyLimit: number;
  autoDeleteAfter: number;
  defaultDownloadFolder: string;
  filenameFormat: string;
  automaticallyDownload: boolean;
  openFolderAfterDownload: boolean;
  enableKeyboardShortcuts: boolean;
  notificationsGenerationComplete: boolean;
  notificationsDownloadFinished: boolean;
  notificationsUpdateAvailable: boolean;
  profilePicture: string;
  username: string;
  email: string;
  version: string;
  developer: string;
  license: string;
}
