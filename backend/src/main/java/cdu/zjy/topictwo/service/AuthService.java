package cdu.zjy.topictwo.service;

import cdu.zjy.topictwo.mapper.UserMapper;
import cdu.zjy.topictwo.model.User;
import cdu.zjy.topictwo.util.JwtUtil;
import cdu.zjy.topictwo.util.PasswordUtil;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;

    public AuthService(UserMapper userMapper, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.jwtUtil = jwtUtil;
    }

    public String register(String username, String password) {
        if (userMapper.findByUsername(username) != null) {
            throw new RuntimeException("用户名已存在");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(PasswordUtil.encode(password));
        userMapper.insert(user);
        return "注册成功";
    }

    public String login(String username, String password) {
        User user = userMapper.findByUsername(username);
        if (user == null || !PasswordUtil.matches(password, user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        return jwtUtil.generateToken(username);
    }
}
