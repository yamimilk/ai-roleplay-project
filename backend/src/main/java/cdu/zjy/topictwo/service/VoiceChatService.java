package cdu.zjy.topictwo.service;

import cdu.zjy.topictwo.dto.ChatMessageDTO;
import cdu.zjy.topictwo.dto.ChatResponse;
import cdu.zjy.topictwo.mapper.ConversationMapper;
import cdu.zjy.topictwo.mapper.MessageMapper;
import cdu.zjy.topictwo.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;


@Service
public class VoiceChatService {

    @Value("${app.upload.audio-path}")
    private String audioPath;

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
        // 1️⃣ 保存原始文件
        File dir = new File(audioPath);
        if (!dir.exists()) dir.mkdirs();
        String filename = UUID.randomUUID() + ".wav";
        File saveFile = new File(dir, filename);
        file.transferTo(saveFile);

        // 2️⃣ 可选：转码，确保是 wav（ffmpeg）
        File wavFile = new File(dir, filename);
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-y", "-i", saveFile.getAbsolutePath(), wavFile.getAbsolutePath()
        );
        pb.inheritIO().start().waitFor();

        // 3️⃣ 调用 ASR 获取文字
        String userText = asrService.transcribe(wavFile);

        // 4️⃣ 保存用户消息
        Message userMsg = new Message();
        userMsg.setConversationId(conversationId);
        userMsg.setSender("user");
        userMsg.setContent(userText);
        userMsg.setAudioUrl("/uploads/audio/" + filename);
        userMsg.setCreatedAt(LocalDateTime.now());
        messageMapper.insert(userMsg);

        // 5️⃣ 调用 LLM 生成 AI 回复
        String aiText = llmService.chat(roleId, userText);

        // 6️⃣ 调用 TTS 生成 AI 语音
        byte[] aiAudio = ttsService.synthesize(aiText);
        String aiFilename = UUID.randomUUID() + ".wav";
        File aiFile = new File(dir, aiFilename);
        Files.write(aiFile.toPath(), aiAudio);

        // 7️⃣ 保存 AI 消息
        Message aiMsg = new Message();
        aiMsg.setConversationId(conversationId);
        aiMsg.setSender("assistant");
        aiMsg.setContent(aiText);
        aiMsg.setAudioUrl("/uploads/audio/" + aiFilename);
        aiMsg.setCreatedAt(LocalDateTime.now());
        messageMapper.insert(aiMsg);

        // 8️⃣ 更新会话
        conversationMapper.updateLastMessage(conversationId, aiText);

        // 9️⃣ 构造返回
        ChatResponse response = new ChatResponse();
        response.setConversationId(conversationId);
        ChatMessageDTO userDto = new ChatMessageDTO(
                "user",
                userText,
                userMsg.getCreatedAt().toString(),
                userMsg.getAudioUrl()  // 如果用户语音存在，就放这里
        );

        ChatMessageDTO aiDto = new ChatMessageDTO(
                "assistant",
                aiText,
                aiMsg.getCreatedAt().toString(),
                aiMsg.getAudioUrl()  // AI 语音 URL
        );

        response.setMessages(List.of(userDto, aiDto));

        return response;
    }
}

