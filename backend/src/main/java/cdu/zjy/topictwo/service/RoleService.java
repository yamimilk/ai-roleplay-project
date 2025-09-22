package cdu.zjy.topictwo.service;

import cdu.zjy.topictwo.mapper.RoleMapper;
import cdu.zjy.topictwo.model.Role;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface RoleService {
    //void addRole(Role role);
    Role getRoleById(String id);
    List<Role> getAllRoles();
}
