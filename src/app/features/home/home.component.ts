import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoiceOption } from '../../models/voice.model';
import { VoiceSettings } from '../../models/settings.model';
import { VoiceStyle } from '../../models/style.model';
import { AudioService } from '../../core/services/audio.service';
import { SettingsService } from '../../core/services/settings.service';
import { SpeechService } from '../../core/services/speech.service';
import { VoiceService } from '../../core/services/voice.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { SliderComponent } from '../../shared/components/slider/slider.component';
import { WaveformComponent } from '../audio-output/waveform/waveform.component';
import { HistoryPanelComponent } from '../actions/history-panel/history-panel.component';
import { CharCounterComponent } from '../text-input/char-counter/char-counter.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    CommonModule,
    NgFor,
    TitleCasePipe,
    FormsModule,
    CardComponent,
    ButtonComponent,
    DropdownComponent,
    SliderComponent,
    WaveformComponent,
    HistoryPanelComponent,
    CharCounterComponent
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  text = 'Welcome to orphivia — type your message and listen with natural voice synthesis.';
  voiceOptions: VoiceOption[] = [];
  filteredVoiceOptions: VoiceOption[] = [];
  availableLanguages: string[] = [];
  selectedVoice: VoiceOption | null = null;
  settings: VoiceSettings;
  isSpeaking = false;
  isPaused = false;
  playbackProgress = 0;
  isDownloading = false;
  showAdvancedVoiceControls = false;
  selectedVoicePreset = 'narrator';
  detectedLanguages: string[] = [];

  voiceStyles: VoiceStyle[] = [
    { id: 'narrator',  label: 'Narrator',  description: 'Warm, steady storytelling tone.',       pitch: 1,   rate: 0.95, volume: 1    },
    { id: 'energetic', label: 'Energetic', description: 'Bright and fast with extra character.', pitch: 1.2, rate: 1.2,  volume: 1    },
    { id: 'deep',      label: 'Deep',      description: 'Lower pitch for bold narration.',        pitch: 0.7, rate: 0.9,  volume: 1    },
    { id: 'robot',     label: 'Robot',     description: 'Mechanical effect with slower cadence.', pitch: 0.8, rate: 0.85, volume: 0.9  },
    { id: 'baby',      label: 'Baby',      description: 'Light and playful voice shape.',         pitch: 1.4, rate: 1.1,  volume: 0.95 },
    { id: 'chipmunk',  label: 'Chipmunk',  description: 'Playful, squeaky, and high-energy.',      pitch: 1.7, rate: 1.25, volume: 0.95 },
    { id: 'cartoon',   label: 'Cartoon',   description: 'Animated and expressive for fun scenes.', pitch: 1.35, rate: 1.08, volume: 0.95 },
    { id: 'celebrity', label: 'Celebrity', description: 'Bold and polished for dramatic delivery.', pitch: 1.05, rate: 0.9, volume: 0.98 }
  ];
  activeStyleId = 'narrator';
  languageFilter = '';
  voiceSearch = '';

  private statusInterval: ReturnType<typeof setInterval> | null = null;
  private playbackFrameId: number | null = null;
  private playbackStartedAt = 0;
  private playbackDurationMs = 1000;
  private playbackStartProgress = 0;

  constructor(
    private readonly speechService: SpeechService,
    private readonly voiceService: VoiceService,
    private readonly settingsService: SettingsService,
    private readonly audioService: AudioService
  ) {
    this.settings = this.settingsService.getSettings();
  }

  ngOnInit(): void {
    this.voiceService.voices$.subscribe(voices => {
      this.voiceOptions = voices;
      this.availableLanguages = this.voiceService.getAvailableLanguages();
      this.selectedVoice = this.voiceService.getDefaultVoice() ?? null;
      this.applyFilters();
    });
    this.applyStyle(this.activeStyleId);

    this.statusInterval = setInterval(() => {
      this.isSpeaking = this.speechService.isSpeaking();
      this.isPaused = this.speechService.isPaused();

      if (this.isSpeaking && !this.isPaused) {
        this.updatePlaybackProgress();
      } else if (!this.isSpeaking) {
        this.stopPlaybackAnimation();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.statusInterval) clearInterval(this.statusInterval);
    this.stopPlaybackAnimation();
  }

  applyFilters(): void {
    this.filteredVoiceOptions = this.voiceService.getVoiceOptions({
      language: this.languageFilter || undefined,
      search: this.voiceSearch || undefined
    });
  }

  onLanguageFilterChange(): void {
    this.applyFilters();
    if (this.selectedVoice && !this.filteredVoiceOptions.find(v => v.id === this.selectedVoice!.id)) {
      this.selectedVoice = this.filteredVoiceOptions[0] ?? null;
    }
  }

  onVoiceSearchChange(): void {
    this.applyFilters();
    if (this.selectedVoice && !this.filteredVoiceOptions.find(v => v.id === this.selectedVoice!.id)) {
      this.selectedVoice = this.filteredVoiceOptions[0] ?? null;
    }
  }

  applyStyle(styleId: string): void {
    const style = this.voiceStyles.find(item => item.id === styleId);
    if (style) {
      this.settings = this.settingsService.applyStyle({
        pitch: style.pitch,
        rate: style.rate,
        volume: style.volume
      });
      this.activeStyleId = styleId;
      this.selectedVoicePreset = styleId;
    }
  }

  onSpeak(): void {
    this.speechService.speak(
      this.text,
      this.selectedVoice,
      this.settings,
      this.getStartIndexForProgress(this.playbackProgress),
      progress => {
        this.playbackProgress = progress;
      }
    );
    this.startPlaybackAnimation();
  }

  onTogglePlayback(): void {
    if (this.isSpeaking && !this.isPaused) {
      this.speechService.pause();
      this.stopPlaybackAnimation();
      return;
    }

    if (this.isPaused) {
      this.speechService.resume();
      this.startPlaybackAnimation();
      return;
    }

    this.onSpeak();
  }

  onReset(): void {
    this.text = '';
    this.settings = this.settingsService.getSettings();
    this.activeStyleId = 'narrator';
    this.languageFilter = '';
    this.voiceSearch = '';
    this.playbackProgress = 0;
    this.stopPlaybackAnimation();
    this.showAdvancedVoiceControls = false;
    this.detectedLanguages = [];
    this.applyFilters();
    this.applyStyle(this.activeStyleId);
    this.selectedVoice = this.voiceService.getDefaultVoice() ?? null;
    this.speechService.cancel();
    this.detectLanguages();
  }

  onTextChange(): void {
    this.detectLanguages();
  }

  onSeekChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    const nextProgress = Number(target.value || 0);
    this.playbackProgress = nextProgress;

    if (!this.text.trim()) return;

    const startIndex = this.getStartIndexForProgress(nextProgress);
    if (this.speechService.isSpeaking() || this.speechService.isPaused()) {
      this.speechService.speak(
        this.text,
        this.selectedVoice,
        this.settings,
        startIndex,
        progress => {
          this.playbackProgress = progress;
        }
      );
      this.startPlaybackAnimation();
    }
  }

  async onDownload(): Promise<void> {
    this.isDownloading = true;
    try {
      await this.audioService.downloadAudio(this.text, this.selectedVoice, this.settings);
    } finally {
      this.isDownloading = false;
    }
  }

  toggleAdvancedVoiceControls(): void {
    this.showAdvancedVoiceControls = !this.showAdvancedVoiceControls;
  }

  onVoicePresetChange(presetId: string): void {
    this.selectedVoicePreset = presetId;
    this.applyStyle(presetId);
  }

  get detectedLanguageLabel(): string {
    return this.detectedLanguages[0] ?? this.selectedVoice?.language ?? 'Auto-detect';
  }

  get playbackDurationLabel(): string {
    return this.formatTime(this.getEstimatedDurationSeconds());
  }

  get playbackPositionLabel(): string {
    return this.formatTime(this.getEstimatedDurationSeconds() * (this.playbackProgress / 100));
  }

  languageOptions(): { value: string; label: string }[] {
    return [
      { value: '', label: 'All languages' },
      ...this.availableLanguages.map(lang => ({ value: lang, label: lang.toUpperCase() }))
    ];
  }

  voiceSelectOptions(): { value: VoiceOption; label: string }[] {
    return this.filteredVoiceOptions.map(v => ({ value: v, label: `${v.name} (${v.language})` }));
  }

  voicePresetOptions(): { value: string; label: string }[] {
    return [
      { value: 'narrator', label: 'Narrator voice' },
      { value: 'energetic', label: 'Energetic voice' },
      { value: 'deep', label: 'Deep voice' },
      { value: 'robot', label: 'Robot voice' },
      { value: 'baby', label: 'Baby voice' },
      { value: 'chipmunk', label: 'Chipmunk voice' },
      { value: 'cartoon', label: 'Cartoon voice' },
      { value: 'celebrity', label: 'Celebrity-inspired voice' }
    ];
  }

  styleOptions(): { value: string; label: string }[] {
    return this.voiceStyles.map(s => ({ value: s.id, label: s.label }));
  }

  private getStartIndexForProgress(progress: number): number {
    const safeProgress = Math.max(0, Math.min(100, progress));
    return Math.max(0, Math.min(this.text.length, Math.round((safeProgress / 100) * this.text.length)));
  }

  private getEstimatedDurationSeconds(): number {
    const charCount = Math.max(this.text.trim().length, 1);
    return Math.max(1, Math.round((charCount * 0.06) / Math.max(this.settings.rate, 0.2)));
  }

  private detectLanguages(): void {
    const sample = this.text.toLowerCase();
    const languageMap: Record<string, string[]> = {
      'en': ['English', 'en-US'],
      'ar': ['Arabic', 'ar-SA'],
      'sw': ['Swahili', 'sw-KE'],
      'ru': ['Russian', 'ru-RU'],
      'fr': ['French', 'fr-FR'],
      'de': ['German', 'de-DE'],
      'es': ['Spanish', 'es-ES'],
      'ja': ['Japanese', 'ja-JP'],
      'zh': ['Chinese', 'zh-CN'],
      'hi': ['Hindi', 'hi-IN']
    };

    const detected = Object.entries(languageMap)
      .filter(([key]) => sample.includes(key))
      .map(([, labels]) => labels[0]);

    this.detectedLanguages = detected.length ? detected : ['Auto-detect'];
  }

  private startPlaybackAnimation(): void {
    this.stopPlaybackAnimation();

    this.playbackStartProgress = this.playbackProgress;
    this.playbackStartedAt = performance.now();
    this.playbackDurationMs = Math.max(1200, this.getEstimatedDurationSeconds() * 1000);

    const tick = () => {
      if (!this.speechService.isSpeaking() || this.speechService.isPaused()) {
        this.stopPlaybackAnimation();
        return;
      }

      const elapsedMs = performance.now() - this.playbackStartedAt;
      const remainingProgress = 100 - this.playbackStartProgress;
      const nextProgress = Math.min(100, this.playbackStartProgress + (elapsedMs / this.playbackDurationMs) * remainingProgress);
      this.playbackProgress = nextProgress;
      this.playbackFrameId = requestAnimationFrame(tick);
    };

    this.playbackFrameId = requestAnimationFrame(tick);
  }

  private stopPlaybackAnimation(): void {
    if (this.playbackFrameId !== null) {
      cancelAnimationFrame(this.playbackFrameId);
      this.playbackFrameId = null;
    }
  }

  private updatePlaybackProgress(): void {
    if (this.playbackFrameId === null) {
      this.startPlaybackAnimation();
    }
  }

  private formatTime(seconds: number): string {
    const safeSeconds = Math.max(0, Math.round(seconds));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
