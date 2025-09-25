package cdu.zjy.topictwo.service;

import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.Map;

@Service
public class TTSService {
    private final WebClient webClient;

    @Value("${tts.api-key}")
    private String apiKey;

    @Value("${tts.model}")
    private String model;

    public TTSService(@Value("${tts.base-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @SuppressWarnings("unchecked")
    public byte[] synthesize(String text) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "input", text
        );

        Map<String, Object> response = webClient.post()
                .uri("/voice/tts")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response != null && response.containsKey("audio")) {
            String base64Audio = (String) response.get("audio");
            return Base64.getDecoder().decode(base64Audio);
        }
        return new byte[0];
    }
}
