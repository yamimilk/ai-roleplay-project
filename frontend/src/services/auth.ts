// 简易本地 Auth，为后续替换真实后端留接口
export interface UserInfo {
  userId: string;
  nickname: string;
  avatar?: string;
}

const LOCAL_KEY = 'demo_user';

export function getCurrentUser(): UserInfo | null {
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? (JSON.parse(raw) as UserInfo) : null;
}

export function loginLocal(user: UserInfo) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(user));
}

export function logoutLocal() {
  localStorage.removeItem(LOCAL_KEY);
}

export function isLoggedIn() {
  return !!getCurrentUser();
}


