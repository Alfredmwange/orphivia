import { Injectable } from '@angular/core';
import { VoiceOption } from '../../models/voice.model';
import { VoiceSettings } from '../../models/settings.model';

@Injectable({ providedIn: 'root' })
export class AudioService {
  async downloadAudio(
    text: string,
    voice: VoiceOption | null,
    settings: VoiceSettings
  ): Promise<void> {
    if (!('MediaRecorder' in window) || !navigator.mediaDevices?.getDisplayMedia) {
      console.warn('Audio download is not supported in this browser.');
      alert('Audio download requires a browser with tab-audio capture support such as Chrome or Edge.');
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      const audioTracks = displayStream.getAudioTracks();
      if (!audioTracks.length) {
        displayStream.getTracks().forEach(track => track.stop());
        alert('Please allow tab audio capture and try again.');
        return;
      }

      const audioOnlyStream = new MediaStream(audioTracks);
      const recorder = new MediaRecorder(audioOnlyStream, {
        mimeType: this.getPreferredMimeType()
      });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orphivia-${Date.now()}.webm`;
        link.click();
        URL.revokeObjectURL(url);
        displayStream.getTracks().forEach(track => track.stop());
        audioOnlyStream.getTracks().forEach(track => track.stop());
      };

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = settings.volume;
      utterance.rate   = settings.rate;
      utterance.pitch  = settings.pitch;
      if (voice) {
        const match = window.speechSynthesis.getVoices().find(v => v.name === voice.name);
        if (match) utterance.voice = match;
      }

      utterance.onend = () => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      };

      utterance.onerror = () => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      };

      recorder.start();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Audio download failed:', err);
      alert('Could not capture the generated audio. Please allow browser tab audio sharing and try again.');
    }
  }

  private getPreferredMimeType(): string | undefined {
    const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm'];
    return preferredTypes.find(type => MediaRecorder.isTypeSupported(type));
  }
}
