package cdu.zjy.topictwo;

import cdu.zjy.topictwo.mapper.RoleMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootTest
class TopicTwoApplicationTests {

//    @Autowired
//    private RoleMapper roleMapper;

    @Test
    public void testLoad() {
//        System.out.println("Mapper Bean = " + roleMapper);
//        System.out.println("Roles = " + roleMapper.getAllRoles());
        System.out.println("hello");
    }

}
