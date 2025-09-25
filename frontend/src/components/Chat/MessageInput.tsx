import React, { useRef, useState } from 'react';
import { Button, Input, Space } from 'antd';

interface Props {
  onSend: (text: string) => void;
  onSendVoice?: (file: Blob, durationMs?: number) => void;
  loading?: boolean;
}

const MessageInput: React.FC<Props> = ({ onSend, onSendVoice, loading }) => {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const triggerSend = () => {
    const v = text.trim();
    if (!v) return;
    onSend(v);
    setText('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const duration = Date.now() - startTimeRef.current;
        chunksRef.current = [];
        onSendVoice?.(blob, duration);
      };
      mediaRecorder.start();
      startTimeRef.current = Date.now();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (err) {
      console.error('无法访问麦克风:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const hasText = text.trim().length > 0;

  return (
    <Space.Compact style={{ width: '100%', alignItems: 'center' }}>
      {!hasText ? (
        <>
          <Button onClick={recording ? stopRecording : startRecording} type="text">
            {recording ? '停止' : '🎤'}
          </Button>
          <Button type="text" disabled>
            📞
          </Button>
        </>
      ) : null}
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
      {hasText ? (
        <Button type="primary" onClick={triggerSend} loading={loading}>↑</Button>
      ) : null}
    </Space.Compact>
  );
};

export default MessageInput;


