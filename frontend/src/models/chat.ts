import { useEffect, useState } from 'react';
import { createConversation, getConversationMessages, listConversations, sendMessage } from '@/services/chat';
import type { ConversationItem } from '@/components/Chat/ConversationList';
import type { ChatMessage } from '@/components/Chat/MessageList';
import { uploadVoiceChat } from '@/services/chat';

export default function useChatModel() {
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [roleId, setRoleId] = useState<number>(0);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [activeConversationServerId, setActiveConversationServerId] = useState<number | undefined>();
  const [clientToServerId, setClientToServerId] = useState<Record<string, number | undefined>>({});
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [sending, setSending] = useState(false);

  // 初次加载会话列表（如果后端有数据，则渲染）
  useEffect(() => {
      if (!roleId)  return;
    // roleId 已有，去加载会话
    const run = async () => {
      try {
        if (!roleId) return;
        const list = await listConversations(roleId);
        if (Array.isArray(list) && list.length > 0) {
          const newMap: Record<string, number | undefined> = {};
          const mapped: ConversationItem[] = list.map((it: any) => {
            const serverId = Number(it.id ?? it.conversationId);
            const cid = String(it.id ?? it.conversationId ?? Date.now());
            newMap[cid] = Number.isNaN(serverId) ? undefined : serverId;
            return {
              id: cid,
              title: String(it.title ?? it.name ?? '会话'),
              lastMessage: it.lastMessage ?? it.lastContent ?? '',
              updatedAt: it.updatedAt ?? it.time ?? '',
            };
          });
          setClientToServerId(newMap);
          setConversations(mapped);
          const first = mapped[0];
          if (first) {
            setActiveId(first.id);
            const sid = newMap[first.id];
            if (!Number.isNaN(sid)) setActiveConversationServerId(sid);
            // 载入首个会话历史
            fetchHistory(first.id, sid);
          }
        } else {
          // 清空当前
          setConversations([]);
          setActiveId(undefined);
          setActiveConversationServerId(undefined);
          setMessagesMap({});
        }
      } catch {}
    };
    
    run();
  }, [roleId]);

  const mapDtoToUi = (user: string): 'user' | 'assistant' => {
    const u = (user || '').toLowerCase();
    if (u.includes('user') || u.includes('用户')) return 'user';
    return 'assistant';
  };

  const ensureActive = () => {
    if (!activeId) {
      const cid = Date.now().toString();
      const newConv: ConversationItem = {
        id: cid,
        title: '新会话',
        lastMessage: '',
        updatedAt: new Date().toLocaleTimeString(),
      };
      setConversations((arr) => [newConv, ...arr]);
      setActiveId(cid);
      setMessagesMap((m) => ({ ...m, [cid]: [] }));
      return cid;
    }
    return activeId;
  };

  const selectConversation = (cid: string) => {
    setActiveId(cid);
    const serverId = clientToServerId[cid];
    if (serverId) {
      setActiveConversationServerId(serverId);
      fetchHistory(cid, serverId);
    }
  };

  const fetchHistory = async (cid: string, serverId?: number) => {
    if (!serverId) return;
    try {
      const data = await getConversationMessages(serverId);
      const arr = (data?.messages || data?.data || []) as any[];
      const mapped: ChatMessage[] = arr.map((m, idx) => {
        // 判断是否为语音消息：content为null且有audioUrl
        const isAudio = !m.content && m.audioUrl;
        console.log('原始消息', m);

        return {
          id: `${serverId}-${idx}`,
          role: mapDtoToUi(m.user),
          roleId: m.roleId,
          content: m.content || '',
          type: isAudio ? 'audio' : 'text',
          audioUrl: m.audioUrl,
          status: isAudio ? 'done' : undefined,
        };
      });
      setMessagesMap((m) => ({ ...m, [cid]: mapped }));
    } catch {}
  };

  

  const send = async (text: string) => {
    const cid = ensureActive();
    setMessagesMap((m) => ({
      ...m,
      [cid]: [...(m[cid] || []), { id: `${Date.now()}-u`, role: 'user', content: text }],
    }));
    setSending(true);
    try {
      const resp = await sendMessage({ roleId, message: text, conversationId: activeConversationServerId });
      setSessionId(resp.sessionId);
      const serverId = resp.conversationId;
      if (serverId) {
        if (!activeConversationServerId) setActiveConversationServerId(serverId);
        setClientToServerId((map) => ({ ...map, [cid]: serverId }));
      }
      // 映射后端返回的往返消息（一般包含用户+AI）
      const mapped: ChatMessage[] = (resp.messages || []).map((m, idx) => ({
        id: `${serverId || 'local'}-${Date.now()}-${idx}`,
        role: mapDtoToUi(m.user),

        content: m.content,
      }));
      setMessagesMap((m) => ({
        ...m,
        [cid]: dedupeMergeMessages(m[cid] || [], mapped),
      }));
      const last = mapped[mapped.length - 1];
      setConversations((arr) => arr.map((c) => c.id === cid ? ({
        ...c,
        lastMessage: last?.content ?? '',
        updatedAt: new Date().toLocaleTimeString(),
      }) : c));
    } finally {
      setSending(false);
    }
  };

  const sendVoice = async (blob: Blob, durationMs?: number) => {
    const cid = ensureActive();
    const tempUrl = URL.createObjectURL(blob);
    const tempId = `${Date.now()}-v`;
  
    // 1️⃣ 乐观更新：显示“上传中”的语音气泡
    setMessagesMap((m) => ({
      ...m,
      [cid]: [...(m[cid] || []), {
        id: tempId,
        role: 'user',
        type: 'audio',
        content: '',
        audioUrl: tempUrl,
        durationMs,
        status: 'uploading'
      }],
    }));
  
    try {
      // 2️⃣ 上传语音到后端
      const resp = await uploadVoiceChat(blob, activeConversationServerId, roleId);
  
      // 3️⃣ 更新 sessionId（如果返回）
      if (resp.sessionId) setSessionId(resp.sessionId);
  
 // 添加调试日志
 console.log('语音上传响应:', resp);
 console.log('音频URL:', resp.audioUrl);
 
 // 测试音频URL是否可访问
 if (resp.audioUrl) {
     const audio = new Audio(resp.audioUrl);
     audio.oncanplay = () => console.log('音频可播放');
     audio.onerror = () => console.log('音频加载失败');
     audio.load();
 }

      // 4️⃣ 替换临时语音气泡状态为 done，并更新 URL 为后端返回的可播放 URL
      setMessagesMap((m) => ({
        ...m,
        [cid]: (m[cid] || []).map((msg) =>
          msg.id === tempId
            ? { ...msg, status: 'done', audioUrl: resp.audioUrl || msg.audioUrl }
            : msg
        ),
      }));
  
      // 5️⃣ 将识别出的用户文本和 AI 回复追加为文本气泡
      const append: ChatMessage[] = [];
      if (resp.userText) {
        append.push({
          id: `${Date.now()}-u2`,
          role: 'user',
          content: resp.userText,
          type: 'text'
        });
      }
      if (resp.aiText) {
        append.push({
          id: `${Date.now()}-a2`,
          role: 'assistant',
          content: resp.aiText,
          type: 'text'
        });
      }
  
      if (append.length) {
        setMessagesMap((m) => ({
          ...m,
          [cid]: [...(m[cid] || []), ...append]
        }));
  
        // 更新会话列表的 lastMessage 和更新时间
        setConversations((arr) =>
          arr.map((c) =>
            c.id === cid
              ? { ...c, lastMessage: append[append.length - 1].content, updatedAt: new Date().toLocaleTimeString() }
              : c
          )
        );
      }
  
    } catch (e) {
      console.error('上传语音失败', e);
  
      // 6️⃣ 上传失败，更新状态
      setMessagesMap((m) => ({
        ...m,
        [cid]: (m[cid] || []).map((msg) =>
          msg.id === tempId ? { ...msg, status: 'failed' } : msg
        ),
      }));
    }
  };
  

  const dedupeMergeMessages = (existing: ChatMessage[], incoming: ChatMessage[]) => {
    if (incoming.length === 0) return existing;
    // 避免重复添加同一条用户消息：根据角色+内容在末尾进行简单去重
    const set = new Set(existing.map((m) => `${m.role}:${m.content}`));
    const appended = incoming.filter((m) => !set.has(`${m.role}:${m.content}`));
    return [...existing, ...appended];
  };

  const createNewConversation = async () => {
    if (!roleId) return;
    const resp = await createConversation({ roleId });
    const serverId = resp.conversationId;
    const cid = String(serverId || Date.now());
    setClientToServerId((map) => ({ ...map, [cid]: serverId }));
    const newConv: ConversationItem = {
      id: cid,
      title: '新会话',
      lastMessage: '',
      updatedAt: new Date().toLocaleTimeString(),
    };
    setConversations((arr) => [newConv, ...arr]);
    setActiveId(cid);
    setActiveConversationServerId(serverId);
    setMessagesMap((m) => ({ ...m, [cid]: [] }));
  };

  return {
    sessionId,
    roleId,
    setRoleId,
    conversations,
    activeId,
    messages: activeId ? (messagesMap[activeId] || []) : [],
    selectConversation,
    send,
    sending,
    sendVoice,
    createNewConversation,
  };
}


