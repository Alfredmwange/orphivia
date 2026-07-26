import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-voices-page',
  standalone: true,
  templateUrl: './voices-page.component.html',
  styleUrls: ['./voices-page.component.css'],
  imports: [CommonModule, RouterModule]
})
export class VoicesPageComponent {
  categories = ['Featured', 'Trending', 'Most Realistic', 'Gaming', 'Anime', 'Movies', 'Podcasts', 'Audiobooks', 'Characters'];
  voices = [
    { name: 'Rachel', category: 'Featured', label: 'Warm American female voice', accent: 'Narration' },
    { name: 'Adam', category: 'Trending', label: 'Deep and cinematic male voice', accent: 'Drama' },
    { name: 'Bella', category: 'Anime', label: 'Bright and youthful character voice', accent: 'Character' },
    { name: 'Nova', category: 'Gaming', label: 'Energetic and crisp for games', accent: 'Gaming' },
    { name: 'Milo', category: 'Podcasts', label: 'Conversational and warm', accent: 'Podcast' },
    { name: 'Sage', category: 'Most Realistic', label: 'Natural, human-like tone', accent: 'Studio' }
  ];
}
