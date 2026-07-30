import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProviderService } from '../../core/services/provider.service';
import { SettingsService } from '../../core/services/settings.service';
import { VoiceOption } from '../../models/voice.model';

@Component({
  selector: 'app-voices-page',
  standalone: true,
  templateUrl: './voices-page.component.html',
  styleUrls: ['./voices-page.component.css'],
  imports: [CommonModule, RouterModule, FormsModule]
})
export class VoicesPageComponent implements OnInit {
  categories = ['All', 'Featured', 'Trending', 'Most Realistic', 'Gaming', 'Anime', 'Podcasts'];
  voices: VoiceOption[] = [];
  filteredVoices: VoiceOption[] = [];
  selectedProvider = 'browser';
  searchTerm = '';
  activeCategory = 'All';
  favorites = new Set<string>();

  constructor(
    private readonly providerService: ProviderService,
    private readonly settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.selectedProvider = this.settingsService.getAppSettings().defaultProvider ?? 'browser';
    this.loadVoices();
  }

  loadVoices(): void {
    this.voices = this.providerService.getProviderVoices(this.selectedProvider);
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredVoices = this.voices.filter(voice => {
      const matchesCategory = this.activeCategory === 'All' || this.categoryForVoice(voice) === this.activeCategory;
      const matchesSearch = !term || voice.name.toLowerCase().includes(term) || voice.language.toLowerCase().includes(term) || (voice.description ?? '').toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }

  toggleFavorite(voiceId: string): void {
    if (this.favorites.has(voiceId)) {
      this.favorites.delete(voiceId);
    } else {
      this.favorites.add(voiceId);
    }
  }

  previewVoice(voice: VoiceOption): void {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(`Previewing ${voice.name}.`);
    utterance.lang = voice.language;
    utterance.rate = 1;
    utterance.pitch = 1;
    synth.speak(utterance);
  }

  private categoryForVoice(voice: VoiceOption): string {
    const name = voice.name.toLowerCase();
    if (name.includes('rachel') || name.includes('bella')) return 'Featured';
    if (name.includes('drew') || name.includes('ava')) return 'Trending';
    if (name.includes('standard') || name.includes('wavenet')) return 'Most Realistic';
    if (name.includes('nova') || name.includes('milo')) return 'Gaming';
    return 'Podcasts';
  }
}
