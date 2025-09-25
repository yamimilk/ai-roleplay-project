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

        String rawFilename = UUID.randomUUID() + ".webm";
        File rawFile = new File(dir, rawFilename);
        file.transferTo(rawFile);

        // 2️⃣ 转码为标准 wav
        String wavFilename = UUID.randomUUID() + ".wav";
        File wavFile = new File(dir, wavFilename);
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-y", "-i",
                rawFile.getAbsolutePath(),
                "-vn", "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le",
                "-f", "wav", wavFile.getAbsolutePath()
        );
        pb.inheritIO().start().waitFor();

        // 3️⃣ 用户音频的公网 URL（立即返回给前端）
        String audioUrl = ngrokUrl + "/uploads/audio/" + wavFilename;

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
                // ASR 转文字
                String userText = asrService.transcribe(wavFilename);

                // 保存用户消息的文字内容（可选）
                userMsg.setContent(userText);
//                messageMapper.insert(userMsg);

                // 调用 LLM 生成 AI 回复
                String aiText = llmService.chat(roleId, userText);

                // 调用 TTS 生成 AI 语音
                byte[] aiAudio = ttsService.synthesize(aiText);
                String aiFilename = UUID.randomUUID() + ".wav";
                File aiFile = new File(dir, aiFilename);
                Files.write(aiFile.toPath(), aiAudio);

                // 保存 AI 消息
                Message aiMsg = new Message();
                aiMsg.setConversationId(conversationId);
                aiMsg.setSender("assistant");
                aiMsg.setContent(aiText);
                aiMsg.setAudioUrl(ngrokUrl + "/uploads/audio/" + aiFilename);
                aiMsg.setCreatedAt(LocalDateTime.now());
                messageMapper.insert(aiMsg);

                // 更新会话最新消息
                conversationMapper.updateLastMessage(conversationId, aiText);

                // 如果前端有 WebSocket，可在这里推送 AI 消息
            } catch (Exception e) {
                e.printStackTrace(); // 记录异常，不阻塞用户体验
            }
        });

        return response;
    }
}
