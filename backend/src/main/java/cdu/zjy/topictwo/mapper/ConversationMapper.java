package cdu.zjy.topictwo.mapper;

import cdu.zjy.topictwo.model.Conversation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ConversationMapper {
    Conversation selectById(Long id);
    List<Conversation> selectAll(int roleId);
    void insert(Conversation conversation);
    void updateLastMessage(@Param("conversationId") Long conversationId,
                           @Param("lastMessage") String lastMessage);

}
