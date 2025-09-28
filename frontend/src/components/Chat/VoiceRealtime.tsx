import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Tag, Typography } from 'antd';
import { VoiceWsClient } from '@/services/voiceWs';
import { WavEncoder, AudioQueuePlayer } from '@/utils/audio';

interface Props {
  roleId?: string;
  conversationId?: number;
}

const VoiceRealtime: React.FC<Props> = ({ roleId, conversationId }) => {
  const wsRef = useRef<VoiceWsClient>();
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const playerRef = useRef<AudioQueuePlayer>(new AudioQueuePlayer());
  const [connected, setConnected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<string>('idle');

  useEffect(() => {
    return () => {
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startWs = () => {
    if (wsRef.current) return;
    const client = new VoiceWsClient({
      onEvent: (ev) => {
        if (ev.type === 'open') setConnected(true);
        if (ev.type === 'close') setConnected(false);
        if (ev.type === 'error') setConnected(false);
        if (ev.type === 'text') {
          console.log('ASR/TEXT:', ev.text);
        }
        if (ev.type === 'audioUrl') {
          const a = new Audio(ev.url);
          a.play().catch(() => void 0);
        }
        if (ev.type === 'binaryAudio') {
          // Assume backend returns WAV bytes in binary frames; enqueue for playback
          playerRef.current.enqueueWav(ev.data);
        }
      },
    });
    wsRef.current = client;
    client.connect({ roleId, conversationId });
  };

  const stopWs = () => {
    wsRef.current?.disconnect();
    wsRef.current = undefined;
  };

  const startRecord = async () => {
    if (recording) return;
    setStatus('requesting mic');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: {
      channelCount: 1,
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: true,
    }} as any);

    // Use WebAudio to get raw PCM frames, then encode/send as small WAV/PCM chunks
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 } as any);
    const source = audioCtx.createMediaStreamSource(stream);

    // ScriptProcessorNode is deprecated; still widely supported. Buffer size 4096 for ~256ms @16k
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(audioCtx.destination);

    processor.onaudioprocess = (ev) => {
      if (!recording) return;
      const input = ev.inputBuffer.getChannelData(0);
      // Encode to small WAV chunk or send PCM directly
      const wavChunk = WavEncoder.encodeWavFromFloat32(input, audioCtx.sampleRate);
      wsRef.current?.sendAudioWav(wavChunk);
      // Alternatively: send PCM directly
      // const pcm16 = float32ToPcm16(input);
      // wsRef.current?.sendAudioPcm(pcm16.buffer);
    };

    // Store stop handlers
    (mediaRef as any).current = { stop: () => {
      source.disconnect();
      processor.disconnect();
      stream.getTracks().forEach(t => t.stop());
      audioCtx.close();
    }, stream } as any;

    setRecording(true);
    setStatus('recording');
  };

  const stopRecord = () => {
    if (!recording) return;
    try {
      mediaRef.current?.stop();
      (mediaRef.current as any)?.stream?.getTracks?.().forEach((t: MediaStreamTrack) => t.stop());
    } catch {}
    mediaRef.current = null as any;
    setRecording(false);
  };

  const stopAll = () => {
    stopRecord();
    stopWs();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Space>
        {!connected ? (
          <Button onClick={startWs} type="default">连接语音</Button>
        ) : (
          <Button onClick={stopWs} danger>断开</Button>
        )}
        {!recording ? (
          <Button onClick={startRecord} type="primary" disabled={!connected}>开始说话</Button>
        ) : (
          <Button onClick={stopRecord} type="default" danger>停止</Button>
        )}
        <Tag color={connected ? 'green' : 'red'}>{connected ? '已连接' : '未连接'}</Tag>
        <Typography.Text type="secondary">{status}</Typography.Text>
      </Space>
    </div>
  );
};

export default VoiceRealtime;


