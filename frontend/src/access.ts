export default function access(initialState: any) {
  console.log('🔍 initialState in access.ts:', initialState);

  const roleId = initialState?.currentUser?.role_id;
  const isAdmin = String(roleId) === '1';
  const isLoggedIn = !!initialState?.isLogin;

  console.log('🛂 当前角色 ID:', roleId);
  console.log('🔐 是否已登录:', isLoggedIn);

  return {
    isLoggedIn,
    isAdmin,
    isLoggedInAndAdmin: isLoggedIn && isAdmin, // ✅ 新增这个
  };
}
