import { history } from '@umijs/max';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Typography, message } from 'antd';
import React from 'react';
import { loginLocal } from '@/services/auth';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    if (!values.username) {
      message.error('请输入用户名');
      return;
    }
    // Demo: 本地登录，直接写入本地
    loginLocal({ userId: values.username, nickname: values.username });
    message.success('登录成功');
    history.push('/chat');
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: 16 }}>
      <Col xs={24} sm={20} md={12} lg={8} xl={6}>
        <Card>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>登录</Title>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}> 
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}> 
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>登录</Button>
            </Form.Item>
            <Form.Item>
              <Button type="link" block onClick={() => history.push('/register')}>没有账号？去注册</Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;


