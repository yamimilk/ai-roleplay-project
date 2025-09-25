package cdu.zjy.topictwo.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.beans.factory.annotation.Value;

import java.io.File;
import java.util.Base64;
import java.util.Map;

@Service
public class ASRService {
    private final WebClient webClient;

    @Value("${asr.api-key}")
    private String apiKey;

    @Value("${asr.model}")
    private String model;

    public ASRService(@Value("${asr.base-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @SuppressWarnings("unchecked")
    public String transcribe(File audioFile) {
        // 1. 生成公网可访问 URL（假设你已经通过 WebMvcConfigurer 映射过）
        String audioUrl = "http://localhost:8080/uploads/audio/" + audioFile.getName();

        // 2. 构造请求体（和官方一致）
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "audio", Map.of(
                        "format", "wav", // 或 webm，取决于保存的文件后缀
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

