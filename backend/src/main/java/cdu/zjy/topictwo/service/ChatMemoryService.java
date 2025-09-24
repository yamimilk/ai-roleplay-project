package cdu.zjy.topictwo.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatMemoryService {

    private final Map<String, List<Map<String, String>>> sessionIdToMessages = new ConcurrentHashMap<>();

    public List<Map<String, String>> getHistory(String sessionId) {
        return sessionIdToMessages.getOrDefault(sessionId, Collections.emptyList());
    }

    public void appendMessage(String sessionId, String role, String content) {
        sessionIdToMessages.compute(sessionId, (id, existing) -> {
            List<Map<String, String>> list = existing == null ? new ArrayList<>() : new ArrayList<>(existing);
            list.add(Map.of("role", role, "content", content));
            return list;
        });
    }

    public void appendUserAndAssistant(String sessionId, String userMessage, String assistantReply) {
        appendMessage(sessionId, "user", userMessage);
        appendMessage(sessionId, "assistant", assistantReply);
    }

    public void clear(String sessionId) {
        sessionIdToMessages.remove(sessionId);
    }
}


