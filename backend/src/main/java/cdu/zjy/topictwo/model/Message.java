package cdu.zjy.topictwo.model;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Message {
    private Long id;
    private Long conversationId;
    private String sender; // user / role
    private String content;
    private LocalDateTime createdAt;
    private String audioUrl; // 保存语音文件路径或URL
}

