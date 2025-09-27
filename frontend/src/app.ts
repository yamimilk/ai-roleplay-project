// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
import '@/global.less';
import {history, RequestConfig } from '@umijs/max';

export async function getInitialState() {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const user_id = localStorage.getItem('id');

  // 未登录：当前页面不是 login、callback，就跳转
  const whiteList = ['/login', '/callback'];
  if (!token && !whiteList.includes(window.location.pathname)) {
    history.replace('/login');
  }

  return {
    name: username || '未知用户',
    // avatar: false,
    isLogin: !!token, // 增加登录判断字段
    currentUser: token ? { username, user_id } : null, // 传用户对象
  };
}

export const layout = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
     collapsed: true,     // 默认收缩
    collapsible: false,  // 禁止切换
  };
};



export const request: RequestConfig = {
  // 请求拦截器：自动加上 token
  requestInterceptors: [
    (url, options) => {
      const token = localStorage.getItem('token');
      if (token) {
        return {
          url,
          options: {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${token}`, // 加上 token
            },
          },
        };
      }
      return { url, options };
    },
  ],

  // 响应拦截器：处理 401
  responseInterceptors: [
    async (response) => {
      if (response.status === 401) {
        // token 失效，跳转登录
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return response;
    },
  ],
};
