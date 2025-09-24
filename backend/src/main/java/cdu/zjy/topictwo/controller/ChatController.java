package cdu.zjy.topictwo.controller;

import cdu.zjy.topictwo.dto.ChatMessageDTO;
import cdu.zjy.topictwo.dto.ChatRequest;
import cdu.zjy.topictwo.dto.ChatResponse;
import cdu.zjy.topictwo.model.Conversation;
import cdu.zjy.topictwo.model.Message;
import cdu.zjy.topictwo.mapper.ConversationMapper;
import cdu.zjy.topictwo.mapper.MessageMapper;
import cdu.zjy.topictwo.model.Role;
import cdu.zjy.topictwo.service.ChatService;
import cdu.zjy.topictwo.service.LLMService;
import cdu.zjy.topictwo.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final LLMService llmService;
    private final RoleService roleService;
    private final ConversationMapper conversationMapper;
    private final MessageMapper messageMapper;

    /**
     * 发送消息（返回本次用户+AI的两条消息）
     */
    private final ChatService chatService;

    @PostMapping("/send")
    public ChatResponse sendMessage(@RequestBody ChatRequest request) {
        return chatService.handleSendMessage(request);
    }

    /**
     * 获取会话列表
     */
    @GetMapping("/conversations/{roleId}")
    public List<Map<String, Object>> listConversations(@PathVariable int roleId) {
        return chatService.listConversations(roleId);
    }

    /**
     * 获取某个会话的历史消息
     */
    @GetMapping("/conversations/{id}/messages")
    public Map<String, Object> getConversationMessages(@PathVariable Long id) {
        return chatService.getConversationMessages(id);
    }

    /**
     * 新建会话
     */
    @PostMapping("/createConversation")
    public ChatResponse createConversation(@RequestBody ChatRequest request) {
        return chatService.createConversation(request);
    }
}
