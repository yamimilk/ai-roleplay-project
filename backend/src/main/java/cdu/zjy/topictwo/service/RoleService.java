package cdu.zjy.topictwo.service;

import cdu.zjy.topictwo.mapper.RoleMapper;
import cdu.zjy.topictwo.model.Role;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {
    private final RoleMapper roleMapper;

    public RoleService(RoleMapper roleMapper) {
        this.roleMapper = roleMapper;
    }

    public Role getRoleById(String id) {
        return roleMapper.getRoleById(id);
    }

    public List<Role> getAllRoles() {
        return roleMapper.getAllRoles();
    }
}
