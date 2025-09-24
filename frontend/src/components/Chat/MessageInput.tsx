import React, { useState } from 'react';
import { Button, Input, Space } from 'antd';

interface Props {
  onSend: (text: string) => void;
  loading?: boolean;
}

const MessageInput: React.FC<Props> = ({ onSend, loading }) => {
  const [text, setText] = useState('');

  const triggerSend = () => {
    const v = text.trim();
    if (!v) return;
    onSend(v);
    setText('');
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input.TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoSize={{ minRows: 1, maxRows: 4 }}
        placeholder="输入消息..."
        onPressEnter={(e) => {
          if (!e.shiftKey) {
            e.preventDefault();
            triggerSend();
          }
        }}
      />
      <Button type="primary" onClick={triggerSend} loading={loading}>发送</Button>
    </Space.Compact>
  );
};

export default MessageInput;


