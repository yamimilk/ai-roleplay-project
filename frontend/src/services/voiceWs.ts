export type VoiceWsEvent =
  | { type: 'open' }
  | { type: 'close'; code?: number; reason?: string }
  | { type: 'error'; error?: Event }
  | { type: 'text'; text: string; isFinal?: boolean }
  | { type: 'audioUrl'; url: string }
  | { type: 'binaryAudio'; data: ArrayBuffer };

export interface VoiceWsOptions {
  url?: string; // ws(s) url; defaults to same-origin '/api/voice/ws'
  heartbeatMs?: number; // default 15000
  onEvent?: (ev: VoiceWsEvent) => void;
}

export class VoiceWsClient {
  private socket?: WebSocket;
  private heartbeatTimer?: number;
  private readonly options: Required<Pick<VoiceWsOptions, 'heartbeatMs'>> & VoiceWsOptions;

  constructor(opts?: VoiceWsOptions) {
    this.options = { heartbeatMs: 15000, ...(opts || {}) } as any;
  }

  // private resolveUrl(): string {
  //   if (this.options.url) return this.options.url;
  //   try {
  //     const override = window.localStorage?.getItem?.('VOICE_WS_URL');
  //     if (override) return override;
  //   } catch {}
  //   const loc = window.location;
  //   const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  //   const base = `${protocol}//${loc.host}`;
  //   // Connect to backend voice websocket
  //   return `${base}/ws/voice`;
  // }
  private resolveUrl(): string {
    if (this.options.url) return this.options.url;
    // 开发阶段直接连后端端口 8080
    return 'ws://localhost:8080/ws/voice';
  }
  

  connect(initPayload?: Record<string, unknown>) {
    const url = this.resolveUrl();
    // 调试：打印实际连接的 WS URL
    try { console.log('[VoiceWs] connecting to', url); } catch {}
    this.socket = new WebSocket(url);
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = () => {
      this.options.onEvent?.({ type: 'open' });
      if (initPayload) {
        this.sendJson({ type: 'start', ...initPayload });
      }
      this.startHeartbeat();
    };

    this.socket.onclose = (e) => {
      this.stopHeartbeat();
      this.options.onEvent?.({ type: 'close', code: e.code, reason: e.reason });
    };

    this.socket.onerror = (e) => {
      this.options.onEvent?.({ type: 'error', error: e });
    };

    this.socket.onmessage = (e) => {
      if (typeof e.data === 'string') {
        try {
          const msg = JSON.parse(e.data);
          if (typeof msg?.audioUrl === 'string') {
            this.options.onEvent?.({ type: 'audioUrl', url: msg.audioUrl });
          }
          if (typeof msg?.text === 'string') {
            this.options.onEvent?.({ type: 'text', text: msg.text, isFinal: !!msg.final });
          }
        } catch {
          // plain text
          this.options.onEvent?.({ type: 'text', text: String(e.data) });
        }
      } else if (e.data instanceof ArrayBuffer) {
        this.options.onEvent?.({ type: 'binaryAudio', data: e.data });
      }
    };
  }

  disconnect(code?: number, reason?: string) {
    this.stopHeartbeat();
    this.sendJson({ type: 'stop' });
    this.socket?.close(code, reason);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      this.sendJson({ type: 'ping', t: Date.now() });
    }, this.options.heartbeatMs);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined as any;
    }
  }

  sendJson(payload: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  sendAudioWav(buffer: ArrayBuffer) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      // Send raw wav bytes as one message
      this.socket.send(buffer);
    }
  }

  sendAudioPcm(buffer: ArrayBuffer) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      // Send raw PCM16LE bytes per chunk
      this.socket.send(buffer);
    }
  }
}


