import { history, useModel } from '@umijs/max';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Typography, message } from 'antd';
import React from 'react';


const { Title } = Typography;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const { setInitialState } = useModel('@@initialState');

 const onFinish = async (values: { username: string; password: string }) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      const data = await res.json();
      const {token,username,user_id} = data;
      // 保存 token 和用户信息
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('user_id',data.user_id);

      message.success('登录成功');
       setInitialState({
              name: data.username,
              // avatar: false,
              isLogin: true,
              currentUser: {username,user_id}
            });
      history.push('/'); // 跳转到首页
    } else {
      const err = await res.json();
      message.error(err.error || '登录失败');
    }
  } catch (e) {
    message.error('网络错误，请稍后再试');
  }
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


