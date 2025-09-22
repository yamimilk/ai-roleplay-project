package cdu.zjy.topictwo.controller;

import cdu.zjy.topictwo.model.Role;
import cdu.zjy.topictwo.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private  RoleService roleService;

    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();
    }

//    @GetMapping
//    public Role getRoleById(@RequestParam String id) {
//        return roleService.getRoleById(id);
//    }

}
