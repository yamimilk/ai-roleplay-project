package cdu.zjy.topictwo.controller;

import cdu.zjy.topictwo.dto.ChatMessageDTO;
import cdu.zjy.topictwo.util.MessagePublisher;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/sse")
public class ChatSseController {

    private final MessagePublisher publisher;

    public ChatSseController(MessagePublisher publisher) {
        this.publisher = publisher;
    }

    // 前端订阅：/sse/subscribe/{conversationId}
    @GetMapping(value = "/subscribe/{conversationId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ChatMessageDTO> subscribe(@PathVariable Long conversationId) {
        return publisher.getFlux(conversationId);
    }
}

