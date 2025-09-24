import React, { useEffect, useRef } from 'react';
import { Avatar, List, Typography } from 'antd';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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
              {m.role === 'user' && <Avatar style={{ marginLeft: 8 }}>U</Avatar>}
            </div>
          </List.Item>
        )}
      />
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;


