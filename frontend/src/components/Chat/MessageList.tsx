import React, { useEffect, useRef, useState } from 'react';
import { Avatar, List, Typography, Spin, message } from 'antd';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  type?: 'text' | 'audio';
  content: string; // for text
  audioUrl?: string; // for audio
  durationMs?: number;
  status?: 'uploading' | 'failed' | 'done';
  avatar?: string;
}

interface Props {
  messages: ChatMessage[];
}

const MessageList: React.FC<Props> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
      <List
        dataSource={messages}
        renderItem={(m) => (
          <List.Item style={{ border: 'none', padding: '8px 0' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && <Avatar src={m.avatar} style={{ marginRight: 8 }}>A</Avatar>}
              {(m.audioUrl ? 'audio' : (m.type || 'text')) !== 'audio' ? (
                <div
                  style={{
                    maxWidth: '70%',
                    background: m.role === 'user' ? '#1677ff' : '#f5f5f5',
                    color: m.role === 'user' ? '#fff' : 'inherit',
                    borderRadius: 8,
                    padding: '8px 12px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <Typography.Text style={{ color: 'inherit' }}>{m.content}</Typography.Text>
                </div>
              ) : (
                <div
                  style={{
                    maxWidth: '70%',
                    background: m.role === 'user' ? '#1677ff' : '#f5f5f5',
                    color: m.role === 'user' ? '#fff' : 'inherit',
                    borderRadius: 8,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  className="voice-message"
                >
                  {m.status === 'uploading' ? (
                    <Spin size="small" />
                  ) : m.status === 'failed' ? (
                    <Typography.Text style={{ color: m.role === 'user' ? '#fff' : '#ff4d4f' }}>!</Typography.Text>
                  ) : m.audioUrl ? (
                    <audio
                      controls
                      src={m.audioUrl}
                      style={{ width: 220 }}
                      preload="none"
                      onPlay={() => console.log('开始播放:', m.audioUrl)}
                      onError={(e) => {
                        console.error('音频播放错误', e);
                        message.error('音频无法播放');
                      }}
                    />
                  ) : null}
                  <span>{formatDuration(m.durationMs)}</span>
                </div>
              )}
              {m.role === 'user' && <Avatar style={{ marginLeft: 8 }}>U</Avatar>}
            </div>
          </List.Item>
        )}
      />
      <div ref={bottomRef} />
    </div>
  );
};

function formatDuration(ms?: number) {
  if (!ms || ms <= 0) return '';
  const s = Math.round(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default MessageList;


