package cdu.zjy.topictwo.model;



import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Conversation {
    private Long conversationId;
    private Long roleId;
    private String roleName;
    private String lastMessage;
    private LocalDateTime updatedAt;
}
