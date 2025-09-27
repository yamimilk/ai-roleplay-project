package cdu.zjy.topictwo.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class User {
    private Integer id;
    private String username;
    private String password;
    private LocalDateTime createdAt;
}
