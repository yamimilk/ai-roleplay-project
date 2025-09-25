package cdu.zjy.topictwo.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;

@Service
public class ASRService {
    private final WebClient webClient;

    @Value("${asr.api-key}")
    private String apiKey;

    @Value("${asr.model}")
    private String model;

    @Value("${ngrok.url}") // 你的公网 ngrok URL
    private String ngrokUrl;

    public ASRService(@Value("${asr.base-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public String transcribe(String filename) {
        // 拼接公网可访问 URL
        String audioUrl = ngrokUrl + "/uploads/audio/" + filename;

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "audio", Map.of(
                        "format", "wav",
                        "url", audioUrl
                )
        );

        Map<String, Object> response = webClient.post()
                .uri("/voice/asr")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response != null && response.containsKey("text")) {
            return (String) response.get("text");
        }
        return "[ASR 无结果]";
    }
}
