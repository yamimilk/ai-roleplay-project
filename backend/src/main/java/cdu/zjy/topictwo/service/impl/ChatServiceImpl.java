package cdu.zjy.topictwo.service.impl;

import cdu.zjy.topictwo.dto.ChatMessageDTO;
import cdu.zjy.topictwo.dto.ChatRequest;
import cdu.zjy.topictwo.dto.ChatResponse;
import cdu.zjy.topictwo.mapper.ConversationMapper;
import cdu.zjy.topictwo.mapper.MessageMapper;
import cdu.zjy.topictwo.model.Conversation;
import cdu.zjy.topictwo.model.Message;
import cdu.zjy.topictwo.model.Role;
import cdu.zjy.topictwo.service.ChatService;
import cdu.zjy.topictwo.service.LLMService;
import cdu.zjy.topictwo.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final LLMService llmService;
    private final RoleService roleService;
    private final ConversationMapper conversationMapper;
    private final MessageMapper messageMapper;

    @Override
    public ChatResponse handleSendMessage(ChatRequest request) {
        Long conversationId;
        Conversation conversation;

        // 1. 判断是否已有会话
        if (request.getConversationId() != null && !request.getConversationId().isEmpty()) {
            conversationId = Long.valueOf(request.getConversationId());
            conversation = conversationMapper.selectById(conversationId);
        } else {
            // 新建会话
            Role role = roleService.getRoleById(request.getRoleId());
            conversation = new Conversation();
            conversation.setRoleId(Long.valueOf(request.getRoleId()));
            conversation.setRoleName(role != null ? role.getName() : "未知角色");
            conversation.setLastMessage(request.getMessage());
            conversation.setUpdatedAt(LocalDateTime.now());
            conversation.setUserId("iij"); // 临时测试用户
            conversationMapper.insert(conversation);
            conversationId = conversation.getConversationId();
        }

        // 2. 保存用户消息
        Message userMsg = new Message();
        userMsg.setConversationId(conversationId);
        userMsg.setSender("user");
        userMsg.setContent(request.getMessage());
        userMsg.setCreatedAt(LocalDateTime.now());
        messageMapper.insert(userMsg);

        // 3. 调用大模型
        Role role = roleService.getRoleById(request.getRoleId());
        String systemPrompt = (role != null)
                ? "你现在需要完全扮演以下角色，与用户对话时必须保持一致：\n角色名：" + role.getName()
                : "你是一个角色扮演 AI，请以自然、连贯的方式回答用户问题。";

        List<Message> history = messageMapper.selectByConversationId(conversationId);

        int MAX_HISTORY = 20;
        List<Message> recent = (history == null || history.isEmpty())
                ? List.of()
                : (history.size() > MAX_HISTORY
                ? history.subList(history.size() - MAX_HISTORY, history.size())
                : history);

        List<Map<String, String>> historyMessages = recent.stream()
                .map(m -> {
                    String sender = m.getSender() == null ? "user" : m.getSender().toLowerCase();
                    String user = ("assistant".equals(sender) || "role".equals(sender)) ? "assistant" : "user";
                    return Map.of("role", user, "content", m.getContent() == null ? "" : m.getContent());
                })
                .collect(Collectors.toList());

        String reply = llmService.chatWithSystemPromptAndHistory(
                systemPrompt,
                historyMessages,
                request.getMessage()
        );

        // 4. 保存 AI 消息
        Message aiMsg = new Message();
        aiMsg.setConversationId(conversationId);
        aiMsg.setSender("role");
        aiMsg.setContent(reply);
        aiMsg.setCreatedAt(LocalDateTime.now());
        messageMapper.insert(aiMsg);

        // 5. 更新会话最后消息
        conversationMapper.updateLastMessage(conversationId, reply);

        // 6. 构造返回
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        ChatMessageDTO userDto = new ChatMessageDTO("user", userMsg.getContent(),
                userMsg.getCreatedAt().format(formatter),null);
        ChatMessageDTO aiDto = new ChatMessageDTO("assistant", aiMsg.getContent(),
                aiMsg.getCreatedAt().format(formatter),null);

        ChatResponse response = new ChatResponse();
//        response.setSessionId(conversationId.toString());
        response.setConversationId(conversationId);
        response.setMessages(List.of(userDto, aiDto));

        return response;
    }

    /**
     * 获取会话列表
     */
    @Override
    public List<Map<String, Object>> listConversations(int roleId) {
        List<Conversation> conversations = conversationMapper.selectAll(roleId);

        return conversations.stream()
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("conversationId", c.getConversationId());
                    map.put("roleId", c.getRoleId());
                    map.put("roleName", c.getRoleName());
                    map.put("lastMessage", c.getLastMessage());
                    map.put("updatedAt", c.getUpdatedAt().toString());
                    return map;
                })
                .collect(Collectors.toList());
    }

    /**
     * 获取某个会话的历史消息
     */
    @Override
    public Map<String, Object> getConversationMessages(Long id) {
        List<Message> messages = messageMapper.selectByConversationId(id);
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

        List<ChatMessageDTO> dtos = messages.stream()
                .map(m -> new ChatMessageDTO(
                        "user".equals(m.getSender()) ? "user" : "assistant",
                        m.getContent(),
                        m.getCreatedAt().format(formatter),
                        m.getAudioUrl()
                ))
                .toList();

        Map<String, Object> res = new HashMap<>();
        res.put("conversationId", id);
        res.put("messages", dtos);

        return res;
    }

    //新建对话
    @Override
    public ChatResponse createConversation(ChatRequest request) {
        Role role = roleService.getRoleById(request.getRoleId());
        Conversation conversation = new Conversation();
        conversation.setRoleId(Long.valueOf(request.getRoleId()));
        conversation.setRoleName(role != null ? role.getName() : "未知角色");
        conversation.setUpdatedAt(LocalDateTime.now());
        conversation.setLastMessage(request.getMessage());
        conversation.setUserId("iij"); // TODO: 替换为真实登录用户
        conversationMapper.insert(conversation);


        ChatResponse response = new ChatResponse();
        response.setConversationId(conversation.getConversationId());
//        response.setMessages(List.of());
//        response.setname(conversation.getRoleName());
        return response;
    }

}
