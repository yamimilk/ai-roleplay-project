package cdu.zjy.topictwo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.LinkedHashMap;
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
                .codecs(configurer ->
                        configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024) // 10 MB
                )
                .build();
        this.roleService = roleService;
    }

    /**
     * 调用 TTS 接口，将文本转成 Base64 音频字符串
     */
    @SuppressWarnings("unchecked")
    public String synthesize(String roleId, String text) {
        String voiceType = roleService.getRoleVoice(roleId);
        System.out.println("数据库取出的 voiceType: [" + voiceType + "] 长度=" + voiceType.length());
        System.out.println("数据库里面查出来的声音是："+voiceType);

        text = text.replaceAll("[^\\u4e00-\\u9fa5a-zA-Z0-9,.!?，。！？]", "");

        // 用 LinkedHashMap 保证顺序
        Map<String, Object> audio = new LinkedHashMap<>();
        audio.put("voice_type",voiceType );
        audio.put("encoding", "mp3");
        audio.put("speed_ratio", 1.0);

        Map<String, Object> request = new LinkedHashMap<>();
        request.put("text", text);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("audio", audio);    // audio 在前
        requestBody.put("request", request);

        // 打印请求体
        System.out.println("请求体对象: " + requestBody);
        try {
            System.out.println("转 JSON: " + new ObjectMapper().writeValueAsString(requestBody));
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            Map<String, Object> response = webClient.post()
                    .uri("/voice/tts")
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(
                            status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class).map(body -> {
                                System.err.println("❌ 七牛返回错误状态: " + clientResponse.statusCode());
                                System.err.println("❌ 七牛错误内容: " + body);
                                return new RuntimeException("七牛 TTS 请求失败: " + body);
                            })
                    )
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("data")) {
                String base64Audio = (String) response.get("data");
                return base64Audio != null ? base64Audio : "";
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return "";
    }
}
