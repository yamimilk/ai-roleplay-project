export class WavEncoder {
  static encodeWavFromFloat32(float32Data: Float32Array, sampleRate = 16000): ArrayBuffer {
    // Convert float32 [-1,1] to PCM16LE
    const pcm = new Int16Array(float32Data.length);
    for (let i = 0; i < float32Data.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Data[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcm.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeString(offset: number, str: string) {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');

    // fmt chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true);

    // data chunk
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // PCM data
    let offset = 44;
    for (let i = 0; i < pcm.length; i++) {
      view.setInt16(offset, pcm[i], true);
      offset += 2;
    }

    return buffer;
  }
}

export class AudioQueuePlayer {
  private ctx?: AudioContext;
  private queue: ArrayBuffer[] = [];
  private playing = false;

  enqueueWav(buffer: ArrayBuffer) {
    this.queue.push(buffer);
    this.playNext();
  }

  private async playNext() {
    if (this.playing || this.queue.length === 0) return;
    this.playing = true;
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const data = this.queue.shift()!;
      const audioBuffer = await this.ctx.decodeAudioData(data.slice(0));
      const src = this.ctx.createBufferSource();
      src.buffer = audioBuffer;
      src.connect(this.ctx.destination);
      src.onended = () => {
        this.playing = false;
        this.playNext();
      };
      src.start(0);
    } catch (e) {
      console.error('AudioQueuePlayer error:', e);
      this.playing = false;
      this.playNext();
    }
  }
}


