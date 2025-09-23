package cdu.zjy.topictwo.controller;

import cdu.zjy.topictwo.dto.ChatRequest;
import cdu.zjy.topictwo.dto.ChatResponse;
import cdu.zjy.topictwo.dto.ChatMessageDTO;
import cdu.zjy.topictwo.model.Role;
import cdu.zjy.topictwo.service.ChatMemoryService;
import cdu.zjy.topictwo.service.LLMService;
import cdu.zjy.topictwo.service.RoleService;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final LLMService llmService;
    private final RoleService roleService;
    private final ChatMemoryService chatMemoryService;

    public ChatController(LLMService llmService, RoleService roleService, ChatMemoryService chatMemoryService) {
        this.llmService = llmService;
        this.roleService = roleService;
        this.chatMemoryService = chatMemoryService;
    }

    /**
     * 发送消息（返回本次用户+AI的两条消息）
     */
    @PostMapping("/send")
    public ChatResponse sendMessage(@RequestBody ChatRequest request) {
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = UUID.randomUUID().toString();
        }

        Role role = roleService.getRoleById(request.getRoleId());

        String systemPrompt;
        if (role != null) {
            StringBuilder sb = new StringBuilder();
            sb.append("你现在需要完全扮演以下角色，与用户对话时必须保持一致：\n");
            sb.append("- 角色名：").append(role.getName()).append("\n");
            if (role.getDescription() != null) {
                sb.append("- 简介：").append(role.getDescription()).append("\n");
            }
            if (role.getPersonaPrompt() != null) {
                sb.append("- 人设与说话风格：").append(role.getPersonaPrompt()).append("\n");
            }
            systemPrompt = sb.toString();
        } else {
            systemPrompt = "你是一个角色扮演 AI，请以自然、连贯的方式回答用户问题。";
        }

        // 调用大模型
        String reply = llmService.chatWithSystemPromptAndHistory(
                systemPrompt,
                chatMemoryService.getHistory(sessionId),
                request.getMessage()
        );

        // 保存到上下文
        chatMemoryService.appendUserAndAssistant(sessionId, request.getMessage(), reply);

        // 构造返回
        ChatMessageDTO userMsg = new ChatMessageDTO("user", request.getMessage(),
                DateTimeFormatter.ISO_INSTANT.format(Instant.now()));
        ChatMessageDTO aiMsg = new ChatMessageDTO("assistant", reply,
                DateTimeFormatter.ISO_INSTANT.format(Instant.now()));

        ChatResponse response = new ChatResponse();
        response.setSessionId(sessionId);
        response.setConversationId(1L); // TODO: 后续替换成真实 conversationId（数据库生成）
        response.setMessages(List.of(userMsg, aiMsg));

        return response;
    }

    /**
     * 获取会话列表
     */
    @GetMapping("/conversations")
    public List<Map<String, Object>> listConversations() {
        // TODO: 从数据库查会话
        // 这里先写 mock 数据
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Map.of(
                "conversationId", 1,
                "roleId", 1,
                "roleName", "哈利波特",
                "lastMessage", "你好！我是哈利波特，很高兴和你聊天。",
                "updatedAt", "2025-09-22T21:30:02"
        ));
        list.add(Map.of(
                "conversationId", 2,
                "roleId", 2,
                "roleName", "苏格拉底",
                "lastMessage", "你认为智慧的本质是什么呢？",
                "updatedAt", "2025-09-21T19:45:00"
        ));
        return list;
    }

    /**
     * 获取某个会话的历史消息
     */
    @GetMapping("/conversations/{id}/messages")
    public Map<String, Object> getConversationMessages(@PathVariable Long id) {
        // TODO: 从数据库查消息
        Map<String, Object> res = new HashMap<>();
        res.put("conversationId", id);
        res.put("messages", List.of(
                new ChatMessageDTO("user", "你好，哈利波特！", "2025-09-22T21:30:00"),
                new ChatMessageDTO("assistant", "你好！我是哈利波特，很高兴和你聊天。", "2025-09-22T21:30:02")
        ));
        return res;
    }
}
