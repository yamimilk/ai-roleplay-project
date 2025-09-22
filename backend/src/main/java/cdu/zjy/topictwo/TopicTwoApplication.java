package cdu.zjy.topictwo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
@MapperScan("cdu.zjy.topictwo.mapper")
public class TopicTwoApplication {

    public static void main(String[] args) {
        SpringApplication.run(TopicTwoApplication.class, args);
    }

}
