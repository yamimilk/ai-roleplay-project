package cdu.zjy.topictwo.mapper;

import cdu.zjy.topictwo.model.Message;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MessageMapper {
    List<Message> selectByConversationId(Long conversationId);

    void insert(Message message);

    void updateMessage(Long id, String userText);
}
