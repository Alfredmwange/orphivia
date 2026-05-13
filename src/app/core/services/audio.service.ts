import { Injectable } from '@angular/core';
import { VoiceOption } from '../../models/voice.model';
import { VoiceSettings } from '../../models/settings.model';

@Injectable({ providedIn: 'root' })
export class AudioService {
  /**
   * Downloads generated speech as a WAV file using the Web Audio API + MediaRecorder.
   * Falls back to a warning if the browser doesn't support audio capture.
   */
  async downloadAudio(
    text: string,
    voice: VoiceOption | null,
    settings: VoiceSettings
  ): Promise<void> {
    if (!('MediaRecorder' in window)) {
      console.warn('Audio download: MediaRecorder not supported in this browser.');
      alert('Audio download is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    try {
      const audioCtx = new AudioContext();
      const destination = audioCtx.createMediaStreamDestination();
      const recorder = new MediaRecorder(destination.stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voicera-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = settings.volume;
      utterance.rate   = settings.rate;
      utterance.pitch  = settings.pitch;
      if (voice) {
        const match = window.speechSynthesis.getVoices().find(v => v.name === voice.name);
        if (match) utterance.voice = match;
      }

      recorder.start();
      window.speechSynthesis.speak(utterance);
      utterance.onend = () => recorder.stop();
    } catch (err) {
      console.error('Audio download failed:', err);
      alert('Could not capture audio. This feature requires a secure context (HTTPS).');
    }
  }
}
