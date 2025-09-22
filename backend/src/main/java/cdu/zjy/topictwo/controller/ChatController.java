package cdu.zjy.topictwo.controller;

import cdu.zjy.topictwo.dto.ChatRequest;
import cdu.zjy.topictwo.service.LLMService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final LLMService llmService;

    public ChatController(LLMService llmService) {
        this.llmService = llmService;
    }

    @PostMapping
    public Map<String, String> chat(@RequestBody ChatRequest request) {
        String reply = llmService.chat(request.getRoleId(), request.getMessage());

        Map<String, String> response = new HashMap<>();
        response.put("reply", reply);
        return response;
    }
}
