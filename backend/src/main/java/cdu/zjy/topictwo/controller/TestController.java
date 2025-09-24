package cdu.zjy.topictwo.controller;

import cdu.zjy.topictwo.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    private final RoleService roleService;

    public TestController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping("/db")
    public String testDB() {
        try {
            //Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM roles", Integer.class);
            Integer count = roleService.getRoleCount();
            return "数据库连通！!!!roles表记录数: " + count;
        } catch (Exception e) {
            e.printStackTrace();
            return "数据库连接失败，问题: " + e.getMessage();
        }
    }
}

