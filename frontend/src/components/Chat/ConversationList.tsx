import React from 'react';
import { Avatar, List, Typography } from 'antd';

export interface ConversationItem {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt?: string;
  avatar?: string;
}

interface Props {
  items: ConversationItem[];
  activeId?: string;
  onSelect: (id: string) => void;
}

const ConversationList: React.FC<Props> = ({ items, activeId, onSelect }) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={items}
      renderItem={(item) => (
        <List.Item
          onClick={() => onSelect(item.id)}
          style={{
            cursor: 'pointer',
            background: item.id === activeId ? 'rgba(0,0,0,0.04)' : undefined,
            paddingLeft: 12,
            paddingRight: 12,
          }}
        >
          <List.Item.Meta
            avatar={<Avatar src={item.avatar}>{item.title?.[0] || 'A'}</Avatar>}
            title={<Typography.Text strong ellipsis>{item.title}</Typography.Text>}
            description={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography.Text type="secondary" ellipsis style={{ maxWidth: 160 }}>
                  {item.lastMessage || ''}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                  {item.updatedAt || ''}
                </Typography.Text>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default ConversationList;


