package cdu.zjy.topictwo.model;

import lombok.Data;
import java.util.List;

@Data
public class Role {
    private String id;            // 唯一标识
    private String name;          // 角色名称
    private String description;   // 简介
    private String personaPrompt; // persona 提示词
    private List<String> skills;  // 技能标签
    private String avatarUrl;     // 头像路径
    private String voice;         // 绑定的 TTS 音色
}
