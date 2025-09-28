import React, { useRef, useState } from 'react';
import { Button, Input } from 'antd';

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
        if (e.data.size > 0) chunksRef.current.push(e.data);
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

  return (
    <Input
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="输入消息..."
      // autoSize={{ minRows: 1, maxRows: 4 }}
      onPressEnter={(e) => {
        if (!e.shiftKey) {
          e.preventDefault();
          triggerSend();
        }
      }}
      suffix={
        <>
          <Button
            onClick={recording ? stopRecording : startRecording}
            type="text"
            style={{ marginRight: 4 }}
          >
            {recording ? '停止' : '🎤'}
          </Button>
          <Button type="text" disabled>
            📞
          </Button>
          {text.trim() && (
            <Button type="primary" onClick={triggerSend} loading={loading}>
              ↑
            </Button>
          )}
        </>
      }
      onClick={() => {
        if (text.trim()) triggerSend(); // 点击输入框也可直接发送
      }}
    />
  );
};

export default MessageInput;
