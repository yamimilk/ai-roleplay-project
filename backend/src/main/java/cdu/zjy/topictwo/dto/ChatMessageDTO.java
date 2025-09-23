package cdu.zjy.topictwo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDTO {
    private String role;      // user / assistant
    private String content;   // 消息内容
    private String timestamp; // ISO 格式时间戳
}
