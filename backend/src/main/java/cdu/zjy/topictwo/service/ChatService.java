package cdu.zjy.topictwo.service;

import cdu.zjy.topictwo.dto.ChatRequest;
import cdu.zjy.topictwo.dto.ChatResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public interface ChatService {
    ChatResponse handleSendMessage(ChatRequest request);
    List<Map<String, Object>> listConversations(int roleId);
    Map<String, Object> getConversationMessages(Long id);
    ChatResponse createConversation(ChatRequest request);
}
