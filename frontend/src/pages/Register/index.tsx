import { history } from '@umijs/max';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Typography, message } from 'antd';
import React from 'react';

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string; confirm: string }) => {
    if (values.password !== values.confirm) {
      message.error('两次输入的密码不一致');
      return;
    }
    message.success('注册成功，请登录');
    history.push('/login');
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: 16 }}>
      <Col xs={24} sm={20} md={12} lg={8} xl={6}>
        <Card>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>注册</Title>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}> 
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}> 
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Form.Item name="confirm" label="确认密码" dependencies={["password"]} rules={[{ required: true, message: '请确认密码' }]}> 
              <Input.Password prefix={<LockOutlined />} placeholder="再次输入密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>注册</Button>
            </Form.Item>
            <Form.Item>
              <Button type="link" block onClick={() => history.push('/login')}>已有账号？去登录</Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterPage;


