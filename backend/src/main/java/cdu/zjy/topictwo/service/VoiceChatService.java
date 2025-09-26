package cdu.zjy.topictwo.service;

import cdu.zjy.topictwo.dto.ChatMessageDTO;
import cdu.zjy.topictwo.dto.ChatResponse;
import cdu.zjy.topictwo.mapper.ConversationMapper;
import cdu.zjy.topictwo.mapper.MessageMapper;
import cdu.zjy.topictwo.model.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class VoiceChatService {

    @Value("${app.upload.audio-path}")
    private String audioPath;

    @Value("${ngrok.url}") // 公网 ngrok URL
    private String ngrokUrl;

    private final ASRService asrService;
    private final LLMService llmService;
    private final TTSService ttsService;
    private final MessageMapper messageMapper;
    private final ConversationMapper conversationMapper;

    public VoiceChatService(ASRService asrService,
                            LLMService llmService,
                            TTSService ttsService,
                            MessageMapper messageMapper,
                            ConversationMapper conversationMapper) {
        this.asrService = asrService;
        this.llmService = llmService;
        this.ttsService = ttsService;
        this.messageMapper = messageMapper;
        this.conversationMapper = conversationMapper;
    }

    public ChatResponse handleVoiceMessage(Long conversationId, String roleId, MultipartFile file) throws Exception {
        // 1️⃣ 保存用户上传的原始文件
        File dir = new File(audioPath);
        if (!dir.exists()) dir.mkdirs();

        String rawFilename = UUID.randomUUID() + ".wav";
        File rawFile = new File(dir, rawFilename);
        file.transferTo(rawFile);


        // 3️⃣ 用户音频的公网 URL（立即返回给前端）
        String audioUrl = ngrokUrl + "/uploads/audio/" + rawFilename;

        // 4️⃣ 保存用户消息到数据库，立即可听
        Message userMsg = new Message();
        userMsg.setConversationId(conversationId);
        userMsg.setSender("user");
        userMsg.setAudioUrl(audioUrl);
        userMsg.setCreatedAt(LocalDateTime.now());
        messageMapper.insert(userMsg);

        // 5️⃣ 构造前端立即可显示的响应
        ChatResponse response = new ChatResponse();
        response.setConversationId(conversationId);
        ChatMessageDTO userDto = new ChatMessageDTO("user", "", userMsg.getCreatedAt().toString(), userMsg.getAudioUrl());
        response.setMessages(List.of(userDto));

        // 6️⃣ 异步处理 ASR → LLM → TTS → 保存 AI 消息
        CompletableFuture.runAsync(() -> {
            try {
                // 1️⃣ ASR
                System.out.println("🎤 开始执行 ASR...");
                String userText = asrService.transcribe(rawFilename);
                System.out.println("🎤 ASR 结果: " + userText);
                // 2️⃣ LLM
                System.out.println("🤖 调用 LLM...");
                String aiText = llmService.chat(roleId, userText);
                System.out.println("🤖 LLM 回复: " + aiText);

                System.out.println("🗣️ 调用 TTS...");
                // 3️⃣ TTS
                String base64Audio = ttsService.synthesize(aiText);

                // 4️⃣ Base64 解码并写文件
                if (base64Audio.contains(",")) {
                    base64Audio = base64Audio.split(",")[1];
                }
                byte[] audioBytes = java.util.Base64.getDecoder().decode(base64Audio);

                String aiFilename = UUID.randomUUID() + ".wav"; // 或 mp3
                File aiFile = new File(dir, aiFilename);
                java.nio.file.Files.write(aiFile.toPath(), audioBytes);
                System.out.println("打印转化文件名"+ aiFilename);

                // 5️⃣ 构建 URL
                String aiAudioUrl = ngrokUrl + "/uploads/audio/" + aiFilename;
                System.out.println("💾 保存 AI 消息到数据库...");
                System.out.println("<UNK> <UNK> AI <UNK>: " + aiAudioUrl);

                // 6️⃣ 插入数据库
                Message aiMsg = new Message();
                aiMsg.setConversationId(conversationId);
                aiMsg.setSender("role");
                aiMsg.setContent(aiText);
                aiMsg.setAudioUrl(aiAudioUrl);
                aiMsg.setCreatedAt(LocalDateTime.now());
                messageMapper.insert(aiMsg);

                System.out.println("💾更新会话消息");
                // 7️⃣ 更新会话最后消息
                conversationMapper.updateLastMessage(conversationId, aiAudioUrl);

            } catch (Exception e) {
                e.printStackTrace();
            }
        });

        return response;
    }
}
