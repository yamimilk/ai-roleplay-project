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
              {m.type !== 'audio' ? (
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
                  ) : (
                    <button 
                      onClick={async () => {
                        console.log('点击播放按钮，音频URL:', m.audioUrl);
                        if (!m.audioUrl) {
                          message.error('音频URL无效');
                          return;
                        }
                        
                        // 先测试URL是否可访问
                        try {
                          const response = await fetch(m.audioUrl, { method: 'HEAD' });
                          console.log('音频URL响应状态:', response.status);
                          if (!response.ok) {
                            message.error(`音频文件不可访问: ${response.status}`);
                            return;
                          }
                        } catch (fetchError) {
                          console.error('音频URL访问失败:', fetchError);
                          message.error('音频文件访问失败，请检查网络连接');
                          return;
                        }
                        
                        try {
                          const audio = new Audio(m.audioUrl);
                          audio.preload = 'auto';
                          
                          // 添加事件监听器
                          audio.onloadstart = () => console.log('开始加载音频:', m.audioUrl);
                          audio.oncanplay = () => console.log('音频可以播放:', m.audioUrl);
                          audio.onerror = (e) => {
                            console.error('音频加载失败:', e, 'URL:', m.audioUrl);
                            message.error('音频加载失败，请检查网络连接');
                          };
                          audio.onload = () => console.log('音频加载完成:', m.audioUrl);
                          
                          console.log('尝试播放音频...');
                          await audio.play();
                          console.log('音频播放成功');
                        } catch (error) {
                          console.error('音频播放失败:', error, 'URL:', m.audioUrl);
                          message.error('音频播放失败，请重试');
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px',
                        borderRadius: '4px',
                      }}
                    >
                      ▶
                    </button>
                  )}
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


