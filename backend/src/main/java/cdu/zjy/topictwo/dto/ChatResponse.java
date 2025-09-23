package cdu.zjy.topictwo.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatResponse {
    private String sessionId;
    private Long conversationId;
    private List<ChatMessageDTO> messages; // 本次往返消息
}
