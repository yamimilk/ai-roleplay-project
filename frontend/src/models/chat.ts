import { useEffect, useState } from 'react';
import { createConversation, getConversationMessages, listConversations, sendMessage } from '@/services/chat';
import type { ConversationItem } from '@/components/Chat/ConversationList';
import type { ChatMessage } from '@/components/Chat/MessageList';

export default function useChatModel() {
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [roleId, setRoleId] = useState<string>('');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [activeConversationServerId, setActiveConversationServerId] = useState<number | undefined>();
  const [clientToServerId, setClientToServerId] = useState<Record<string, number | undefined>>({});
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [sending, setSending] = useState(false);

  // 初次加载会话列表（如果后端有数据，则渲染）
  useEffect(() => {
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
      const mapped: ChatMessage[] = arr.map((m, idx) => ({
        id: `${serverId}-${idx}`,
        role: mapDtoToUi(m.user),
        content: m.content,
      }));
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
    createNewConversation,
  };
}


