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
  text = 'Welcome to Voicera — type your message and listen with natural voice synthesis.';
  voiceOptions: VoiceOption[] = [];
  filteredVoiceOptions: VoiceOption[] = [];
  availableLanguages: string[] = [];
  selectedVoice: VoiceOption | null = null;
  settings: VoiceSettings;
  isSpeaking = false;
  isPaused = false;

  voiceStyles: VoiceStyle[] = [
    { id: 'narrator',  label: 'Narrator',  description: 'Warm, steady storytelling tone.',       pitch: 1,   rate: 0.95, volume: 1    },
    { id: 'energetic', label: 'Energetic', description: 'Bright and fast with extra character.', pitch: 1.2, rate: 1.2,  volume: 1    },
    { id: 'deep',      label: 'Deep',      description: 'Lower pitch for bold narration.',        pitch: 0.7, rate: 0.9,  volume: 1    },
    { id: 'robot',     label: 'Robot',     description: 'Mechanical effect with slower cadence.', pitch: 0.8, rate: 0.85, volume: 0.9  },
    { id: 'baby',      label: 'Baby',      description: 'Light and playful voice shape.',         pitch: 1.4, rate: 1.1,  volume: 0.95 }
  ];
  activeStyleId = 'narrator';
  languageFilter = '';
  voiceSearch = '';

  private statusInterval: ReturnType<typeof setInterval> | null = null;

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
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.statusInterval) clearInterval(this.statusInterval);
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
    }
  }

  onSpeak(): void {
    this.speechService.speak(this.text, this.selectedVoice, this.settings);
  }

  onPause(): void {
    this.speechService.pause();
  }

  onResume(): void {
    this.speechService.resume();
  }

  onStop(): void {
    this.speechService.cancel();
  }

  onReset(): void {
    this.text = '';
    this.settings = this.settingsService.getSettings();
    this.activeStyleId = 'narrator';
    this.languageFilter = '';
    this.voiceSearch = '';
    this.applyFilters();
    this.applyStyle(this.activeStyleId);
    this.selectedVoice = this.voiceService.getDefaultVoice() ?? null;
    this.speechService.cancel();
  }

  async onDownload(): Promise<void> {
    await this.audioService.downloadAudio(this.text, this.selectedVoice, this.settings);
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

  styleOptions(): { value: string; label: string }[] {
    return this.voiceStyles.map(s => ({ value: s.id, label: s.label }));
  }
}
