export interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'system';
  supported: boolean;
  description?: string;
  provider?: string;
}
