import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { VoiceOption } from '../../models/voice.model';

export type ProviderId = 'browser' | 'elevenlabs' | 'azure' | 'google';

export interface ProviderDefinition {
  id: ProviderId;
  label: string;
  description: string;
  accent: string;
  features: string[];
}

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private readonly providers: ProviderDefinition[] = [
    {
      id: 'browser',
      label: 'Browser speech',
      description: 'Uses the device voice synthesis engine with no extra setup.',
      accent: 'Local',
      features: ['Live preview', 'System voices', 'Instant playback']
    },
    {
      id: 'elevenlabs',
      label: 'ElevenLabs',
      description: 'High-quality neural voices with studio-grade clarity.',
      accent: 'AI',
      features: ['Studio voices', 'Fast generation', 'High fidelity']
    },
    {
      id: 'azure',
      label: 'Azure Speech',
      description: 'Microsoft neural voices with multilingual support.',
      accent: 'Cloud',
      features: ['Multilingual', 'SSML-ready', 'Neural voices']
    },
    {
      id: 'google',
      label: 'Google TTS',
      description: 'Google Cloud Text-to-Speech voices for rich synthesis.',
      accent: 'Cloud',
      features: ['Cloud APIs', 'Multiple languages', 'Natural cadence']
    }
  ];

  getProviders(): ProviderDefinition[] {
    return [...this.providers];
  }

  getProvider(id: string | ProviderId | null | undefined): ProviderDefinition | undefined {
    return this.providers.find(provider => provider.id === id) ?? this.providers[0];
  }

  getProviderVoices(provider: string | ProviderId | null | undefined): VoiceOption[] {
    const resolvedProvider = this.getProvider(provider ?? 'browser')?.id ?? 'browser';

    switch (resolvedProvider) {
      case 'elevenlabs':
        return [
          this.createVoice('elevenlabs:rachel', 'Rachel', 'en-US', 'female', 'Warm and conversational', true),
          this.createVoice('elevenlabs:bella', 'Bella', 'en-US', 'female', 'Bright and expressive', true),
          this.createVoice('elevenlabs:drew', 'Drew', 'en-US', 'male', 'Calm and cinematic', true),
          this.createVoice('elevenlabs:antoni', 'Antoni', 'en-US', 'male', 'Clear and polished', true)
        ];
      case 'azure':
        return [
          this.createVoice('azure:ava', 'Ava', 'en-US', 'female', 'Friendly and natural', true),
          this.createVoice('azure:guy', 'Guy', 'en-US', 'male', 'Deep and confident', true),
          this.createVoice('azure:sonia', 'Sonia', 'en-GB', 'female', 'British polished tone', true),
          this.createVoice('azure:remy', 'Remy', 'fr-FR', 'male', 'French neural voice', true)
        ];
      case 'google':
        return [
          this.createVoice('google:standard-a', 'Standard A', 'en-US', 'female', 'Fluid and modern', true),
          this.createVoice('google:standard-b', 'Standard B', 'en-US', 'male', 'Energetic and direct', true),
          this.createVoice('google:wavenet-c', 'WaveNet C', 'en-GB', 'female', 'Rich and premium', true),
          this.createVoice('google:wavenet-d', 'WaveNet D', 'ja-JP', 'male', 'Natural Japanese cadence', true)
        ];
      default:
        return this.loadBrowserVoices();
    }
  }

  getProviderLanguages(provider: string | ProviderId | null | undefined): string[] {
    return [...new Set(this.getProviderVoices(provider).map(voice => voice.language.split('-')[0]))].sort();
  }

  getProviderStyles(provider: string | ProviderId | null | undefined): Array<{ id: string; label: string; description: string; pitch: number; rate: number; volume: number }> {
    return [
      { id: 'narrator', label: 'Narrator', description: 'Warm and grounded', pitch: 1, rate: 0.95, volume: 1 },
      { id: 'energetic', label: 'Energetic', description: 'Bright and upbeat', pitch: 1.1, rate: 1.1, volume: 1 },
      { id: 'deep', label: 'Deep', description: 'Bold and cinematic', pitch: 0.8, rate: 0.9, volume: 0.95 },
      { id: 'robot', label: 'Robot', description: 'Mechanical and synthetic', pitch: 0.9, rate: 0.85, volume: 0.9 }
    ];
  }

  getProviderFeatures(provider: string | ProviderId | null | undefined): string[] {
    return this.getProvider(provider)?.features ?? [];
  }

  isConfigured(provider: string | ProviderId | null | undefined): boolean {
    const resolvedProvider = (provider ?? 'browser').toString();
    const env = environment as typeof environment & Record<string, string | boolean | undefined>;
    switch (resolvedProvider) {
      case 'elevenlabs':
        return Boolean(env['elevenlabsApiKey']);
      case 'azure':
        return Boolean(env['azureSpeechKey'] && env['azureSpeechRegion']);
      case 'google':
        return Boolean(env['googleCloudApiKey']);
      default:
        return true;
    }
  }

  async synthesizeAudio(
    provider: string | ProviderId | null | undefined,
    voice: VoiceOption | null,
    text: string,
    options: { rate?: number; pitch?: number; volume?: number } = {}
  ): Promise<Blob | null> {
    const resolvedProvider = (provider ?? 'browser').toString();

    if (resolvedProvider === 'browser' || !voice) {
      return null;
    }

    const normalizedText = text.trim();
    if (!normalizedText) {
      return null;
    }

    const voiceId = voice.id;
    const env = environment as typeof environment & Record<string, string | boolean | undefined>;
    const key = env['elevenlabsApiKey'] as string | undefined;
    const azureKey = env['azureSpeechKey'] as string | undefined;
    const azureRegion = env['azureSpeechRegion'] as string | undefined;
    const googleKey = env['googleCloudApiKey'] as string | undefined;

    try {
      switch (resolvedProvider) {
        case 'elevenlabs': {
          if (!key) {
            return null;
          }
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId.replace('elevenlabs:', '')}`, {
            method: 'POST',
            headers: {
              'xi-api-key': key,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: normalizedText,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.35,
                similarity_boost: 0.85,
                speed: options.rate ?? 1
              }
            })
          });
          if (!response.ok) {
            throw new Error(`ElevenLabs request failed: ${response.status}`);
          }
          return await response.blob();
        }
        case 'azure': {
          if (!azureKey || !azureRegion) {
            return null;
          }
          const voiceName = voice.name.replace(/\s+/g, '');
          const xml = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='${voiceName}'>${this.escapeXml(normalizedText)}</voice></speak>`;
          const response = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': azureKey,
              'Ocp-Apim-Subscription-Region': azureRegion,
              'Content-Type': 'application/ssml+xml',
              'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3'
            },
            body: xml
          });
          if (!response.ok) {
            throw new Error(`Azure request failed: ${response.status}`);
          }
          return await response.blob();
        }
        case 'google': {
          if (!googleKey) {
            return null;
          }
          const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              input: { text: normalizedText },
              voice: { languageCode: voice.language, name: voice.name },
              audioConfig: { audioEncoding: 'MP3' }
            })
          });
          if (!response.ok) {
            throw new Error(`Google request failed: ${response.status}`);
          }
          const payload = await response.json();
          const audioBase64 = payload.audioContent as string | undefined;
          if (!audioBase64) {
            return null;
          }
          const bytes = Uint8Array.from(atob(audioBase64), char => char.charCodeAt(0));
          return new Blob([bytes], { type: 'audio/mpeg' });
        }
        default:
          return null;
      }
    } catch (error) {
      console.error('Provider synthesis failed', error);
      return null;
    }
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private loadBrowserVoices(): VoiceOption[] {
    if (typeof window === 'undefined') {
      return [];
    }

    return window.speechSynthesis.getVoices().map(voice => this.createVoice(voice.name, voice.name, voice.lang, voice.name.toLowerCase().includes('female') ? 'female' : voice.name.toLowerCase().includes('male') ? 'male' : 'system', 'Browser voice', true));
  }

  private createVoice(id: string, name: string, language: string, gender: VoiceOption['gender'], description: string, supported: boolean): VoiceOption {
    return {
      id,
      name,
      language,
      gender,
      supported,
      description,
      provider: 'browser'
    } as VoiceOption;
  }
}
