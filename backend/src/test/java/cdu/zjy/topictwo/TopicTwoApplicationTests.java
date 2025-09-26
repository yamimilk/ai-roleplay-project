package cdu.zjy.topictwo;

import cdu.zjy.topictwo.mapper.RoleMapper;
import cdu.zjy.topictwo.service.TTSService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Map;

@SpringBootTest
class TopicTwoApplicationTests {

    @Autowired
    private TTSService ttsService;

    @Test
    public void testSynthesizeDebug() {
        TTSService tts = new TTSService("https://openai.qiniu.com/v1");
        ReflectionTestUtils.setField(tts, "apiKey", "sk-341444a38bf21126dc624193f3f1c8db63dbbce3da2990fcce9a0f5c5bb828c0");

//        byte[] audio = tts.synthesize("你好，世界！");
//        System.out.println("生成音频字节长度：" + audio.length);
    }

    @Test
    void testTTSServiceExists() {
        try {
            Class<?> ttsClass = Class.forName("cdu.zjy.topictwo.service.TTSService");
            System.out.println("TTSService 类找到: " + ttsClass);
        } catch (ClassNotFoundException e) {
            System.out.println("TTSService 类未找到");
        }
    }

//    @Autowired
//    private RoleMapper roleMapper;

//    @Test
//    public void main() {
//        String apiKey = "sk-341444a38bf21126dc624193f3f1c8db63dbbce3da2990fcce9a0f5c5bb828c0"; // 换成你的 key
//        String audioUrl = "https://hingeless-servomechanically-janel.ngrok-free.dev/uploads/audio/a4b27a7e-154f-4233-b70f-f7763089fb61.wav";
//
//        RestTemplate rest = new RestTemplate();
//
//        Map<String, Object> body = Map.of(
//                "model", "asr",
//                "audio", Map.of(
//                        "format", "wav",
//                        "url", audioUrl
//                )
//        );
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        headers.setBearerAuth(apiKey);
//
//        HttpEntity<Map<String,Object>> entity = new HttpEntity<>(body, headers);
//
//        try {
//            ResponseEntity<String> resp = rest.exchange(
//                    "https://openai.qiniu.com/v1/voice/asr",
//                    HttpMethod.POST,
//                    entity,
//                    String.class
//            );
//            System.out.println("HTTP status: " + resp.getStatusCodeValue());
//            System.out.println("Body: " + resp.getBody());
//        } catch (Exception e) {
//            System.err.println("请求异常: " + e.getMessage());
//            e.printStackTrace();
//        }
//    }

}
