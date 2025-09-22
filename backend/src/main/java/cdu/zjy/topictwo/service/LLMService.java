package cdu.zjy.topictwo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class LLMService {

    private final WebClient webClient;

    @Value("${llm.api-key}")
    private String apiKey;

    @Value("${llm.model}")
    private String model;

    public LLMService(@Value("${llm.base-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @SuppressWarnings("unchecked")
    public String chat(String roleId, String userMessage) {
        // prompt 简单拼接：后续可以替换为数据库里角色设定
        String prompt = "你现在扮演 " + roleId + "，请用该角色的语气回答：\n" + userMessage;

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", "你是一个角色扮演 AI"),
                        Map.of("role", "user", "content", prompt)
                )
        );

        Map<String, Object> response = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        // 解析结果
        if (response != null && response.containsKey("choices")) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (!choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        }
        return "[LLM 无回复]";
    }

    /**
     * 使用外部传入的系统提示词与用户消息进行对话。
     * systemPrompt 应包含完整的角色设定、说话风格与边界。
     */
    @SuppressWarnings("unchecked")
    public String chatWithSystemPrompt(String systemPrompt, String userMessage) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                )
        );

        Map<String, Object> response = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response != null && response.containsKey("choices")) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (!choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        }
        return "[LLM 无回复]";
    }

    /**
     * 使用系统提示词 + 历史消息 + 本轮用户消息 进行对话。
     * historyMessages 需为 [{"role": "user|assistant", "content": "..."}, ...]
     */
    @SuppressWarnings("unchecked")
    public String chatWithSystemPromptAndHistory(String systemPrompt, List<Map<String, String>> historyMessages, String userMessage) {
        List<Map<String, Object>> messages = new java.util.ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        if (historyMessages != null && !historyMessages.isEmpty()) {
            for (Map<String, String> m : historyMessages) {
                String role = m.get("role");
                String content = m.get("content");
                if (role != null && content != null) {
                    messages.add(Map.of("role", role, "content", content));
                }
            }
        }
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", messages
        );

        Map<String, Object> response = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response != null && response.containsKey("choices")) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (!choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        }
        return "[LLM 无回复]";
    }
}
