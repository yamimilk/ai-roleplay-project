// VoiceMessage.tsx
import React from 'react';
import { Button } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

interface Props {
  audioUrl: string;
  durationMs?: number;
  color?: string;
}

const VoiceMessage: React.FC<Props> = ({ audioUrl, durationMs, color = '#1677ff' }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  // 模拟竖条波形，可以自定义高度数组
  const bars = [4, 8, 6, 10, 6, 8, 4, 7, 5, 9];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      maxWidth: 300,
      backgroundColor: color === '#fff' ? '#1677ff' : '#f5f5f5',
      borderRadius: 20,
      padding: '4px 8px',
    }}>
      <Button
        type="text"
        shape="circle"
        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={togglePlay}
        style={{ color: color === '#fff' ? '#fff' : '#1677ff' }}
      />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, flex: 1, height: 16 }}>
        {bars.map((h, idx) => (
          <div
            key={idx}
            style={{
              width: 2,
              height: h,
              backgroundColor: color === '#fff' ? '#fff' : '#1677ff',
              borderRadius: 1,
            }}
          />
        ))}
      </div>
      {durationMs && (
        <span style={{ fontSize: 12, color: color === '#fff' ? '#fff' : '#888' }}>
          {Math.round(durationMs / 1000)}"
        </span>
      )}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
};

export default VoiceMessage;
