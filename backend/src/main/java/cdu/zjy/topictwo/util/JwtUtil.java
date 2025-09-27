package cdu.zjy.topictwo.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key;

    // 过期时间：1天
    private static final long EXPIRATION = 1000 * 60 * 60 * 24;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        // 用配置文件里的 secret 生成固定的 key
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // 生成 JWT
    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key) // 使用配置里的 key
                .compact();
    }


    // 解析 JWT
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key) // 验证签名
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
