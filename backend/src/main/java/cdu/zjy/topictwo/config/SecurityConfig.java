package cdu.zjy.topictwo.config;

import cdu.zjy.topictwo.filter.JwtAuthFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Map;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(authenticationEntryPoint()) // 401
                        .accessDeniedHandler(accessDeniedHandler())           // 403
                )
                .addFilterBefore(jwtAuthFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 401 未登录或 token 失效
    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            writeJson(response, HttpServletResponse.SC_UNAUTHORIZED,
                    Map.of("error", "未认证，请先登录"));
        };
    }

    // 403 已登录但无权限
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            writeJson(response, HttpServletResponse.SC_FORBIDDEN,
                    Map.of("error", "没有访问权限"));
        };
    }

    private void writeJson(HttpServletResponse response, int status, Map<String, Object> body) {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        try {
            new ObjectMapper().writeValue(response.getWriter(), body);
        } catch (IOException e) {
            // 打日志，避免直接抛出
            e.printStackTrace();
        }
    }

}

