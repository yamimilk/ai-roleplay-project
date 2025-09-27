package cdu.zjy.topictwo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.Map;
@Service
public class TTSService {
    private final WebClient webClient;
    private final RoleService roleService;

    @Value("${tts.api-key}")
    private String apiKey;

    public TTSService(@Value("${tts.base-url}") String baseUrl, RoleService roleService) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
        this.roleService = roleService;
    }

    /**
     * 调用 TTS 接口，将文本转成 Base64 音频字符串
     */
    @SuppressWarnings("unchecked")
    public String synthesize(String roleId,String text) {

        String voiceType = roleService.getRoleVoice(roleId);

        Map<String, Object> requestBody = Map.of(
                "audio", Map.of(
                        "voice_type", voiceType,
                        "encoding", "mp3",
                        "speed_ratio", 1.0
                ),
                "request", Map.of(
                        "text", text
                )
        );

        Map<String, Object> response = webClient.post()
                .uri("/voice/tts")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        System.out.println("七牛返回原始 JSON: " );

        if (response != null && response.containsKey("data")) {
            String base64Audio = (String) response.get("data"); // data 是 String
            return base64Audio != null ? base64Audio : "";
        }

        return "";
    }
}
