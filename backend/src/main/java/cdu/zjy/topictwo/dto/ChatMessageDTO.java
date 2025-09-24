package cdu.zjy.topictwo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDTO {
    private String user;      // 消息发送方
    private String content;   // 消息内容
    private String createdAt; // ISO 格式时间戳
}
