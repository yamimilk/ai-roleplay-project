package cdu.zjy.topictwo.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String roleId;
    private String message;
    private String sessionId; // 可选，用于保持上下文
}