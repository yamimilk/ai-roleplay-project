package cdu.zjy.topictwo.controller;

import cdu.zjy.topictwo.dto.ChatResponse;
import cdu.zjy.topictwo.service.VoiceChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/voice")
public class VoiceChatController {

    @Autowired
    private VoiceChatService voiceChatService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> voiceChat(
            @RequestParam("conversationId") Long conversationId,
            @RequestParam("roleId") Long roleId,
//            @RequestParam("background") String background,
            @RequestParam("file") MultipartFile audioFile) throws Exception {

        ChatResponse response = voiceChatService.handleVoiceMessage(conversationId, String.valueOf(roleId), audioFile);
        return ResponseEntity.ok(response);
    }
}