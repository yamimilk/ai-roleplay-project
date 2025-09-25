package cdu.zjy.topictwo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
public class ChatMessageDTO {
    private String user;      // 消息发送方
    private String content;   // 消息内容（文本消息用）
    private String createdAt; // 时间戳
    private String audioUrl;  // 语音文件URL/路径，可选

    // 提供一个3参构造器，audioUrl 默认置空
    public ChatMessageDTO(String user, String content, String createdAt) {
        this.user = user;
        this.content = content;
        this.createdAt = createdAt;
        this.audioUrl = null;
    }

    // 也可以用全参构造器（手写 or Lombok @AllArgsConstructor）
    public ChatMessageDTO(String user, String content, String createdAt, String audioUrl) {
        this.user = user;
        this.content = content;
        this.createdAt = createdAt;
        this.audioUrl = audioUrl;
    }
}

