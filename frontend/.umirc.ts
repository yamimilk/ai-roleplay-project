import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  vite:{},
  layout: {
    title: '@umijs/max',
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
  routes: [
    { path: '/', redirect: '/chat' },
    { name: '登录', path: '/login', component: './Login',layout: false },
    { name: '注册', path: '/register', component: './Register',layout: false },
    { name: '聊天', path: '/chat', component: './Chat' },
  ],
  npmClient: 'pnpm',
});

