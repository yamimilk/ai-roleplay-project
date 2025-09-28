package cdu.zjy.topictwo.util;

import cdu.zjy.topictwo.dto.ChatMessageDTO;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MessagePublisher {

    // 每个会话维护一个 Sink
    private final Map<Long, Sinks.Many<ChatMessageDTO>> sinks = new ConcurrentHashMap<>();

    public Flux<ChatMessageDTO> getFlux(Long conversationId) {
        return sinks
                .computeIfAbsent(conversationId, id -> Sinks.many().multicast().onBackpressureBuffer())
                .asFlux();
    }

    public void publish(Long conversationId, ChatMessageDTO message) {
        Sinks.Many<ChatMessageDTO> sink = sinks.get(conversationId);
        if (sink != null) {
            sink.tryEmitNext(message);
        }
    }
}
