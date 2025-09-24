import React, { useEffect, useMemo, useState } from 'react';
import { Button, Grid, Layout, Select, Typography } from 'antd';
import ConversationList from '@/components/Chat/ConversationList';
import MessageList from '@/components/Chat/MessageList';
import MessageInput from '@/components/Chat/MessageInput';
import useChatModel from '@/models/chat';
import { isLoggedIn } from '@/services/auth';
import { history } from '@umijs/max';
import { queryChatRoleList } from '@/services/chat';

const { Sider, Content, Header } = Layout;
const { useBreakpoint } = Grid;

const ChatPage: React.FC = () => {
  if (!isLoggedIn()) {
    history.replace('/login');
  }

  const screens = useBreakpoint();
  const {
    roleId, setRoleId,
    conversations, activeId, messages, selectConversation,
    send, sending, createNewConversation,
  } = useChatModel();

  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoadingRoles(true);
      try {
        const list = await queryChatRoleList();
        // 去重以避免 Select 内部使用 value 作为 key 导致的重复 key 警告
        const seen = new Set<string>();
        const dedup = (Array.isArray(list) ? list : []).filter((r: any) => {
          const key = String(r.roleId ?? r.id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const opts = dedup.map((r: any) => ({ label: r.name, value: String(r.roleId ?? r.id) }));
        setRoleOptions(opts);
        if (!roleId && opts.length > 0) {
          setRoleId(opts[0].value);
        }
      } finally {
        setLoadingRoles(false);
      }
    };
    run();
    // 仅初次加载
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);

  const siderWidth = screens.md ? 300 : 220;

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        width={siderWidth}
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        collapsedWidth={0}
        style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <div style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
          <Typography.Text strong>会话列表</Typography.Text>
        </div>
        <div style={{ height: 'calc(100% - 46px)', overflow: 'auto' }}>
          <ConversationList items={conversations} activeId={activeId} onSelect={selectConversation} />
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button type="text" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? '展开会话' : '收起会话'}
            </Button>
            <Typography.Text strong style={{ marginRight: 8 }}>角色</Typography.Text>
            <Select
              value={roleId || undefined}
              onChange={setRoleId}
              style={{ width: 200 }}
              loading={loadingRoles}
              placeholder="请选择角色"
              options={roleOptions}
            />
          </div>
          <Button type="primary" onClick={createNewConversation}>新建会话</Button>
        </Header>
        <Content style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <MessageList messages={messages} />
          </div>
          <div style={{ padding: 12, borderTop: '1px solid #f0f0f0' }}>
            <MessageInput onSend={send} loading={sending} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ChatPage;


