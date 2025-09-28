import React, { useEffect, useRef, useState } from 'react';
import { Avatar, List, Typography, Spin, message } from 'antd';
import VoiceMessage from './VoiceMessage'

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
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {m.role === 'assistant' && (
                <Avatar src={m.avatar} style={{ marginRight: 8 }}>
                  A
                </Avatar>
              )}

              {/* 判断是文字还是语音 */}
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
                  <Typography.Text style={{ color: 'inherit' }}>
                    {m.content}
                  </Typography.Text>
                </div>
              ) : (
                // 🎵 动态波形语音条
                <VoiceMessage
                  audioUrl={m.audioUrl!}
                  durationMs={m.durationMs}
                  color={m.role === 'user' ? '#fff' : '#1677ff'}
                />
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


